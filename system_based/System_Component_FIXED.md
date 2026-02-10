# System Component Design - Simplified (Thai Tour Website)

> เอกสารนี้แสดงการออกแบบส่วนประกอบระบบแบบ **Simplified** ที่เหมาะสำหรับนักศึกษาปี 1

---

## Overview

**Simplifications:**
- ❌ Session class → JWT only (stateless)
- ❌ AuditLog class → console.log()
- ❌ NotificationService with Queue → console.log()
- ❌ CacheService (Redis) → In-memory or none
- ❌ LoggerService (Winston) → console.log()
- ❌ RateLimitMiddleware → Simple or none

---

## 1. Use Case Diagram (Simplified)

```mermaid
graph LR
    subgraph Actors
        Customer((Customer))
        Admin((Admin))
    end

    subgraph Auth_Module
        UC1(Register Account)
        UC2(Login / Logout)
    end

    subgraph Customer_Module
        UC5(Search Tours)
        UC6(View Tour Details)
        UC7(Book Tour Package)
        UC8(Upload Payment Slip)
        UC9(View Booking History)
        UC10(Cancel Booking)
        UC11(Download E-Ticket)
    end

    subgraph Admin_Module
        UC13(Manage Tours CRUD)
        UC14(Verify Payments)
        UC15(View Financial Stats)
    end

    Customer --- UC1
    Customer --- UC2
    Customer --- UC5
    Customer --- UC6
    Customer --- UC7
    Customer --- UC8
    Customer --- UC9
    Customer --- UC10
    Customer --- UC11

    Admin --- UC2
    Admin --- UC13
    Admin --- UC14
    Admin --- UC15
```

---

## 2. Class Diagram (Simplified)

```mermaid
classDiagram
    %% ========== Models ==========
    class User {
        +UUID id
        +String email
        +String passwordHash
        +String fullName
        +Enum role
        +DateTime createdAt
    }

    class Tour {
        +UUID id
        +String title
        +String description
        +Decimal basePrice
        +String region
        +String category
        +Int maxCapacity
        +String[] imageUrls
        +Boolean isActive
        +Boolean isRecommended
    }

    class Booking {
        +UUID id
        +UUID userId
        +UUID tourId
        +Int pax
        +Decimal totalPrice
        +Date travelDate
        +Enum status
        +DateTime paymentDeadline
    }

    class Payment {
        +UUID id
        +UUID bookingId
        +String slipUrl
        +String slipHash
        +Decimal amount
        +Enum status
        +UUID verifiedBy
    }

    %% ========== Controllers ==========
    class AuthController {
        +register(req, res): Response
        +login(req, res): Response
    }

    class TourController {
        +getAllTours(req, res): Response
        +getTourById(req, res): Response
        +createTour(req, res): Response
        +updateTour(req, res): Response
        +deleteTour(req, res): Response
    }

    class BookingController {
        +createBooking(req, res): Response
        +getMyBookings(req, res): Response
        +cancelBooking(req, res): Response
        +calculatePrice(req, res): Response
    }

    class PaymentController {
        +uploadSlip(req, res): Response
        +verifyPayment(req, res): Response
        +getPendingPayments(req, res): Response
    }

    class AdminController {
        +getDashboardStats(req, res): Response
    }

    %% ========== Services ==========
    class AuthService {
        +hashPassword(plain): String
        +comparePassword(plain, hash): Boolean
        +generateJWT(userId, role): String
        +validateJWT(token): Object
    }

    class TourService {
        +findTours(filters): Promise~Tour[]~
        +getTourById(id): Promise~Tour~
        +createTour(data): Promise~Tour~
    }

    class BookingService {
        +calculatePrice(tourId, pax, options): Promise~Decimal~
        +createBooking(data): Promise~Booking~
    }

    class PaymentService {
        +uploadSlip(file, bookingId): Promise~Payment~
        +calculateSHA256(buffer): String
        +verifyPayment(id, action): Promise~Boolean~
    }

    class EmailService {
        +sendBookingConfirmation(booking): void
        +sendPaymentApproved(booking): void
        +sendPaymentRejected(booking, reason): void
    }

    %% ========== Middleware ==========
    class AuthMiddleware {
        +authenticate(req, res, next): void
        +checkRole(role): Function
    }

    %% ========== Relationships ==========
    User "1" --> "*" Booking : makes
    Tour "1" --> "*" Booking : includes
    Booking "1" --> "1" Payment : has

    AuthController ..> AuthService : uses
    TourController ..> TourService : uses
    BookingController ..> BookingService : uses
    PaymentController ..> PaymentService : uses
    BookingService ..> EmailService : uses
    PaymentService ..> EmailService : uses
```

---

## 3. Payment Verification Flow (Simplified)

```mermaid
sequenceDiagram
    participant Customer
    participant UI as Customer Portal
    participant API as Payment Service
    participant DB as Database
    participant Admin
    participant Dashboard as Admin Dashboard

    Note over Customer, Dashboard: Payment Upload & Verification

    Customer->>UI: Upload Slip
    UI->>API: POST /upload

    API->>API: Calculate SHA-256
    API->>DB: Check duplicate

    alt Duplicate
        API-->>UI: ERROR "Duplicate slip"
    else New
        API->>DB: Save payment
        API->>API: console.log("Notify admin")
        API-->>UI: Success
    end

    Admin->>Dashboard: View pending
    Dashboard->>API: GET /pending
    API->>DB: Query payments
    API-->>Dashboard: Show list

    Admin->>Dashboard: Approve/Reject
    Dashboard->>API: PATCH /verify

    API->>DB: Update status
    API->>API: console.log("Email sent")
    API-->>Dashboard: Success
```

---

## 4. Email Service Implementation (Simple)

```typescript
@Injectable()
export class EmailService {
  sendBookingConfirmation(booking: any) {
    console.log('=================================');
    console.log('📧 BOOKING CONFIRMATION');
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Total: ${booking.totalPrice}`);
    console.log('Please pay within 24 hours');
    console.log('=================================');
  }

  sendPaymentApproved(booking: any) {
    console.log('=================================');
    console.log('📧 PAYMENT APPROVED');
    console.log(`Booking ID: ${booking.id}`);
    console.log('E-Ticket ready');
    console.log('=================================');
  }

  sendPaymentRejected(booking: any, reason: string) {
    console.log('=================================');
    console.log('📧 PAYMENT REJECTED');
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Reason: ${reason}`);
    console.log('=================================');
  }
}
```

---

## 5. Summary of Simplifications

| Original | Simplified |
|---|---|
| 7 Tables | 4 Tables |
| Session Class | JWT only |
| AuditLog Class | console.log() |
| NotificationService (Queue) | EmailService (console.log) |
| CacheService (Redis) | None |
| LoggerService (Winston) | console.log() |
| RateLimitMiddleware | None or @nestjs/throttler |
| Email Queue | console.log() |
| Password Reset | Admin reset |

---

**Last Updated:** 2026-02-10
**Status:** Simplified for Year 1 Students 🚀
