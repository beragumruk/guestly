-- Guestly materialized intelligence models.

create materialized view if not exists daily_signal_rollup as
select
  organization_id,
  date_trunc('day', created_at) as signal_day,
  count(*) as total_signals,
  count(*) filter (where priority = 'critical') as critical_signals,
  count(*) filter (where priority = 'high') as high_signals,
  count(*) filter (where priority in ('critical', 'high')) as urgent_signals,
  count(distinct location_id) as active_signal_locations,
  count(distinct department) as active_departments
from feedback
group by organization_id, date_trunc('day', created_at);

create unique index if not exists daily_signal_rollup_key
on daily_signal_rollup (organization_id, signal_day);

create materialized view if not exists recurring_pattern_candidates as
select
  organization_id,
  issue_type,
  department,
  count(*) as signal_count,
  count(*) filter (where priority = 'critical') as critical_count,
  count(*) filter (where priority = 'high') as high_count,
  recurring_issue_threshold(
    count(*)::integer,
    count(*) filter (where priority = 'critical')::integer,
    count(*) filter (where priority = 'high')::integer
  ) as severity,
  max(created_at) as latest_signal_at
from feedback
where sentiment <> 'positive'
group by organization_id, issue_type, department;

create index if not exists recurring_pattern_candidates_org_severity_idx
on recurring_pattern_candidates (organization_id, severity);

create or replace function refresh_guestly_intelligence()
returns void
language sql
as $$
  refresh materialized view concurrently daily_signal_rollup;
  refresh materialized view recurring_pattern_candidates;
$$;
