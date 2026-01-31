const express = require('express');
const twilio = require('twilio');
const { MessagingResponse } = twilio.twiml;
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// ⚠️ OFFICIAL SCHOOL MESSAGE — DO NOT EDIT WITHOUT ADMIN APPROVAL
// The welcome message below is locked and must be served EXACTLY as written.
const AUTO_REPLY = `Welcome to Santa Ana Calm Waters School! We're thrilled to have you show interest in our institution.
🌟We are a private school located in Ruiru town in Kiambu County next to the Ruiru Law Courts. We are a mixed day and boarding school with our classes running from ECD level, Primary School and Junior school.
🌟Our school provides holistic education in a Happy, Secure and Stimulating learning environment, in which all members of the school community can grow in confidence and realize their highest potential.  
  
🌟We provide an enabling environment that empowers our learners with the opportunity to grow, develop and exploit their abilities, potential and talents whilst empowering and inspiring them to be confident and self-aware so as to prepare them to lead purposeful lives of meaningful and constructive service to the world.
🌟As you purpose to join us in this exciting learning journey, we look forward to working closely with you to ensure that your child receives quality education. 
🔹🔸🔹Please feel free to ask any questions that you may have in relation to our school.`;

// Data file to persist phone numbers that have already been auto-responded to
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'responded.json');

// In-memory cache for fast checks
let respondedSet = new Set();

// Simple promise-based lock to serialize file writes and avoid race conditions
let fileLock = Promise.resolve();
function withLock(fn) {
  const start = fileLock;
  let release;
  fileLock = new Promise(resolve => { release = resolve; });
  return start.then(fn).finally(() => release());
}

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf8');
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) respondedSet = new Set(arr);
    } catch (err) {
      // If file doesn't exist or is invalid, start fresh and create file
      if (err.code !== 'ENOENT') {
        console.error('Warning: could not read responded data file:', err.message);
      }
      respondedSet = new Set();
      await fs.writeFile(DATA_FILE, JSON.stringify([]), { encoding: 'utf8' });
    }
  } catch (err) {
    console.error('Failed to ensure data file:', err);
    throw err;
  }
}

async function addResponded(identifier) {
  // Serialize writes
  return withLock(async () => {
    if (respondedSet.has(identifier)) return false;
    respondedSet.add(identifier);
    // write atomically
    const tmp = DATA_FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(Array.from(respondedSet)), { encoding: 'utf8' });
    await fs.rename(tmp, DATA_FILE);
    return true;
  });
}

// Validate Twilio request using X-Twilio-Signature and TWILIO_AUTH_TOKEN
function isValidTwilioRequest(req) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;
  const signature = req.get('X-Twilio-Signature') || req.get('x-twilio-signature');
  if (!signature) return false;

  // Construct full URL Twilio used (respect X-Forwarded-Proto when behind proxies)
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
  const host = req.get('host');
  const url = `${proto}://${host}${req.originalUrl}`;

  // Use twilio.validateRequest(authToken, signature, url, params)
  try {
    return twilio.validateRequest(authToken, signature, url, req.body);
  } catch (err) {
    console.error('Twilio validation error:', err && err.message);
    return false;
  }
}

app.post('/whatsapp', async (req, res) => {
  // Accept only verified requests
  if (!isValidTwilioRequest(req)) {
    return res.status(403).send('Forbidden');
  }

  // Twilio WhatsApp sender is in req.body.From (e.g. "whatsapp:+2547...")
  const sender = req.body && req.body.From;
  if (!sender) {
    // Nothing to do
    return res.sendStatus(200);
  }

  // Log minimal metadata only (timestamp + sender). Never log message content.
  try {
    console.log(JSON.stringify({ ts: new Date().toISOString(), sender }));
  } catch (e) {
    // ignore logging errors
  }

  // If we've already auto-responded to this sender, return 200 silently
  if (respondedSet.has(sender)) {
    return res.sendStatus(200);
  }

  // Add the sender immediately to the persisted record to avoid duplicates
  // Note: this means if sending the reply fails we still won't reply on retries.
  try {
    await addResponded(sender);
  } catch (err) {
    console.error('Failed to persist responded sender:', err && err.message);
    // Do not proceed to reply if we cannot persist the state
    return res.sendStatus(500);
  }

  // Send the locked official reply exactly once
  const twiml = new MessagingResponse();
  twiml.message(AUTO_REPLY);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

app.get('/', (req, res) => res.send('Santa Ana WhatsApp autoresponder running.'));

(async () => {
  try {
    await ensureDataFile();
    app.listen(PORT, () => {
      console.log(`WhatsApp autoresponder listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err && err.message);
    process.exit(1);
  }
})();
