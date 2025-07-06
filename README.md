# ParkWise

**ParkWise** is a full-stack parking management system designed with modular services, workflow automation, and role-based user portals. It supports three distinct user roles — **drivers**, **enforcers**, and **administrators** — each with tailored workflows and portal interfaces.  

Built with **Next.js**, **Node.js**, **PostgreSQL**, and **Material-UI**, ParkWise delivers a clean, responsive experience across devices and provides an efficient, scalable solution for parking operations.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
  - [Backend Services](#backend-services)
  - [Workflow Automation](#workflow-automation)
- [Frontend](#frontend)
- [Tech Stack](#tech-stack)
- [Highlights](#highlights)

---

## 🚗 Features

### Drivers
- Register vehicles and manage profiles.
- Purchase and renew parking permits.
- View, pay, or challenge parking tickets.
- Access a dedicated Driver Portal with real-time updates.

### Enforcers
- Scan license plates and issue tickets.
- View active violations and ticket history.
- Use the Enforcer Portal to streamline enforcement workflows.

### Administrators
- Review and approve permit applications.
- Manage ticket challenges, escalations, and decisions.
- Monitor system-wide activity from the Admin Portal.

---

## Architecture

ParkWise follows a modular microservices architecture, with each service encapsulating its own business logic and database layer.  

### Backend Services
- **Auth Service**
  - Secure session management.
  - User authentication and role-based access control.
  
- **Ticket Service**
  - Ticket issuance and history tracking.
  - Challenge submission, escalation workflows, and status updates.
  
- **Permit Service**
  - Permit issuance, renewal, and expiration logic.
  - Integrated payment processing with **Stripe**.
  
- **Vehicle Service**
  - Vehicle registration and validation.
  - Association with user accounts and permits.

### Workflow Automation
- Approval workflows for permits and ticket challenges.
- Automated email notifications and status updates.
- Event-driven routing of tasks between roles.

---

## Frontend

The frontend, built with **React** and **Material-UI**, offers three role-specific portals:
- **Driver Portal**
- **Enforcer Portal**
- **Admin Portal**

Each portal provides users with the tools and information relevant to their role in a clean, intuitive interface.

---

## Tech Stack

- **Frontend:** Next.js, React, Material-UI  
- **Backend:** Node.js (Express), PostgreSQL  
- **Authentication & Access Control:** JWT-based sessions  
- **Payments:** Stripe integration  

---

## Highlights

- Modular microservices for scalability and maintainability  
- Workflow-driven backend logic with automated status tracking  
- Responsive, role-based UIs for seamless user experience  
- Secure authentication and role-specific access control  
