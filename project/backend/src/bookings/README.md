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

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| booking_reference | varchar | Unique booking reference |
| tour_id | uuid | Foreign key to tours |
| user_id | uuid | Foreign key to users |
| start_date | date | Tour start date |
| end_date | date | Tour end date |
| number_of_travelers | integer | Number of travelers |
| base_price | decimal(10,2) | Base price before discount |
| discount | decimal(10,2) | Discount amount |
| total_price | decimal(10,2) | Final price after discount |
| status | enum | pending, confirmed, cancelled, refunded |
| contact_info | jsonb | Contact information object |
| special_requests | text | Optional special requests |
| cancellation_reason | text | Reason for cancellation |
| refund_amount | decimal(10,2) | Refund amount if cancelled |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

## Authentication

Currently using mock user IDs for development. To enable JWT authentication:

1. Uncomment `@UseGuards(JwtAuthGuard)` decorators in the controller
2. Replace `'mock-user-id'` with `req.user.id`
3. Ensure JWT auth module is properly configured

## Testing

To test the endpoints:

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

## Notes

- TypeScript lint errors about uninitialized properties are expected for TypeORM entities and DTOs
- The module uses class-validator for automatic DTO validation
- Database synchronize is enabled in development but should be disabled in production
- All endpoints follow RESTful conventions
