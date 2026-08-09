# Guestly

Guestly is an AI-powered guest intelligence operating system for hotels, boutique hotels, cafes, restaurants, and hospitality groups.

Guestly converts high-friction guest signals into structured operational workflows: QR intake, risk classification, recurrence detection, SLA routing, playbook orchestration, manager escalation, recovery evidence, portfolio analytics, and executive-ready reporting. It is designed as an intelligence layer between raw feedback and day-to-day hospitality operations.

The product combines a polished manager workspace with a deeper signal intelligence layer. Public feedback links collect guest input at service touchpoints, classification logic turns unstructured comments into operational metadata, workflow planning assigns the correct owner and recovery path, and analytics surfaces the patterns leadership needs before private complaints become public reputation issues.

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

## Build

```bash
npm run build
```

## Workspace Access

Use `/login` with workspace credentials issued by Guestly. The demo email is configured as `GUESTLY_DEMO_EMAIL`; the password must be provided through `GUESTLY_DEMO_PASSWORD` in the runtime environment and should not be committed to source control.

Workspace:

- Guestly Demo Workspace
- Business type: hospitality group demo

## Product Surface

Guestly includes:

- Public feedback links for rooms, tables, counters, receipts, lobbies, and post-stay email flows
- Signal classification for sentiment, urgency, priority, department, and issue type
- Risk flags for allergy, safety, theft, injury, discrimination, legal, and social escalation
- Workflow orchestration for intake, enrichment, routing, escalation, recovery, monitoring, and resolution
- SLA-aware playbooks, owner assignment, evidence requirements, and executive visibility rules
- Pattern intelligence for recurrence, location heatmaps, anomaly detection, and operating load
- Privacy redaction for guest-provided contact, room, and payment references
- Forecasting utilities for volume, urgent load, and staffing pressure
- Portfolio rollups for hospitality groups managing multiple properties or concepts
- Notification payload generation for manager alerts, daily digests, and recovery queues
- Manager inbox with filters, search, status updates, and action creation
- Analytics for recurring complaints, department load, urgency distribution, and location performance
- Billing and plan management UI for Core and Pro plans
- Settings for organization profile and notification preferences
- Settings → Integrations for CSV export, email alert rules, Slack OAuth setup, and signed webhook management

## Architecture

- Next.js App Router
- TypeScript application code
- Tailwind CSS design system
- Browser persistence adapter in `lib/store.ts`
- Python signal intelligence, workflow orchestration, playbooks, SLA routing, privacy, anomaly detection, portfolio rollups, and reporting exports in `intelligence/`
- SQL schema, analytics views, materialized intelligence models, routing policies, billing entitlements, workflow events, and generic demo workspace seed data in `database/`
- Vanilla JavaScript and CSS website embed package in `public/embed/`
- Python reporting utility in `tools/feedback_report.py`
- Shell launch and SQL checks in `scripts/`

## Website Embed

Guestly can be placed directly into the public website through the branded embed package in `public/embed/`. The embed supports modal intake and direct-link modes for landing pages, property microsites, post-stay pages, and campaign pages while keeping the same polished Guestly interface.

See `docs/EMBED.md` for the production snippet and deployment patterns.

## Intelligence Layer

The intelligence layer is organized around a signal lifecycle:

1. Intake captures the guest message, source location, rating, timestamp, and channel.
2. Classification assigns sentiment, urgency, priority, department, issue type, summary, suggested action, risk flags, and score.
3. Enrichment evaluates recurrence, location pressure, department load, and anomaly baselines.
4. Workflow planning maps the signal to owners, SLAs, playbooks, evidence requirements, and escalation channels.
5. Recovery operations create action items, notification payloads, manager visibility, and audit events.
6. Analytics roll up trends into daily summaries, recurring pattern candidates, location performance, and portfolio-level risk.

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

See [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) for the integration migration, server variables, Slack OAuth callback, Resend email setup, webhook signatures, and production authentication handoff.

## Rights

Copyright 2026 Guestly. All rights reserved. No open-source license is granted.
