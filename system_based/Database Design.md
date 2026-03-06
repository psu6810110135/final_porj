# Database Design — Thai Tour Website

> โครงสร้างฐานข้อมูลจริงตาม Entity ที่ใช้ในโปรเจกปัจจุบัน (TypeORM + PostgreSQL 16)

---

## Overview

```
Database: thai_tours (PostgreSQL 16 via Docker, port 5433)
ORM: TypeORM (synchronize: true — dev only)
Connection: postgresql://thai_tours:thai_tours_password@localhost:5433/thai_tours

Tables — 7 ตาราง:
├── users
├── tours
├── tour_schedules
├── bookings
├── payments
├── reviews
└── tickets
```

---

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    %% ========== Users ==========
    USERS {
        uuid id PK "UUID auto-generated"
        string username UK "Login username — unique, NOT NULL"
        string password "bcrypt hash"
        string email "Nullable, unique"
        string first_name "Nullable"
        string last_name "Nullable"
        string full_name "Nullable"
        string phone "Nullable"
        string avatar_url "Profile image path"
        enum role "ADMIN | CUSTOMER | USER — Default: USER"
        boolean is_active "Default: true"
        string resetPasswordOtp "6-digit OTP code (nullable)"
        timestamp resetPasswordOtpExpires "OTP expiry (nullable)"
        string resetPasswordToken "Reset token (nullable)"
        timestamp created_at "Auto"
        timestamp updated_at "Auto"
    }

    %% ========== Tours ==========
    TOURS {
        uuid id PK "UUID"
        string title "Max 100 chars, NOT NULL"
        text description "Tour description"
        decimal price "DECIMAL(10,2) — adult price"
        decimal child_price "DECIMAL(10,2) — nullable"
        string province "Max 50 chars"
        enum region "North | South | Central | East | West | Northeast"
        enum duration "1 day | 1 day 1 night | 2 days 1 night | ..."
        int max_group_size "Default: 15"
        decimal rating "DECIMAL(2,1) — cached avg"
        int review_count "Default: 0"
        string image_cover "Cover image URL"
        text_array images "Gallery image URLs"
        text_array highlights "Tour highlights"
        text_array preparation "Preparation items"
        text itinerary "Itinerary text"
        jsonb itinerary_data "Array of day/time/detail objects"
        text included "What is included"
        text excluded "What is excluded"
        text conditions "Booking conditions"
        enum category "Sea | Mountain | Cultural | Nature | City | Adventure"
        boolean is_active "Default: true"
        boolean is_recommended "Default: false"
        timestamp created_at "Auto"
        timestamp updated_at "Auto"
    }

    %% ========== Tour Schedules ==========
    TOUR_SCHEDULES {
        uuid id PK "UUID"
        uuid tour_id FK "Ref: TOURS.id — CASCADE"
        date available_date "Unique with tour_id"
        int max_capacity_override "Nullable"
        boolean is_available "Default: true"
        timestamp created_at "Auto"
    }

    %% ========== Bookings ==========
    BOOKINGS {
        uuid id PK "UUID"
        string booking_reference UK "Unique reference code"
        uuid tour_id FK "Ref: TOURS.id"
        uuid user_id FK "Ref: USERS.id"
        uuid tour_schedule_id FK "Ref: TOUR_SCHEDULES.id — nullable"
        date travel_date "Nullable — for one-day tours"
        date start_date "Nullable — for multi-day tours"
        date end_date "Nullable — for multi-day tours"
        int pax "Number of travelers (min 1)"
        decimal base_price "DECIMAL(10,2)"
        decimal discount "DECIMAL(10,2) — Default: 0"
        decimal total_price "DECIMAL(10,2)"
        enum status "PENDING_PAY | PENDING_VERIFY | CONFIRMED | CANCELLED | EXPIRED"
        string payment_slip_url "Slip image path (nullable)"
        timestamp payment_deadline "Created + 15 minutes"
        jsonb selected_options "adults/children counts"
        jsonb contact_info "name, email, phone"
        text special_requests "Nullable"
        text cancellation_reason "Nullable"
        decimal refund_amount "Nullable"
        timestamp created_at "Auto"
        timestamp updated_at "Auto"
    }

    %% ========== Payments ==========
    PAYMENTS {
        uuid id PK "UUID"
        decimal amount "DECIMAL(10,2)"
        string slip_url "Slip image path (nullable)"
        string status "pending_verify | approved | rejected"
        timestamp verifiedAt "Nullable"
        timestamp uploadedAt "Upload timestamp"
    }

    %% ========== Reviews ==========
    REVIEWS {
        uuid id PK "UUID"
        uuid user_id FK "Ref: USERS.id"
        uuid tour_id FK "Ref: TOURS.id"
        uuid booking_id FK "Ref: BOOKINGS.id — UNIQUE"
        int rating "1-5"
        text comment "Nullable"
        boolean is_recommended "Default: false"
        timestamp created_at "Auto"
        timestamp updated_at "Auto"
    }

    %% ========== Tickets (Contact Form) ==========
    TICKETS {
        uuid id PK "UUID"
        string first_name "NOT NULL"
        string last_name "NOT NULL"
        string email "NOT NULL"
        string phone "NOT NULL"
        text message "NOT NULL"
        string status "pending | resolved | cancelled — Default: pending"
        timestamp created_at "Auto"
    }

    %% ========== Relationships ==========
    USERS ||--o{ BOOKINGS : "creates"
    USERS ||--o{ REVIEWS : "writes"
    TOURS ||--o{ BOOKINGS : "has"
    TOURS ||--o{ TOUR_SCHEDULES : "has schedules"
    TOURS ||--o{ REVIEWS : "receives"
    BOOKINGS ||--|| PAYMENTS : "has one payment"
    BOOKINGS ||--o| REVIEWS : "may have one review"
    TOUR_SCHEDULES ||--o{ BOOKINGS : "booked on"
```

---

## 2. Database Schema (SQL DDL — ตรงกับ TypeORM Entity)

### 2.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(255),
    avatar_url VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user'
        CHECK (role IN ('admin', 'customer', 'user')),
    is_active BOOLEAN DEFAULT TRUE,
    "resetPasswordOtp" VARCHAR(255),
    "resetPasswordOtpExpires" TIMESTAMPTZ,
    "resetPasswordToken" VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

---

### 2.2 Tours Table

```sql
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    child_price DECIMAL(10,2),
    province VARCHAR(50),
    region VARCHAR(50) NOT NULL DEFAULT 'Central'
        CHECK (region IN ('North', 'South', 'Central', 'East', 'West', 'Northeast')),
    duration VARCHAR(50) NOT NULL DEFAULT '1 day'
        CHECK (duration IN ('1 day', '1 day 1 night', '2 days 1 night',
                            '2 days 2 nights', '3 days 2 nights')),
    max_group_size INTEGER NOT NULL DEFAULT 15,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    image_cover VARCHAR(255),
    images TEXT[],
    highlights TEXT[],
    preparation TEXT[],
    itinerary TEXT,
    itinerary_data JSONB,
    included TEXT,
    excluded TEXT,
    conditions TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'Nature'
        CHECK (category IN ('Sea', 'Mountain', 'Cultural', 'Nature', 'City', 'Adventure')),
    is_active BOOLEAN DEFAULT TRUE,
    is_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tours_region ON tours(region);
CREATE INDEX idx_tours_category ON tours(category);
CREATE INDEX idx_tours_active ON tours(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_tours_recommended ON tours(is_recommended) WHERE is_recommended = TRUE;
```
CREATE INDEX idx_tours_featured ON tours(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_tours_price ON tours(base_price);
CREATE INDEX idx_tours_category_region ON tours(category, region);
CREATE INDEX idx_tours_title_fulltext ON tours USING GIN (to_tsvector('thai', title));
```

---

### 2.3 Tour Schedules Table

```sql
CREATE TABLE tour_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    max_capacity_override INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tour_id, available_date)
);

CREATE INDEX idx_schedules_tour_date ON tour_schedules(tour_id, available_date);
CREATE INDEX idx_schedules_available ON tour_schedules(available_date) WHERE is_available = TRUE;
```

---

### 2.4 Bookings Table

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(255) UNIQUE,
    tour_id UUID NOT NULL REFERENCES tours(id),
    user_id UUID NOT NULL REFERENCES users(id),
    tour_schedule_id UUID REFERENCES tour_schedules(id),
    travel_date DATE,
    start_date DATE,
    end_date DATE,
    pax INTEGER NOT NULL CHECK (pax > 0),
    base_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_pay'
        CHECK (status IN ('pending_pay', 'pending_verify', 'confirmed', 'cancelled', 'expired')),
    payment_slip_url VARCHAR(255),
    payment_deadline TIMESTAMPTZ,
    selected_options JSONB,
    contact_info JSONB NOT NULL,
    special_requests TEXT,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_deadline ON bookings(payment_deadline);
```

---

### 2.5 Payments Table

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    slip_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending_verify'
        CHECK (status IN ('pending_verify', 'approved', 'rejected')),
    "verifiedAt" TIMESTAMPTZ,
    "uploadedAt" TIMESTAMPTZ DEFAULT NOW()
);
-- OneToOne relationship ผ่าน JoinColumn ใน TypeORM → booking_id FK
CREATE INDEX idx_payments_status ON payments(status);
```

---

### 2.6 Reviews Table

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (booking_id)
);

CREATE INDEX idx_reviews_tour_id ON reviews(tour_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

---

### 2.7 Tickets Table (Contact Form)

```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'resolved', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Database Views

### 3.1 Tour Availability View (ใช้ schedules + bookings)

```sql
CREATE OR REPLACE VIEW tour_date_availability AS
SELECT
    t.id AS tour_id,
    ts.available_date,
    COALESCE(ts.max_capacity_override, t.max_group_size) AS max_capacity,
    COALESCE(SUM(b.pax) FILTER (
        WHERE b.status IN ('confirmed', 'pending_verify', 'pending_pay')
    ), 0) AS booked_seats,
    COALESCE(ts.max_capacity_override, t.max_group_size) - COALESCE(SUM(b.pax) FILTER (
        WHERE b.status IN ('confirmed', 'pending_verify', 'pending_pay')
    ), 0) AS available_seats,
    ts.is_available
FROM tours t
JOIN tour_schedules ts ON ts.tour_id = t.id
LEFT JOIN bookings b ON b.tour_id = t.id AND b.travel_date = ts.available_date
GROUP BY t.id, ts.available_date, ts.max_capacity_override, t.max_group_size, ts.is_available;
```

---

## 4. Key Business Rules ที่ใช้งานจริงในโค้ด

| Rule | รายละเอียด |
|---|---|
| Payment Deadline | 15 นาที หลังสร้าง Booking (ไม่ใช่ 24 ชม.) |
| Pricing | `price` × adults + `child_price` × children |
| Discount | 5% ถ้า booking date อยู่ในอนาคต |
| Max Active Bookings | 5 bookings ต่อ user (status: pending_pay, pending_verify, confirmed) |
| One Review Per Booking | booking_id UNIQUE ใน reviews table |
| Auto-Expire | Cron job ทุกชั่วโมง — UPDATE status = 'expired' WHERE payment_deadline < NOW() |
| Concurrency | `DataSource.transaction()` + pessimistic_write lock ป้องกัน overbooking |

---

## 5. Seed Data

### Default Admin Account

```sql
-- Admin: username = admin, password = admin1234
INSERT INTO users (id, username, password, full_name, role)
VALUES (
    gen_random_uuid(),
    'admin',
    '$2b$10$...',  -- bcrypt hash ของ 'admin1234'
    'Admin User',
    'admin'
);
```

---

## 6. Data Dictionary

### Table: USERS

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, auto | Primary Key |
| username | VARCHAR(255) | UNIQUE, NOT NULL | Login username |
| password | VARCHAR(255) | NOT NULL | bcrypt hash |
| email | VARCHAR(255) | UNIQUE, NULLABLE | Email address |
| first_name | VARCHAR(255) | NULLABLE | ชื่อ |
| last_name | VARCHAR(255) | NULLABLE | นามสกุล |
| full_name | VARCHAR(255) | NULLABLE | ชื่อเต็ม |
| phone | VARCHAR(255) | NULLABLE | เบอร์โทร |
| avatar_url | VARCHAR(255) | NULLABLE | Avatar image path |
| role | ENUM | Default: 'user' | ADMIN / CUSTOMER / USER |
| is_active | BOOLEAN | Default: true | Account active flag |
| resetPasswordOtp | VARCHAR(255) | NULLABLE | OTP 6 หลัก |
| resetPasswordOtpExpires | TIMESTAMPTZ | NULLABLE | OTP expiry |
| resetPasswordToken | VARCHAR(255) | NULLABLE | Reset token |
| created_at | TIMESTAMPTZ | Auto | วันสร้าง |
| updated_at | TIMESTAMPTZ | Auto | วันอัปเดต |

### Table: TOURS

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Tour identifier |
| title | VARCHAR(100) | NOT NULL | ชื่อทัวร์ |
| description | TEXT | NULLABLE | คำอธิบาย |
| price | DECIMAL(10,2) | NOT NULL | ราคาผู้ใหญ่ |
| child_price | DECIMAL(10,2) | NULLABLE | ราคาเด็ก |
| province | VARCHAR(50) | NULLABLE | จังหวัด |
| region | ENUM | Default: Central | ภาค |
| duration | ENUM | Default: '1 day' | ระยะเวลา |
| max_group_size | INTEGER | Default: 15 | จำนวนคนสูงสุด |
| rating | DECIMAL(2,1) | Default: 0 | คะแนนเฉลี่ย (cached) |
| review_count | INTEGER | Default: 0 | จำนวนรีวิว |
| image_cover | VARCHAR(255) | NULLABLE | รูปหน้าปก |
| images | TEXT[] | NULLABLE | Gallery รูปภาพ |
| highlights | TEXT[] | NULLABLE | ไฮไลท์ |
| preparation | TEXT[] | NULLABLE | สิ่งที่ต้องเตรียม |
| itinerary | TEXT | NULLABLE | กำหนดการ (text) |
| itinerary_data | JSONB | NULLABLE | กำหนดการ (structured) |
| included | TEXT | NULLABLE | สิ่งที่รวม |
| excluded | TEXT | NULLABLE | สิ่งที่ไม่รวม |
| conditions | TEXT | NULLABLE | เงื่อนไข |
| category | ENUM | Default: Nature | หมวดหมู่ |
| is_active | BOOLEAN | Default: true | แสดงบนเว็บ |
| is_recommended | BOOLEAN | Default: false | แนะนำ |

### Table: BOOKINGS

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Booking ID |
| booking_reference | VARCHAR(255) | UNIQUE | เลขอ้างอิง |
| tour_id | UUID | FK → tours | ทัวร์ที่จอง |
| user_id | UUID | FK → users | ผู้จอง |
| tour_schedule_id | UUID | FK → tour_schedules, NULLABLE | ตาราง schedule |
| travel_date | DATE | NULLABLE | วันเดินทาง (one-day) |
| start_date | DATE | NULLABLE | วันเริ่ม (multi-day) |
| end_date | DATE | NULLABLE | วันจบ (multi-day) |
| pax | INTEGER | min 1 | จำนวนคน |
| base_price | DECIMAL(10,2) | NOT NULL | ราคาก่อนส่วนลด |
| discount | DECIMAL(10,2) | Default: 0 | ส่วนลด |
| total_price | DECIMAL(10,2) | NOT NULL | ราคารวม |
| status | ENUM | Default: pending_pay | สถานะ |
| payment_slip_url | VARCHAR(255) | NULLABLE | รูปสลิป |
| payment_deadline | TIMESTAMPTZ | NULLABLE | กำหนดชำระ (15 นาที) |
| selected_options | JSONB | NULLABLE | {adults, children} |
| contact_info | JSONB | NOT NULL | {name, email, phone} |
| special_requests | TEXT | NULLABLE | คำขอพิเศษ |
| cancellation_reason | TEXT | NULLABLE | เหตุผลยกเลิก |
| refund_amount | DECIMAL(10,2) | NULLABLE | เงินคืน |

### Table: PAYMENTS

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Payment ID |
| amount | DECIMAL(10,2) | NOT NULL | จำนวนเงิน |
| slip_url | VARCHAR(255) | NULLABLE | รูปสลิป |
| status | VARCHAR(20) | Default: pending_verify | สถานะการตรวจสอบ |
| verifiedAt | TIMESTAMPTZ | NULLABLE | เวลายืนยัน |
| uploadedAt | TIMESTAMPTZ | Auto | เวลาอัปโหลด |

### Table: TICKETS

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Ticket ID |
| first_name | VARCHAR(255) | NOT NULL | ชื่อผู้ติดต่อ |
| last_name | VARCHAR(255) | NOT NULL | นามสกุล |
| email | VARCHAR(255) | NOT NULL | อีเมล |
| phone | VARCHAR(255) | NOT NULL | เบอร์โทร |
| message | TEXT | NOT NULL | ข้อความ |
| status | VARCHAR(20) | Default: pending | สถานะ (pending/resolved/cancelled) |
| created_at | TIMESTAMPTZ | Auto | วันสร้าง |

---

**Last Updated:** 2026-03-06
**Status:** สอดคล้องกับ Entity ในโค้ดปัจจุบัน
