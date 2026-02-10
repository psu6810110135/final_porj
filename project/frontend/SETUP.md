# Frontend Setup Guide

React + TypeScript + Vite frontend for Thai Tour Website.

---

## Quick Start

### Option 1: With Docker (Recommended)

```bash
# From project root
docker-compose up frontend

# Frontend will be available at http://localhost:5173
```

### Option 2: Manual Development

```bash
# Navigate to frontend directory
cd project/frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:5173

---

## Environment Setup

### 1. Create .env File

```bash
cd project/frontend
cp .env.example .env
```

### 2. Configure .env

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1
```

**Note**: When using Docker, the backend URL should be `http://localhost:3000/api/v1`

---

## Available Scripts

```bash
npm run dev       # Start development server with hot-reload
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## Project Structure

```
frontend/
├── public/              # Static assets
│   └── vite.svg
│
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Layout/      # Navbar, Footer
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── pages/           # Page components
│   │   ├── Home.tsx           # Tour list
│   │   ├── TourDetail.tsx     # Tour details
│   │   ├── Login.tsx          # Login page
│   │   ├── Register.tsx       # Register page
│   │   ├── MyBookings.tsx     # User bookings
│   │   ├── MyProfile.tsx      # User profile
│   │   ├── BookingForm.tsx    # Booking form
│   │   ├── PaymentUpload.tsx  # Payment slip upload
│   │   └── Admin/             # Admin pages
│   │       ├── Dashboard.tsx
│   │       ├── TourManagement.tsx
│   │       └── PaymentVerify.tsx
│   │
│   ├── services/        # API services
│   │   ├── api.ts       # Axios configuration
│   │   ├── auth.ts      # Auth API calls
│   │   ├── tours.ts     # Tours API calls
│   │   ├── bookings.ts  # Bookings API calls
│   │   └── payments.ts  # Payments API calls
│   │
│   ├── types/           # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── tour.ts
│   │   ├── booking.ts
│   │   └── payment.ts
│   │
│   ├── utils/           # Helper functions
│   │   ├── format.ts    # Date/currency formatting
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.ts
│   │
│   ├── assets/          # Images, icons
│   │   └── react.svg
│   │
│   ├── App.tsx          # Root component with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles + Tailwind
│
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Vite | 7.2.4 | Build Tool |
| React Router | 7.13.0 | Routing |
| Tailwind CSS | 4.1.18 | Styling |
| Axios | 1.13.4 | HTTP Client |
| TanStack Query | 5.90.20 | State Management |
| date-fns | 4.1.0 | Date Utilities |
| qrcode.react | 4.2.0 | QR Code Generation |

---

## Routing Structure

```
/                    → Home (Tour List)
/tours/:id           → Tour Detail
/login               → Login Page
/register            → Register Page
/my-bookings         → My Bookings (Protected)
/my-profile          → My Profile (Protected)
/admin               → Admin Dashboard (Admin only)
  /admin/tours       → Tour Management
  /admin/payments    → Payment Verification
```

---

## Key Components

### Protected Routes

Pages that require authentication use `ProtectedRoute` wrapper:

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

<Route path="/my-bookings" element={
  <ProtectedRoute>
    <MyBookings />
  </ProtectedRoute>
} />
```

### API Service

Base API configuration in `src/services/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Development

### Hot Module Replacement (HMR)

Vite provides instant hot-reload. Changes reflect immediately in the browser.

### Styling with Tailwind CSS

```tsx
// Example component
function TourCard({ tour }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <img src={tour.image} alt={tour.title} className="w-full h-48 object-cover rounded" />
      <h3 className="text-xl font-bold mt-2">{tour.title}</h3>
      <p className="text-gray-600">{formatPrice(tour.price)}</p>
    </div>
  );
}
```

### State Management with TanStack Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { toursService } from '../services/tours';

function TourList() {
  const { data: tours, isLoading, error } = useQuery({
    queryKey: ['tours'],
    queryFn: toursService.getAllTours,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tours?.map(tour => <TourCard key={tour.id} tour={tour} />)}
    </div>
  );
}
```

---

## Common Issues

### API Connection Refused

Make sure backend is running:
```bash
# Check backend status
curl http://localhost:3000/api/v1/tours

# Or start backend
docker-compose up backend
```

### Port 5173 Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Environment Variables Not Working

1. Restart dev server after changing `.env`
2. Ensure `.env` is in the `project/frontend/` directory
3. Variables must start with `VITE_` prefix

---

## Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

Build output is in `dist/` directory.

Deploy `dist/` to Vercel, Netlify, or any static hosting.

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variable:
   - `VITE_API_URL` = your production backend URL
3. Deploy automatically on push to `main`

### Manual Deployment

```bash
npm run build
# Upload 'dist' folder to your hosting provider
```

---

**Last Updated**: 2025-02-10
