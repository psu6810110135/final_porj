# System Component Design - Simplified (Thai Tour Website)

> เอกสารนี้แสดงการออกแบบส่วนประกอบระบบแบบ **Simplified** ที่เหมาะสำหรับนักศึกษาปี 1

---

## Overview

**Removed from original design:**
- ❌ CacheService (Redis) → In-memory cache or none
- ❌ LoggerService (Winston) → console.log()
- ❌ NotificationService (Email Queue) → console.log()
- ❌ Session management → JWT only (stateless)

---

## 1. Module Decomposition (Simplified)

```mermaid
classDiagram
    note "System Module Decomposition - Simplified Version"

    %% ========== Frontend Layer ==========
    class Frontend_Application {
        <<Vercel Host>>
        +environment: production
    }

    class CustomerPortal {
        +searchTours(criteria: Object): Promise~Tour[]~
        +viewTourDetail(id: UUID): Promise~Tour~
        +viewOneDayTours(): Promise~Tour[]~
        +viewMultiDayTours(): Promise~Tour[]~
        +bookOneDayTour(tourId: UUID, date: Date, pax: Int): Promise~Booking~
        +bookMultiDayTour(tourId: UUID, startDate: Date, endDate: Date, pax: Int): Promise~Booking~
        +planCustomTrip(people: Int, dates: Date[]): Promise~Plan~
        +uploadPaymentSlip(image: File): Promise~UploadResult~
        +viewBookingHistory(): Promise~Booking[]~
        +cancelBooking(bookingId: UUID): Promise~Boolean~
        +downloadETicket(bookingId: UUID): Promise~PDF~
    }

    class AdminDashboard {
        +viewFinancialStats(period: String): Promise~Stats~
        +approveBooking(bookingId: UUID): Promise~Boolean~
        +rejectBooking(bookingId: UUID, reason: String): Promise~Boolean~
        +manageTours(action: CRUD, data: Tour): Promise~Tour~
        +verifySlip(imageUrl: String): Promise~Verification~
    }

    %% ========== Backend Layer ==========
    class Backend_API {
        <<Render Host>>
        +port: 8080
        +healthCheck(): Status
    }

    class AuthService {
        +login(email: String, password: String): Promise~Token~
        +register(userData: Object): Promise~User~
        -hashPassword(plain: String): String
        -comparePassword(plain: String, hash: String): Boolean
        -generateJWT(userId: UUID, role: String): JWT
    }

    class TourService {
        +getAllTours(filters: Object): Promise~Tour[]~
        +getTourById(id: UUID): Promise~Tour~
        +createTour(data: Object): Promise~Tour~
        +updateTour(id: UUID, data: Object): Promise~Tour~
        +deleteTour(id: UUID): Promise~Boolean~
        +checkAvailability(tourId: UUID, date: Date): Promise~Int~
        +getOneDayTours(): Promise~Tour[]~
        +getMultiDayTours(): Promise~Tour[]~
    }

    class BookingEngine {
        +calculatePrice(basePrice: Float, pax: Int, options: Object): Float
        +checkAvailability(tourId: UUID, date: Date, pax: Int): Promise~Boolean~
        +createBookingOrder(userId: UUID, tourId: UUID, data: Object): Promise~Booking~
        +generateQRCode(amount: Float, refId: String): Promise~String~
    }

    class PaymentService {
        +uploadSlipImage(file: File, bookingId: UUID): Promise~UploadResult~
        +verifyTransaction(slipId: UUID, adminId: UUID): Promise~Boolean~
        +detectDuplicateSlip(fileHash: String): Promise~Boolean~
        -calculateSHA256(file: Buffer): String
    }

    class EmailService {
        +sendBookingConfirmation(userId: UUID, bookingId: UUID): void
        +sendPaymentApproved(bookingId: UUID): void
        +sendPaymentRejected(bookingId: UUID, reason: String): void
    }

    %% ========== Relationships ==========
    Frontend_Application *-- CustomerPortal
    Frontend_Application *-- AdminDashboard

    Backend_API *-- AuthService
    Backend_API *-- TourService
    Backend_API *-- BookingEngine
    Backend_API *-- PaymentService
    Backend_API *-- EmailService

    CustomerPortal ..> TourService : "GET /api/v1/tours"
    CustomerPortal ..> BookingEngine : "POST /api/v1/bookings"
    CustomerPortal ..> PaymentService : "POST /api/v1/payments"

    AdminDashboard ..> PaymentService : "PATCH /api/v1/payments/verify"
    AdminDashboard ..> TourService : "CRUD Operations"

    BookingEngine ..> TourService : "Check Stock"
    BookingEngine ..> EmailService : "Send Confirmation"
    PaymentService ..> EmailService : "Email Status Updates"
```

---

## 2. API Endpoint Specification

### 2.1 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Create new user account | ❌ |
| POST | `/api/v1/auth/login` | Login with email/password | ❌ |

