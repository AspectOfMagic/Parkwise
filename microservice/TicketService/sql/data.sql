\connect ticket;
DELETE FROM ticket;
INSERT INTO ticket(id, vehicle, data)
VALUES (
  '2907b5a1-832e-4fa7-ae23-9d3f2856f387',
  'f3a1c1b2-4b52-4d8e-8f9b-1234567890ab', -- change to valid vehicle uuid
  jsonb_build_object(
    'cost', 50.00,
    'issued', '2025-05-01T09:00:00Z',
    'deadline', '2025-06-13T23:59:59Z',
    'status', 'unpaid',  -- paid/unpaid/late/accepted/challenged
    'desc', ''
  )
);

INSERT INTO ticket(id, vehicle, data)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222',
  jsonb_build_object(
    'cost', 50.00,
    'issued', '2025-05-25T12:30:00Z',
    'deadline', '2025-6-25T12:30:00Z',
    'status', 'challenged',
    'desc', 'I am not paying this!!!!'
  )
);
