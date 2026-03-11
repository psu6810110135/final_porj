# End-to-End Test: Full Tour Booking Flow

## Overview

This e2e test simulates a complete user booking flow in the Thai Tour Booking website:

1. **Setup**: Admin creates a tour with schedule via API
2. **User Flow**: User logs in → Browse tours → Select tour → Fill booking form → Submit
3. **Verification**: Redirect to payment page → Check QR code, amount, timer → Verify booking in DB

## Test Files

- **Main Test**: `tests/booking-flow.spec.ts` - Full booking flow test
- **Helper Functions**: `tests/helpers/api.ts` - API utilities for tour/schedule creation, login

## Prerequisites

- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5173`
- PostgreSQL database initialized
- Admin user: `admin` / `admin1234`
- Test user: `somchai_w` / `Password123!`

## How to Run

### Option 1: Using npm scripts (Recommended)

```bash
# Start all services (Docker DB + Backend + Frontend)
./run.sh

# In a separate terminal, run the e2e test
npm run test:e2e

# Watch mode (useful for development)
npx playwright test tests/booking-flow.spec.ts --headed

# Run with UI (interactive)
npx playwright test tests/booking-flow.spec.ts --ui
```

### Option 2: Manual Setup

```bash
# Terminal 1: Start PostgreSQL
docker-compose up -d postgres

# Terminal 2: Start Backend
cd project/backend
npm run start:dev

# Terminal 3: Start Frontend
cd project/frontend
npm run dev

# Terminal 4: Run Tests
npm run test:e2e
```

### Option 3: Run in Watch Mode (See the Flow in Real-Time)

```bash
# Shows browser window with the full booking flow
npx playwright test tests/booking-flow.spec.ts --headed --watch
```

## What the Test Does

### Setup Phase (Automated)

- Logs in as admin
- Creates a new tour: "E2E Test Tour - Doi Inthanon National Park"
  - Price: ฿2000
  - Max capacity: 20
- Creates a schedule for 5 days in the future
- Logs output with tour ID and schedule date

### User Flow (Visual in Browser)

1. **Login** (somchai_w / Password123!)
   - Navigates to homepage
   - Clicks login button
   - Enters credentials
   - Waits for logged-in state

2. **Browse Tours**
   - Navigates to /tours page
   - Finds the E2E test tour (or any tour as fallback)
   - Clicks to view tour details

3. **Fill Booking Form**
   - Selects travel date
   - Adds +2 travelers
   - Fills contact info:
     - Name: "Somchai Wisetchai"
     - Email: "somchai@example.com"
     - Phone: "0812345678"

4. **Submit Booking**
   - Clicks booking button
   - Waits for redirect to /payment/:id

### Assertion Phase

- ✅ Verify URL changed to `/payment/:id`
- ✅ Verify QR code canvas is rendered
- ✅ Verify amount is displayed
- ✅ Verify countdown timer exists
- ✅ Verify payment instructions visible
- ✅ Verify booking created in database with correct data

## Tips & Troubleshooting

### Test Fails at Login

- Ensure `somchai_w` user exists with password `Password123!`
- Check backend is running on port 3000
- Clear browser cache/cookies if needed

### Test Fails at Tour Selection

- Ensure the created tour is visible on /tours page
- Test has fallback to select first available tour
- Check tour search/filter isn't too restrictive

### Test Fails at Payment Page Verification

- Payment page might use different HTML structure
- Check browser console for JavaScript errors
- Verify booking is created in database even if page assertions fail

### Test Times Out

- Increase timeouts by adjusting `waitForTimeout(X)` values
- Ensure all services are running and responsive
- Check browser DevTools for any blocked resources

### Database Verification Fails

- Booking might take a few seconds to appear in DB
- Test includes retry logic with helpful error messages
- Check API is returning booking correctly

## Test Output Example

```
📋 SETUP: Creating tour and schedule via API...
✅ Admin logged in
📅 Using schedule date: 2026-03-15
✅ Tour created: [uuid] - E2E Test Tour...
✅ Tour schedule created: [uuid]

🧑 USER FLOW: Starting user booking flow...
1️⃣ Navigating to login page...
2️⃣ Entering login credentials...
⏳ Waiting for login...

3️⃣ Navigating to tours page...
4️⃣ Clicking on the test tour...
5️⃣ Selecting travel date and travelers...
👥 Adding travelers...

6️⃣ Filling contact information...
7️⃣ Submitting booking...

✅ ASSERTIONS: Verifying payment page...
📌 Booking ID: [uuid]
✅ QR code canvas found
✅ Amount appears to be displayed
✅ Countdown timer appears visible

🗄️ DATABASE VERIFICATION...
✅ Booking found in database
🎉 All assertions passed!
```

## Environment Variables

If needed, configure in `playwright.config.ts`:

```typescript
baseURL: "http://localhost:5173"; // Frontend URL
API_BASE_URL: "http://localhost:3000"; // Backend URL (in test helpers)
```

## Performance Notes

- Full test takes ~30-60 seconds depending on system
- Backend seeding tour/schedule takes ~2 seconds
- Browser navigation and form filling takes ~15-20 seconds
- Database verification takes ~5 seconds
- Built-in delays (2-3 seconds between major steps) for visibility

## Notes on Data Flow

1. Admin token generated via API login endpoint
2. Tour created with minimal required fields
3. Schedule created for future date (auto-calculated)
4. User logs in separately via UI
5. Booking created via form submission
6. Payment details fetched and verified
7. Booking record retrieved and validated

## Debugging

Enable Playwright debug mode:

```bash
PWDEBUG=1 npx playwright test tests/booking-flow.spec.ts
```

This opens Inspector mode where you can step through the test.
