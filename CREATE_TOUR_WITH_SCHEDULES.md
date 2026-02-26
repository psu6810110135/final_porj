# สร้างทัวร์พร้อมกำหนดวันเปิดทัวร์ (Create Tour with Schedules)

## 🎯 วัตถุประสงค์

ให้ Admin สามารถ**สร้างทัวร์พร้อมกำหนดวันเปิดทัวร์และจำนวนที่นั่งแต่ละวัน**ในคำขอเดียว

---

## ✅ Database - ไม่ต้องแก้ไข

**Good news!** Database มี table `tour_schedules` อยู่แล้วตาม Database Design:

```sql
CREATE TABLE tour_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    max_capacity_override INTEGER CHECK (max_capacity_override IS NULL OR max_capacity_override > 0),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tour_id, available_date)
);
```

**ไม่ต้องรัน migration ใหม่** เพราะ table นี้มีอยู่แล้ว ✅

---

## 📝 ไฟล์ที่แก้ไข

### 1. `/src/tours/dto/create-tour.dto.ts`

เพิ่ม **ScheduleDto** class และ **schedules array**:

```typescript
// ✨ เพิ่ม Class สำหรับกำหนด Schedule (วันเปิดทัวร์)
class ScheduleDto {
  @IsDateString()
  date!: string;  // วันที่เปิดทัวร์ (YYYY-MM-DD)

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;  // จำนวนที่นั่ง (ถ้าไม่ระบุจะใช้ tour.max_group_size)
}

export class CreateTourDto {
  // ... existing fields ...

  // ✨ เพิ่ม: กำหนดวันเปิดทัวร์พร้อมจำนวนที่นั่งแต่ละวัน
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  @IsOptional()
  schedules?: ScheduleDto[];
}
```

---

### 2. `/src/tours/tours.service.ts`

**เพิ่ม TourSchedule repository**:

```typescript
import { TourSchedule } from './entities/tour-schedule.entity';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private toursRepository: Repository<Tour>,
    @InjectRepository(TourSchedule)
    private schedulesRepository: Repository<TourSchedule>,  // ← เพิ่ม
  ) {}
```

**แก้ไข create() method**:

```typescript
async create(createTourDto: CreateTourDto): Promise<Tour> {
  const { schedules, ...tourData } = createTourDto;

  // 1. สร้าง Tour
  const tour = this.toursRepository.create({
    ...tourData,
    images: createTourDto.image_cover ? [createTourDto.image_cover] : [],
    is_active: true,
  });
  const savedTour = await this.toursRepository.save(tour);

  // 2. สร้าง Schedules ถ้ามีการส่งมา
  if (schedules && schedules.length > 0) {
    const scheduleEntities = schedules.map(s => ({
      tour_id: savedTour.id,
      available_date: new Date(s.date),
      max_capacity_override: s.capacity ?? undefined,
      is_available: true,
    }));
    await this.schedulesRepository.insert(scheduleEntities);
  }

  return savedTour;
}
```

---

## 🚀 วิธีใช้งาน

### สถานการณ์: Admin สร้างทัวร์เชียงใหม่ 3 วัน 2 คืน

**Endpoint**: `POST /api/v1/tours`

**Request Body**:

```json
{
  "title": "เที่ยวเชียงใหม่ 3 วัน 2 คืน",
  "description": "ทัวร์ครบวงจร ครอบคลุมทุกจุดท่องเที่ยวชื่นดังในเชียงใหม่",
  "price": 8900,
  "province": "เชียงใหม่",
  "region": "North",
  "duration": "3 วัน 2 คืน",
  "category": "Culture",
  "max_group_size": 30,
  "image_cover": "https://example.com/chiang-mai-tour.jpg",
  "highlights": [
    "วัดพระธาตุดอยสุเทพ",
    "ตลาดวโรรส",
    "บ้านกาดหลวง"
  ],
  
  "schedules": [
    {
      "date": "2026-03-15",
      "capacity": 25
    },
    {
      "date": "2026-03-20",
      "capacity": 30
    },
    {
      "date": "2026-03-25"
    },
    {
      "date": "2026-04-01",
      "capacity": 20
    }
  ]
}
```

