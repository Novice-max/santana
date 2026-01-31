Gmail Autoresponder (Google Apps Script)

Overview
- Google Apps Script that automatically replies to first-time/unreplied email contacts with an exact predefined welcome message.
- Designed to run on a time-driven trigger (every minute recommended).

How it works
1. The script searches for unread threads in `INBOX` that are not labeled `AutoResponded`.
2. If a thread contains exactly one message (initial contact), the script sends the exact predefined reply to the sender, marks the thread as read, and adds the `AutoResponded` label.

Deployment steps
1. Open https://script.google.com and create a new project.
2. Replace the default `Code.gs` with the code from `Code.gs` in this folder.
3. Save the project and authorize the script when prompted (scopes: Gmail send/read/label).
4. Run the `createMinuteTrigger` function once from the Apps Script editor (Triggers -> create) to create a time-driven trigger running `autoRespondToNewMessages` every minute.
5. Optionally run `testOnce()` to perform a one-time pass.

Notes & customization
- The script uses a label `AutoResponded` to prevent duplicate replies. You can change this label name in the code.
- If you wish to only reply during certain hours, add a time check at the top of `autoRespondToNewMessages()`.
- The reply is sent exactly as provided — do NOT edit the `AUTO_REPLY` constant unless you intend to change the official message.

Safety
- Be aware of Gmail sending limits. For low to moderate volumes (school parent messages) this approach is appropriate.
- Monitor the `AutoResponded` label and Gmail activity to ensure behavior is correct.
