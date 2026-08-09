# Security and administration setup

Guestly's security and account-administration pages use the existing product stack. The local demo continues to be useful for UI review, but production administration requires the database and server variables below.

## Apply the schema

Apply these SQL files to the production Supabase database in this order:

1. `database/schema.sql`
2. `database/integrations.sql`
3. `database/security_admin.sql`

The security migration adds organization roles, member status, invitations, location assignments, an organization activity log, and data-retention preferences. Its row-level-security policies keep rows scoped to the signed-in profile's organization.

## Session configuration

Set a unique, high-entropy session secret in the product deployment:

```bash
GUESTLY_SESSION_SECRET=long-random-server-only-value
GUESTLY_DEMO_PASSWORD=local-or-controlled-demo-password
```

The product session is signed, HTTP-only, same-site, and expires after eight hours. In production, the cookie is marked secure. Never expose either value to the browser.

The present login route is a controlled demo login, not a replacement for an identity provider. Before issuing accounts to real customers, connect the session issuer to the chosen authentication provider and use its verified user ID as `profiles.id`. That provider should own password reset, account verification, and multi-factor authentication where required.

## Team invitations

Team invites are organization-scoped, role-scoped, time-limited, and stored only as a token hash. To deliver invite messages, configure:

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Guestly <alerts@your-domain.example>
NEXT_PUBLIC_APP_URL=https://app.getguestly.com
```

The dashboard can record and send an invitation now. Complete the authentication-provider onboarding and invite-acceptance handler before relying on invitations for live user provisioning.

## Privacy and deletion

Owners and Admins can export organization feedback. Owners can set a retention preference, purge feedback older than that preference after typing `PURGE`, and delete their organization only after typing the organization ID.

Guestly intentionally does not run unattended, irreversible retention deletion. Each purge requires a present Owner confirmation, which reduces the risk of accidental data loss.

## Security review checklist

- Keep `SUPABASE_SERVICE_ROLE_KEY`, Resend keys, Slack keys, encryption keys, and webhook signing secrets server-side only.
- Use a dedicated `GUESTLY_SESSION_SECRET` in every production environment.
- Apply the row-level-security policies before connecting live users.
- Ensure every production profile has an active status and a valid organization role.
- Test an Owner, Admin, Manager, and Viewer account against sensitive API routes before launch.
- Configure a monitored security contact mailbox before publishing the trust page.
