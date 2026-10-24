# RSVP → Google Sheet setup

Sheet: https://docs.google.com/spreadsheets/d/1cVGUcmnMWsgHjDN5KyS97ch4JkcbGhh1QrxaDoovpSo/edit

1. Open the sheet ▸ Extensions ▸ Apps Script.
2. Replace everything in Code.gs with google-apps-script/code.gs and save.
3. In the function dropdown pick `setup` ▸ Run, and allow the permissions.
   This creates the `rsvp` tab with bold, frozen headers:
   Timestamp | Guest Name | Attending | Seats | Message | Invitation Link
4. Deploy ▸ New deployment ▸ type: Web app
   - Execute as: Me
   - Who has access: Anyone
5. Copy the Web app URL (ends in /exec).
6. Put it in `.env` for local dev:

       VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec

7. Add the same variable in Vercel ▸ Project ▸ Settings ▸ Environment Variables,
   then redeploy (Vite bakes it in at build time).

If you edit the script later: Deploy ▸ Manage deployments ▸ edit ▸ Version: New version,
so the URL stays the same.
