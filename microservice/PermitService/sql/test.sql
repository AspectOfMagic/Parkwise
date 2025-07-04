CREATE EXTENSION IF NOT EXISTS btree_gist;

DROP TABLE IF EXISTS permit_type CASCADE;

CREATE TABLE permit_type (
  id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb
);

CREATE UNIQUE INDEX unique_permit_type
ON permit_type ((data->>'class'), (data->>'type'));

-- actual permits with known UUIDs
INSERT INTO permit_type (id, data) VALUES
('11111111-1111-1111-1111-111111111111', jsonb_build_object(
  'class', 'A',
  'type', 'annual',
  'price', 765.12,
  'deleted', false
)),
('11111111-1111-1111-1111-111111111112', jsonb_build_object(
  'class', 'A',
  'type', 'month',
  'price', 150,
  'deleted', false
)),
('11111111-1111-1111-1111-111111111113', jsonb_build_object(
  'class', 'A',
  'type', 'week',
  'price', 45,
  'deleted', false
)),
('11111111-1111-1111-1111-111111111114', jsonb_build_object(
  'class', 'A',
  'type', 'day',
  'price', 5.25,
  'deleted', false
)),
('22222222-2222-2222-2222-222222222221', jsonb_build_object(
  'class', 'R',
  'type', 'annual',
  'price', 504.96,
  'deleted', false
)),
('22222222-2222-2222-2222-222222222222', jsonb_build_object(
  'class', 'R',
  'type', 'month',
  'price', 90,
  'deleted', false
)),
('22222222-2222-2222-2222-222222222223', jsonb_build_object(
  'class', 'R',
  'type', 'week',
  'price', 27,
  'deleted', false
)),
('22222222-2222-2222-2222-222222222224', jsonb_build_object(
  'class', 'R',
  'type', 'day',
  'price', 6,
  'deleted', false
));

-- fake deletes with known UUIDs
INSERT INTO permit_type (id, data) VALUES
('33333333-3333-3333-3333-333333333331', jsonb_build_object(
  'class', 'C',
  'type', 'fake',
  'price', 0,
  'deleted', true
)),
('33333333-3333-3333-3333-333333333332', jsonb_build_object(
  'class', 'C',
  'type', 'test',
  'price', 0,
  'deleted', true
));


CREATE OR REPLACE FUNCTION extract_active_date(data jsonb) 
RETURNS timestamp 
LANGUAGE sql 
IMMUTABLE 
AS $$ SELECT (data->>'active')::timestamp; $$;

CREATE OR REPLACE FUNCTION extract_expiration_date(data jsonb) 
RETURNS timestamp 
LANGUAGE sql 
IMMUTABLE 
AS $$ SELECT (data->>'expiration')::timestamp; $$;

DROP TABLE IF EXISTS permit;
CREATE TABLE permit (
    id UUID UNIQUE DEFAULT gen_random_uuid(),
    holder UUID,
    vehicle UUID,
    info UUID,
    data jsonb,
    CONSTRAINT fk_permit_type FOREIGN KEY (info) REFERENCES permit_type(id),
    CONSTRAINT no_date_overlap EXCLUDE USING gist (
        holder WITH =,
        vehicle WITH =,
        tsrange(extract_active_date(data), extract_expiration_date(data)) WITH &&
    )
);

INSERT INTO permit (holder, vehicle, info, data)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,  -- $3 holder
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,  -- $4 vehicle
  '11111111-1111-1111-1111-111111111114'::uuid,  -- $1 info
  jsonb_build_object(
    'active', '2025-05-22T00:00:00Z'::timestamptz,
    'expiration', '2025-05-23T00:00:00Z'::timestamptz,
    'deleted', false
  )
);

INSERT INTO permit (holder, vehicle, info, data)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,  -- $3 holder
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,  -- $4 vehicle
  '11111111-1111-1111-1111-111111111114'::uuid,  -- $1 info
  jsonb_build_object(
    'active', '2025-02-01T00:00:00Z'::timestamptz,
    'expiration', '2025-02-02T00:00:00Z'::timestamptz,
    'deleted', false
  )
);

INSERT INTO permit (holder, vehicle, info, data)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,  -- $3 holder
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,  -- $4 vehicle
  '11111111-1111-1111-1111-111111111114'::uuid,  -- $1 info
  jsonb_build_object(
    'active', '2025-07-01T00:00:00Z'::timestamptz,
    'expiration', '2025-07-02T00:00:00Z'::timestamptz,
    'deleted', true
  )
);

INSERT INTO permit (holder, vehicle, info, data)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-bbbbbbbbbbbb'::uuid,  -- $3 holder
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,  -- $4 vehicle
  '11111111-1111-1111-1111-111111111114'::uuid,  -- $1 info
  jsonb_build_object(
    'active', '2025-05-22T00:00:00Z'::timestamptz,
    'expiration', '2025-07-23T00:00:00Z'::timestamptz,
    'deleted', false
  )
);