**คำอธิบาย**:
- วันที่ 15 มีนาคม: จำกัด **25 คน**
- วันที่ 20 มีนาคม: จำกัด **30 คน**
- วันที่ 25 มีนาคม: **ไม่ระบุ capacity** → ใช้ `max_group_size = 30` คน
- วันที่ 1 เมษายน: จำกัด **20 คน**

**Response**:

```json
{
  "id": "tour-uuid-123",
  "title": "เที่ยวเชียงใหม่ 3 วัน 2 คืน",
  "price": 8900,
  "max_group_size": 30,
  "is_active": true,
  "created_at": "2026-02-25T19:40:00Z"
}
```

---

## 📊 ตรวจสอบ Schedules ที่สร้างแล้ว

**Endpoint**: `GET /api/v1/tours/:tourId/schedules`

**Response**:

```json
[
  {
    "id": "schedule-uuid-1",
    "tour_id": "tour-uuid-123",
    "available_date": "2026-03-15",
    "max_capacity_override": 25,
    "is_available": true,
    "booked_seats": 0,
    "available_seats": 25,
    "created_at": "2026-02-25T19:40:01Z"
  },
  {
    "id": "schedule-uuid-2",
    "tour_id": "tour-uuid-123",
    "available_date": "2026-03-20",
    "max_capacity_override": 30,
    "is_available": true,
    "booked_seats": 0,
    "available_seats": 30,
    "created_at": "2026-02-25T19:40:01Z"
  },
  {
    "id": "schedule-uuid-3",
    "tour_id": "tour-uuid-123",
    "available_date": "2026-03-25",
    "max_capacity_override": null,
    "is_available": true,
    "booked_seats": 0,
    "available_seats": 30,
    "created_at": "2026-02-25T19:40:01Z"
  },
  {
    "id": "schedule-uuid-4",
    "tour_id": "tour-uuid-123",
    "available_date": "2026-04-01",
    "max_capacity_override": 20,
    "is_available": true,
    "booked_seats": 0,
    "available_seats": 20,
    "created_at": "2026-02-25T19:40:01Z"
  }
]
```

---

## 🔄 ขั้นตอนการทำงาน (Workflow)

```
Admin creates tour
       │
       ▼
POST /api/v1/tours
{
  "title": "...",
  "price": 8900,
  "schedules": [...]
}
       │
       ▼
┌──────────────────┐
│ 1. Create Tour   │
│    (save to DB)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ 2. Loop through schedules[]  │
│    For each schedule:        │
│    - tour_id = savedTour.id  │
│    - available_date = s.date │
│    - capacity = s.capacity   │
│    - is_available = true     │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Bulk insert schedules │
│    to tour_schedules     │
└────────┬─────────────────┘
         │
         ▼
    Return Tour
```

---

## ✨ ข้อดีของวิธีนี้

### 1. **UX ที่ดีกว่า**
- Admin ไม่ต้องสร้างทัวร์ก่อน แล้วค่อยกลับมาเพิ่ม schedules
- **สร้างครั้งเดียวเสร็จ** ในหน้าเดียว

### 2. **Atomic Operation**
- ถ้าสร้าง tour สำเร็จ แต่ schedule fail → tour ก็ถูกสร้างอยู่ดี
- ถ้าต้องการ **all-or-nothing** สามารถใช้ Transaction ได้

### 3. **Flexible Capacity**
- แต่ละวันสามารถกำหนด capacity ต่างกันได้
- ถ้าไม่ระบุ จะใช้ `tour.max_group_size` เป็นค่า default

### 4. **Database Optimized**
- ใช้ `insert()` bulk insertion แทน `save()` หลายครั้ง
- ประหยัดการ query database

---

## 🔀 ทางเลือกอื่น (Alternatives)

### ทางเลือก 1: สร้างแยก (2 API calls)

```bash
# Step 1: Create tour
POST /api/v1/tours
{ "title": "...", "price": 8900 }

# Response: { "id": "tour-uuid-123" }

# Step 2: Create schedules
POST /api/v1/tours/tour-uuid-123/schedules
{
  "schedules": [
    { "date": "2026-03-15", "capacity": 25 },
    { "date": "2026-03-20", "capacity": 30 }
  ]
}
```

**ข้อเสีย**:
- ❌ ต้อง 2 API calls
- ❌ UX ไม่ดี (ต้องรอ tour ถูกสร้างก่อน)
- ❌ ถ้า step 2 fail → tour ถูกสร้างไว้แล้วแต่ไม่มี schedules

