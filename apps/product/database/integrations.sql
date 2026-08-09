-- Guestly integrations, delivery logging, and organization isolation.
-- Apply after schema.sql. Secrets are encrypted by the application before storage.

create table organization_integrations (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  provider text not null check (provider in ('email', 'slack')),
  enabled boolean not null default false,
  status text not null check (status in ('connected', 'not_connected', 'needs_attention', 'coming_soon')),
  config jsonb not null default '{}'::jsonb,
  secret_encrypted text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create table integration_webhooks (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  endpoint text not null check (endpoint like 'https://%'),
  enabled boolean not null default true,
  events text[] not null check (array_length(events, 1) > 0),
  signing_secret_encrypted text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table integration_webhook_deliveries (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  webhook_id text not null references integration_webhooks(id) on delete cascade,
  event text not null check (event in ('feedback.created', 'feedback.urgent', 'feedback.updated')),
  status_code integer,
  success boolean not null,
  error text,
  attempted_at timestamptz not null default now()
);

create index organization_integrations_organization_idx on organization_integrations (organization_id);
create index integration_webhooks_organization_idx on integration_webhooks (organization_id);
create index integration_webhook_deliveries_webhook_idx on integration_webhook_deliveries (webhook_id, attempted_at desc);

-- The profile's organization is the tenant boundary. Service-role server routes still
-- filter by organization_id explicitly, while direct client access is constrained here.
alter table organization_integrations enable row level security;
alter table integration_webhooks enable row level security;
alter table integration_webhook_deliveries enable row level security;

create policy "integration connections stay within an organization"
  on organization_integrations
  for all
  using (organization_id = (select organization_id from profiles where id = auth.uid()::text))
  with check (organization_id = (select organization_id from profiles where id = auth.uid()::text));

create policy "webhook endpoints stay within an organization"
  on integration_webhooks
  for all
  using (organization_id = (select organization_id from profiles where id = auth.uid()::text))
  with check (organization_id = (select organization_id from profiles where id = auth.uid()::text));

create policy "webhook delivery logs stay within an organization"
  on integration_webhook_deliveries
  for select
  using (organization_id = (select organization_id from profiles where id = auth.uid()::text));
