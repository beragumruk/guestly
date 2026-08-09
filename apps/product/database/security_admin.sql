-- Guestly role administration, invitation workflow, and privacy controls.
-- Apply after schema.sql and integrations.sql.

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('owner', 'admin', 'manager', 'viewer'));
alter table profiles add column if not exists status text not null default 'active' check (status in ('active', 'access_revoked'));
alter table profiles add column if not exists revoked_at timestamptz;

create table team_invitations (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'manager', 'viewer')),
  location_ids text[] not null default '{}',
  token_hash text not null unique,
  invited_by text not null references profiles(id) on delete restrict,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table profile_location_access (
  profile_id text not null references profiles(id) on delete cascade,
  location_id text not null references feedback_locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, location_id)
);

create table organization_activity_log (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  actor_id text references profiles(id) on delete set null,
  actor_label text not null,
  event_type text not null,
  object_type text,
  object_label text,
  created_at timestamptz not null default now()
);

create table organization_data_preferences (
  organization_id text primary key references organizations(id) on delete cascade,
  retention_days integer check (retention_days is null or retention_days between 30 and 3650),
  updated_by text references profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index team_invitations_organization_idx on team_invitations (organization_id, created_at desc);
create index profile_location_access_location_idx on profile_location_access (location_id);
create index organization_activity_log_organization_idx on organization_activity_log (organization_id, created_at desc);

alter table team_invitations enable row level security;
alter table profile_location_access enable row level security;
alter table organization_activity_log enable row level security;
alter table organization_data_preferences enable row level security;

create policy "team invitations stay within an organization"
  on team_invitations for all
  using (organization_id = (select organization_id from profiles where id = auth.uid()::text))
  with check (organization_id = (select organization_id from profiles where id = auth.uid()::text));

create policy "location access stays within an organization"
  on profile_location_access for all
  using (profile_id in (select id from profiles where organization_id = (select organization_id from profiles where id = auth.uid()::text)))
  with check (profile_id in (select id from profiles where organization_id = (select organization_id from profiles where id = auth.uid()::text)));

create policy "activity stays within an organization"
  on organization_activity_log for select
  using (organization_id = (select organization_id from profiles where id = auth.uid()::text));

create policy "data preferences stay within an organization"
  on organization_data_preferences for all
  using (organization_id = (select organization_id from profiles where id = auth.uid()::text))
  with check (organization_id = (select organization_id from profiles where id = auth.uid()::text));
