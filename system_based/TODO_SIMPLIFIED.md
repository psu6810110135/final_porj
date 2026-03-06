# Thai Tour Website — Development Status & Roadmap

> สถานะการพัฒนาและ Roadmap ที่สอดคล้องกับโค้ดปัจจุบัน

---

## สถานะรวม (Current Status)

| Module | Backend | Frontend | Status |
|---|---|---|---|
| Auth (JWT + Google OAuth + OTP) | ✅ | ✅ | Complete |
| Tours (CRUD + Search + Filter) | ✅ | ✅ | Complete |
| Tour Schedules | ✅ | ✅ | Complete |
| Bookings (Transaction + Lock) | ✅ | ✅ | Complete |
| Payments (PromptPay + Verify) | ✅ | ✅ | Complete |
| Reviews | ✅ | ✅ | Complete |
| Users (Profile + Avatar) | ✅ | ✅ | Complete |
| Tickets (Contact) | ✅ | ✅ | Complete |
| Admin Dashboard | ✅ | ✅ | Complete |

---

## Phase 0: Infrastructure ✅

### สิ่งที่ทำแล้ว

- [x] React + Vite + TypeScript (frontend, port 5173)
- [x] NestJS + TypeORM (backend, port 3000)
- [x] PostgreSQL 16 via Docker Compose (port 5433)
- [x] Tailwind CSS v4 + shadcn/ui components
- [x] `run.sh` / `stop.sh` scripts
- [x] Frontend path alias `@/` → `src/`
- [x] Backend `synchronize: true` (auto-schema)

### Dependencies ที่ติดตั้งแล้ว

