# Guestly

Guestly is an AI-powered customer feedback intelligence platform for hotels, boutique hotels, cafes, restaurants, and hospitality operators.

This repository contains the Guestly product application: guest feedback intake, operational intelligence, action routing, analytics, location management, and plan operations in one polished workspace.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Build

```bash
npm run build
```

## Workspace Access

Use `Continue to Workspace` on `/login`, or enter:

- Email: `bera@getguestly.com`
- Password: `launch-access`

Workspace:

- The Meridian House
- Business type: boutique hotel

## Product Surface

Guestly includes:

- Public feedback links for rooms, tables, counters, receipts, lobbies, and post-stay email flows
- Signal classification for sentiment, urgency, priority, department, and issue type
- Risk flags for allergy, safety, theft, injury, discrimination, legal, and social escalation
- Manager inbox with filters, search, status updates, and action creation
- Analytics for recurring complaints, department load, urgency distribution, and location performance
- Billing and plan management UI for Core and Pro plans
- Settings for organization profile and notification preferences

## Architecture

- Next.js App Router
- TypeScript application code
- Tailwind CSS design system
- Deterministic signal intelligence engine in `lib/classifier.ts`
- Browser persistence adapter in `lib/store.ts`
- SQL schema, analytics views, routing policies, and launch workspace seed data in `database/`
- Python signal intelligence package in `intelligence/`
- Python reporting utility in `tools/feedback_report.py`
- Shell launch check in `scripts/launch-check.sh`

## Launch Checks

```bash
npm run lint
npm run build
npm run intelligence:verify
npm run sql:check
python3 tools/feedback_report.py
sh scripts/launch-check.sh
node scripts/visual-check.mjs
```

## Environment

No secrets are committed. Runtime configuration belongs in environment variables, using `.env.example` as the reference.

## Rights

Copyright 2026 Guestly. All rights reserved. No open-source license is granted.
