# Guestly

<p>
  <img alt="Version 1.0.0" src="https://img.shields.io/badge/version-1.0.0-18181b?style=for-the-badge&labelColor=52525b">
  <img alt="License: proprietary source available" src="https://img.shields.io/badge/license-proprietary_source--available-18181b?style=for-the-badge&labelColor=52525b">
  <img alt="Commercial hosted product" src="https://img.shields.io/badge/commercial-hosted_product_only-18181b?style=for-the-badge&labelColor=52525b">
  <img alt="Monorepo" src="https://img.shields.io/badge/workspace-monorepo-18181b?style=for-the-badge&labelColor=52525b">
  <img alt="Landing app: Vite" src="https://img.shields.io/badge/landing-Vite-18181b?style=for-the-badge&labelColor=52525b">
  <img alt="Product app: Next.js" src="https://img.shields.io/badge/product-Next.js-18181b?style=for-the-badge&labelColor=52525b">
  <img alt="Local intelligence classifier" src="https://img.shields.io/badge/intelligence-local_classifier-18181b?style=for-the-badge&labelColor=52525b">
</p>

Guestly is an AI-powered guest intelligence operating system for hospitality teams. It helps hotels, boutique hotels, cafes, restaurants, and hospitality groups capture guest feedback at the point of experience, classify operational risk, route issues to the right owner, and surface recurring service patterns before they become public reputation problems.

This repository contains the public website and the product workspace in one monorepo.

```txt
apps/landing   Public website for getguestly.com
apps/product   Guestly software workspace for app.getguestly.com
```

## Commercial Status

Guestly is source-available, not open source.

The code is published for product transparency, technical review, recruiting, partnership diligence, and launch visibility. It is not a grant of permission to operate Guestly as a competing service, self-host it for a business, resell it, remove the brand, copy the interface, or use the software in production without a written commercial license from Guestly.

Businesses that want to use Guestly should use the hosted product at `app.getguestly.com` or obtain a paid commercial agreement.

Read:

- `LICENSE.md` for the proprietary source-available license
- `COMMERCIAL.md` for commercial-use restrictions
- `TRADEMARKS.md` for brand and trademark restrictions
- `SECURITY.md` for vulnerability reporting and secret-handling expectations

## Product Overview

Guestly turns quiet guest feedback into structured operating intelligence.

Hospitality teams already receive signals from rooms, lobbies, tables, receipts, post-stay messages, staff conversations, and reviews. The hard part is not collecting more comments. The hard part is understanding which signals matter, which department owns them, which issues are recurring, and which guest experiences need immediate recovery.

Guestly is built around that workflow:

1. Guests scan a QR code or open a feedback link.
2. Guestly captures the source location and service context.
3. Feedback is classified by sentiment, urgency, priority, department, issue type, and risk flags.
4. Managers review a prioritized inbox instead of a flat pile of comments.
5. Recurring patterns are surfaced across locations, departments, and issue categories.
6. Teams create action items, update status, and monitor operational follow-through.

The result is a feedback command center for hospitality operators, not a generic survey form and not a simple chat wrapper.

## Core Surfaces

### Public Website

The landing app in `apps/landing` powers `getguestly.com`.

It includes:

- Premium Guestly marketing site
- Request demo flow
- Product login handoff into `app.getguestly.com`

### Product Workspace

The product app in `apps/product` powers `app.getguestly.com`.

It includes:

- Demo manager access flow
- Dashboard overview
- Feedback inbox with filters and status updates
- Public guest feedback links at `/f/[slug]`
- Location and QR management
- Analytics views
- Billing and plan UI
- Settings
- Local persistence for product review
- Deterministic local intelligence classifier

## Intelligence Layer

Guestly includes a local intelligence layer designed to mirror the operational shape of a production AI system without requiring external services to run.

The classifier and analytics modules model:

- Sentiment classification
- Urgency and priority scoring
- Department routing
- Issue taxonomy mapping
- Risk flag detection for safety, allergy, legal, theft, discrimination, injury, and social exposure
- Recurrence detection
- Location pressure analysis
- Department load
- SLA and playbook scaffolding
- Portfolio-style reporting utilities
- Privacy redaction utilities
- Forecasting and anomaly helpers

This lets the product feel complete during review while keeping production credentials and hosted infrastructure outside the public repository.

## Monorepo Layout

```txt
.
|-- apps
|   |-- landing
|   |   |-- src
|   |   |-- public
|   |   `-- package.json
|   `-- product
|       |-- app
|       |-- components
|       |-- database
|       |-- intelligence
|       |-- lib
|       |-- public
|       |-- scripts
|       |-- tools
|       `-- package.json
|-- COMMERCIAL.md
|-- LICENSE.md
|-- SECURITY.md
|-- TRADEMARKS.md
`-- package.json
```

## Local Development

Install dependencies for each app:

```bash
npm --prefix apps/landing install
npm --prefix apps/product install
```

Run the public website:

```bash
npm run dev:landing
```

Run the product workspace:

```bash
npm run dev:product
```

Build the landing app:

```bash
npm run build:landing
```

Build the product app:

```bash
npm run build:product
```

Run product launch checks:

```bash
npm run launch:check
```

## Hosted Product

Guestly is designed to run as a hosted commercial product. The public website lives at `getguestly.com`, and the product workspace lives at `app.getguestly.com`.

This repository can run locally for review without Supabase, Stripe, OpenAI, Resend, or webhooks. Production services are intentionally kept behind integration boundaries and are not required for local evaluation.

## Demo And Login Flow

The public website sends demo and sign-in intent to the product login:

```txt
https://app.getguestly.com/login
```

Plan interest stays on the public website through the contact form:

```txt
https://getguestly.com/#access
```

The product workspace is the only place where workspace authentication belongs. Production deployments should enforce real authentication, authorization, billing, and organization provisioning before handling live customer data.

The review workspace is gated by `GUESTLY_DEMO_EMAIL` and `GUESTLY_DEMO_PASSWORD`. Keep the password in the hosting environment, never in the repository.

## Configuration

Landing app configuration lives in:

```txt
apps/landing/.env.example
```

Product app configuration lives in:

```txt
apps/product/.env.example
```

No production secrets should be committed to this repository.

## Public Repository Policy

This repository may be public, but it is not free software. The absence of an open-source license means no one receives broad reuse rights by default.

You may read the code for evaluation. You may not copy, host, operate, sell, sublicense, white-label, or create a derivative commercial product from Guestly without written permission.

## Verification

Before release:

```bash
npm run build:landing
npm run build:product
npm run launch:check
```

The product launch check runs linting, intelligence verification, SQL checks, and reporting validation.

## Rights

Copyright 2026 Guestly. All rights reserved.

Guestly, the Guestly logo, Guestly product design, and associated brand assets are proprietary. No open-source license is granted.
