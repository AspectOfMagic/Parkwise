\connect vehicle

DROP TABLE IF EXISTS vehicle CASCADE;

CREATE TABLE vehicle (
    id UUID UNIQUE DEFAULT gen_random_uuid (),
    owner UUID,
    data jsonb
);

CREATE UNIQUE INDEX vehicle_plate_state_unique ON vehicle (
    (data ->> 'plate'),
    (data ->> 'state')
);

CREATE VIEW active_vehicles AS
SELECT
    id,
    owner,
    data ->> 'plate' AS plate,
    data ->> 'make' AS make,
    data ->> 'model' AS model,
    data ->> 'year' AS year,
    data ->> 'color' AS color,
    data ->> 'state' AS state
FROM vehicle
WHERE
    data ->> 'deleted' = 'false';

CREATE VIEW deleted_vehicle AS
SELECT
    id,
    owner,
    data ->> 'plate' AS plate,
    data ->> 'make' AS make,
    data ->> 'model' AS model,
    data ->> 'year' AS year,
    data ->> 'color' AS color,
    data ->> 'state' AS state
FROM vehicle
WHERE
    data ->> 'deleted' = 'true';