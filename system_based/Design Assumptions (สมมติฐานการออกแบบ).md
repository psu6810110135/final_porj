# Design Assumptions (สมมติฐานการออกแบบ) — Thai Tour Website

> เอกสารนี้แสดงสมมติฐานการออกแบบที่ใช้ในระบบจองทัวร์ออนไลน์ สอดคล้องกับโค้ดปัจจุบัน

---

## 1. User Assumptions

### 1.1 Device Readiness
- Modern web browsers (Chrome, Safari, Firefox)
- Responsive design (Desktop, Tablet, Mobile)
- JavaScript and Cookies enabled

### 1.2 Basic Knowledge
**Customers:**
- คุ้นเคยกับการใช้งานเว็บไซต์ e-commerce (Shopee, Lazada)
- ใช้แอป Mobile Banking ได้ (สำหรับสแกน PromptPay QR)
- อัปโหลดไฟล์ผ่านเบราว์เซอร์ได้

**Admins:**
- ตรวจสอบสลิปการชำระเงินได้
- จัดการข้อมูลทัวร์ ตารางเดินทาง ผู้ใช้ รีวิว และ Ticket ได้

---

## 2. System & Infrastructure Assumptions

### 2.1 Development Infrastructure

| Service | Technology | Port | Notes |
|---|---|---|---|
| Frontend | React + Vite | 5173 | Dev server with HMR |
| Backend | NestJS | 3000 | `npm run start:dev` |
| Database | PostgreSQL 16 | 5433 | Docker container |

- การพัฒนาใช้ Docker Compose สำหรับ PostgreSQL เท่านั้น (Backend/Frontend run locally)
- ใช้ `synchronize: true` ใน TypeORM — Auto-schema migration สำหรับ development

### 2.2 Internet Connection
- Always-on connectivity required
- Minimum bandwidth: 3 Mbps
- No offline capability

### 2.3 File Storage

| ประเภท | Path | Size Limit |
|---|---|---|
| Payment Slips | `./uploads/slips/` | 5 MB |
| Avatars | `./uploads/avatars/` | 2 MB |
| Tour Images | `./uploads/tour-images/` | multipart |

- ไฟล์เก็บใน local disk (`./uploads/`) — ไม่ใช้ Cloud Storage
- Backend serve static files ผ่าน `ServeStaticModule`
- รองรับ MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### 2.4 External Services

| Service | Usage | Note |
|---|---|---|
| Google OAuth 2.0 | Social Login | via `@nestjs/passport` + `passport-google-oauth20` |
| Gmail SMTP | OTP Password Reset Email | Nodemailer + App Password |
| PromptPay QR | Payment QR Code Generation | `promptpay-qr` package |

- Google OAuth: ผู้ใช้เลือกล็อกอินผ่าน Google ได้ — ระบบสร้าง User ใหม่อัตโนมัติ
- Email: ใช้สำหรับส่ง OTP เท่านั้น (forgot password) — Notification อื่นๆ ใช้ `console.log()`
- PromptPay: เข้ารหัส phone number เป็น QR Code string ฝั่ง Backend

### 2.5 Security Assumptions

| Layer | Protection | Note |
|---|---|---|
| Authentication | JWT + bcrypt + Google OAuth | AuthGuard('jwt') per-route |
| Authorization | RolesGuard + @Roles() decorator | Infrastructure exists, not applied universally |
| File Upload | Multer FileFilter + Size limit | PNG/JPG/GIF/WEBP only |
| Password Reset | 6-digit OTP + 10 min expiry | via Email |
| CORS | Enabled for localhost:5173 | dev config |

---

## 3. Data & Operational Assumptions

### 3.1 Data Accuracy
- Admin ยืนยันข้อมูลทัวร์ก่อนบันทึก
- ไม่มี Email Verification สำหรับ Registration
- Phone format: String (ไม่มี validation format)
- Username ต้องไม่ซ้ำ (unique constraint)

### 3.2 Currency & Geography
- Currency: THB only
- Region: Thailand only (ภาค: เหนือ, กลาง, อีสาน, ตะวันออก, ใต้)
- Time Zone: Asia/Bangkok (UTC+7)

### 3.3 Payment Assumptions

**Manual Verification Only:**
1. ระบบสร้าง PromptPay QR Code
2. ลูกค้าสแกน QR และชำระเงิน
3. ลูกค้าอัปโหลดสลิป (ภายใน 15 นาที)
4. Admin ตรวจสอบสลิปและ Approve/Reject

