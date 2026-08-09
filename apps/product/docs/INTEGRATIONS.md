# Guestly integrations setup

Guestly integrations are organization-scoped and require the production database path. The current local workspace continues to work without these values, but it correctly leaves server-backed integrations unavailable until setup is complete.

## Deploy the product application

The marketing site and the authenticated product are separate applications. Deploy `apps/product` as the project root for the deployment serving `app.getguestly.com`, then set its build command to `npm run build`. The integration API routes, Slack callback, and daily cron are part of that product deployment, not the marketing-site deployment.

## 1. Provision integration storage

Apply these SQL files to the same Supabase project that holds the Guestly production tables:

1. `database/schema.sql`
2. `database/integrations.sql`
3. `database/security_admin.sql`

`integrations.sql` adds organization-scoped integration connections, webhook endpoints, delivery logs, and row-level security policies. Server routes also filter every storage query by organization ID.

## 2. Required server variables

Set these only in the product deployment, never in browser-exposed variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
GUESTLY_INTEGRATIONS_ENCRYPTION_KEY=base64-encoded-32-byte-key
GUESTLY_DEMO_ORGANIZATION_ID=org_guestly_demo
```

Generate the encryption key with a trusted secret manager or:

```bash
openssl rand -base64 32
```

The application encrypts Slack access tokens and webhook signing secrets before persisting them. Do not rotate this key without a coordinated secret-reencryption migration.

## 3. Email notifications

Guestly sends email through Resend when these variables are present:

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Guestly <alerts@your-domain.example>
```

Admins can select recipients and rules for all new feedback, urgent feedback, negative feedback, selected categories, and daily summaries. The scheduled daily-summary endpoint is `/api/integrations/daily-summary`.

For Vercel Cron, set `CRON_SECRET` or `GUESTLY_CRON_SECRET` to the same deployment secret. The included schedule runs daily at 13:00 UTC. Change it in `vercel.json` if a different delivery time is needed.

## 4. Slack OAuth

Create a Slack app and configure this redirect URI exactly:

```text
https://your-product-domain.example/api/integrations/slack/callback
```

Then set:

```bash
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=https://your-product-domain.example/api/integrations/slack/callback
SLACK_OAUTH_STATE_SECRET=long-random-server-only-secret
```

The requested scopes are `chat:write`, `channels:read`, and `groups:read`. After OAuth succeeds, an administrator still chooses a Slack channel ID and the feedback events that trigger messages. Until these variables are configured, the dashboard labels Slack as Coming soon.

## 5. Webhooks

Admins can create one or more public HTTPS endpoints, choose `feedback.created`, `feedback.urgent`, and `feedback.updated`, test delivery, enable or disable endpoints, and remove them. Guestly signs every JSON payload with:

```text
X-Guestly-Signature: sha256=<hex-hmac>
```

The signing secret is shown once after creation and stored encrypted. Verify the raw request body with HMAC SHA-256 before trusting it. Delivery attempts, response codes, and errors are retained in `integration_webhook_deliveries`.

Webhook endpoints must be public HTTPS URLs. Localhost and `.local` addresses are rejected to reduce SSRF risk.

## Production authentication note

The current project ships with a secured demo workspace credential flow and browser persistence for local review. It is not a full identity-provider integration or an invitation-acceptance service. For a multi-organization production launch, connect the signed session issuer to the selected authentication provider, use that provider's verified user ID as the profile ID, and complete the invite-acceptance flow before enabling live invitations.
