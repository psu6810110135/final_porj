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
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: TypeORM
- **Database**: PostgreSQL (Render/Railway)
- **Authentication**: JWT
- **Deployment**: Render

### Database
- PostgreSQL (Render/Railway)
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
VITE_API_URL=http://localhost:8080/api/v1
```

#### Backend (`.env`)
```
PORT=8080
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

## Development Roadmap

See `../system_based/TODO.md` for detailed development tasks.

## License

MIT
