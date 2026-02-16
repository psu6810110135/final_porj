# Bookings Module

Complete implementation of the bookings module for Thai Tours backend.

## Structure

```
src/bookings/
├── dto/
│   ├── calculate-booking.dto.ts    # DTO for price calculation
│   ├── create-booking.dto.ts       # DTO for creating bookings
│   └── cancel-booking.dto.ts       # DTO for cancellation
├── entities/
│   └── booking.entity.ts           # TypeORM entity with all fields
├── bookings.controller.ts          # REST API endpoints
├── bookings.service.ts             # Business logic
├── bookings.module.ts              # Module configuration
└── README.md                       # This file
```

## API Endpoints

### 1. Calculate Booking Price

**POST** `/api/v1/bookings/calculate`

Calculate the total price for a booking including discounts.

**Request Body:**

```json
{
  "tourId": "uuid",
  "startDate": "2024-03-15",
  "endDate": "2024-03-20",
  "numberOfTravelers": 2
}
```

**Response:**

```json
{
  "basePrice": 10000,
  "discount": 500,
  "totalPrice": 9500,
  "breakdown": {
    "pricePerPerson": 5000,
    "numberOfTravelers": 2,
    "subtotal": 10000,
    "discountPercentage": 5,
    "discountAmount": 500,
    "total": 9500
  }
}
```

### 2. Create Booking

**POST** `/api/v1/bookings`

Create a new booking (requires authentication).

**Request Body:**

```json
{
  "tourId": "uuid",
  "startDate": "2024-03-15",
  "endDate": "2024-03-20",
  "numberOfTravelers": 2,
  "contactInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+66812345678"
  },
  "specialRequests": "Vegetarian meals please"
}
```

**Response:**

```json
{
  "id": "uuid",
  "bookingReference": "BK-ABC123XYZ",
  "status": "pending",
  "tourId": "uuid",
  "startDate": "2024-03-15",
  "endDate": "2024-03-20",
  "numberOfTravelers": 2,
  "totalPrice": 9500,
  "contactInfo": { ... },
  "createdAt": "2024-02-15T12:00:00Z"
}
```

### 3. Get My Bookings

**GET** `/api/v1/bookings/my-bookings`

Get all bookings for the authenticated user.

**Response:**

```json
[
  {
    "id": "uuid",
    "bookingReference": "BK-ABC123XYZ",
    "status": "confirmed",
    "tourId": "uuid",
    "startDate": "2024-03-15",
    "endDate": "2024-03-20",
    "numberOfTravelers": 2,
    "totalPrice": 9500,
    "createdAt": "2024-02-15T12:00:00Z"
  }
]
```

### 4. Get Booking Details

**GET** `/api/v1/bookings/:id`

Get detailed information about a specific booking.

**Response:**

```json
{
  "id": "uuid",
  "bookingReference": "BK-ABC123XYZ",
  "status": "confirmed",
  "tourId": "uuid",
  "userId": "uuid",
  "startDate": "2024-03-15",
  "endDate": "2024-03-20",
  "numberOfTravelers": 2,
  "basePrice": 10000,
  "discount": 500,
  "totalPrice": 9500,
  "contactInfo": { ... },
  "specialRequests": "...",
  "createdAt": "2024-02-15T12:00:00Z",
  "updatedAt": "2024-02-15T12:00:00Z"
}
```

### 5. Cancel Booking

**PATCH** `/api/v1/bookings/:id/cancel`

Cancel a booking with refund calculation.

**Request Body:**

```json
{
  "reason": "Change of plans"
}
```

**Response:**

```json
{
  "id": "uuid",
  "status": "cancelled",
  "refundAmount": 9500,
  "refundPercentage": 100,
  "cancellationReason": "Change of plans"
}
```

## Business Logic

### Discount Calculation

- **5% discount** for weekend bookings (Saturday or Sunday start dates)
- Discounts are automatically calculated based on the start date

### Refund Policy

- **100% refund**: Cancelled 7+ days before start date
- **50% refund**: Cancelled 3-6 days before start date
- **No refund**: Cancelled less than 3 days before start date

### Booking Reference Format

- Format: `BK-XXXXXXXXX`
- Generated using timestamp + random characters
- Guaranteed to be unique

## Database Schema

**Table:** `bookings`

| Column              | Type          | Description                             |
| ------------------- | ------------- | --------------------------------------- |
| id                  | uuid          | Primary key                             |
| booking_reference   | varchar       | Unique booking reference                |
| tour_id             | uuid          | Foreign key to tours                    |
| user_id             | uuid          | Foreign key to users                    |
| start_date          | date          | Tour start date                         |
| end_date            | date          | Tour end date                           |
| number_of_travelers | integer       | Number of travelers                     |
| base_price          | decimal(10,2) | Base price before discount              |
| discount            | decimal(10,2) | Discount amount                         |
| total_price         | decimal(10,2) | Final price after discount              |
| status              | enum          | pending, confirmed, cancelled, refunded |
| contact_info        | jsonb         | Contact information object              |
| special_requests    | text          | Optional special requests               |
| cancellation_reason | text          | Reason for cancellation                 |
| refund_amount       | decimal(10,2) | Refund amount if cancelled              |
| created_at          | timestamp     | Creation timestamp                      |
| updated_at          | timestamp     | Last update timestamp                   |

