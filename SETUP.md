# Thai Tour Website - Setup Guide

วิธีติดตั้งและรันโปรเจกต์ Thai Tour Website

---

## โครงสร้างโปรเจกต์

```
final_porj/
├── docker-compose.yml    # Docker setup (PostgreSQL เท่านั้น)
├── SETUP.md              # ไฟล์นี้
│
└── project/
    ├── backend/          # NestJS Backend
    │   ├── src/
    │   ├── .env
    │   └── package.json
    └── frontend/         # React Frontend
        ├── src/
        ├── .env
        └── package.json
```

---

```bash
# Terminal 1 - Database (Docker)
docker-compose up

# Terminal 2 - Backend
cd project/backend
npm run start:dev

# Terminal 3 - Frontend
cd project/frontend
npm run dev
```

---

## เข้าถึง Application

| Service | URL | ใช้อะไร |
|---------|-----|---------|
| Frontend | http://localhost:5173 | หน้าเว็บหลัก |
| Backend API | http://localhost:3000 | API |
| Health Check | http://localhost:3000/health | เช็คสถานะ Backend |
| PostgreSQL | localhost:5433 | Database |

---

## ทดสอบว่าทำงานไหม

```bash
# เช็ค Backend
curl http://localhost:3000/health

# ผลลัพธ์ที่ควรได้
{"status":"ok","timestamp":"...","uptime":123.456,"environment":"development"}
```

---

## Environment Variables

### Backend (`project/backend/.env`)
```env
PORT=3000
DATABASE_URL=postgresql://thai_tours:thai_tours_password@localhost:5433/thai_tours
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

### Frontend (`project/frontend/.env`)
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## Docker Compose Commands

```bash
# รัน PostgreSQL
docker-compose up

# รันแบบ background
docker-compose up -d

# ดู logs
docker-compose logs -f

# หยุด
docker-compose down

# หยุดและลบข้อมูลทั้งหมด
docker-compose down -v
```

---

## เชื่อมต่อ Database

```bash
# เข้าไปใน PostgreSQL container
docker exec -it thai_tours_db psql -U thai_tours -d thai_tours

# คำสั่งพื้นฐาน
\dt          # ดูทุก table
\d users     # ดู structure ของ table users
\q           # ออก
```

---

## แก้ปัญหา

### Port ใช้ไม่ได้
```bash
# ดูว่าอะไรใช้ port อยู่
lsof -i :3000
lsof -i :5173
lsof -i :5433

# ฆ่า process
kill -9 <PID>

# หรือใช้คำสั่งนี้
lsof -ti:3000 | xargs kill -9
```


```

--- 

## ถัดไป

ดูรายละเอียด development:
- Roadmap: `system_based/TODO_SIMPLIFIED.md`
- Backend: ดูใน `project/backend/`
- Frontend: ดูใน `project/frontend/`

---

**Last Updated**: 2025-02-10
