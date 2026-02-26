# Booking System Enhancement - Documentation

## สรุปการเปลี่ยนแปลง (Summary of Changes)

### วัตถุประสงค์ (Objectives)
1. ✅ **ป้องกันการจองย้อนหลัง** - ไม่สามารถจองทัวร์ที่วันเดินทางผ่านไปแล้ว
2. ✅ **แสดงวันที่เต็ม** - ระบบตรวจสอบที่นั่งว่างและไม่ให้จองเกินจำนวนที่กำหนด
3. ✅ **จำกัดจำนวนการจองต่อผู้ใช้** - ผู้ใช้สามารถมีการจองที่ active ได้สูงสุด 5 รายการ

---

## ไฟล์ที่เปลี่ยนแปลง (Files Modified)

### 1. ✨ ไฟล์ใหม่: `/src/config/booking.config.ts`
**คำอธิบาย**: การตั้งค่าระบบจอง

```typescript
export const BOOKING_CONFIG = {
  MAX_ACTIVE_BOOKINGS_PER_USER: 5,
  ACTIVE_BOOKING_STATUSES: ['pending_pay', 'pending_verify', 'confirmed'],
} as const;
```

**การปรับแต่ง**:
- เปลี่ยน `MAX_ACTIVE_BOOKINGS_PER_USER` เป็นจำนวนที่ต้องการ (ปัจจุบัน: 5)
- `ACTIVE_BOOKING_STATUSES` คือสถานะที่นับว่าเป็น "active"

---

### 2. 📝 แก้ไข: `/src/bookings/dto/create-booking.dto.ts`

**เปลี่ยนแปลง**:
- ✅ `tourScheduleId` เปลี่ยนจาก **optional** เป็น **required** (บังคับต้องส่ง)
- ❌ ลบฟิลด์ `travelDate`, `startDate`, `endDate` (ไม่ใช้แล้ว)

**ก่อนแก้ไข**:
```typescript
@IsUUID('4')
@IsOptional()  // ส่งหรือไม่ส่งก็ได้
tourScheduleId?: string;

@IsDateString()
@IsOptional()
travelDate?: string;  // ฟิลด์เดิม - ลบออกแล้ว
```

**หลังแก้ไข**:
```typescript
@IsUUID('4')
tourScheduleId!: string;  // บังคับต้องส่ง
```

---

### 3. 📝 แก้ไข: `/src/bookings/dto/calculate-booking.dto.ts`

**เปลี่ยนแปลง**: เหมือนกับ `create-booking.dto.ts`
- ✅ `tourScheduleId` required
- ❌ ลบฟิลด์วันที่ทั้งหมด

---

### 4. 🔧 แก้ไข: `/src/bookings/bookings.service.ts`

**เปลี่ยนแปลงใหญ่** - Refactor ทั้งระบบการจอง

#### **4.1 Method: `calculatePrice()`**

**ก่อน**: ใช้วันที่จากผู้ใช้ส่งมา
```typescript
const { tourId, travelDate, startDate, endDate } = calculateBookingDto;
const refDate = travelDate ? new Date(travelDate) : ...;
```

**หลัง**: ดึงวันที่จาก `tour_schedules` table
```typescript
const { tourId, tourScheduleId } = calculateBookingDto;

const schedule = await this.schedulesRepository.findOne({
  where: { id: tourScheduleId },
});

// ตรวจสอบว่า schedule ตรงกับ tour
if (schedule.tour_id !== tourId) {
  throw new BadRequestException('Schedule does not belong to this tour');
}

const refDate = new Date(schedule.available_date);
```

#### **4.2 Method: `create()` - ขั้นตอนการ Validate**

**ลำดับการตรวจสอบใหม่**:

```
1. ✅ Max bookings check (validateMaxBookingsPerUser)
   ↓
2. ✅ Lock tour row (pessimistic_write)
   ↓
3. ✅ Lock & validate schedule:
   - Schedule exists?
   - Belongs to tour?
   - is_available === true? (NEW)
   - available_date >= today? (NEW - ป้องกันจองย้อนหลัง)
   ↓
4. ✅ Capacity check (เช็คที่นั่งว่าง)
   ↓
5. ✅ Calculate price
   ↓
6. ✅ Create booking (travelDate = schedule.available_date)
```

#### **4.3 Method ใหม่: `validateMaxBookingsPerUser()`**

```typescript
private async validateMaxBookingsPerUser(
  manager: EntityManager,
  userId: string,
): Promise<void> {
  const count = await manager
    .getRepository(Booking)
    .createQueryBuilder('b')
    .where('b.userId = :userId', { userId })
    .andWhere('b.status IN (:...statuses)', {
      statuses: BOOKING_CONFIG.ACTIVE_BOOKING_STATUSES,
    })
    .getCount();

  if (count >= BOOKING_CONFIG.MAX_ACTIVE_BOOKINGS_PER_USER) {
    throw new BadRequestException(
      `You have reached the maximum limit of ${BOOKING_CONFIG.MAX_ACTIVE_BOOKINGS_PER_USER} active bookings`,
    );
  }
}
```

