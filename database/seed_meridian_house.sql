-- Meridian House launch workspace seed data.

insert into organizations (id, name, business_type, subscription_status, created_at)
values ('org_meridian_house', 'The Meridian House', 'boutique_hotel', 'active', '2026-05-18T12:00:00Z')
on conflict (id) do update set
  name = excluded.name,
  business_type = excluded.business_type,
  subscription_status = excluded.subscription_status;

insert into profiles (id, organization_id, email, name, role, created_at)
values ('usr_bera', 'org_meridian_house', 'bera@getguestly.com', 'Bera Gumruk', 'owner', '2026-05-18T12:05:00Z')
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  role = excluded.role;

insert into feedback_locations (id, organization_id, name, location_type, reference_code, public_slug, active, created_at)
values
  ('loc_room_307', 'org_meridian_house', 'Room 307', 'room', '307', 'meridian-room-307', true, '2026-05-24T14:00:00Z'),
  ('loc_lobby', 'org_meridian_house', 'Lobby QR', 'lobby', 'LOBBY', 'meridian-lobby', true, '2026-05-26T14:00:00Z'),
  ('loc_cafe_counter', 'org_meridian_house', 'Cafe Counter', 'counter', 'CAFE', 'meridian-cafe-counter', true, '2026-05-29T14:00:00Z'),
  ('loc_table_18', 'org_meridian_house', 'Table 18', 'table', 'T18', 'meridian-table-18', true, '2026-06-02T14:00:00Z'),
  ('loc_post_stay', 'org_meridian_house', 'Post-Stay Email', 'email', 'EMAIL', 'meridian-post-stay', true, '2026-06-04T14:00:00Z'),
  ('loc_receipt', 'org_meridian_house', 'Receipt QR', 'receipt', 'RECEIPT', 'meridian-receipt', true, '2026-06-05T14:00:00Z')
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
    'org_meridian_house',
    'loc_room_307',
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
    'org_meridian_house',
    'loc_table_18',
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
