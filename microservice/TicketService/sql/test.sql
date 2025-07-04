DROP TABLE IF EXISTS ticket CASCADE;
CREATE TABLE ticket(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), vehicle UUID, data jsonb);

-- Generated with ChatGPT

-- Ticket 1: Active ticket for vehicle ABC123
INSERT INTO ticket(id, vehicle, data)
SELECT 
  'aaaabbbb-aaaa-bbbb-aaaa-bbbbaaaabbbb'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, -- vehicle ABC123
  jsonb_build_object(
    'cost', '100',
    'issued', '2023-12-01T10:00:00Z',
    'deadline', '2024-01-01T00:00:00Z',
    'status', 'unpaid'
  );

-- Ticket 2: Paid ticket for vehicle ABC123
INSERT INTO ticket(id, vehicle, data)
SELECT 
  'bbbbcccc-bbbb-cccc-bbbb-ccccbbbbcccc'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  jsonb_build_object(
    'cost', '75',
    'issued', '2023-06-10T09:00:00Z',
    'deadline', '2023-07-10T00:00:00Z',
    'status', 'paid'
  );

-- Ticket 3: Challenged ticket for vehicle ABC124 (Mitsubishi)
INSERT INTO ticket(id, vehicle, data)
SELECT 
  'ccccdddd-cccc-dddd-cccc-ddddccccdddd'::uuid,
  'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, -- vehicle ABC124
  jsonb_build_object(
    'cost', '90',
    'issued', '2024-04-15T11:30:00Z',
    'deadline', '2024-05-15T00:00:00Z',
    'status', 'challenged'
  );

-- Ticket 5: Ticket for NY vehicle LMN456 (Ford)
INSERT INTO ticket(id, vehicle, data)
SELECT 
  'eeeeaaaa-eeee-aaaa-eeee-aaaaeeeeaaaa'::uuid,
  'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  jsonb_build_object(
    'cost', '85',
    'issued', '2024-03-01T12:00:00Z',
    'deadline', '2024-04-01T00:00:00Z',
    'status', 'unpaid'
  );