---

## วิธีใช้งาน (How to Use)

### 1️⃣ สร้าง Tour Schedule ก่อน (Admin Only)

**Endpoint**: `POST /api/v1/tours/:tourId/schedules`

```json
{
  "available_date": "2026-03-15",
  "max_capacity_override": 20,
  "is_available": true
}
```

**คำอธิบาย**:
- `available_date`: วันที่เปิดให้จอง (format: YYYY-MM-DD)
- `max_capacity_override`: จำนวนที่นั่ง (ถ้าไม่ระบุจะใช้ `tour.max_group_size`)
- `is_available`: เปิด/ปิด การจอง (default: true)

---

### 2️⃣ ดูรายการ Schedule ที่มี

**Endpoint**: `GET /api/v1/tours/:tourId/schedules`

**Response**:
```json
[
  {
    "id": "schedule-uuid-1",
    "tour_id": "tour-uuid",
    "available_date": "2026-03-15",
    "max_capacity_override": 20,
    "is_available": true,
    "booked_seats": 15,
    "available_seats": 5,
    "created_at": "2026-02-25T12:00:00Z"
  },
  {
    "id": "schedule-uuid-2",
    "available_date": "2026-03-16",
    "max_capacity_override": null,
    "is_available": true,
    "booked_seats": 0,
    "available_seats": 30,
    "created_at": "2026-02-25T12:00:00Z"
  }
]
```

**การตรวจสอบที่นั่งว่าง**:
- `booked_seats`: จำนวนที่จองแล้ว
- `available_seats`: ที่นั่งคงเหลือ
- ถ้า `available_seats = 0` หรือ `is_available = false` → **ไม่สามารถจองได้**

---

### 3️⃣ คำนวณราคาก่อนจอง

**Endpoint**: `POST /api/v1/bookings/calculate`

```json
{
  "tourId": "tour-uuid",
  "tourScheduleId": "schedule-uuid-1",
  "pax": 2
}
```

**Response**:
```json
{
  "basePrice": 10000,
  "discount": 500,
  "totalPrice": 9500,
  "breakdown": {
    "pricePerPerson": 5000,
    "pax": 2,
    "subtotal": 10000,
    "discountPercentage": 5,
    "discountAmount": 500,
    "total": 9500
  }
}
```

---

### 4️⃣ จองทัวร์

**Endpoint**: `POST /api/v1/bookings`

**Request Body**:
```json
{
  "tourId": "tour-uuid",
  "tourScheduleId": "schedule-uuid-1",
  "pax": 2,
  "contactInfo": {
    "name": "สมชาย ใจดี",
    "email": "somchai@example.com",
    "phone": "0812345678"
  },
  "specialRequests": "ต้องการที่นั่งใกล้หน้าต่าง",
  "selectedOptions": {
    "meal": "vegetarian"
  }
}
```

**⚠️ ห้ามส่ง**:
- ❌ `travelDate`
- ❌ `startDate`
- ❌ `endDate`

**✅ บังคับต้องส่ง**:
- ✅ `tourScheduleId`

---

## Error Messages

| HTTP Status | Error Message                                                 | สาเหตุ                                          |
|-------------|---------------------------------------------------------------|-------------------------------------------------|
| 400         | `tourScheduleId is required`                                  | ไม่ได้ส่ง `tourScheduleId`                      |
| 404         | `Schedule not found`                                          | ไม่มี schedule ID นี้                          |
| 400         | `Schedule does not belong to this tour`                       | schedule ไม่ตรงกับ tour                        |
| 400         | `This schedule is not available for booking`                  | `is_available = false`                          |
| 400         | `Cannot book a schedule that has already passed`              | **วันที่ผ่านไปแล้ว** (ป้องกันจองย้อนหลัง)       |
| 400         | `You have reached the maximum limit of 5 active bookings`     | ผู้ใช้มีการจอง active ครบ 5 รายการแล้ว        |
| 400         | `เหลือที่นั่งเพียง X ที่`                                     | **ที่นั่งไม่พอ** (เต็มแล้ว)                     |

---

## ตัวอย่างการใช้งาน (Usage Example)

### Scenario: จองทัวร์เที่ยวเชียงใหม่ 3 วัน 2 คืน

**Step 1**: Admin สร้าง schedule
```bash
POST /api/v1/tours/chiangmai-tour-uuid/schedules
{
  "available_date": "2026-04-01",
  "max_capacity_override": 25,
  "is_available": true
}
```

**Step 2**: ลูกค้าดูรายการวันที่มี
```bash
GET /api/v1/tours/chiangmai-tour-uuid/schedules

Response:
[
  {
    "id": "schedule-abc123",
    "available_date": "2026-04-01",
    "available_seats": 10  // ← เหลือ 10 ที่
  },
  {
    "id": "schedule-def456",
    "available_date": "2026-04-05",
    "available_seats": 0  // ← เต็ม ❌
  }
]
```

