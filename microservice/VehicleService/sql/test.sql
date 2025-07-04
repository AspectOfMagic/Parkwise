DROP TABLE IF EXISTS vehicle CASCADE;
CREATE TABLE vehicle(id UUID UNIQUE DEFAULT gen_random_uuid(), owner UUID, data jsonb);

CREATE UNIQUE INDEX vehicle_plate_state_unique
ON vehicle ((data->>'plate'), (data->>'state'));

CREATE VIEW active_vehicles AS
SELECT
  id,
  owner,
  data->>'plate' AS plate,
  data->>'make' AS make,
  data->>'model' AS model,
  data->>'year' AS year,
  data->>'color' AS color,
  data->>'state' AS state
FROM vehicle
WHERE data->>'deleted' = 'false';

CREATE VIEW deleted_vehicle AS
SELECT
  id,
  owner,
  data->>'plate' AS plate,
  data->>'make' AS make,
  data->>'model' AS model,
  data->>'year' AS year,
  data->>'color' AS color,
  data->>'state' AS state
FROM vehicle
WHERE data->>'deleted' = 'false';


-- Generated w/ ChatGPT: https://chatgpt.com/c/683a3f10-652c-8007-9663-5c35c2e7a1ce
-- Vehicle 1: Not deleted
INSERT INTO vehicle(id, owner, data)
SELECT 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  jsonb_build_object(
    'plate', 'ABC123',
    'make', 'Toyota',
    'model', 'Corolla',
    'year', 2010,
    'color', 'Silver',
    'state', 'CA',
    'deleted', FALSE
  );

-- Vehicle 2: Not deleted
INSERT INTO vehicle(id, owner, data)
SELECT 
  'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  jsonb_build_object(
    'plate', 'ABC124',
    'make', 'Mitsubishi',
    'model', 'Lancer',
    'year', 2012,
    'color', 'Black',
    'state', 'CA',
    'deleted', FALSE
  );

-- Vehicle 3: Deleted
INSERT INTO vehicle(id, owner, data)
SELECT 
  '44444444-4444-4444-4444-444444444444'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  jsonb_build_object(
    'plate', 'ABC125',
    'make', 'Honda',
    'model', 'Acura',
    'year', 2008,
    'color', 'Blue',
    'state', 'CA',
    'deleted', TRUE
  );

-- Vehicle 4: Deleted
INSERT INTO vehicle(id, owner, data)
SELECT 
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  jsonb_build_object(
    'plate', 'XYZ789',
    'make', 'Honda',
    'model', 'Civic',
    'year', 2009,
    'color', 'Red',
    'state', 'CA',
    'deleted', TRUE
  );

-- Vehicle 5: Not deleted
INSERT INTO vehicle(id, owner, data)
SELECT 
  'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  jsonb_build_object(
    'plate', 'LMN456',
    'make', 'Ford',
    'model', 'Focus',
    'year', 2015,
    'color', 'White',
    'state', 'NY',
    'deleted', FALSE
  );

-- Vehicle 6: Deleted
INSERT INTO vehicle(id, owner, data)
SELECT 
  'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  jsonb_build_object(
    'plate', 'TESLA1',
    'make', 'Tesla',
    'model', 'Model 3',
    'year', 2021,
    'color', 'Gray',
    'state', 'TX',
    'deleted', TRUE
  );

-- Vehicle 7: Not deleted
INSERT INTO vehicle(id, owner, data)
SELECT 
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  jsonb_build_object(
    'plate', 'CHEVY9',
    'make', 'Chevrolet',
    'model', 'Impala',
    'year', 2011,
    'color', 'Green',
    'state', 'CA',
    'deleted', FALSE
  );

-- get owner test
  INSERT INTO vehicle(id, owner, data)
SELECT 
  '1fffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  jsonb_build_object(
    'plate', 'CHEVY6',
    'make', 'Chevrolet',
    'model', 'Impala',
    'year', 2012,
    'color', 'Green',
    'state', 'CA',
    'deleted', FALSE
  );


-- get owner test
  INSERT INTO vehicle(id, owner, data)
SELECT 
  '3fffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid,
  jsonb_build_object(
    'plate', 'CHEVY10',
    'make', 'Chevrolet',
    'model', 'Impala',
    'year', 2012,
    'color', 'Green',
    'state', 'CA',
    'deleted', FALSE
  );
