# Tours Module Documentation

## 📋 Overview

Tours Module เป็นส่วนหลักของระบบที่จัดการข้อมูลทัวร์ทั้งหมด รองรับการค้นหา กรอง และจัดการข้อมูลทัวร์ต่างๆ

## 🏗️ Architecture

### Entities
- **Tour Entity** (`entities/tour.entity.ts`)
  - ใช้ TypeORM สำหรับจัดการ Database
  - รองรับ Enum สำหรับ Region และ Category
  - มีฟิลด์ครบถ้วนสำหรับข้อมูลทัวร์

### DTOs
- **CreateTourDto** - สำหรับสร้างทัวร์ใหม่
- **UpdateTourDto** - สำหรับอัปเดตข้อมูลทัวร์
- **GetToursFilterDto** - สำหรับกรองและค้นหาทัวร์

### Enums
```typescript
enum TourRegion {
  NORTH = 'North',
  SOUTH = 'South',
  CENTRAL = 'Central',
  EAST = 'East',
  WEST = 'West',
  NORTHEAST = 'Northeast'
}

enum TourCategory {
  SEA = 'Sea',
  MOUNTAIN = 'Mountain',
  CULTURAL = 'Cultural',
  NATURE = 'Nature',
  CITY = 'City',
  ADVENTURE = 'Adventure'
}
```

## 🚀 API Endpoints

### 1. GET `/api/tours`
ดึงข้อมูลทัวร์ทั้งหมด พร้อมฟีเจอร์กรอง

**Query Parameters:**
- `search` - ค้นหาจากชื่อหรือคำอธิบาย
- `province` - กรองตามจังหวัด
- `region` - กรองตามภูมิภาค (North, South, Central, East, West, Northeast)
- `category` - กรองตามหมวดหมู่ (Sea, Mountain, Cultural, Nature, City, Adventure)
- `minPrice` - ราคาต่ำสุด
- `maxPrice` - ราคาสูงสุด
- `duration` - ระยะเวลาทัวร์
- `sort` - เรียงลำดับตามราคา (ASC, DESC)

**ตัวอย่าง:**
```bash
# ค้นหาทัวร์ทะเลในภาคใต้
GET /api/tours?category=Sea&region=South

# ค้นหาทัวร์ราคา 1000-2000 บาท
GET /api/tours?minPrice=1000&maxPrice=2000

# ค้นหาคำว่า "เกาะ"
GET /api/tours?search=เกาะ
```

### 2. GET `/api/tours/:id`
ดึงข้อมูลทัวร์รายตัว

**ตัวอย่าง:**
```bash
GET /api/tours/550e8400-e29b-41d4-a716-446655440000
```

### 3. POST `/api/tours`
สร้างทัวร์ใหม่ (Admin only)

**Request Body:**
```json
{
  "title": "เกาะสมุย",
  "description": "สวรรค์กลางอ่าวไทย",
  "price": 1200,
  "child_price": 800,
  "province": "Surat Thani",
  "region": "South",
  "category": "Sea",
  "duration": "1 Day",
  "rating": 4.8,
  "review_count": 120,
  "image_cover": "https://example.com/image.jpg",
  "images": ["url1", "url2"],
  "highlights": ["รถรับส่งฟรี", "อาหารกลางวัน"],
  "itinerary": "รายละเอียดโปรแกรม...",
  "included": "รวมอาหาร, รถรับส่ง",
  "excluded": "ไม่รวมค่าเครื่องดื่ม",
  "conditions": "เงื่อนไขการจอง...",
  "is_active": true
}
```

### 4. PATCH `/api/tours/:id`
อัปเดตข้อมูลทัวร์ (Admin only)

### 5. DELETE `/api/tours/:id`
ลบทัวร์ (Admin only)

### 6. POST `/api/tours/seed`
เพิ่มข้อมูลทัวร์ตัวอย่าง (Development only)

## 🧪 การทดสอบ (Testing)

### 1. ทดสอบด้วย cURL

#### ดึงข้อมูลทัวร์ทั้งหมด
```bash
curl http://localhost:3000/api/tours
```

#### ค้นหาทัวร์ทะเล
```bash
curl "http://localhost:3000/api/tours?category=Sea"
```

#### ค้นหาทัวร์ในภาคเหนือ
```bash
curl "http://localhost:3000/api/tours?region=North"
```

#### ค้นหาทัวร์ราคา 1000-2000 บาท
```bash
curl "http://localhost:3000/api/tours?minPrice=1000&maxPrice=2000"
```

### 2. ทดสอบด้วย Postman/Thunder Client

**Collection สำหรับทดสอบ:**

1. **GET All Tours**
   - URL: `http://localhost:3000/api/tours`
   - Method: GET

2. **GET Tours with Filters**
   - URL: `http://localhost:3000/api/tours?category=Sea&region=South`
   - Method: GET

3. **GET Tour by ID**
   - URL: `http://localhost:3000/api/tours/{tourId}`
   - Method: GET

4. **POST Create Tour**
   - URL: `http://localhost:3000/api/tours`
   - Method: POST
   - Body: JSON (ดูตัวอย่างด้านบน)

