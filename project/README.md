# Thai Tour Website

A full-stack tour booking platform for Thai tourism with customer portal and admin dashboard.

## Project Overview

This is a tour booking system that allows customers to:

- Browse and search for tours across Thailand
- Book tours with real-time availability checking
- Upload payment slips for verification
- Receive E-Tickets via email
- Manage their bookings

Admins can:

- Manage tour listings
- Verify payment slips
- View dashboard statistics
- Access audit logs

## Tech Stack

### Frontend

- **Framework**: React + TypeScript + Vite
- **Routing**: React Router
- **Styling**: TailwindCSS
- **State Management**: TanStack Query
- **Deployment**: Amazon S3 + CloudFront

### Backend

- **Runtime**: Node.js
- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: PostgreSQL (Amazon RDS)
- **Authentication**: JWT
- **Deployment**: AWS App Runner or Amazon ECS Fargate

### Database

- PostgreSQL (Amazon RDS)
- Connection pooling managed by backend

## Project Structure

```
project/
├── frontend/          # React frontend application
├── backend/           # Express backend API
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Environment Variables

#### Frontend (`.env`)

```
VITE_API_URL=http://localhost:3000
```

#### Backend (`.env`)

```
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

## AWS Deployment

The codebase now supports AWS-oriented production configuration:

- Frontend static hosting on S3 + CloudFront
- Backend container deployment on App Runner or ECS Fargate
- PostgreSQL on RDS
- Uploads stored in S3 via backend `StorageService`

Deployment steps and required environment variables are documented in `AWS_DEPLOYMENT.md`.

## Development Roadmap

See `../system_based/TODO.md` for detailed development tasks.

## License

MIT