**Step 3**: ลูกค้าเลือกวันที่ 1 เมษายน (schedule-abc123)
```bash
POST /api/v1/bookings
{
  "tourId": "chiangmai-tour-uuid",
  "tourScheduleId": "schedule-abc123",  // ← เลือกวันที่นี้
  "pax": 3,
  "contactInfo": {
    "name": "นายทดสอบ",
    "email": "test@mail.com",
    "phone": "0899999999"
  }
}
```

**Step 4**: ระบบตรวจสอบ
1. ✅ ผู้ใช้มีการจอง active น้อยกว่า 5 รายการ
2. ✅ Schedule exists และ belongs to tour
3. ✅ `is_available = true`
4. ✅ วันที่ 1 เมษายน 2026 > วันนี้
5. ✅ ที่นั่งว่าง: 10 ที่ >= 3 คน ✅
6. ✅ สร้างการจองสำเร็จ

---

## Database View สำหรับดูที่นั่งว่าง

**View**: `tour_date_availability`

```sql
SELECT * FROM tour_date_availability 
WHERE tour_id = 'your-tour-uuid';
```

**Output**:
```
tour_id  | available_date | max_capacity | booked_seats | available_seats | is_available
---------|----------------|--------------|--------------|-----------------|-------------
uuid-123 | 2026-03-15     | 20           | 15           | 5               | true
uuid-123 | 2026-03-16     | 30           | 30           | 0               | true  ← เต็ม
uuid-123 | 2026-03-17     | 25           | 0            | 25              | false ← ปิด
```

---

## Testing Checklist

### ✅ Test Cases

1. **ป้องกันจองย้อนหลัง**
   ```bash
   # สร้าง schedule วันที่ผ่านมาแล้ว
   POST /tours/.../schedules
   { "available_date": "2026-02-20" }  # วันนี้คือ 2026-02-25
   
   # พยายามจอง
   POST /bookings
   { "tourScheduleId": "..." }
   
   # Expected: 400 "Cannot book a schedule that has already passed"
   ```

2. **ป้องกันจองเกินที่นั่ง**
   ```bash
   # Schedule มีที่เหลือ 2 ที่
   POST /bookings
   { "pax": 5 }  # จอง 5 คน
   
   # Expected: 400 "เหลือที่นั่งเพียง 2 ที่"
   ```

3. **ป้องกันจองเกิน 5 รายการ**
   ```bash
   # ผู้ใช้มี active bookings 5 รายการแล้ว
   POST /bookings
   { ... }
   
   # Expected: 400 "You have reached the maximum limit of 5 active bookings"
   ```

4. **ป้องกันจอง schedule ที่ปิด**
   ```bash
   # Schedule: is_available = false
   POST /bookings
   { "tourScheduleId": "..." }
   
   # Expected: 400 "This schedule is not available for booking"
   ```

---

## Breaking Changes ⚠️

### สำหรับ Frontend Developer

**ก่อน** (Old API):
```javascript
// API เดิม - ใช้ไม่ได้แล้ว ❌
fetch('/api/v1/bookings', {
  method: 'POST',
  body: JSON.stringify({
    tourId: '...',
    travelDate: '2026-03-15',  // ❌ ลบออกแล้ว
    pax: 2
  })
});
```

**หลัง** (New API):
```javascript
// API ใหม่ - ต้องส่ง tourScheduleId ✅
fetch('/api/v1/bookings', {
  method: 'POST',
  body: JSON.stringify({
    tourId: '...',
    tourScheduleId: 'schedule-uuid-123',  // ✅ บังคับ
    pax: 2
  })
});
```

### Migration Steps

1. **เพิ่ม API call**: `GET /tours/:tourId/schedules` เพื่อดึงรายการวันที่
2. **แสดง UI**: Calendar/List แสดงวันที่ว่าง/เต็ม
3. **Update form**: เปลี่ยนจาก date picker เป็นการเลือก schedule
4. **ส่ง `tourScheduleId`** แทน `travelDate`

---

## Summary

### ✨ Features ใหม่
- ✅ ป้องกันจองย้อนหลัง (past date validation)
- ✅ แสดงวันที่เต็ม (capacity check per schedule)
- ✅ จำกัดการจองต่อผู้ใช้ (max 5 active bookings)
- ✅ เช็ค schedule availability (is_available flag)

### 📊 Database Schema
- ใช้ table `tour_schedules` (มีอยู่แล้วตาม Database Design)
- View `tour_date_availability` แสดงที่นั่งว่างต่อวัน

### 🔒 Validations
1. Max bookings per user (5 active)
2. Schedule exists & belongs to tour
3. Schedule is_available = true
4. Schedule date >= today
5. Enough available seats

---

**Last Updated**: 2026-02-25
**Status**: ✅ Ready for Testing