5. **PATCH Update Tour**
   - URL: `http://localhost:3000/api/tours/{tourId}`
   - Method: PATCH
   - Body: JSON (บางฟิลด์ที่ต้องการอัปเดต)

6. **DELETE Tour**
   - URL: `http://localhost:3000/api/tours/{tourId}`
   - Method: DELETE

### 3. ทดสอบด้วย Frontend

เปิดเบราว์เซอร์และไปที่:
```
http://localhost:5173/tours
```

## 📦 การเพิ่มข้อมูลทัวร์ (Seeding)

### วิธีที่ 1: ใช้ Seed Endpoint (แนะนำสำหรับ Development)

```bash
# เริ่มต้น Backend Server
npm run start:dev

# เรียก Seed Endpoint
curl -X POST http://localhost:3000/api/tours/seed
```

หรือใช้ Postman/Thunder Client:
- Method: POST
- URL: `http://localhost:3000/api/tours/seed`

**ข้อมูลที่จะถูกเพิ่ม:**
1. เกาะสมุย - ทะเล, ภาคใต้, 1,200 บาท
2. ดอยอินทนนท์ - ภูเขา, ภาคเหนือ, 1,590 บาท
3. เกาะพีพี - ทะเล, ภาคใต้, 1,800 บาท
4. วัดไชยวัฒนาราม - วัฒนธรรม, ภาคกลาง, 890 บาท
5. เขื่อนเชี่ยวหลาน - ธรรมชาติ, ภาคใต้, 2,500 บาท
6. เกาะล้าน - ทะเล, ภาคตะวันออก, 690 บาท

### วิธีที่ 2: สร้างข้อมูลผ่าน API

```bash
curl -X POST http://localhost:3000/api/tours \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ทัวร์ใหม่",
    "description": "คำอธิบาย",
    "price": 1500,
    "province": "Bangkok",
    "region": "Central",
    "category": "City",
    "duration": "1 Day"
  }'
```

### วิธีที่ 3: ใช้ Database Migration (Production)

สร้างไฟล์ migration:
```bash
npm run migration:create -- src/migrations/SeedTours
```

## 🔧 Configuration

### Database Schema

```sql
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  child_price DECIMAL(10,2),
  province VARCHAR(50) NOT NULL,
  region VARCHAR(20) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image_cover VARCHAR(255),
  images TEXT[],
  highlights TEXT[],
  itinerary TEXT,
  included TEXT,
  excluded TEXT,
  conditions TEXT,
  category VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=3000
NODE_ENV=development
```

## 🐛 Troubleshooting

### ปัญหา: ไม่สามารถเชื่อมต่อ Database
```bash
# ตรวจสอบว่า PostgreSQL ทำงานอยู่
psql -U postgres -c "SELECT version();"

# ตรวจสอบ DATABASE_URL ใน .env
cat .env | grep DATABASE_URL
```

### ปัญหา: Seed ไม่ทำงาน
```bash
# ตรวจสอบว่า table tours มีอยู่
psql -U postgres -d dbname -c "\dt"

# ลบข้อมูลเก่าและ seed ใหม่
psql -U postgres -d dbname -c "TRUNCATE tours CASCADE;"
curl -X POST http://localhost:3000/api/tours/seed
```

### ปัญหา: TypeScript Errors
```bash
# ติดตั้ง dependencies ใหม่
npm install

# Build โปรเจค
npm run build
```

## 📊 ตัวอย่างการใช้งานจริง

### Frontend Integration

```typescript
// services/tourService.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/tours';

export const getTours = async (filters?: {
  search?: string;
  category?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  const response = await axios.get(API_URL, { params: filters });
  return response.data;
};

export const getTourById = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};
```

### React Component Example

```tsx
// pages/ToursPage.tsx
import { useState, useEffect } from 'react';
import { getTours } from '../services/tourService';

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    region: '',
  });

  useEffect(() => {
    const fetchTours = async () => {
      const data = await getTours(filters);
      setTours(data);
    };
    fetchTours();
  }, [filters]);

  return (
    <div>
      {/* Filter UI */}
      <select onChange={(e) => setFilters({...filters, category: e.target.value})}>
        <option value="">All Categories</option>
        <option value="Sea">Sea</option>
        <option value="Mountain">Mountain</option>
        <option value="Cultural">Cultural</option>
      </select>

      {/* Tours List */}
      {tours.map(tour => (
        <div key={tour.id}>
          <h3>{tour.title}</h3>
          <p>{tour.description}</p>
          <p>Price: {tour.price} THB</p>
        </div>
      ))}
    </div>
  );
}
```

## 📝 Notes

- ข้อมูลทัวร์ทั้งหมดจะแสดงเฉพาะที่ `is_active = true`
- การค้นหาไม่ case-sensitive
- ราคาเป็น Decimal(10,2) รองรับทศนิยม 2 ตำแหน่ง
- Rating เป็น Decimal(2,1) รองรับค่า 0.0 - 5.0
- Images และ Highlights เป็น Array ของ String

## 🔐 Security

- ควรเพิ่ม Authentication สำหรับ POST, PATCH, DELETE endpoints
- ใช้ Rate Limiting สำหรับ API calls
- Validate input ทุกครั้งด้วย class-validator
- ใช้ CORS configuration ที่เหมาะสม

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
