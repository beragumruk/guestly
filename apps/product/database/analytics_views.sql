-- Guestly analytics views
-- These views power executive summaries, trend analysis, and recovery queues.

create or replace view feedback_signal_summary as
select
  f.organization_id,
  count(*) as total_responses,
  count(*) filter (where f.priority in ('high', 'critical')) as urgent_responses,
  count(*) filter (where f.priority = 'critical') as critical_responses,
  count(*) filter (where f.sentiment = 'positive') as positive_responses,
  count(*) filter (where f.sentiment = 'neutral') as neutral_responses,
  count(*) filter (where f.sentiment = 'negative') as negative_responses,
  count(*) filter (where f.sentiment = 'mixed') as mixed_responses,
  max(f.created_at) as latest_response_at
from feedback f
group by f.organization_id;

create or replace view feedback_department_load as
select
  f.organization_id,
  f.department,
  count(*) as total,
  count(*) filter (where f.status not in ('resolved', 'archived')) as open_total,
  count(*) filter (where f.priority in ('high', 'critical')) as urgent_total,
  round(avg(coalesce(f.rating, 0)) filter (where f.rating is not null), 2) as average_rating
from feedback f
group by f.organization_id, f.department;

create or replace view feedback_issue_trends as
select
  f.organization_id,
  f.issue_type,
  date_trunc('day', f.created_at) as signal_day,
  count(*) as total,
  count(*) filter (where f.priority = 'critical') as critical_total,
  count(*) filter (where f.priority = 'high') as high_total
from feedback f
group by f.organization_id, f.issue_type, date_trunc('day', f.created_at);

create or replace view location_performance as
select
  l.organization_id,
  l.id as location_id,
  l.name,
  l.location_type,
  l.reference_code,
  l.active,
  count(f.id) as total_responses,
  count(f.id) filter (where f.priority in ('high', 'critical')) as urgent_responses,
  count(f.id) filter (where f.sentiment = 'positive') as positive_responses,
  round(avg(f.rating) filter (where f.rating is not null), 2) as average_rating,
  max(f.created_at) as latest_response_at
from feedback_locations l
left join feedback f on f.location_id = l.id
group by l.organization_id, l.id, l.name, l.location_type, l.reference_code, l.active;

create or replace view open_recovery_queue as
select
  f.id,
  f.organization_id,
  f.location_id,
  l.name as location_name,
  f.message,
  f.priority,
  f.urgency,
  f.department,
  f.issue_type,
  f.ai_summary,
  f.suggested_action,
  f.risk_flags,
  f.status,
  f.created_at,
  case f.priority
    when 'critical' then 1
    when 'high' then 2
    when 'medium' then 3
    else 4
  end as queue_rank
from feedback f
join feedback_locations l on l.id = f.location_id
where f.status not in ('resolved', 'archived')
order by queue_rank asc, f.created_at desc;

create or replace function recurring_issue_threshold(
  issue_count integer,
  critical_count integer,
  high_count integer
)
returns text
language sql
immutable
as $$
  select case
    when critical_count > 0 then 'critical'
    when high_count >= 2 or issue_count >= 4 then 'high'
    when high_count = 1 or issue_count >= 2 then 'medium'
    else 'low'
  end
$$;
