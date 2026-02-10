# Database Design - Simplified (Thai Tour Website)

> เอกสารนี้แสดงโครงสร้างฐานข้อมูลแบบ **Simplified** ที่เหมาะสำหรับนักศึกษาปี 1

---

## Overview

```
Database Tables (4 tables only):
├── users
├── tours
├── bookings
└── payments
```

**Removed from original design:**
- ❌ SESSIONS table → JWT only (stateless)
- ❌ AUDIT_LOGS table → console.log() instead
- ❌ EMAIL_QUEUE table → console.log() instead
- ❌ PASSWORD_RESETS table → Admin reset password instead
- ❌ Row Level Security (RLS) → NestJS Guards instead
- ❌ Full-text search index → LIKE/ILIKE instead
- ❌ Materialized views → Simple views instead

---

## 1. Entity-Relationship Diagram (Simplified)

```mermaid
erDiagram
    %% ========== User Management ==========
    USERS {
        uuid id PK "User ID (UUID)"
        string email UK "Login Email - Unique"
        string password_hash "bcrypt Hash (cost=12)"
        string full_name "Display Name"
        string phone_number "Contact Number (nullable)"
        enum role "admin | customer - Default: customer"
        datetime created_at "Registration Date"
        datetime updated_at "Last Update"
    }

    %% ========== Tour Management ==========
    TOURS {
        uuid id PK "Tour ID (UUID)"
        string title "Tour Name - NOT NULL"
        text description "Detailed Description"
        decimal base_price "Price per Person (THB)"
        string region "North | South | Central | East | West | Northeast"
        string category "Adventure | Relax | Culture | Food | Beach"
        int max_capacity "Total Available Seats"
        string image_url "Cover Image URL"
        string[] additional_images "Gallery Images Array"
        boolean is_active "Show/Hide Status - Default: true"
        boolean is_recommended "Featured Tour - Default: false"
        json options "Optional Add-ons"
        datetime created_at "Creation Date"
        datetime updated_at "Last Modified Date"
    }

    %% ========== Booking System ==========
    BOOKINGS {
        uuid id PK "Booking ID (UUID)"
        uuid user_id FK "Ref: USERS.id"
        uuid tour_id FK "Ref: TOURS.id"
        int pax "Number of People"
        decimal total_price "Final Calculated Price"
        date travel_date "Selected Travel Date"
        json selected_options "Chosen Add-ons"
        enum status "pending_pay | pending_verify | confirmed | cancelled | expired"
        datetime payment_deadline "Auto-cancel time (created_at + 24h)"
        datetime created_at "Booking Timestamp"
        datetime updated_at "Last Status Change"
    }

    %% ========== Payment & Transactions ==========
    PAYMENTS {
        uuid id PK "Transaction ID"
        uuid booking_id FK "Ref: BOOKINGS.id - Unique"
        string slip_url "Slip Image Path"
        string slip_hash "SHA-256 Hash - Unique (duplicate detection)"
        decimal amount "Paid Amount"
        datetime uploaded_at "Upload Timestamp"
        enum status "waiting | pending_verify | approved | rejected"
        uuid verified_by FK "Ref: USERS.id (Admin) - nullable"
        datetime verified_at "Verification Timestamp"
        text reject_reason "Reason if rejected"
        datetime created_at "Payment Record Creation"
    }

    %% ========== Relationships ==========
    USERS ||--o{ BOOKINGS : "makes"
    TOURS ||--o{ BOOKINGS : "is_booked_in"
    BOOKINGS ||--|| PAYMENTS : "has_payment"
    USERS ||--o{ PAYMENTS : "admin_verifies"
```

---

## 2. Database Schema (SQL DDL)

### 2.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### 2.2 Tours Table

```sql
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    region VARCHAR(50) NOT NULL CHECK (region IN ('North', 'South', 'Central', 'East', 'West', 'Northeast')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('Adventure', 'Relax', 'Culture', 'Food', 'Beach')),
    max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
    image_url TEXT,
    additional_images TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    is_recommended BOOLEAN DEFAULT FALSE,
    options JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tours_region ON tours(region);
CREATE INDEX idx_tours_category ON tours(category);
CREATE INDEX idx_tours_active ON tours(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_tours_recommended ON tours(is_recommended) WHERE is_recommended = TRUE;
CREATE INDEX idx_tours_price ON tours(base_price);
```

---

