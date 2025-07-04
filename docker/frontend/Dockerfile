FROM node:23-alpine

EXPOSE 3000
EXPOSE 3001
EXPOSE 3002
EXPOSE 3003
EXPOSE 3010
EXPOSE 4000
EXPOSE 4001
EXPOSE 4002
EXPOSE 4003

WORKDIR /home/app

# Copy root files
COPY package.json /home/app/
COPY package-lock.json /home/app/
COPY .env /home/app/

# ---------------- AuthService ----------------
COPY microservice/AuthService/build /home/app/microservice/AuthService/build
COPY microservice/AuthService/package.json /home/app/microservice/AuthService/
COPY microservice/AuthService/package-lock.json /home/app/microservice/AuthService/

WORKDIR /home/app/microservice/AuthService
RUN npm install

# ---------------- VehicleService ----------------
COPY microservice/VehicleService/build /home/app/microservice/VehicleService/build
COPY microservice/VehicleService/package.json /home/app/microservice/VehicleService/
COPY microservice/VehicleService/package-lock.json /home/app/microservice/VehicleService/

WORKDIR /home/app/microservice/VehicleService
RUN npm install

# ---------------- PermitService ----------------
COPY microservice/PermitService/build /home/app/microservice/PermitService/build
COPY microservice/PermitService/package.json /home/app/microservice/PermitService/
COPY microservice/PermitService/package-lock.json /home/app/microservice/PermitService/
COPY microservice/PermitService/.env /home/app/microservice/PermitService/

WORKDIR /home/app/microservice/PermitService
RUN npm install

# ---------------- TicketService ----------------
COPY microservice/TicketService/build /home/app/microservice/TicketService/build
COPY microservice/TicketService/package.json /home/app/microservice/TicketService/
COPY microservice/TicketService/package-lock.json /home/app/microservice/TicketService/
COPY microservice/TicketService/.env /home/app/microservice/TicketService/

WORKDIR /home/app/microservice/TicketService
RUN npm install

# ---------------- Parking App ----------------
COPY parking-app/.next/ /home/app/parking-app/.next/
COPY parking-app/package.json /home/app/parking-app/
COPY parking-app/package-lock.json /home/app/parking-app/
COPY parking-app/next.config.ts /home/app/parking-app/
COPY parking-app/public/  /home/app/parking-app/public/

WORKDIR /home/app/parking-app
RUN npm install

# ---------------- Driver App ----------------
COPY driver/.next/ /home/app/driver/.next/
COPY driver/package.json /home/app/driver/
COPY driver/package-lock.json /home/app/driver/
COPY driver/next.config.ts /home/app/driver/
COPY driver/public/  /home/app/driver/public/
COPY driver/.env /home/app/driver/

WORKDIR /home/app/driver
RUN npm install

# ---------------- Enforcer App ----------------
COPY enforcement/.next/ /home/app/enforcement/.next/
COPY enforcement/package.json /home/app/enforcement/
COPY enforcement/package-lock.json /home/app/enforcement/
COPY enforcement/next.config.ts /home/app/enforcement/
COPY enforcement/public/  /home/app/enforcement/public/
COPY enforcement/.env /home/app/enforcement/

WORKDIR /home/app/enforcement
RUN npm install

# ---------------- Admin App ----------------
COPY admin/.next/ /home/app/admin/.next/
COPY admin/package.json /home/app/admin/
COPY admin/package-lock.json /home/app/admin/
COPY admin/next.config.ts /home/app/admin/
COPY admin/public/  /home/app/admin/public/

WORKDIR /home/app/admin
RUN npm install

# ---------------- API Gateway ----------------
COPY microservice/ApiGateway/dist/ /home/app/microservice/ApiGateway/dist/
COPY microservice/ApiGateway/package.json /home/app/microservice/ApiGateway/
COPY microservice/ApiGateway/package-lock.json /home/app/microservice/ApiGateway/

WORKDIR /home/app/microservice/ApiGateway
RUN npm install

# ---------------- Root App ----------------
WORKDIR /home/app
RUN npm install

CMD ["npm", "start"]
