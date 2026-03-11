# E2E Test Implementation Summary

## What Was Created

### 1. Main E2E Test File

**File**: `tests/booking-flow.spec.ts`

A comprehensive Playwright e2e test that validates the complete tour booking flow:

**What it tests:**

- ✅ Admin creates a tour and schedule via API
- ✅ User logs in with credentials (somchai_w / Password123!)
- ✅ User navigates to /tours page
- ✅ User selects a tour and views details
- ✅ User selects travel date and number of travelers
- ✅ User fills contact information (name, email, phone)
- ✅ User submits booking form
- ✅ System redirects to /payment/:id page
- ✅ Payment page displays:
  - QR code for payment
  - Amount to pay
  - Countdown timer
- ✅ Booking is created in database with correct data

**Features:**

- Automated tour/schedule creation via API
- Detailed console logging with emojis for visibility
- Robust element selectors with fallbacks
- Comprehensive error handling
- Database verification via API
- 30-60 second test duration
- Built-in delays between steps for visibility

### 2. API Helper Functions

**File**: `tests/helpers/api.ts`

Utility functions for API interactions:

- `adminLogin(username, password)` - Get admin JWT token
- `createTour(adminToken, tourData)` - Create a test tour
- `createTourSchedule(adminToken, tourId, date)` - Create tour schedule
- `userLogin(username, password)` - Get user JWT token
- `getTour(tourId)` - Retrieve tour details

### 3. Documentation Files

#### E2E_TEST_GUIDE.md

Comprehensive guide covering:

- Overview of test flow
- Prerequisites and setup
- Multiple ways to run tests
- Detailed step-by-step explanation
- Assertion descriptions
- Troubleshooting tips
- Performance notes
- Debugging instructions

#### QUICK_START_E2E_TEST.md

Quick reference for running tests:

- TL;DR 3-step setup
- Expected console output
- Alternative run commands
- Troubleshooting for common issues
- Test architecture diagram
- File locations

### 4. npm Scripts

**File**: `package.json` (added scripts)

```json
{
  "scripts": {
    "test:e2e": "npx playwright test",
    "test:e2e:headed": "npx playwright test --headed",
    "test:e2e:ui": "npx playwright test --ui",
    "test:e2e:debug": "npx playwright test --debug"
  }
}
```

---

## How to Use

### Quick Start

```bash
# In root directory
./run.sh                    # Start all services
npm run test:e2e:headed    # Run test with browser visible
```

### Run Commands

```bash
npm run test:e2e           # Headless (fast)
npm run test:e2e:headed    # Browser window visible
npm run test:e2e:ui        # Interactive UI mode
npm run test:e2e:debug     # Step-through debugging
```

---

## Test Flow Visualization

```
START
  │
  ├─ SETUP PHASE (API calls)
  │  ├─ Admin login → get JWT token
  │  ├─ Create tour "E2E Test Tour - Doi Inthanon"
  │  │  └─ Price: ฿2000, Max capacity: 20
  │  └─ Create schedule for future date
  │
  ├─ USER FLOW (Browser automation)
  │  ├─ Navigate to http://localhost:5173
  │  ├─ Click login button
  │  ├─ Fill credentials: somchai_w / Password123!
  │  ├─ Submit login form
  │  ├─ Navigate to /tours page
  │  ├─ Click test tour
  │  ├─ Select travel date from schedule
  │  ├─ Add +2 travelers (click + button twice)
  │  ├─ Fill contact info:
  │  │  ├─ Name: "Somchai Wisetchai"
  │  │  ├─ Email: "somchai@example.com"
  │  │  └─ Phone: "0812345678"
  │  ├─ Click booking button
  │  └─ Wait for redirect to /payment/:id
  │
  ├─ ASSERTION PHASE (Verify payment page)
  │  ├─ Check URL contains /payment/
  │  ├─ Verify QR code canvas visible
  │  ├─ Check amount displayed
  │  ├─ Verify countdown timer
  │  └─ Verify payment instructions
  │
  ├─ DATABASE VERIFICATION
  │  ├─ User login via API
  │  ├─ Fetch booking details from /api/bookings/:id
  │  └─ Validate:
  │     ├─ ID matches
  │     ├─ Tour ID is correct
  │     ├─ Status is pending/awaiting
  │     └─ Traveler count > 0
  │
  └─ END (✅ Success or ❌ Failure)
```

