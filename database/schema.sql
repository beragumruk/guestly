-- Guestly operational data model
-- Reference schema for production database provisioning.

create table organizations (
  id text primary key,
  name text not null,
  business_type text not null check (
    business_type in ('hotel', 'boutique_hotel', 'cafe', 'restaurant', 'hospitality_group', 'other')
  ),
  subscription_status text not null check (
    subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'free')
  ),
  created_at timestamptz not null default now()
);

create table profiles (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default now()
);

create table feedback_locations (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  name text not null,
  location_type text not null check (
    location_type in ('room', 'lobby', 'table', 'receipt', 'counter', 'email', 'other')
  ),
  reference_code text not null,
  public_slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table feedback (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  location_id text not null references feedback_locations(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  message text not null,
  guest_name text,
  guest_email text,
  visit_context text,
  sentiment text not null check (sentiment in ('positive', 'neutral', 'negative', 'mixed')),
  urgency text not null check (urgency in ('low', 'medium', 'high', 'critical')),
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
  department text not null check (
    department in ('rooms', 'front_desk', 'housekeeping', 'kitchen', 'service', 'management', 'maintenance', 'other')
  ),
  issue_type text not null check (
    issue_type in ('cleanliness', 'noise', 'food_quality', 'staff', 'wait_time', 'safety', 'billing', 'comfort', 'maintenance', 'other')
  ),
  ai_summary text not null,
  suggested_action text not null,
  risk_flags text[] not null default '{}',
  status text not null check (status in ('new', 'in_review', 'assigned', 'resolved', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table action_items (
  id text primary key,
  feedback_id text not null references feedback(id) on delete cascade,
  organization_id text not null references organizations(id) on delete cascade,
  title text not null,
  owner text,
  status text not null check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

create index feedback_organization_created_idx on feedback (organization_id, created_at desc);
create index feedback_priority_status_idx on feedback (priority, status);
create index feedback_location_idx on feedback (location_id);
create index feedback_issue_type_idx on feedback (issue_type);
create index action_items_organization_status_idx on action_items (organization_id, status);
