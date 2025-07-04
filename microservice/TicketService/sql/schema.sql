\connect ticket;
DROP TABLE IF EXISTS ticket;

CREATE TABLE ticket(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), vehicle UUID, data jsonb);
