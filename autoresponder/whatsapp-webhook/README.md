WhatsApp Autoresponder (Twilio)

Overview
- Simple Node.js + Express webhook that replies to incoming WhatsApp messages via Twilio with an exact predefined welcome message.

Files
- `index.js` - Express webhook that returns the exact reply as TwiML.
- `package.json` - dependencies and start script.

Setup (local testing)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Expose to the internet for Twilio (local testing) with `ngrok`:
   ```bash
   ngrok http 3000
   ```
   Note the HTTPS forwarding URL, e.g. `https://abcd1234.ngrok.io`.

Twilio configuration
1. Create or use a Twilio account and enable the WhatsApp sandbox (or WhatsApp Business API).
2. In the Twilio Console -> Programmable Messaging -> Try it out -> WhatsApp sandbox, set the "WHEN A MESSAGE COMES IN" webhook URL to:
   `https://<your-host>/whatsapp` (POST)
   Example for ngrok: `https://abcd1234.ngrok.io/whatsapp`
3. Incoming WhatsApp messages will trigger the webhook and Twilio will deliver the reply.

Notes & security
- This webhook replies to all incoming messages with the exact message. If you want filtering (e.g., only first-time messages), add logic to check the incoming message or persist send-state (database or cache).
- Optionally validate Twilio requests using the `X-Twilio-Signature` header and your `TWILIO_AUTH_TOKEN` for production.
