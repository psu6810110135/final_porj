# Thai Tour Website - Development Roadmap (SIMPLIFIED FOR YEAR 1)

> 📋 Todo List แบบเรียบง่าย เหมาะสำหรับนักศึกษาปี 1

---

## 🔄 Scope Update (ต้องทำเพิ่มให้ตรงระบบปัจจุบัน)

- **Tour Schedule & Slot**: สร้าง `tour_schedules` + API GET schedules + booking ต้องหัก slot
- **Featured Tours**: เพิ่มคอลัมน์ `is_featured` + endpoint/filter featured และหน้า Home ดึงเฉพาะ featured (Admin ปรับได้)
- **Reviews & Rating**: สร้าง `reviews` + API POST/GET + คำนวณ avg rating/ review_count กลับไปที่ tours
- **Booking Pricing & Auth**: เลิกใช้ราคา mock 5000; ใช้ `tours.price/child_price`, แยกผู้ใหญ่/เด็ก, ตรวจ slot, ใช้ userId จาก JWT
- **Search Flow**: Search หน้า Home ต้องส่ง query ไป `/tours` และ ToursPage ต้องอ่าน `search/region` เพื่อกรอง/ยิง backend

### File Upload Guardrails (แนวทางเพิ่ม)

- จำกัดขนาดไฟล์ผ่าน Multer `limits.fileSize` (เช่น 50MB จาก env) ส่ง 413 ถ้าเกิน
- ตรวจ MIME whitelist ใน `fileFilter` (ปี 1 ตรวจ MIME พอ) และปฏิเสธ MIME ต้องห้าม
- ป้องกัน path traversal: อย่าใช้ชื่อไฟล์จาก client เป็นพาธ; rename เป็น UUID; เก็บ original name แยกได้
- Storage ควรใช้ที่ปลอดภัย (เช่น S3) ใช้ชื่อ UUID; ปิดการใช้ `..` หรือ absolute path
- Error message ชัดเจนสำหรับ oversize / MIME ไม่ผ่าน / upload fail
- ทดสอบ: ไฟล์ถูกประเภท, ไฟล์ใหญ่เกิน, MIME ต้องห้าม, ตรวจว่าไฟล์ที่เซฟเป็น UUID ไม่มี path แฝง

---

## 🎯 ทัศนะภาพรวม (Overview)

| Phase       | งานหลัก                      | Priority  | ประมาณการ |
| ----------- | ---------------------------- | --------- | --------- |
| **Phase 0** | Setup & Infrastructure       | 🔴 High   | 1-2 วัน   |
| **Phase 1** | Database Setup               | 🔴 High   | 1 วัน     |
| **Phase 2** | Backend API                  | 🔴 High   | 5-7 วัน   |
| **Phase 3** | Frontend - Auth & Tours      | 🟡 Medium | 4-5 วัน   |
| **Phase 4** | Frontend - Booking & Payment | 🔴 High   | 4-5 วัน   |
| **Phase 5** | Admin Dashboard              | 🟡 Medium | 3-4 วัน   |
| **Phase 6** | Testing & Deployment         | 🟡 Medium | 2-3 วัน   |

---

## 📍 Phase 0: Setup & Infrastructure (1-2 วัน)

### 0.1 Project Repository Setup

- [ ] Create GitHub Repository
- [ ] Setup `.gitignore` (Node.js, .env, node_modules)
- [ ] Setup README.md with project overview
- [ ] Create branch structure (`main`, `dev`)

### 0.2 Frontend Setup (Vercel)

- [ ] Initialize React Project (Vite + React + TypeScript)
  ```bash
  npm create vite@latest frontend -- --template react-ts
  ```
- [ ] Install Dependencies:
  - [ ] `react-router-dom` (Routing)
  - [ ] `axios` (API calls)
  - [ ] `tailwindcss` (Styling)
  - [ ] `date-fns` (Date utilities)
  - [ ] `qrcode.react` (QR Code generation)
- [ ] Setup Folder Structure:
  ```
  frontend/
  ├── src/
  │   ├── components/     # Reusable components
  │   ├── pages/          # Page components
  │   ├── services/       # API services
  │   ├── utils/          # Helper functions
  │   └── App.tsx
  ├── public/
  └── package.json
  ```
- [ ] Setup Environment Variables (`.env`)
  - `VITE_API_URL=http://localhost:3000/api/v1`

### 0.3 Backend Setup (Render) - NestJS

- [ ] Initialize NestJS Project
  ```bash
  npm i -g @nestjs/cli
  nest new backend
  ```
