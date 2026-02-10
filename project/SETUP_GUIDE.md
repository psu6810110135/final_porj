# คู่มือการใช้งานโปรเจค Thai Tour Website

## 📋 เนื้อหา (Table of Contents)
- [ภาพรวมโปรเจค](#ภาพรวมโปรเจค)
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [การเตรียมระบบ (Prerequisites)](#การเตรียมระบบ-prerequisites)
- [วิธีการติดตั้งและเริ่มต้น](#วิธีการติดตั้งและเริ่มต้น)
- [การตรวจสอบระบบ](#การตรวจสอบระบบ)
- [สิ่งที่ติดตั้งไปแล้ว](#สิ่งที่ติดตั้งไปแล้ว)
- [คำสั่งที่ใช้บ่อย](#คำสั่งที่ใช้บ่อย)
- [การแก้ปัญหา (Troubleshooting)](#การแก้ปัญหา-troubleshooting)

---

## ภาพรวมโปรเจค

โปรเจคนี้เป็นระบบจองทัวร์ในประเทศไทย ประกอบด้วย:
- **Frontend**: React + TypeScript + Vite
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL (Docker)

---

## โครงสร้างโปรเจค

```
project/
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── components/    # Component ต่างๆ
│   │   ├── pages/         # หน้าเว็บ
│   │   ├── services/      # API calls
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── .env               # Environment variables
│   └── package.json
│
├── backend/               # NestJS Backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── tours/         # Tours module
│   │   ├── bookings/      # Bookings module
│   │   ├── payments/      # Payments module
│   │   ├── admin/         # Admin module
│   │   ├── health/        # Health check
│   │   ├── common/        # Shared utilities
│   │   ├── main.ts        # Entry point
│   │   └── app.module.ts  # Root module
│   ├── .env               # Environment variables
│   └── package.json
│
├── docker-compose.yml     # PostgreSQL container
└── SETUP_GUIDE.md         # ไฟล์นี้
```

---

## การเตรียมระบบ (Prerequisites)

ตรวจสอบว่ามีโปรแกรมเหล่านี้ติดตั้งอยู่:

```bash
# ตรวจสอบ Node.js (ต้องเวอร์ชัน 18+)
node --version

# ตรวจสอบ npm
npm --version

# ตรวจสอบ Docker
docker --version

# ตรวจสอบ Docker Compose
docker-compose --version
```

---

## วิธีการติดตั้งและเริ่มต้น

### 1. เริ่มต้น PostgreSQL Database

```bash
# จาก root folder ของโปรเจค
docker-compose up -d

# ตรวจสอบว่า container ทำงาน
docker ps

# ดู logs
docker-compose logs -f postgres
```

**Database Connection:**
- Host: `localhost:5433`
- Database: `thai_tours`
- User: `thai_tours`
- Password: `thai_tours_password`

### 2. เริ่มต้น Backend

```bash
# เข้าไปใน backend folder
cd backend

# ติดตั้ง dependencies (ถ้ายังไม่ได้ทำ)
npm install

# เริ่มต้นในโหมด development
npm run start:dev
```

Backend จะทำงานที่: `http://localhost:8080`

### 3. เริ่มต้น Frontend

เปิด terminal ใหม่ แล้ว:

```bash
# เข้าไปใน frontend folder
cd frontend

# ติดตั้ง dependencies (ถ้ายังไม่ได้ทำ)
npm install

# เริ่มต้น development server
npm run dev
```

Frontend จะทำงานที่: `http://localhost:5173`

---

## การตรวจสอบระบบ

### ตรวจสอบ Backend API

```bash
# Health check endpoint
curl http://localhost:8080/api/health

# ควรได้รับ response:
# {
#   "status": "ok",
#   "message": "Thai Tour API is running",
#   "timestamp": "2026-02-07T..."
# }
```

### ตรวจสอบ Frontend

เปิด browser ไปที่: `http://localhost:5173`

ควรเห็นหน้าว่างของ React (Vite template)

### ตรวจสอบ Database

```bash
# เข้าไปใน PostgreSQL container
docker exec -it thai_tours_db psql -U thai_tours -d thai_tours

# ดูรายการ tables
\dt

# ออกจาก database
\q
```

### ตรวจสอบว่าทุกอย่างทำงาน

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:5173 | ✅ |
| Backend API | http://localhost:8080/api/health | ✅ |
| PostgreSQL | localhost:5433 | ✅ |

---

## สิ่งที่ติดตั้งไปแล้ว

### ✅ Phase 0: Setup & Infrastructure (เสร็จสมบูรณ์)

#### Frontend
- ✅ Vite + React + TypeScript project
- ✅ TailwindCSS v4 พร้อม @tailwindcss/postcss
- ✅ React Router DOM
- ✅ Axios (สำหรับ API calls)
- ✅ TanStack Query (สำหรับ data fetching)
- ✅ date-fns (สำหรับจัดการวันที่)
- ✅ qrcode.react (สำหรับสร้าง QR Code)

#### Backend
- ✅ NestJS + TypeScript
- ✅ TypeORM + PostgreSQL
- ✅ JWT Authentication (@nestjs/jwt, passport)
- ✅ Validation (class-validator, class-transformer)
- ✅ File Upload (multer)
- ✅ Security (cors, helmet)
- ✅ Logging (winston)

#### Database
- ✅ PostgreSQL 16 Alpine (Docker)
- ✅ Docker Compose setup
- ✅ Health check configured

---

## คำสั่งที่ใช้บ่อย

### Docker Commands

```bash
# เริ่มต้น database
docker-compose up -d

# หยุด database
docker-compose down

# หยุดและลบ volumes (ลบข้อมูลทั้งหมด)
docker-compose down -v

# ดู logs
docker-compose logs -f postgres

# เข้าไปใน database
docker exec -it thai_tours_db psql -U thai_tours -d thai_tours
```

### Backend Commands

```bash
cd backend

# Development mode (มี hot reload)
npm run start:dev

# Build สำหรับ production
npm run build

# Run production
npm run start:prod
```

### Frontend Commands

```bash
cd frontend

# Development mode
npm run dev

# Build สำหรับ production
npm run build

# Preview production build
npm run preview
```

---

## การแก้ปัญหา (Troubleshooting)

### Port ใช้งานไม่ได้ (EADDRINUSE)

**ปัญหา:** `Error: listen EADDRINUSE: address already in use :::8080`

**วิธีแก้:**

```bash
# หา process ที่ใช้ port 8080
lsof -ti :8080

# ฆ่า process
kill -9 <PID>

# หรือใช้คำสั่งเดียวจบ
kill -9 $(lsof -ti :8080)
```

### Database เชื่อมต่อไม่ได้

**ปัญหา:** `password authentication failed for user "thai_tours"`

**วิธีแก้:**

```bash
# ตรวจสอบว่า Docker container ทำงานอยู่
docker ps | grep thai_tours_db

# ถ้าไม่ทำงาน ให้เริ่มใหม่
docker-compose up -d

# ตรวจสอบ port
docker ps | grep 5433
```

### Frontend TailwindCSS Error

**ปัญหา:** `[postcss] It looks like you're trying to use tailwindcss directly`

**วิธีแก้:**
ตรวจสอบว่ามี `@tailwindcss/postcss` ติดตั้งอยู่:

```bash
cd frontend
npm list @tailwindcss/postcss
```

ถ้าไม่มี ให้ติดตั้ง:
```bash
npm install @tailwindcss/postcss
```

ตรวจสอบ `postcss.config.js`:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

ตรวจสอบ `src/index.css`:
```css
@import "tailwindcss";
```

### Backend build ไม่ได้

**ปัญหา:** `Cannot find module 'dist/main'`

**วิธีแก้:**
ใช้ `npm run start:dev` แทน ซึ่งใช้ nodemon + ts-node โดยตรง

---

## Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Backend (`.env`)
```env
PORT=8080
DATABASE_URL=postgresql://thai_tours:thai_tours_password@localhost:5433/thai_tours
JWT_SECRET=dev-secret-key-change-in-production-123456
JWT_EXPIRES_IN=24h
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## ขั้นตอนถัดไป (Next Steps)

ดูรายละเอียดการพัฒนาต่อได้ที่: `../system_based/TODO.md`

**Phase 1: Database Setup**
- สร้าง database tables
- สร้าง indexes
- สร้าง views และ triggers
- Seed ข้อมูลทดสอบ

---

## ติดต่อ / ขอความช่วยเหลือ

หากพบปัญหา ให้ตรวจสอบ:
1. Docker ทำงานอยู่หรือไม่
2. Port 8080, 5173, 5433 ว่างหรือไม่
3. Environment variables ถูกต้องหรือไม่

---

**อัปเดตล่าสุด:** 2026-02-07
**สถานะ:** Phase 0 เสร็จสมบูรณ์ ✅
