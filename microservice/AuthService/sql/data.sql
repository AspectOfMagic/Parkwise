\connect driver;

DELETE FROM driver;

INSERT INTO
    driver (id, data)
VALUES (
        'ac4aebc4-ee7d-402a-8d75-b2265112c4c8',
        jsonb_build_object(
            'email',
            'tommy@books.com',
            'name',
            'Tommy Timekeeper',
            'pwhash',
            crypt (
                'tommytimekeeper',
                gen_salt ('bf')
            ),
            'inactive',
            false,
            'role',
            'driver'
        )
    );

INSERT INTO driver(data)
VALUES (
  jsonb_build_object(
    'email','biggybob@books.com',
    'name','Biggy Bob',
    'pwhash',crypt('biggybob',gen_salt('bf')),
    'inactive', false, 
    'role', 'driver' 
  )
);

INSERT INTO driver(data)
VALUES (
  jsonb_build_object(
    'email','chappycharles@books.com',
    'name','Chappy Charles',
    'pwhash',crypt('chappycharles',gen_salt('bf')),
    'inactive', false, 
    'role', 'driver' 
  )
);

INSERT INTO driver(data)
VALUES (
  jsonb_build_object(
    'email','cozycalum@books.com',
    'name','Cozy Calum',
    'pwhash',crypt('cozycalum',gen_salt('bf')),
    'inactive', false, 
    'role', 'driver' 
  )
);

DELETE FROM enforcer;

INSERT INTO
    enforcer (data)
VALUES (
        jsonb_build_object(
            'email',
            'molly@books.com',
            'name',
            'Molly Member',
            'pwhash',
            crypt (
                'mollymember',
                gen_salt ('bf')
            ),
            'role',
            'enforcer'
        )
    );

DELETE FROM admin;

INSERT INTO
    admin (data)
VALUES (
        jsonb_build_object(
            'email',
            'anna@books.com',
            'name',
            'Anna Admin',
            'pwhash',
            crypt ('annaadmin', gen_salt ('bf')),
            'inactive',
            false,
            'role',
            'admin'
        )
    );