- [ ] Install Dependencies:
  - [ ] `@nestjs/typeorm` (ORM)
  - [ ] `typeorm` (Database ORM)
  - [ ] `pg` (PostgreSQL driver)
  - [ ] `bcryptjs` (Password hashing)
  - [ ] `@nestjs/jwt` (JWT authentication)
  - [ ] `@nestjs/passport` (Authentication)
  - [ ] `passport-jwt` (JWT strategy)
  - [ ] `class-validator` (Input validation)
  - [ ] `class-transformer` (Data transformation)
  - [ ] `@nestjs/config` (Environment config)
  - [ ] **NOTE**: Email ใช้ console.log() ไม่ต้องติดตั้ง nodemailer
- [ ] Setup Folder Structure:
  ```
  backend/
  ├── src/
  │   ├── auth/           # Authentication module
  │   ├── tours/          # Tour management module
  │   ├── schedules/      # Tour schedules module
  │   ├── bookings/       # Booking module
  │   ├── payments/       # Payment module
  │   ├── reviews/        # Reviews module
  │   ├── users/          # User management module
  │   ├── common/         # Shared utilities
  │   └── main.ts         # Entry point
  ├── .env
  └── package.json
  ```
- [ ] Setup Environment Variables (`.env`)
  - `PORT=3000`
  - `DATABASE_URL=postgresql://...`
  - `JWT_SECRET=your-secret-key`
  - `JWT_EXPIRES_IN=24h`

### 0.4 Database Setup (PostgreSQL)

- [ ] Create PostgreSQL instance (Render/Railway)
- [ ] Get Connection String
- [ ] Setup Database (ดู Phase 1)

---

## 📍 Phase 1: Database Setup (1 วัน)

### 1.1 Create Tables (ตามลำดับ)

#### Users

- [ ] Create `users` table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
```

#### Tours

- [ ] Create `tours` table

```sql
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    itinerary TEXT,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    region VARCHAR(50) NOT NULL CHECK (region IN ('North', 'South', 'Central', 'East', 'West', 'Northeast')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('Adventure', 'Relax', 'Culture', 'Food', 'Beach')),
    tour_type VARCHAR(20) NOT NULL DEFAULT 'one_day' CHECK (tour_type IN ('one_day', 'multi_day')),
    duration_days INTEGER NOT NULL DEFAULT 1 CHECK (duration_days > 0),
    transportation TEXT,
    accommodation TEXT,
    max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
    image_url TEXT,
    additional_images TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    options JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tours_region ON tours(region);
