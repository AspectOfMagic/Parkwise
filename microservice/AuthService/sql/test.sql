-- Active: 1739522065492@@127.0.0.1@5432
DROP TABLE IF EXISTS driver CASCADE;
DROP TABLE IF EXISTS enforcer CASCADE;
DROP TABLE IF EXISTS admin CASCADE;

CREATE TABLE driver(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);

CREATE TABLE enforcer(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);

CREATE TABLE admin(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);
DELETE FROM driver;
INSERT INTO driver(data)
VALUES (
  jsonb_build_object(
    'email','tommy@books.com',
    'name','Tommy Timekeeper',
    'pwhash',crypt('tommytimekeeper',gen_salt('bf')),
    'inactive', false,
    'role', 'driver'
  )
);

DELETE FROM enforcer;
INSERT INTO enforcer(data)
VALUES (
  jsonb_build_object(
    'email','molly@books.com',
    'name','Molly Member',
    'pwhash',crypt('mollymember',gen_salt('bf')),
    'inactive', false,
    'role', 'enforcer'
  )
);

DELETE FROM admin;
INSERT INTO admin(data)
VALUES (
  jsonb_build_object(
    'email','anna@books.com',
    'name','Anna Admin',
    'pwhash',crypt('annaadmin',gen_salt('bf')),
    'inactive', false,
    'role', 'admin'
  )
);
