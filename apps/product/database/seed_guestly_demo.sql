-- Guestly demo workspace seed data.

insert into organizations (id, name, business_type, subscription_status, created_at)
values ('org_guestly_demo', 'Guestly Demo Workspace', 'hospitality_group', 'active', '2026-05-18T12:00:00Z')
on conflict (id) do update set
  name = excluded.name,
  business_type = excluded.business_type,
  subscription_status = excluded.subscription_status;

insert into profiles (id, organization_id, email, name, role, created_at)
values ('usr_demo_manager', 'org_guestly_demo', 'workspace@getguestly.com', 'Demo Manager', 'owner', '2026-05-18T12:05:00Z')
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  role = excluded.role;

insert into feedback_locations (id, organization_id, name, location_type, reference_code, public_slug, active, created_at)
values
  ('loc_guest_room', 'org_guestly_demo', 'Guest Room Touchpoint', 'room', 'ROOM', 'guestly-demo-room', true, '2026-05-24T14:00:00Z'),
  ('loc_front_desk', 'org_guestly_demo', 'Front Desk / Host Stand', 'lobby', 'ENTRY', 'guestly-demo-front-desk', true, '2026-05-26T14:00:00Z'),
  ('loc_counter', 'org_guestly_demo', 'Counter Service', 'counter', 'COUNTER', 'guestly-demo-counter', true, '2026-05-29T14:00:00Z'),
  ('loc_dining_table', 'org_guestly_demo', 'Dining Table Touchpoint', 'table', 'TABLE', 'guestly-demo-table', true, '2026-06-02T14:00:00Z'),
  ('loc_post_visit', 'org_guestly_demo', 'Post-Visit Email', 'email', 'EMAIL', 'guestly-demo-email', true, '2026-06-04T14:00:00Z'),
  ('loc_receipt', 'org_guestly_demo', 'Receipt QR', 'receipt', 'RECEIPT', 'guestly-demo-receipt', true, '2026-06-05T14:00:00Z')
on conflict (id) do update set
  name = excluded.name,
  location_type = excluded.location_type,
  reference_code = excluded.reference_code,
  public_slug = excluded.public_slug,
  active = excluded.active;

insert into feedback (
  id,
  organization_id,
  location_id,
  rating,
  message,
  guest_name,
  guest_email,
  visit_context,
  sentiment,
  urgency,
  priority,
  department,
  issue_type,
  ai_summary,
  suggested_action,
  risk_flags,
  status,
  created_at,
  updated_at
)
values
  (
    'fb_1',
    'org_guestly_demo',
    'loc_guest_room',
    2,
    'The room felt damp and the hallway noise made it hard to sleep.',
    'Mara L.',
    'mara@example.com',
    'During stay',
    'negative',
    'medium',
    'medium',
    'rooms',
    'noise',
    'Noise feedback classified for Rooms with standard follow-up priority.',
    'Review the feedback, route it to the relevant lead, and close the loop once action is taken.',
    '{}',
    'new',
    '2026-06-20T14:00:00Z',
    '2026-06-20T14:00:00Z'
  ),
  (
    'fb_3',
    'org_guestly_demo',
    'loc_dining_table',
    2,
    'My food allergy was not handled confidently by the server.',
    'Avery K.',
    'avery@example.com',
    'During stay',
    'negative',
    'critical',
    'critical',
    'kitchen',
    'food_quality',
    'Critical Food Quality signal routed to Kitchen for immediate operator review.',
    'Escalate to the duty manager now, contact the guest, document the incident, and assign an owner.',
    '{"Allergy"}',
    'new',
    '2026-06-19T14:00:00Z',
    '2026-06-19T14:00:00Z'
  )
on conflict (id) do nothing;