---

## Key Features

### 1. Robust Element Selection

- Uses multiple selector strategies (role, text, CSS)
- Falls back to alternative selectors if primary fails
- Scrolls elements into view before interaction
- Handles missing elements gracefully

### 2. Comprehensive Logging

- Emojis for easy visual scanning
- Step-by-step progress indicators
- Token previews (first 20 chars)
- API response logging
- Error messages with context

### 3. Smart Waits

- Uses `waitForURL` for navigation
- Uses `waitForSelector` for element loading
- Includes manual delays for visibility
- Configurable timeout values
- Handles async operations properly

### 4. Error Handling

- Try-catch blocks for API calls
- Fallback selectors for UI elements
- Detailed error messages
- Non-blocking assertion failures
- Recovery suggestions in logs

### 5. Database Verification

- Fetches created booking from API
- Validates all key fields
- Checks booking status
- Confirms relationship to tour
- Handles timing issues gracefully

---

## Technical Stack

- **Framework**: Playwright Test
- **Language**: TypeScript
- **Browser**: Chrome/Chromium (configurable)
- **API**: Fetch API
- **Assertion**: Playwright's built-in expect()

---

## Test Data

### Tour Created

- Title: "E2E Test Tour - Doi Inthanon National Park"
- Price: ฿2000
- Description: "A wonderful one-day tour to Thailand's highest mountain"
- Region: NORTH
- Category: ADVENTURE
- Duration: 1 DAY
- Max capacity: 20
- Schedule: 5 days from run date

### User Credentials (Pre-existing)

- Username: `somchai_w`
- Password: `Password123!`

### Booking Details Filled

- Name: "Somchai Wisetchai"
- Email: "somchai@example.com"
- Phone: "0812345678"
- Travelers: 2
- Date: Schedule date selected
- Tour: E2E test tour

---

## Files Changed/Created

```
Created:
  ✅ tests/booking-flow.spec.ts
  ✅ tests/helpers/api.ts
  ✅ E2E_TEST_GUIDE.md
  ✅ QUICK_START_E2E_TEST.md
  ✅ E2E_TEST_SUMMARY.md (this file)

Modified:
  ✅ package.json (added test scripts)
```

---

## Prerequisites Checklist

Before running the test, ensure:

- [ ] Docker is running
- [ ] Node.js and npm installed
- [ ] Backend can reach on http://localhost:3000
- [ ] Frontend runs on http://localhost:5173
- [ ] PostgreSQL database initialized
- [ ] Admin user exists: admin / admin1234
- [ ] Test user exists: somchai_w / Password123!
- [ ] Playwright installed (`npm list @playwright/test`)

---

## Expected Test Duration

| Phase             | Duration    |
| ----------------- | ----------- |
| Setup (API)       | 5-10s       |
| User Login        | 3-5s        |
| Browse Tours      | 2-3s        |
| Fill Booking      | 3-5s        |
| Submit & Redirect | 2-3s        |
| Page Assertions   | 2-3s        |
| Database Check    | 2-3s        |
| **Total**         | **~30-60s** |

---

## Debugging Tips

### Enable Verbose Output

```bash
PWDEBUG=1 npm run test:e2e:headed
```

### Run Single Test

```bash
npx playwright test booking-flow.spec.ts
```

### Check Specific Step

Add breakpoints around line number in test file or use:

```bash
npx playwright test booking-flow.spec.ts:123
```

### View Test Report

```bash
npx playwright show-report
```

---

## Common Issues & Solutions

| Issue                    | Solution                           |
| ------------------------ | ---------------------------------- |
| Backend not responding   | Start with `./run.sh`              |
| Login fails              | Verify user credentials in DB      |
| Tour not found           | Check backend /api/tours endpoint  |
| Payment page not loading | Verify booking creation succeeded  |
| Timeout errors           | Increase timeout values in test    |
| Browser won't open       | Check Chrome/Chromium installation |

---

## Next Steps

1. Run the test once with `npm run test:e2e:headed` to verify setup
2. Review console output for any issues
3. Adjust timeouts if services are slow
4. Customize test data as needed for your environment
5. Integrate into CI/CD pipeline if desired

---

## Maintenance

- Update user credentials if changed in system
- Adjust selectors if UI layout changes
- Monitor timeout values for system performance
- Keep Playwright updated: `npm update @playwright/test`

Happy testing! 🚀
