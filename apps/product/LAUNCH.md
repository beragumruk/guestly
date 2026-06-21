# Launch Readiness

Guestly is structured as a complete product workspace with intake, intelligence, routing, analytics, billing, and settings surfaces.

## Product Checks

- Manager access opens the Guestly Demo Workspace.
- Dashboard summarizes total responses, urgent issues, critical issues, top complaint, and open actions.
- Location management creates public feedback links and QR cards.
- Public feedback forms accept guest messages and route them into the manager inbox.
- Signal intelligence assigns sentiment, urgency, priority, department, issue type, summary, suggested action, and risk flags.
- Feedback inbox supports search, filters, status updates, detail review, and action creation.
- Analytics show trends by time, urgency, department, issue type, and location.
- Billing presents Core and Pro plan paths.
- Settings persist workspace profile and alert preferences.

## Repository Checks

- No secrets are committed.
- No open-source license is granted.
- `npm run lint` passes.
- `npm run build` passes.
- `sh scripts/launch-check.sh` passes.
- `node scripts/visual-check.mjs` passes while the app is running.
