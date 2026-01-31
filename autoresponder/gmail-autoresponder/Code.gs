// Google Apps Script: Gmail autoresponder for first-time/unreplied messages
// Paste this code into a new Google Apps Script project (script.google.com)

const AUTO_REPLY = `Welcome to Santa Ana Calm Waters School! We're thrilled to have you show interest in our institution.
🌟We are a private school located in Ruiru town in Kiambu County next to the Ruiru Law Courts. We are a mixed day and boarding school with our classes running from ECD level, Primary School and Junior school.
🌟Our school provides holistic education in a Happy, Secure and Stimulating learning environment, in which all members of the school community can grow in confidence and realize their highest potential.  
  
🌟We provide an enabling environment that empowers our learners with the opportunity to grow, develop and exploit their abilities, potential and talents whilst empowering and inspiring them to be confident and self-aware so as to prepare them to lead purposeful lives of meaningful and constructive service to the world.
🌟As you purpose to join us in this exciting learning journey, we look forward to working closely with you to ensure that your child receives quality education. 
🔹🔸🔹Please feel free to ask any questions that you may have in relation to our school.`;

function autoRespondToNewMessages() {
  // Label used to mark threads we've already auto-responded to
  const LABEL_NAME = 'AutoResponded';
  let label = GmailApp.getUserLabelByName(LABEL_NAME);
  if (!label) label = GmailApp.createLabel(LABEL_NAME);

  // Search for unread inbox threads NOT already labeled as AutoResponded
  // Adjust query if you want different behavior
  const query = 'in:inbox is:unread -label:' + LABEL_NAME;
  const threads = GmailApp.search(query, 0, 50); // batch up to 50 threads per run

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];

    // Only reply when this is the first message in the thread (initial contact)
    if (thread.getMessageCount() === 1) {
      const messages = thread.getMessages();
      const message = messages[0];
      const from = message.getFrom();
      const recipient = extractEmail(from);

      if (recipient) {
        // Send the exact reply. We send as plaintext and also as HTML (with line breaks preserved).
        GmailApp.sendEmail(recipient, 'Re: ' + (message.getSubject() || ''), AUTO_REPLY, { htmlBody: AUTO_REPLY.replace(/\n/g, '<br>') });

        // Mark thread so we don't reply again
        thread.addLabel(label);
        thread.markRead();
      }
    }
  }
}

function extractEmail(fromHeader) {
  // fromHeader might be 'Name <email@example.com>' or just 'email@example.com'
  const match = fromHeader.match(/<([^>]+)>/);
  if (match && match[1]) return match[1];
  // fallback: try to match an email-like string
  const simple = fromHeader.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return simple ? simple[0] : null;
}

// Helper to create an installable time-driven trigger to run every minute
function createMinuteTrigger() {
  // Delete existing triggers for this function (avoid duplicates)
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'autoRespondToNewMessages') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  // Create new trigger every minute
  ScriptApp.newTrigger('autoRespondToNewMessages').timeBased().everyMinutes(1).create();
}

// Optional: manual test runner
function testOnce() {
  autoRespondToNewMessages();
}
