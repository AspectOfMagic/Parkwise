\connect permit;

CREATE EXTENSION IF NOT EXISTS btree_gist;

DROP TABLE IF EXISTS permit_type CASCADE;
CREATE TABLE permit_type(
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    data jsonb
);

CREATE UNIQUE INDEX unique_permit_type
ON permit_type ((data->>'class'), (data->>'type'));

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