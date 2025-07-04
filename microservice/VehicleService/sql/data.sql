\connect vehicle;

DELETE FROM vehicle;

-- Vehicle 1: Not deleted
INSERT INTO
    vehicle (id, owner, data)
VALUES (
        'f3a1c1b2-4b52-4d8e-8f9b-1234567890ab',
        'ac4aebc4-ee7d-402a-8d75-b2265112c4c8',
        jsonb_build_object(
            'make',
            'Toyota',
            'model',
            'Corolla',
            'plate',
            'ABC123',
            'state',
            'CA',
            'year',
            2020,
            'color',
            'White',
            'deleted',
            'false'
        )
    );

-- Vehicle 2: Deleted
INSERT INTO
    vehicle (id, owner, data)
VALUES (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        jsonb_build_object(
            'make',
            'Honda',
            'model',
            'Civic',
            'plate',
            'XYZ789',
            'state',
            'NY',
            'year',
            2019,
            'color',
            'Black',
            'deleted',
            'true'
        )
    );

-- Vehicle 3: Not deleted
INSERT INTO
    vehicle (id, owner, data)
VALUES (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'f81f34d1-e91a-4000-ac1f-aeb8dce1bcfe',
        jsonb_build_object(
            'make',
            'Ford',
            'model',
            'Focus',
            'plate',
            'LMN456',
            'state',
            'TX',
            'year',
            2018,
            'color',
            'Blue',
            'deleted',
            'false'
        )
    );

-- Vehicle 4: Deleted
INSERT INTO
    vehicle (id, owner, data)
VALUES (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '33333333-3333-3333-3333-333333333333',
        jsonb_build_object(
            'make',
            'Tesla',
            'model',
            'Model 3',
            'plate',
            'TESLA1',
            'state',
            'FL',
            'year',
            2022,
            'color',
            'Red',
            'deleted',
            'true'
        )
    );

-- Vehicle 5: Not deleted
INSERT INTO
    vehicle (id, owner, data)
VALUES (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'dc8fbca8-1620-4cb0-ad10-d2847435ae01', -- Chappy Charles
        jsonb_build_object(
            'make',
            'Chevrolet',
            'model',
            'Impala',
            'plate',
            'CHEVY9',
            'state',
            'WA',
            'year',
            2017,
            'color',
            'Gray',
            'deleted',
            'false'
        )
    );

INSERT INTO
    vehicle (id, owner, data)
VALUES (
        '6dd86bd8-4604-4516-b9d1-d57c76ce9834',
        '8b37dfce-b5e4-43fb-a807-658e6b0d899e', -- Cozy Calum
        jsonb_build_object(
            'make',
            'Jeep',
            'model',
            'Wrangler',
            'plate',
            'JEEPYU',
            'state',
            'WA',
            'year',
            2018,
            'color',
            'Black',
            'deleted',
            'false'
        )
    );