## Authentication

Currently using mock user IDs for development. To enable JWT authentication:

1. Uncomment `@UseGuards(JwtAuthGuard)` decorators in the controller
2. Replace `'mock-user-id'` with `req.user.id`
3. Ensure JWT auth module is properly configured

## Testing

### Manual Testing

To test the endpoints manually:

1. Start the server: `npm run start:dev`
2. Use Postman or curl to test endpoints
3. Database will auto-sync in development mode

Example curl command:

```bash
curl -X POST http://localhost:3000/api/v1/bookings/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "tourId": "test-tour-id",
    "startDate": "2024-03-16",
    "endDate": "2024-03-20",
    "numberOfTravelers": 2
  }'
```

### E2E Testing

The bookings module includes comprehensive end-to-end tests that verify all functionality:

**Test File:** `test/bookings.e2e-spec.ts`

#### How E2E Tests Work

1. **Test Setup:**
   - Creates a standalone NestJS application with the BookingsModule
   - Uses in-memory database configuration for isolated testing
   - Sets up ValidationPipe for request validation
   - Initializes TypeORM repositories for database operations

2. **Database Management:**
   - Each test runs in isolation with clean database state
   - `afterEach()` hook cleans up all test data after every test
   - Uses raw SQL queries (`DELETE FROM bookings`) for efficient cleanup
   - Prevents test interference and ensures consistent results

3. **Test Categories Covered:**

   **Price Calculation Tests:**
   - ✅ Basic price calculation (weekday vs weekend)
   - ✅ Weekend discount application (5% for Saturday/Sunday)
   - ✅ Validation for invalid date formats
   - ✅ Validation for invalid traveler counts
   - ✅ Validation for missing required fields

   **Booking Creation Tests:**
   - ✅ Successful booking creation with all fields
   - ✅ Booking creation without special requests (optional field)
   - ✅ Email validation (invalid email format)
   - ✅ Required field validation (missing contact info)
   - ✅ Date format validation
   - ✅ Minimum travelers validation

   **Booking Retrieval Tests:**
   - ✅ Empty bookings list for new users
   - ✅ Multiple bookings retrieval for a user
   - ✅ Individual booking retrieval by ID
   - ✅ 404 error for non-existent bookings
   - ✅ UUID format validation (returns 400 for invalid UUIDs)

   **Booking Cancellation Tests:**
   - ✅ 100% refund (7+ days before start)
   - ✅ 50% refund (3-6 days before start)
   - ✅ 0% refund (less than 3 days before start)
   - ✅ Duplicate cancellation prevention
   - ✅ 404 error for non-existent bookings
   - ✅ Validation for missing cancellation reason

#### What E2E Tests Verify

**HTTP Status Codes:**

- `201 Created` for successful POST operations (calculate, create booking)
- `200 OK` for successful GET and PATCH operations
- `400 Bad Request` for validation errors and invalid UUIDs
- `404 Not Found` for missing resources

**Response Structure:**

- All required fields are present in responses
- Data types match expected formats (UUID, numbers, dates, objects)
- Booking references follow `BK-XXXXXXXXX` format
- Price calculations are accurate with proper decimal handling

**Business Logic:**

- Weekend discounts are correctly applied (5% for Saturday/Sunday)
- Refund percentages match cancellation timing policy
- Booking status transitions work correctly
- Date validations prevent past dates and invalid ranges

**Data Integrity:**

- Foreign key relationships are maintained
- Database constraints are respected
- Unique booking references are generated
- Decimal precision is preserved for monetary values

**Security & Validation:**

- UUID parameter validation prevents SQL injection
- Input validation blocks malformed requests
- Required field enforcement ensures data completeness
- Email format validation maintains contact data quality

#### Running E2E Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run only bookings e2e tests
npm run test:e2e -- test/bookings.e2e-spec.ts

# Run with coverage
npm run test:e2e -- --coverage
```

#### Test Results Interpretation

**Success Indicators:**

- All 24 tests passing
- No database connection errors
- Proper cleanup between tests
- Expected HTTP status codes
- Correct response data structures

**Failure Patterns:**

- Database errors → Check PostgreSQL connection
- Validation failures → Review DTO constraints
- Status code mismatches → Verify controller responses
- Timeout issues → Check async operations

#### Test Data Management

**Mock Data Used:**

- `mockUserId = 'test-user-id'`
- `mockTourId = 'test-tour-id'`
- Valid/invalid email formats for validation tests
- Various date combinations for discount/refund logic
- Edge case values for boundary testing

**Cleanup Strategy:**

- Raw SQL deletion ensures complete cleanup
- Runs after every single test
- Prevents data accumulation across test runs
- Maintains test isolation and reliability

## Notes

- TypeScript lint errors about uninitialized properties are expected for TypeORM entities and DTOs
- The module uses class-validator for automatic DTO validation
- Database synchronize is enabled in development but should be disabled in production
- All endpoints follow RESTful conventions