**Request Example:**

```json
POST /api/v1/auth/login
{
  "email": "customer@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-1234",
      "email": "customer@example.com",
      "role": "customer"
    }
  }
}
```

---

### 2.2 Tour Management Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/v1/tours` | List all tours (with filters) | ❌ |
| GET | `/api/v1/tours/one-day` | List one-day trips only | ❌ |
| GET | `/api/v1/tours/multi-day` | List multi-day packages only | ❌ |
| GET | `/api/v1/tours/:id` | Get tour details | ❌ |
| POST | `/api/v1/tours` | Create new tour | ✅ Admin |
| PATCH | `/api/v1/tours/:id` | Update tour | ✅ Admin |
| DELETE | `/api/v1/tours/:id` | Soft delete tour | ✅ Admin |

**Query Parameters Example:**

```
GET /api/v1/tours?region=south&category=adventure&minPrice=1000&maxPrice=5000&tour_type=multi_day
```

---

### 2.3 Booking Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/v1/bookings` | Create new booking | ✅ Customer |
| GET | `/api/v1/bookings/:id` | Get booking details | ✅ Owner/Admin |
| GET | `/api/v1/bookings/my-bookings` | List user's bookings | ✅ Customer |
| PATCH | `/api/v1/bookings/:id/cancel` | Cancel booking | ✅ Owner |
| POST | `/api/v1/bookings/calculate` | Calculate trip price | ✅ Customer |

---

### 2.4 Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/v1/payments/:bookingId/upload` | Upload payment slip | ✅ Customer |
| PATCH | `/api/v1/payments/:id/verify` | Verify payment (approve/reject) | ✅ Admin |
| GET | `/api/v1/payments/pending` | List pending verifications | ✅ Admin |

---

## 3. Email Service (Simplified)

```typescript
@Injectable()
export class EmailService {
  // Simplified: Just use console.log() instead of real email
  sendBookingConfirmation(userId: string, bookingId: string) {
    console.log('=================================');
    console.log('📧 EMAIL: Booking Confirmation');
    console.log(`To: User ID: ${userId}`);
    console.log(`Booking ID: ${bookingId}`);
    console.log('Message: Your booking has been confirmed. Please pay within 24 hours.');
    console.log('=================================');
  }

  sendPaymentApproved(bookingId: string) {
    console.log('=================================');
    console.log('📧 EMAIL: Payment Approved');
    console.log(`Booking ID: ${bookingId}`);
    console.log('Message: Your payment has been approved. E-Ticket is ready.');
    console.log('=================================');
  }

  sendPaymentRejected(bookingId: string, reason: string) {
    console.log('=================================');
    console.log('📧 EMAIL: Payment Rejected');
    console.log(`Booking ID: ${bookingId}`);
    console.log(`Reason: ${reason}`);
    console.log('Message: Please re-upload your payment slip.');
    console.log('=================================');
  }
}
```

---

## 4. Payment Verification Flow (Simplified)

```mermaid
sequenceDiagram
    participant Customer
    participant UI as Customer Portal
    participant API as Payment Service
    participant DB as Database
    participant Admin
    participant Dashboard as Admin Dashboard

    Note over Customer, Dashboard: Payment Upload & Verification

    %% Phase 1: Customer Upload
    Customer->>UI: Upload Slip Image
    UI->>API: POST /api/v1/payments/:bookingId/upload

    API->>API: Calculate SHA-256 Hash
    API->>DB: Check duplicate slip

    alt Duplicate Slip
        API-->>UI: ERROR "This slip was already used"
    else New Slip
        API->>DB: Save slip, Update status to 'pending_verify'
        API-->>UI: Success

        API->>API: console.log("Notify Admin: New payment")
    end

    %% Phase 2: Admin Verification
    Admin->>Dashboard: View Pending Payments
    Dashboard->>API: GET /api/v1/payments/pending
    API->>DB: Query pending payments
    API-->>Dashboard: Show list

    Admin->>Dashboard: Click "Approve" or "Reject"
    Dashboard->>API: PATCH /api/v1/payments/:id/verify

    API->>DB: Update payment status
    API->>DB: Update booking status
    API->>API: console.log("Email: Payment verified")

    API-->>Dashboard: Success
```

---

## 5. Error Handling

### Standard Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_STOCK_INSUFFICIENT",
    "message": "This tour is fully booked"
  }
}
```

---

## 6. Summary of Simplifications

| Original (Complex) | Simplified |
|---|---|
| 8 Services | 5 Services |
| CacheService (Redis) | In-memory or none |
| LoggerService (Winston) | console.log() |
| NotificationService (Email Queue) | console.log() |
| Session table | JWT only (stateless) |
| RateLimiter (Advanced) | @nestjs/throttler or none |

---

**Last Updated:** 2026-02-10
**Status:** Simplified for Year 1 Students 🚀
