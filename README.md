# Thai Tour Website

A full-stack tour booking website for Thai tourists, built with NestJS backend and React frontend.

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **State Management**: TanStack Query
- **Utilities**: date-fns, qrcode.react

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL (with TypeORM)
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: PostgreSQL (Render/Railway)

## Project Structure

```
final_porj/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── tours/       # Tour management module
│   │   ├── bookings/    # Booking module
│   │   ├── payments/    # Payment module
│   │   ├── users/       # User management module
│   │   ├── admin/       # Admin dashboard module
│   │   ├── common/      # Shared utilities
│   │   └── main.ts
│   ├── .env             # Environment variables (not in git)
│   ├── .env.example     # Environment template
│   └── package.json
│
├── project/
│   └── frontend/         # React frontend
│       ├── src/
│       │   ├── components/   # Reusable components
│       │   ├── pages/        # Page components
│       │   ├── services/     # API services
│       │   ├── utils/        # Helper functions
│       │   ├── types/        # TypeScript types
│       │   └── App.tsx
│       ├── .env              # Environment variables
│       └── package.json
│
├── docker-compose.yml   # Docker setup for local development
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Local Development with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd final_porj
```

2. Start all services:
```bash
docker-compose up --build
```

Services will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5433

### Local Development (without Docker)

1. Start PostgreSQL (using docker-compose for DB only):
```bash
docker-compose up postgres
```

2. Setup Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

3. Setup Frontend:
```bash
cd project/frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://thai_tours:thai_tours_password@localhost:5433/thai_tours
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api/v1
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password

### Tours
- `GET /api/tours` - List all tours (with filters)
- `GET /api/tours/:id` - Get tour details
- `POST /api/tours` - Create new tour (Admin only)
- `PATCH /api/tours/:id` - Update tour (Admin only)
- `DELETE /api/tours/:id` - Soft delete tour (Admin only)

### Bookings
- `POST /api/v1/bookings/calculate` - Calculate price
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/my-bookings` - Get user's bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/v1/payments/:bookingId/upload` - Upload payment slip
- `GET /api/v1/payments/pending` - Get pending payments (Admin only)
- `PATCH /api/v1/payments/:id/verify` - Verify payment (Admin only)

## Development Status

See [system_based/TODO_SIMPLIFIED.md](./system_based/TODO_SIMPLIFIED.md) for detailed development roadmap.

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | In Progress | Setup & Infrastructure |
| Phase 1 | Pending | Database Setup |
| Phase 2 | Pending | Backend API |
| Phase 3 | Pending | Frontend - Auth & Tours |
| Phase 4 | Pending | Frontend - Booking & Payment |
| Phase 5 | Pending | Admin Dashboard |
| Phase 6 | Pending | Testing & Deployment |

## License

UNLICENSED