CREATE INDEX idx_tours_category ON tours(category);
CREATE INDEX idx_tours_type ON tours(tour_type);
CREATE INDEX idx_tours_active ON tours(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_tours_featured ON tours(is_featured) WHERE is_featured = TRUE;
```

#### Bookings

- [ ] Create `bookings` table

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE RESTRICT,
    pax INTEGER NOT NULL CHECK (pax > 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
    travel_date DATE,
    start_date DATE,
    end_date DATE,
    selected_options JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_pay'
        CHECK (status IN ('pending_pay', 'pending_verify', 'confirmed', 'cancelled', 'expired')),
    payment_deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_deadline ON bookings(payment_deadline);
CREATE INDEX idx_bookings_travel_date ON bookings(travel_date);
```

#### Tour Schedules

- [ ] Create `tour_schedules` table

```sql
CREATE TABLE tour_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    max_capacity_override INTEGER CHECK (max_capacity_override IS NULL OR max_capacity_override > 0),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tour_id, available_date)
);
CREATE INDEX idx_schedules_tour_date ON tour_schedules(tour_id, available_date);
CREATE INDEX idx_schedules_available ON tour_schedules(available_date) WHERE is_available = TRUE;
```

#### Reviews

- [ ] Create `reviews` table

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (booking_id)
);
CREATE INDEX idx_reviews_tour_id ON reviews(tour_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

#### Payments

- [ ] Create `payments` table

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    slip_url TEXT,
    slip_hash VARCHAR(64) UNIQUE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    uploaded_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'waiting'
        CHECK (status IN ('waiting', 'pending_verify', 'approved', 'rejected')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    reject_reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payments_hash ON payments(slip_hash);
```

### 1.2 Create Views (สำหรับดู availability)

```sql
-- View แสดง availability ต่อวัน (ใช้ tour_schedules)
CREATE OR REPLACE VIEW tour_date_availability AS
SELECT
    t.id AS tour_id,
    ts.available_date,
    COALESCE(ts.max_capacity_override, t.max_capacity) AS max_capacity,
    COALESCE(SUM(b.pax) FILTER (
        WHERE b.status IN ('confirmed', 'pending_verify', 'pending_pay')
    ), 0) AS booked_seats,
    COALESCE(ts.max_capacity_override, t.max_capacity) - COALESCE(SUM(b.pax) FILTER (
        WHERE b.status IN ('confirmed', 'pending_verify', 'pending_pay')
    ), 0) AS available_seats,
    ts.is_available
FROM tours t
JOIN tour_schedules ts ON ts.tour_id = t.id
LEFT JOIN bookings b ON b.tour_id = t.id AND b.travel_date = ts.available_date
GROUP BY t.id, ts.available_date, ts.max_capacity_override, t.max_capacity, ts.is_available;
```

### 1.3 Create Simple Trigger (auto-update updated_at)

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

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 1.4 Seed Data (ข้อมูลทดสอบ)

- [ ] Create Admin Test Account: `admin@test.com` / `TestPass123!`
- [ ] Create Customer Test Account: `customer@test.com` / `TestPass123!`
- [ ] Insert 5-10 Sample Tours

---

## 📍 Phase 2: Backend API (5-7 วัน)

### 2.1 Authentication Module

- [ ] Create Auth Module: `nest g module auth`
- [ ] Create Auth Service: `nest g service auth`
- [ ] Create Auth Controller: `nest g controller auth`
- [ ] Create JwtStrategy for passport
- [ ] Create JwtAuthGuard
- [ ] Implement endpoints:
  - [ ] `POST /api/v1/auth/register` - Register new user
  - [ ] `POST /api/v1/auth/login` - Login with email/password
  - [ ] `POST /api/v1/auth/logout` - Logout (optional, mainly clear client-side token)

### 2.2 Tour Module

- [ ] Create Tour Module: `nest g module tours`
- [ ] Create Tour Service: `nest g service tours`
- [ ] Create Tour Controller: `nest g controller tours`
- [ ] Implement endpoints:
  - [ ] `GET /api/v1/tours` - List all tours (with filters: region, category, tour_type, is_featured)
  - [ ] `GET /api/v1/tours/one-day` - List one-day tours only
  - [ ] `GET /api/v1/tours/multi-day` - List multi-day tours only
  - [ ] `GET /api/v1/tours/featured` - List featured tours (for Home page)
  - [ ] `GET /api/v1/tours/:id` - Get tour details
  - [ ] `GET /api/v1/tours/:id/schedules` - Get available dates for a tour
  - [ ] `POST /api/v1/tours` - Create new tour (Admin only)
  - [ ] `PATCH /api/v1/tours/:id` - Update tour (Admin only)
  - [ ] `DELETE /api/v1/tours/:id` - Soft delete tour (Admin only)

### 2.2b Tour Schedule Module

- [ ] Create Schedule Module: `nest g module schedules`
- [ ] Create Schedule Service: `nest g service schedules`
- [ ] Implement endpoints:
  - [ ] `POST /api/v1/tours/:id/schedules` - Add schedule date (Admin only)
  - [ ] `PATCH /api/v1/tours/:id/schedules/:scheduleId` - Update schedule (Admin only)
  - [ ] `DELETE /api/v1/tours/:id/schedules/:scheduleId` - Remove schedule (Admin only)

### 2.3 Booking Module

- [ ] Create Booking Module: `nest g module bookings`
- [ ] Create Booking Service: `nest g service bookings`
- [ ] Create Booking Controller: `nest g controller bookings`
- [ ] Implement endpoints:
  - [ ] `POST /api/v1/bookings/calculate` - Calculate price
  - [ ] `POST /api/v1/bookings` - Create booking (with transaction)
  - [ ] `GET /api/v1/bookings/my-bookings` - Get user's bookings
  - [ ] `GET /api/v1/bookings/:id` - Get booking details
  - [ ] `PATCH /api/v1/bookings/:id/cancel` - Cancel booking

**CRITICAL: Booking Creation with Transaction**

```typescript
// Pseudo-code
async createBooking(data) {
  return await this.dataSource.transaction(async (manager) => {
    // 1. Lock tour row
    const tour = await manager.findOne(Tour, {
      where: { id: data.tourId },
      lock: { mode: 'pessimistic_write' }
    });

    // 2. Check availability
    const availability = await this.checkAvailability(tour.id, data.travelDate);
    if (availability < data.pax) {
      throw new Error('Insufficient seats');
    }

    // 3. Create booking
    const booking = manager.create(Booking, {
      ...data,
      status: 'pending_pay',
      paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await manager.save(booking);

    // 4. Create payment record
    const payment = manager.create(Payment, {
      bookingId: booking.id,
      amount: data.totalPrice,
      status: 'waiting'
    });
    await manager.save(payment);

    // 5. Generate QR Code
    const qrCode = await this.generateQRCode(data.totalPrice, booking.id);

    return { booking, qrCode };
  });
}
```

### 2.4 Payment Module

- [ ] Create Payment Module: `nest g module payments`
- [ ] Create Payment Service: `nest g service payments`
- [ ] Create Payment Controller: `nest g controller payments`
- [ ] Implement endpoints:
  - [ ] `POST /api/v1/payments/:bookingId/upload` - Upload slip
  - [ ] `GET /api/v1/payments/pending` - Get pending payments (Admin only)
  - [ ] `PATCH /api/v1/payments/:id/verify` - Verify payment (Admin only)

**Upload Slip Logic:**

```typescript
async uploadSlip(file, bookingId) {
  // 1. Calculate hash
  const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

  // 2. Check duplicate
  const existing = await this.paymentRepo.findOne({ where: { slipHash: hash } });
  if (existing) {
    throw new Error('Duplicate slip detected');
  }

  // 3. Upload to File Storage (local/cloud)
  const url = await this.uploadToStorage(file, bookingId);

  // 4. Update payment record
  await this.paymentRepo.update(
    { bookingId },
    {
      slipUrl: url,
      slipHash: hash,
      status: 'pending_verify',
      uploadedAt: new Date()
    }
  );

  // 5. Update booking status
  await this.bookingRepo.update(
    { id: bookingId },
    { status: 'pending_verify' }
  );

  // 6. Log to console (simulate email)
  console.log(`📧 New payment uploaded for booking ${bookingId}`);
}
```

### 2.5 Reviews Module

- [ ] Create Review Module: `nest g module reviews`
- [ ] Create Review Service: `nest g service reviews`
- [ ] Create Review Controller: `nest g controller reviews`
- [ ] Implement endpoints:
  - [ ] `POST /api/v1/reviews` - Create review (must have confirmed booking)
  - [ ] `GET /api/v1/tours/:id/reviews` - Get reviews for a tour
- [ ] Auto-update `tours.average_rating` and `tours.review_count` after review created

### 2.6 Admin Module (Simple)

- [ ] Create Admin Module: `nest g module admin`
- [ ] Create Admin Service: `nest g service admin`
- [ ] Create Admin Controller: `nest g controller admin`
- [ ] Implement endpoints:
  - [ ] `GET /api/v1/admin/stats` - Dashboard statistics

### 2.6 Background Jobs (Simple Cron)

- [ ] Install `@nestjs/schedule`
- [ ] Create ScheduleModule
- [ ] Implement cron jobs:
  - [ ] Expire pending bookings (every hour)

  ```typescript
  @Cron('0 * * * *') // Every hour
  async expirePendingBookings() {
    await this.bookingRepo.update(
      {
        status: 'pending_pay',
        paymentDeadline: LessThan(new Date())
      },
      { status: 'expired' }
    );
  }
  ```

  - [ ] Ping `/api/health` every 10 minutes (prevent Render sleep)

  ```typescript
  @Cron('*/10 * * * *') // Every 10 minutes
  async pingHealth() {
    console.log('🏥 Health check ping');
  }
  ```

---

## 📍 Phase 3: Frontend - Auth & Tours (4-5 วัน)

### 3.1 Common Components

- [ ] `Layout` (Navbar, Footer)
- [ ] `LoadingSpinner`
- [ ] `ErrorMessage`
- [ ] `ProtectedRoute` (wrapper สำหรับหน้าที่ต้อง login)

### 3.2 Authentication Pages

- [ ] `Login` page
- [ ] `Register` page

### 3.3 Tour Pages

- [ ] `TourList` page (Home)
  - [ ] Search filters (Region, Category, Price)
  - [ ] Tour card grid
  - [ ] Pagination
- [ ] `TourDetail` page
  - [ ] Tour information display
  - [ ] Image gallery
  - [ ] "Book Now" button

### 3.4 User Profile

- [ ] `MyProfile` page
  - [ ] View/Edit profile
  - [ ] Change password

---

## 📍 Phase 4: Frontend - Booking & Payment (4-5 วัน)

### 4.1 Booking Flow

- [ ] `BookingForm` component
  - [ ] Select travel date
  - [ ] Input pax
  - [ ] Price calculation
- [ ] `BookingConfirmation` page
  - [ ] Show QR Code
  - [ ] Show deadline

### 4.2 Payment Flow

- [ ] `PaymentUpload` component
  - [ ] File upload (drag & drop)
  - [ ] Preview
  - [ ] Validation
- [ ] `PaymentStatus` page

### 4.3 My Bookings

- [ ] `MyBookings` page
  - [ ] List all bookings
  - [ ] Filter by status
  - [ ] View details

---

## 📍 Phase 5: Admin Dashboard (3-4 วัน)

### 5.1 Admin Layout

- [ ] `AdminLayout` (Sidebar)
- [ ] Admin route protection

### 5.2 Dashboard Overview

- [ ] `DashboardOverview` page
  - [ ] Total revenue
  - [ ] Today's bookings
  - [ ] Pending payments count

### 5.3 Tour Management

- [ ] `TourList` (Admin view)
- [ ] `TourForm` (Create/Edit)
- [ ] Delete confirmation

### 5.4 Payment Verification

- [ ] `PendingPayments` page
  - [ ] List pending payments
  - [ ] View slip modal
  - [ ] Approve/Reject buttons

---

## 📍 Phase 6: Testing & Deployment (2-3 วัน)

### 6.1 Testing

- [ ] Manual Testing
  - [ ] Complete customer journey
  - [ ] Complete admin journey
  - [ ] Test concurrent booking (3-5 users)
  - [ ] Test duplicate slip detection

### 6.2 Deployment

- [ ] **Frontend to Vercel**
  - [ ] Connect GitHub repo
  - [ ] Setup environment variables
  - [ ] Deploy
- [ ] **Backend to Render**
  - [ ] Connect GitHub repo
  - [ ] Setup environment variables
  - [ ] Deploy
- [ ] **Database (PostgreSQL)**
  - [ ] Run migration scripts

### 6.3 Post-Deployment

- [ ] Test all endpoints on production
- [ ] Verify file upload works
- [ ] Setup health check monitoring

---

## 🔥 Critical Tasks (ทำก่อนเป็นพิเศษ)

| Priority | Task                                 | Why                        |
| -------- | ------------------------------------ | -------------------------- |
| 🔴🔴🔴   | Database Tables (6 tables)           | ทุกอย่างต้องใช้ DB         |
| 🔴🔴🔴   | Auth Service                         | ทุกหน้าต้อง Login          |
| 🔴🔴🔴   | Booking with Transaction             | ป้องกัน race condition     |
| 🔴🔴     | Payment Upload + Duplicate Detection | ป้องกันโกง                 |
| 🔴🔴     | Admin Payment Verification           | ระบบไม่ทำงานถ้าไม่มี       |
| 🔴       | Tour CRUD                            | ต้องมีข้อมูลทัวร์ก่อนจะจอง |

---

## 📝 หมายเหตุ

### File Naming Convention

- Components: `PascalCase` (e.g., `TourCard.tsx`)
- Services: `camelCase` (e.g., `tourService.ts`)

### Git Commit Convention

```
feat: add login page
fix: resolve race condition in booking
docs: update README
```

---

## ✅ Checklist ก่อน Deploy

```
✅ ทดสอบ Concurrent Booking (3-5 users → no overbooking)
✅ ทดสอบ Duplicate Slip
✅ ทดสอบ Auto-expire (24h)
✅ ทดสอบ Payment Reject → customer re-upload
✅ ทดสอบ File Upload
✅ ทดสอบ QR Code
✅ ทดสอบ Responsive (mobile)
```

---

**สิ่งที่ลบออกเพื่อลดความซับซ้อน:**

❌ Redis Caching
❌ Email Queue System  
❌ Audit Logs Table
❌ Session Table
❌ Password Reset Table
❌ Row Level Security (RLS)
❌ Winston Logger (ใช้ console.log แทน)
❌ Rate Limiter (ใช้ NestJS guards เบื้องต้น)
❌ Full-text Search Index
❌ Materialized Views
❌ cors, helmet, dotenv packages (NestJS มี built-in)
❌ zod (ใช้ class-validator แทน)
❌ winston (ใช้ console.log แทน)
❌ rate-limit package (ใช้ @nestjs/throttler แทน ถ้าจำเป็น)

**Last Updated:** 2025-02-10
**Status:** Simplified for Year 1 Students 🎓
