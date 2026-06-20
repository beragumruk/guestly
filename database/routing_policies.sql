-- Guestly routing policies and operational queue helpers.

create or replace function default_department_owner(department text)
returns text
language sql
immutable
as $$
  select case department
    when 'rooms' then 'Rooms lead'
    when 'front_desk' then 'Front desk manager'
    when 'housekeeping' then 'Housekeeping lead'
    when 'kitchen' then 'Kitchen manager'
    when 'service' then 'Service manager'
    when 'management' then 'Duty manager'
    when 'maintenance' then 'Facilities lead'
    else 'Operations lead'
  end
$$;

create or replace function escalation_sla_minutes(priority text)
returns integer
language sql
immutable
as $$
  select case priority
    when 'critical' then 15
    when 'high' then 60
    when 'medium' then 240
    else 1440
  end
$$;

create or replace view recovery_queue_with_sla as
select
  q.*,
  default_department_owner(q.department) as default_owner,
  escalation_sla_minutes(q.priority) as sla_minutes,
  q.created_at + make_interval(mins => escalation_sla_minutes(q.priority)) as response_due_at,
  now() > q.created_at + make_interval(mins => escalation_sla_minutes(q.priority)) as breached_sla
from open_recovery_queue q;

create or replace function create_recovery_action(feedback_id text)
returns text
language plpgsql
as $$
declare
  source_feedback feedback%rowtype;
  action_id text;
begin
  select * into source_feedback from feedback where id = feedback_id;

  if source_feedback.id is null then
    raise exception 'feedback item not found: %', feedback_id;
  end if;

  action_id := 'act_' || replace(gen_random_uuid()::text, '-', '');

  insert into action_items (
    id,
    feedback_id,
    organization_id,
    title,
    owner,
    status,
    created_at
  )
  values (
    action_id,
    source_feedback.id,
    source_feedback.organization_id,
    source_feedback.suggested_action,
    default_department_owner(source_feedback.department),
    'open',
    now()
  );

  update feedback
  set status = 'assigned',
      updated_at = now()
  where id = source_feedback.id
    and status in ('new', 'in_review');

  return action_id;
end;
$$;