**Backend:**
- `@nestjs/typeorm`, `typeorm`, `pg`
- `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `passport-google-oauth20`
- `bcryptjs`, `class-validator`, `class-transformer`
- `@nestjs/schedule` (cron jobs)
- `nodemailer` (OTP email)
- `promptpay-qr` (QR code generation)
- `multer` (file upload)
- `@nestjs/serve-static` (serve uploaded files)

**Frontend:**
- `react-router-dom` v7
- `axios`
- `tailwindcss` v4, `shadcn/ui`
- `date-fns` / `dayjs`
- `lucide-react` (icons)

### Environment

```
# Backend
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=thai_tours
DB_PASSWORD=thai_tours_password
DB_DATABASE=thai_tours
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
EMAIL_USER=... (Gmail)
EMAIL_PASS=... (App Password)
PROMPTPAY_PHONE=...
```

```
# Frontend
VITE_API_URL=http://localhost:3000  (ใช้ผ่าน src/config/api.ts → API_BASE_URL)
```

---

## Phase 1: Database ✅

### 7 Tables (TypeORM auto-generated)

| Table | Primary Key | Key Columns |
|---|---|---|
| `users` | UUID | username (unique), password, role (ADMIN/CUSTOMER/USER), email, first_name, last_name, phone, avatar_url, resetPasswordOtp |
| `tours` | UUID | title, price, child_price, province, region (enum), category (enum), duration (enum), max_capacity, image_cover, images[], itinerary_data JSONB, is_recommended |
| `tour_schedules` | UUID | tour_id (FK), available_date, max_capacity, is_available — unique(tour_id, available_date) |
| `bookings` | UUID | user_id (FK), tour_id (FK), tour_schedule_id (FK), booking_reference, adults, children, base_price, discount, total_price, contact_info JSONB, payment_deadline, status |
| `payments` | UUID | booking_id (FK), amount, status, payment_method, slip_url |
| `reviews` | UUID | user_id (FK), tour_id (FK), booking_id (FK), rating (1-5), comment |
| `tickets` | UUID | name, email, phone, message, status (pending/resolved/cancelled) |

### Seed Data

- Admin account seeded on startup: `admin` / `admin1234` (role: ADMIN)

---

## Phase 2: Backend API ✅

### Auth Module (`@Controller('auth')`)

- [x] `POST /api/auth/signup` — Register (username + password)
- [x] `POST /api/auth/signin` — Login → JWT token
- [x] `GET /api/auth/google` — Google OAuth redirect
- [x] `GET /api/auth/google/callback` — Google OAuth callback → token
- [x] `GET /api/auth/profile` — Get current user (JWT)
- [x] `POST /api/auth/forgot-password` — Send OTP to email
- [x] `POST /api/auth/verify-otp` — Verify 6-digit OTP
- [x] `POST /api/auth/reset-password` — Reset password with token

### Tours Module (`@Controller('api/tours')`)

- [x] `GET /api/tours` — List tours (filter: region, category, province, duration, price, search, sort)
- [x] `GET /api/tours/recommended` — Recommended tours
- [x] `GET /api/tours/:id` — Tour detail
- [x] `POST /api/tours` — Create tour (Admin, multipart/form-data)
- [x] `PATCH /api/tours/:id` — Update tour (Admin)
- [x] `DELETE /api/tours/:id` — Delete tour (Admin)
- [x] `GET /api/tours/:id/schedules` — Get schedules
- [x] `GET /api/tours/:id/schedules/available` — Available schedules only
- [x] `POST /api/tours/:id/schedules` — Create schedule (Admin)
- [x] `PATCH /api/tours/:id/schedules/:scheduleId` — Update schedule (Admin)
- [x] `DELETE /api/tours/:id/schedules/:scheduleId` — Delete schedule (Admin)

### Bookings Module (`@Controller('api/bookings')`)

- [x] `POST /api/bookings` — Create booking (Transaction + pessimistic_write lock)
- [x] `POST /api/bookings/calculate` — Calculate price (adults × price + children × childPrice - discount)
- [x] `GET /api/bookings/my-bookings` — User's bookings
- [x] `GET /api/bookings/:id` — Booking detail
- [x] `PATCH /api/bookings/:id/cancel` — Cancel booking (pending_pay only)
- [x] `POST /api/bookings/:id/upload-slip` — Upload payment slip (Multer, 5MB)

### Payments Module (`@Controller('api/payments')`)

- [x] `GET /api/payments/pending` — Pending payments (Admin)
- [x] `GET /api/payments/booking/:bookingId` — Payment by booking
- [x] `PATCH /api/payments/:id/verify` — Approve/Reject (Admin)

### Reviews Module (`@Controller('api/reviews')`)

- [x] `POST /api/reviews` — Create review (confirmed booking required)
- [x] `GET /api/reviews/tour/:tourId` — Reviews for a tour
- [x] `GET /api/reviews/admin` — All reviews (Admin)

### Users Module (`@Controller('api/users')`)

- [x] `GET /api/users/me` — Get profile
- [x] `PATCH /api/users/me` — Update profile
- [x] `POST /api/users/me/avatar` — Upload avatar (Multer, 2MB)
- [x] `GET /api/users` — List all users (Admin)
- [x] `DELETE /api/users/:id` — Delete user (Admin)

### Tickets Module (`@Controller('api/tickets')`)

- [x] `POST /api/tickets` — Create ticket (public)
- [x] `GET /api/tickets` — List tickets (Admin)
- [x] `PATCH /api/tickets/:id` — Update ticket status (Admin)

### Admin Module (`@Controller('api/admin')`)

- [x] `GET /api/admin/stats` — Dashboard statistics (revenue, bookings, users)

### Background Jobs (Cron)

- [x] `@Cron('*/1 * * * *')` — Expire bookings past 15-minute deadline (คืนที่นั่ง + status → expired)

---

## Phase 3: Frontend — Auth & Tours ✅

### Pages ที่ทำแล้ว

- [x] `/` — Home page (recommended tours, search)
- [x] `/tours` — Tour list (filter, search, sort)
- [x] `/tours/:id` — Tour detail (info, schedules, reviews, booking form)
- [x] `/login` — Login page (username/password + Google OAuth)
- [x] `/register` — Register page
- [x] `/login/success` — Google OAuth callback handler
- [x] `/forgot-password` — Send OTP + verify + reset
- [x] `/profile` — User profile + avatar upload
- [x] `/contact` — Contact / ticket form

### Components

- [x] Navbar / Footer (Layout)
- [x] AdminGuard (client-side role check)
- [x] shadcn/ui: Button, Card, Badge, Input, Sheet, Dialog, etc.
- [x] `cn()` utility (`clsx` + `tailwind-merge`)

---

## Phase 4: Frontend — Booking & Payment ✅

- [x] Booking form (Sheet component ใน TourDetail)
- [x] Date selection → available schedules
- [x] Adults + Children count
- [x] Price calculation (auto via API)
- [x] `/payment/:id` — Payment page (PromptPay QR + 15-min countdown)
- [x] Slip upload
- [x] `/booking-history` — Booking history (list + status badges)
- [x] Cancel booking (pending_pay only)

---

## Phase 5: Admin Dashboard ✅

- [x] `/admin` — Dashboard (stats overview)
- [x] `/admin/tours` — Tour management (CRUD + image upload)
- [x] `/admin/schedules` — Schedule management
- [x] `/admin/bookings` — Booking management
- [x] `/admin/payments` — Payment verification (view slip + approve/reject)
- [x] `/admin/users` — User management
- [x] `/admin/reviews` — Review management
- [x] `/admin/tickets` — Ticket management

---

## Phase 6: Testing ✅ (Partial)

- [x] Jest unit tests (backend: `*.spec.ts`)
- [x] Jest E2E tests (backend: `test/*.e2e-spec.ts`)
- [x] Playwright E2E tests (root: `tests/*.spec.ts`)
- [ ] Load testing (not done)
- [ ] Security penetration testing (not done)

---

## สิ่งที่ยังอาจปรับปรุงได้ (Optional Improvements)

| หัวข้อ | รายละเอียด | Priority |
|---|---|---|
| RolesGuard enforcement | Infrastructure อยู่ใน `auth/` แต่ยังไม่ apply ทุก route | Medium |
| Email notifications | ปัจจุบัน Nodemailer ใช้เฉพาะ OTP — booking/payment notify ยัง console.log | Low |
| Production deployment | ยังใช้ dev mode only (synchronize: true, localhost) | Low |
| Redis cache | ไม่มี — query DB ตรง | Low |
| Structured logging | ใช้ console.log ไม่มี Winston/Pino | Low |
| Rate limiting | ยังไม่มี | Low |

---

## Checklist ก่อน Deploy

```
✅ Test concurrent booking (pessimistic lock — no overbooking)
✅ Test auto-expire (15 นาที cron)
✅ Test payment reject → customer re-upload
✅ Test file upload (slip 5MB, avatar 2MB)
✅ Test PromptPay QR generation
✅ Test Google OAuth login
✅ Test OTP password reset
✅ Test responsive (mobile)
✅ Test admin CRUD (tours, schedules, users, reviews, tickets)
```

---

**Last Updated:** 2026-03-06
**Status:** สอดคล้องกับโค้ดปัจจุบัน

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
