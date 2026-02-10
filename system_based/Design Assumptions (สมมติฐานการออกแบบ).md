# Design Assumptions - Simplified (Thai Tour Website)

> เอกสารนี้แสดงสมมติฐานการออกแบบแบบ **Simplified** ที่เหมาะสำหรับนักศึกษาปี 1

---

## Overview

**Simplifications:**
- ❌ Winston Logger → console.log()
- ❌ Redis Caching → Database query only
- ❌ Email Queue → console.log()
- ❌ Row Level Security → NestJS Guards

---

## 1. User Assumptions

### 1.1 Device Readiness
- Modern web browsers (Chrome, Safari, Firefox)
- Responsive design (Desktop, Tablet, Mobile)
- JavaScript and Cookies enabled

### 1.2 Basic Knowledge
**Customers:**
- Familiar with e-commerce websites (Shopee, Lazada)
- Can use mobile banking apps
- Can upload files via browser

**Admins:**
- Can verify payment slips
- Understand basic dashboard

---

## 2. System & Infrastructure Assumptions

### 2.1 Internet Connection
- Always-on connectivity required
- Minimum bandwidth: 3 Mbps
- No offline capability

### 2.2 Cloud Service Availability

| Service | Provider | Uptime | Notes |
|---|---|---|---|
| Frontend | Vercel | 99.99% | Cloudflare CDN |
| Backend | Render (Starter) | 99.9% | Cold Start ~30s |
| Database | Supabase (Free) | 99.9% | Connection Pool: 60 |

**Mitigation for Render Cold Start:**
- Cron job ping `/api/health` every 10 minutes

### 2.3 File Storage (Supabase)
- Total Storage: 1 GB (Free tier)
- Max File Size: 5 MB (system limit)
- Slip size average: 500 KB

**Auto-cleanup:**
- Delete confirmed booking slips after 90 days
- Delete cancelled booking slips after 7 days

### 2.4 Security Assumptions

| Layer | Protection | Note |
|---|---|---|
| Network | Cloudflare DDoS | Basic protection |
| Authentication | JWT + bcrypt | No 2FA in v1.0 |
| Database | NestJS Guards | No RLS |
| File Upload | Mime-type + Size | No virus scanning |
| API | Basic rate limiting | Optional |

**Security Gaps (Accepted for v1.0):**
- No malware scanning
- No CAPTCHA
- No WAF

---

## 3. Data & Operational Assumptions

### 3.1 Data Accuracy
- Admin verifies all tour data before entry
- No email verification in v1.0
- Phone format: String (no validation)

### 3.2 Currency & Geography
- Currency: THB only
- Region: Thailand only
- Time Zone: Asia/Bangkok (UTC+7)

### 3.3 Payment Assumptions

**Manual Verification Only:**
1. System generates QR Code
2. Customer scans and pays
3. Customer uploads slip screenshot
4. Admin verifies manually

**Latency:**
- Payment deadline: 24 hours
- Verification SLA: ~12 hours (no auto-enforcement)

### 3.4 Concurrency & Race Conditions
- Peak concurrency: ≤ 50 users
- Database pool: 60 connections
- Transaction + FOR UPDATE lock for race condition prevention

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

**Will do:**
- ✅ Manual Testing (complete user journey)
- ✅ Basic security testing (SQL injection, XSS)
- ✅ Concurrent booking test (3-5 users)

**Will NOT do:**
- ❌ Load testing
- ❌ Penetration testing
- ❌ Automated E2E testing

### 5.2 Test Data
- Mock data for development
- Admin: `admin@test.com` / `TestPass123!`
- Customer: `customer@test.com` / `TestPass123!`

---

## 6. Maintenance Assumptions

### 6.1 Backup & Recovery
- Supabase auto-backup (daily @ 03:00 AM)
- Retention: 7 days (Free tier)

### 6.2 Monitoring
- Console logging only
- No real-time alerts
- Manual log checking

---

## 7. Business Logic Assumptions

### 7.1 Cancellation Rules
- Can cancel if status = `pending_pay`
- No refund if status = `confirmed`
- No modification after confirmation

### 7.2 Pricing Logic
```
totalPrice = basePricePerPerson × numberOfPeople
```
- No seasonal pricing in v1.0

### 7.3 Inventory Management
- Immediate deduction on booking
- Stock release on cancel/expire
- Transaction + SELECT FOR UPDATE for prevention

---

## 8. Summary of Simplifications

| Original | Simplified |
|---|---|
| Winston Logger | console.log() |
| Redis Cache | None (DB query) |
| Email Queue | console.log() |
| Row Level Security | NestJS Guards |
| Advanced Monitoring | Console logs |
| Virus Scanning | None |
| 2FA | None |

---

## 9. Validation Checklist

Before deploy:
```
✅ Test concurrent booking (3-5 users)
✅ Test duplicate slip detection
✅ Test auto-expire (24h)
✅ Test payment reject → re-upload
✅ Test file upload
✅ Test QR code scanning
✅ Test responsive (mobile)
```

---

**Last Updated:** 2026-02-10
**Status:** Simplified for Year 1 Students 🚀
