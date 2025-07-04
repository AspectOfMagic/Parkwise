\connect driver;
DROP TABLE IF EXISTS driver CASCADE;
DROP TABLE IF EXISTS enforcer CASCADE;
DROP TABLE IF EXISTS admin CASCADE;

CREATE TABLE driver(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);

CREATE TABLE enforcer(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);

CREATE TABLE admin(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);
