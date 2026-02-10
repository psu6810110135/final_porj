# System Overview - Simplified (Thai Tour Website)

> เอกสารนี้แสดงภาพรวมระบบแบบ **Simplified** ที่เหมาะสำหรับนักศึกษาปี 1

---

## 1. High-Level Architecture

```mermaid
graph TD
    subgraph Client_Side
        Browser["Web Browser<br>(Desktop / Mobile)"]
    end

    subgraph Cloud_Infrastructure
        subgraph Frontend_Host
            ReactApp["React Application<br>(Vite + React + TS)"]
        end

        subgraph Backend_Host
            NestJS["NestJS API<br>(Port: 3000)"]
        end

        subgraph Database_Host
            PostgreSQL[(PostgreSQL<br>4 Tables)]
            Storage[(File Storage<br>Slip Images)]
        end
    end

    Browser --> ReactApp
    ReactApp --> NestJS
    NestJS --> PostgreSQL
    NestJS --> Storage
```

---

## 2. Functional Overview

```mermaid
mindmap
  root((Thai Tour Service))
    Customer_Actor(Customer)
        Authentication
            Login / Register
            Manage Profile
        Planning_Engine
            Search Tours
            Calculate Price
        Booking_System
            Book Package
            Upload Slip
            View Status
    Admin_Actor(Admin)
        Tour_Management
            Create / Edit Tours
        Order_Management
            Verify Payments
        Dashboard
            View Stats
```

---

## 3. Core Process Flow (Booking & Payment)

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer
    participant FE as Frontend
    participant BE as Backend (NestJS)
    participant DB as PostgreSQL
    actor Admin as Admin

    Note over User, Admin: Booking & Payment Process

    User->>FE: Select Tour & Plan
    FE->>BE: POST /api/v1/bookings
    BE->>DB: Create Booking (Transaction)
    DB-->>BE: Booking Created
    BE-->>FE: QR Code + Deadline
    FE-->>User: Show QR Code

    User->>FE: Upload Slip
    FE->>BE: POST /api/v1/payments/upload
    BE->>DB: Save Payment (SHA-256 hash)
    BE->>BE: console.log("New payment")

    Admin->>FE: View Pending
    FE->>BE: GET /api/v1/payments/pending
    BE-->>FE: Payment List

    Admin->>FE: Approve
    FE->>BE: PATCH /api/v1/payments/verify
    BE->>DB: Update Status
    BE->>BE: console.log("Payment approved")
    BE-->>FE: Success
```

---

## 4. Tech Stack (Simplified)

### Frontend
| Technology | Purpose |
|---|---|
| React + TypeScript | UI Framework |
| Vite | Build Tool |
| React Router | Routing |
| Axios | API Client |
| Tailwind CSS | Styling |
| date-fns | Date utilities |
| qrcode.react | QR Code |

### Backend
| Technology | Purpose |
|---|---|
| NestJS | Framework |
| TypeORM | ORM |
| PostgreSQL | Database |
| JWT | Authentication |
| bcrypt | Password hashing |
| class-validator | Validation |
| @nestjs/config | Config |
| @nestjs/schedule | Cron jobs |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| Supabase | Database + Storage |

---

## 5. Data Flow Diagram

```mermaid
flowchart LR
    User[Customer] --> UI[React App]
    User --> AdminUI[Admin Dashboard]

    UI --> API[NestJS API]
    AdminUI --> API

    API --> DB[(PostgreSQL)]
    API --> Storage[(Supabase Storage)]

    API --> Console[console.log()<br>Email Simulation]

    subgraph Tables
        DB --> Users[users]
        DB --> Tours[tours]
        DB --> Bookings[bookings]
        DB --> Payments[payments]
    end
```

---

## 6. Summary of Simplifications

| Component | Original | Simplified |
|---|---|---|
| Database | 7 Tables | 4 Tables |
| Auth | Session + JWT | JWT only |
| Email | Queue System | console.log() |
| Logging | Winston | console.log() |
| Cache | Redis | None |
| Security | RLS + Complex | Guards + Basic |

---

**Last Updated:** 2026-02-10
**Status:** Simplified for Year 1 Students 🚀
