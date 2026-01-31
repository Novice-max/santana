Santa Ana Calm Waters - Autoresponder Setup

This folder contains two ready-to-deploy autoresponder prototypes:

1) WhatsApp (Twilio)
- Path: `autoresponder/whatsapp-webhook`
- Quick start: install Node.js, `npm install`, run `npm start`, expose via `ngrok` and point Twilio WhatsApp webhook to `/whatsapp`.
- Behavior: replies to every incoming WhatsApp message with the exact predefined welcome message.

2) Gmail (Google Apps Script)
- Path: `autoresponder/gmail-autoresponder`
- Quick start: copy `Code.gs` into a new Google Apps Script project, authorize, run `createMinuteTrigger` once.
- Behavior: checks unread inbox threads and replies exactly once to initial contact, adds label `AutoResponded` to avoid duplicates.

Important
- Both implementations send the EXACT official message defined in each code file. Do not edit the `AUTO_REPLY` constant unless you intentionally want to change the official reply.
- Test carefully with a few messages first.

If you'd like, I can:
- Add Twilio request validation to the webhook (recommended for production).
- Add filtering logic (only reply to messages classified as "first contact" rather than every message) for WhatsApp.
- Deploy the webhook to a cloud provider (Heroku, Railway, Vercel, Azure) and help configure Twilio.