### ทางเลือก 2: Nested Creation (✅ วิธีที่เลือกใช้)

```bash
# Single API call
POST /api/v1/tours
{
  "title": "...",
  "schedules": [...]
}
```

**ข้อดี**:
- ✅ UX ดีกว่า
- ✅ API call เดียว
- ✅ ง่ายต่อการใช้งาน

---

## ⚠️ ข้อควรระวัง

### 1. **Duplicate Dates**

Database มี constraint `UNIQUE (tour_id, available_date)` ดังนั้น:

```json
// ❌ จะ ERROR
{
  "schedules": [
    { "date": "2026-03-15" },
    { "date": "2026-03-15" }  // ← ซ้ำ!
  ]
}
```

**Error**: `duplicate key value violates unique constraint`

### 2. **Invalid Date Format**

```json
// ❌ จะ ERROR
{
  "schedules": [
    { "date": "15/03/2026" }  // ← ต้องเป็น YYYY-MM-DD
  ]
}
```

**Error**: `date must be a valid ISO 8601 date string`

### 3. **Empty Schedules Array**

```json
// ✅ OK - จะสร้างแค่ tour ไม่สร้าง schedules
{
  "title": "...",
  "schedules": []
}

// ✅ OK - เหมือนกัน
{
  "title": "..."
  // ไม่ส่ง schedules field
}
```

---

## 🧪 Test Cases

### Test 1: สร้างทัวร์พร้อม schedules

```bash
POST /api/v1/tours
{
  "title": "Test Tour",
  "price": 5000,
  "province": "กรุงเทพ",
  "region": "Central",
  "duration": "1 วัน",
  "category": "Food",
  "max_group_size": 20,
  "schedules": [
    { "date": "2026-03-01", "capacity": 15 },
    { "date": "2026-03-05", "capacity": 20 }
  ]
}
```

**Expected**:
- ✅ Tour ถูกสร้าง
- ✅ 2 schedules ถูกสร้าง

### Test 2: สร้างทัวร์ไม่มี schedules

```bash
POST /api/v1/tours
{
  "title": "Test Tour 2",
  "price": 5000,
  // ... ไม่มี schedules field
}
```

**Expected**:
- ✅ Tour ถูกสร้าง
- ✅ ไม่มี schedules ถูกสร้าง

### Test 3: Schedule ไม่ระบุ capacity

```bash
POST /api/v1/tours
{
  "title": "Test Tour 3",
  "max_group_size": 25,
  "schedules": [
    { "date": "2026-03-10" }  // ← ไม่ระบุ capacity
  ]
}
```

**Expected**:
- ✅ Schedule ถูกสร้างด้วย `max_capacity_override = null`
- ✅ จะใช้ `tour.max_group_size = 25` เป็น capacity

---

## 📌 สรุป

### ✅ สิ่งที่ได้

1. **Admin สร้างทัวร์พร้อม schedules ในคำขอเดียว**
2. **ไม่ต้องแก้ database** (ใช้ table เดิม)
3. **แต่ละวันกำหนด capacity ได้อิสระ**
4. **UX ที่ดีกว่า** (single API call)

### 📂 ไฟล์ที่แก้ไข

| File | Changes |
|------|---------|
| `create-tour.dto.ts` | เพิ่ม `ScheduleDto` class และ `schedules[]` field |
| `tours.service.ts` | เพิ่ม `TourSchedule` repository, แก้ไข `create()` method |

### 🔗 Integration กับ Booking System

ตอนนี้ระบบจอง (`@/Users/thanaphiphat/Documents/Webdev_class/final_porj/BOOKING_SYSTEM_CHANGES.md:1`) **บังคับให้ส่ง `tourScheduleId`** ดังนั้น:

1. Admin สร้างทัวร์พร้อม schedules ✅
2. Customer เลือกวันที่จาก schedules ✅
3. Customer จองโดยส่ง `tourScheduleId` ✅
4. System ตรวจสอบ capacity, past date, availability ✅

**ทุกอย่างเชื่อมโยงกันครบแล้ว! 🎉**

---

**Last Updated**: 2026-02-25  
**Status**: ✅ Ready to Use
