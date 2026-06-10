# Mobile Newsletter Generator — Deploy Bundle

Static, no-build tool that produces a bulletproof, table-based OrangeHRM
mobile-release newsletter email. Open `index.html`, fill in the form, then
**Copy HTML** or **Download HTML** to send.

## Files
- `index.html` — app shell (two-pane workspace)
- `generator.css` — generator UI styles
- `template.js` — renders the email HTML from the form state
- `generator.js` — form logic, state, localStorage, image/GIF upload, export
- `assets-data.js` — default hero + logos as data URLs
- `store-badges.js` — App Store / Google Play badge images as data URLs

## Deploy
No backend. Drag this folder onto Vercel / Netlify Drop, or push to a GitHub
Pages repo. Serve over **HTTPS** (or localhost) — Copy HTML and Send test need it.
