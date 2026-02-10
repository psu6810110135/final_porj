# Backend Setup Guide

NestJS backend for Thai Tour Website.

---

## Quick Start

### Option 1: With Docker (Recommended)

```bash
# From project root
docker-compose up backend

# Backend will be available at http://localhost:3000
```

### Option 2: Manual Development

```bash
# Step 1: Start database
docker-compose up postgres

# Step 2: In a new terminal, run backend
cd backend
npm install          # First time only
npm run start:dev    # Start with hot-reload
```

---

## Environment Setup

### 1. Copy Environment File

```bash
cd backend
cp .env.example .env
```

### 2. Configure .env

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (matches docker-compose.yml)
DATABASE_URL=postgresql://thai_tours:thai_tours_password@localhost:5433/thai_tours

# JWT Secret (change in production)
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

---

## Available Scripts

```bash
npm run start:dev    # Start with hot-reload (development)
npm run start:debug  # Start with debug mode
npm run start        # Start production build
npm run start:prod   # Start production build

npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:cov     # Run tests with coverage
```

---

## Module Structure

```
backend/src/
├── auth/           # Authentication & Authorization
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/  # Passport JWT strategy
│   └── guards/      # Auth guards
│
├── tours/          # Tour Management
│   ├── tours.module.ts
│   ├── tours.controller.ts
│   ├── tours.service.ts
│   └── entities/   # Tour entity
│
├── bookings/       # Booking System
│   ├── bookings.module.ts
│   ├── bookings.controller.ts
│   ├── bookings.service.ts
│   └── entities/   # Booking entity
│
├── payments/       # Payment Verification
│   ├── payments.module.ts
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   └── entities/   # Payment entity
│
├── users/          # User Management
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── entities/   # User entity
│
├── admin/          # Admin Dashboard
│   ├── admin.module.ts
│   ├── admin.controller.ts
│   └── admin.service.ts
│
├── common/         # Shared Code
│   ├── decorators/
│   ├── dto/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
│
├── app.module.ts   # Root module
└── main.ts         # Entry point
```

---

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
```

### Tours
```
GET    /api/v1/tours
GET    /api/v1/tours/:id
POST   /api/v1/tours         (Admin only)
PATCH  /api/v1/tours/:id     (Admin only)
DELETE /api/v1/tours/:id     (Admin only)
```

### Bookings
```
POST   /api/v1/bookings/calculate
POST   /api/v1/bookings
GET    /api/v1/bookings/my-bookings
GET    /api/v1/bookings/:id
PATCH  /api/v1/bookings/:id/cancel
```

### Payments
```
POST   /api/v1/payments/:bookingId/upload
GET    /api/v1/payments/pending     (Admin only)
PATCH  /api/v1/payments/:id/verify  (Admin only)
```

### Admin
```
GET    /api/v1/admin/stats
```

---

## Database Setup

### Using Docker Database

```bash
# Start PostgreSQL
docker-compose up postgres

# Connect to database
docker exec -it thai_tours_db psql -U thai_tours -d thai_tours
```

### Run Migrations (When Implemented)

```bash
npm run migration:run
npm run migration:revert
```

---

## Development Tips

### Hot Reload

Changes in `src/` automatically restart the server.

### Debugging

```bash
# Run with debug enabled
npm run start:debug

# Or use VS Code launch configuration
# Set breakpoints in VS Code and press F5
```

### Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

---

## Common Issues

### Database Connection Failed

```bash
# Check if postgres is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Port 3000 Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
PORT=3001
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Production Build

```bash
# Build
npm run build

# Test production build locally
npm run start:prod
```

Output is in `dist/` directory.

---

**Last Updated**: 2025-02-10
