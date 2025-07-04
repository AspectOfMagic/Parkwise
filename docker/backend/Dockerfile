FROM postgres:alpine

# Copy init SQL scripts into image
COPY microservice/AuthService/sql/databases.sql /docker-entrypoint-initdb.d/1.databases.sql
COPY microservice/AuthService/sql/schema.sql /docker-entrypoint-initdb.d/2.schema.sql
COPY microservice/AuthService/sql/data.sql /docker-entrypoint-initdb.d/3.data.sql

COPY microservice/VehicleService/sql/databases.sql /docker-entrypoint-initdb.d/4.databases.sql
COPY microservice/VehicleService/sql/schema.sql /docker-entrypoint-initdb.d/5.schema.sql
COPY microservice/VehicleService/sql/data.sql /docker-entrypoint-initdb.d/6.data.sql

COPY microservice/PermitService/sql/databases.sql /docker-entrypoint-initdb.d/7.databases.sql
COPY microservice/PermitService/sql/schema.sql /docker-entrypoint-initdb.d/8.schema.sql
COPY microservice/PermitService/sql/data.sql /docker-entrypoint-initdb.d/9.data.sql

COPY microservice/TicketService/sql/databases.sql /docker-entrypoint-initdb.d/10.databases.sql
COPY microservice/TicketService/sql/schema.sql /docker-entrypoint-initdb.d/11.schema.sql
COPY microservice/TicketService/sql/data.sql /docker-entrypoint-initdb.d/12.data.sql