**Timing:**
- Payment deadline: **15 นาที** — Cron job `@Cron('*/1 * * * *')` ตรวจทุก 1 นาที
- Booking ที่เกิน 15 นาทีโดยไม่อัปโหลดสลิป → status `expired` + คืนที่นั่งอัตโนมัติ
- Verification SLA: ขึ้นอยู่กับ Admin (ไม่มี auto-enforcement)

### 3.4 Concurrency & Race Conditions
- Peak concurrency: ≤ 50 users
- `DataSource.transaction()` + `pessimistic_write` lock ป้องกัน race condition
- ตรวจ `remaining_seats` ภายใน transaction ก่อนสร้าง booking

---

## 4. Performance Assumptions

### 4.1 Response Time Targets

| Operation | Target | Acceptable |
|---|---|---|
| Page Load | < 2s | < 3s |
| API Response (GET) | < 500ms | < 1s |
| API Response (POST) | < 1s | < 2s |
| Image Load | < 1s | < 2s |

### 4.2 Load Capacity
- Daily Active Users: 100-300
- Peak Concurrent: 50 users
- Requests Per Second: 10 req/s (avg), 30 req/s (peak)

---

## 5. Testing Assumptions

### 5.1 Testing Scope

**มี:**
- ✅ Manual Testing (user journey ทั้งหมด)
- ✅ Unit Tests (Jest — NestJS services/controllers)
- ✅ E2E Tests (Jest + supertest — backend API)
- ✅ Playwright E2E Tests (browser automation — root level)
- ✅ Concurrent booking test

**ไม่มี:**
- ❌ Load testing / Stress testing
- ❌ Penetration testing
- ❌ Security scanning automation

### 5.2 Test Data (Seed)
- Admin account seeded on startup: `admin` / `admin1234`
- Role: `ADMIN`
- Customer accounts: ลงทะเบียนผ่านหน้า `/register`

---

## 6. Maintenance Assumptions

### 6.1 Database
- PostgreSQL 16 via Docker — data persists in Docker volume
- `synchronize: true` — TypeORM auto-migrate (dev only, ไม่ใช้ใน production)
- Connection: `postgresql://thai_tours:thai_tours_password@localhost:5433/thai_tours`

### 6.2 Monitoring
- Console logging only (`console.log`)
- ไม่มี real-time alerts
- ไม่มี structured logging (Winston/Pino)

---

## 7. Business Logic Assumptions

### 7.1 Cancellation Rules
- ยกเลิกได้เมื่อ status = `pending_pay` เท่านั้น
- ไม่มี refund ถ้า status = `confirmed`
- ยกเลิกแล้วคืนที่นั่งอัตโนมัติ

### 7.2 Pricing Logic
```
basePrice = tour.price × adults
childTotal = tour.childPrice × children
discount = 5% ถ้า group ≥ 5 คน
totalPrice = (basePrice + childTotal) - discount
```
- ไม่มี seasonal pricing
- ราคาแยก ผู้ใหญ่ / เด็ก

### 7.3 Booking Constraints
- ที่นั่งตัดทันทีเมื่อสร้าง booking (lock + deduct)
- คืนที่นั่งเมื่อ cancel/expire
- จำกัด active bookings ต่อ user: สูงสุด 5 รายการ (configurable ใน `booking.config.ts`)

### 7.4 Tour Schedules
- แต่ละทัวร์มีหลาย `TourSchedule` — วันที่เปิดให้จอง
- Composite unique index: `[tour_id, available_date]`
- Admin enable/disable แต่ละวันที่ได้

---

## 8. Summary

| หัวข้อ | สถานะปัจจุบัน |
|---|---|
| Logger | console.log() |
| Cache | ไม่มี (query DB โดยตรง) |
| Email | Nodemailer สำหรับ OTP เท่านั้น |
| Auth | JWT + Google OAuth + OTP Reset |
| File Storage | Local disk (`./uploads/`) |
| Database | PostgreSQL 16 (Docker, port 5433) |
| Payment | PromptPay QR + Manual verify |
| Payment Deadline | 15 นาที (Cron auto-expire) |
| Booking Lock | Transaction + pessimistic_write |

---

## 9. Validation Checklist

```
✅ Test concurrent booking (pessimistic lock)
✅ Test auto-expire (15 นาที cron)
✅ Test payment reject → re-upload
✅ Test file upload (slip 5MB, avatar 2MB)
✅ Test QR code generation (PromptPay)
✅ Test Google OAuth login
✅ Test OTP password reset
✅ Test responsive (mobile)
✅ Test admin tour/schedule CRUD
```

---

**Last Updated:** 2026-03-06
**Status:** สอดคล้องกับโค้ดปัจจุบัน
