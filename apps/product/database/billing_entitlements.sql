-- Guestly plan entitlements.

create table subscription_plans (
  id text primary key,
  name text not null,
  price integer not null,
  interval text not null check (interval in ('month', 'year')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table plan_entitlements (
  id text primary key,
  plan_id text not null references subscription_plans(id) on delete cascade,
  entitlement_key text not null,
  entitlement_label text not null,
  limit_value integer,
  created_at timestamptz not null default now(),
  unique (plan_id, entitlement_key)
);

insert into subscription_plans (id, name, price, interval, featured)
values
  ('core', 'Core Plan', 29, 'month', false),
  ('pro', 'Pro Plan', 99, 'month', true)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  interval = excluded.interval,
  featured = excluded.featured;

insert into plan_entitlements (id, plan_id, entitlement_key, entitlement_label, limit_value)
values
  ('ent_core_locations', 'core', 'feedback_locations', 'Feedback collection locations', 25),
  ('ent_core_classification', 'core', 'classification', 'Signal intelligence classification', null),
  ('ent_core_action_queue', 'core', 'action_queue', 'Action queue', null),
  ('ent_pro_locations', 'pro', 'feedback_locations', 'Feedback collection locations', 250),
  ('ent_pro_patterns', 'pro', 'pattern_intelligence', 'Recurring pattern intelligence', null),
  ('ent_pro_reports', 'pro', 'leadership_reports', 'Leadership reports', null)
on conflict (plan_id, entitlement_key) do update set
  entitlement_label = excluded.entitlement_label,
  limit_value = excluded.limit_value;

create or replace view organization_entitlements as
select
  o.id as organization_id,
  o.name as organization_name,
  o.subscription_status,
  sp.id as plan_id,
  sp.name as plan_name,
  pe.entitlement_key,
  pe.entitlement_label,
  pe.limit_value
from organizations o
join subscription_plans sp on sp.id = case
  when o.subscription_status in ('active', 'trialing') then 'core'
  else 'core'
end
join plan_entitlements pe on pe.plan_id = sp.id;
