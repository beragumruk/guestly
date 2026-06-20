-- Guestly workflow event ledger.

create table workflow_events (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  feedback_id text not null references feedback(id) on delete cascade,
  event_type text not null,
  actor text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index workflow_events_feedback_created_idx on workflow_events (feedback_id, created_at desc);
create index workflow_events_organization_type_idx on workflow_events (organization_id, event_type);

create or replace function append_workflow_event(
  feedback_id text,
  event_type text,
  actor text,
  payload jsonb default '{}'::jsonb
)
returns text
language plpgsql
as $$
declare
  source_feedback feedback%rowtype;
  event_id text;
begin
  select * into source_feedback from feedback where id = feedback_id;
  if source_feedback.id is null then
    raise exception 'feedback item not found: %', feedback_id;
  end if;

  event_id := 'evt_' || replace(gen_random_uuid()::text, '-', '');
  insert into workflow_events (id, organization_id, feedback_id, event_type, actor, payload)
  values (event_id, source_feedback.organization_id, source_feedback.id, event_type, actor, payload);
  return event_id;
end;
$$;

create or replace view feedback_workflow_timeline as
select
  f.id as feedback_id,
  f.organization_id,
  f.priority,
  f.status,
  l.name as location_name,
  e.event_type,
  e.actor,
  e.payload,
  e.created_at as event_created_at
from feedback f
join feedback_locations l on l.id = f.location_id
left join workflow_events e on e.feedback_id = f.id;
