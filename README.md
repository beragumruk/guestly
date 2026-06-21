# Guestly

Guestly is an AI-powered guest intelligence operating system for hospitality teams. This repository contains both the public website and the product workspace.

## Apps

```txt
apps/landing   Public website for getguestly.com
apps/product   Guestly software for app.getguestly.com
```

## Local Development

Install dependencies inside each app:

```bash
npm --prefix apps/landing install
npm --prefix apps/product install
```

Run the public website:

```bash
npm run dev:landing
```

Run the Guestly software:

```bash
npm run dev:product
```

## Vercel Projects

Create two Vercel projects from this same GitHub repository.

Landing project:

- Root Directory: `apps/landing`
- Domains: `getguestly.com`, `www.getguestly.com`
- Environment variables:

```env
VITE_GUESTLY_APP_URL=https://app.getguestly.com
VITE_GUESTLY_ADMIN_CODES=MERIDIAN-ACCESS,GUESTLY-ACCESS
```

Product project:

- Root Directory: `apps/product`
- Domain: `app.getguestly.com`

## Access Flow

Visitors can open `https://getguestly.com/admin`, enter an operator access code, and continue to `https://app.getguestly.com`.

## Verification

```bash
npm run build:landing
npm run build:product
npm run launch:check
```

## Rights

Copyright 2026 Guestly. All rights reserved. No open-source license is granted.