### 2.3 Bookings Table

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE RESTRICT,
    pax INTEGER NOT NULL CHECK (pax > 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
    travel_date DATE NOT NULL CHECK (travel_date >= CURRENT_DATE),
    selected_options JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_pay'
        CHECK (status IN ('pending_pay', 'pending_verify', 'confirmed', 'cancelled', 'expired')),
    payment_deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_deadline ON bookings(payment_deadline);
CREATE INDEX idx_bookings_tour_status ON bookings(tour_id, status);
```

---

### 2.4 Payments Table

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    slip_url TEXT,
    slip_hash VARCHAR(64) UNIQUE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    uploaded_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting'
        CHECK (status IN ('waiting', 'pending_verify', 'approved', 'rejected')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    reject_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_hash ON payments(slip_hash) WHERE slip_hash IS NOT NULL;
```

---

## 3. Database Views (Simplified)

### 3.1 Tour Availability View

```sql
CREATE OR REPLACE VIEW tour_availability AS
SELECT
    t.id AS tour_id,
    t.title,
    t.max_capacity,
    COALESCE(SUM(b.pax) FILTER (WHERE b.status IN ('confirmed', 'pending_verify', 'pending_pay')), 0) AS booked_seats,
    t.max_capacity - COALESCE(SUM(b.pax) FILTER (WHERE b.status IN ('confirmed', 'pending_verify', 'pending_pay')), 0) AS available_seats
FROM tours t
LEFT JOIN bookings b ON t.id = b.tour_id
GROUP BY t.id, t.title, t.max_capacity;
```

---

## 4. Database Triggers

### 4.1 Auto-update Updated_at Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### 4.2 Auto-expire Pending Bookings

```sql
CREATE OR REPLACE FUNCTION expire_pending_bookings()
RETURNS void AS $$
BEGIN
    UPDATE bookings
    SET status = 'expired'
    WHERE status = 'pending_pay'
      AND payment_deadline < NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Seed Data

### 5.1 Create Test Accounts

```sql
-- Admin Account (password: TestPass123!)
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES (
    gen_random_uuid(),
    'admin@test.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmc0i',
    'Admin User',
    'admin'
);

-- Customer Account (password: TestPass123!)
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES (
    gen_random_uuid(),
    'customer@test.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmc0i',
    'Test Customer',
    'customer'
);
```

---

## 6. Data Dictionary

### Table: USERS

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, Default: gen_random_uuid() | Primary Key |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login username |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash (cost=12) |
| full_name | VARCHAR(255) | NOT NULL | Display name |
| phone_number | VARCHAR(20) | NULLABLE | Contact number |
| role | VARCHAR(20) | CHECK, Default: 'customer' | User role |
| created_at | TIMESTAMPTZ | Default: NOW() | Registration timestamp |
| updated_at | TIMESTAMPTZ | Default: NOW() | Last update timestamp |

### Table: TOURS

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Tour identifier |
| title | VARCHAR(255) | NOT NULL | Tour name |
| description | TEXT | NULLABLE | Full details |
| base_price | DECIMAL(10,2) | CHECK >= 0 | Price per person |
| region | VARCHAR(50) | CHECK IN (...) | Geographic region |
| category | VARCHAR(50) | CHECK IN (...) | Tour type |
| max_capacity | INTEGER | CHECK > 0 | Total seats |
| is_active | BOOLEAN | Default: TRUE | Show in listings |
| is_recommended | BOOLEAN | Default: FALSE | Featured status |

### Table: BOOKINGS

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Booking ID |
| user_id | UUID | FK USERS(id) | Customer who booked |
| tour_id | UUID | FK TOURS(id) | Booked tour |
| pax | INTEGER | CHECK > 0 | Number of travelers |
| total_price | DECIMAL(10,2) | CHECK > 0 | Final price |
| travel_date | DATE | CHECK >= CURRENT_DATE | Travel date |
| status | VARCHAR(20) | CHECK IN (...) | Booking status |
| payment_deadline | TIMESTAMPTZ | NOT NULL | Auto-cancel time |

### Table: PAYMENTS

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Payment record ID |
| booking_id | UUID | FK BOOKINGS(id), UNIQUE | Related booking |
| slip_url | TEXT | NULLABLE | Storage path |
| slip_hash | VARCHAR(64) | UNIQUE | SHA-256 of image |
| amount | DECIMAL(10,2) | CHECK > 0 | Payment amount |
| status | VARCHAR(20) | CHECK IN (...) | Verification status |

---

## 7. Summary of Simplifications

| Original (Complex) | Simplified |
|---|---|
| 7 Tables | 4 Tables |
| SESSIONS table | JWT only (stateless) |
| AUDIT_LOGS table | console.log() |
| EMAIL_QUEUE table | console.log() |
| PASSWORD_RESETS table | Admin reset |
| Row Level Security (RLS) | NestJS Guards |
| Full-text search index | LIKE/ILIKE |
| Materialized views | Simple views |

---

**Last Updated:** 2026-02-10
**Status:** Simplified for Year 1 Students 🚀
