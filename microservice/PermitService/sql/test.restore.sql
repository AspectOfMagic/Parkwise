DELETE FROM permit;

INSERT INTO permit_type (id, data)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object(
    'class', 'A',
    'type', 'day',
    'price', 5,
    'deleted', false
  )
);

INSERT INTO permit (holder, vehicle, info, data)
VALUES (
  'ac4aebc4-ee7d-402a-8d75-b2265112c4c8',
  'f3a1c1b2-4b52-4d8e-8f9b-1234567890ab',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object(
    'active', '2025-05-30T00:00:00.000Z',
    'expiration', '2025-05-30T23:59:59.999Z',
    'deleted', false
  )
)