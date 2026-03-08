#!/usr/bin/env bash
set -euo pipefail

# =====================================================
# Thai Tour Booking — Full Database Seed (ภาษาไทย)
# docker exec → psql
# =====================================================

DB_CONTAINER="${DB_CONTAINER:-thai_tours_db}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5433}"
DB_USERNAME="${DB_USERNAME:-thai_tours}"
DB_PASSWORD="${DB_PASSWORD:-thai_tours_password}"
DB_DATABASE="${DB_DATABASE:-thai_tours}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker command not found."
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
  echo "Error: container '$DB_CONTAINER' is not running."
  echo "Start it first: docker-compose up -d postgres"
  exit 1
fi

echo "🌱 Seeding database '$DB_DATABASE' in container '$DB_CONTAINER' ..."
echo "   Target: ${DB_USERNAME}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"

docker exec -e PGPASSWORD="$DB_PASSWORD" -i "$DB_CONTAINER" \
  psql -v ON_ERROR_STOP=1 -U "$DB_USERNAME" -d "$DB_DATABASE" <<'SQL'
BEGIN;

-- ===== CLEAN SLATE =====
TRUNCATE TABLE
  reviews, payments, bookings, tour_schedules,
  tickets, tours, users
RESTART IDENTITY CASCADE;


-- ======================================================================
-- 1. USERS  (11 คน: 1 admin, 9 active, 1 inactive)
-- ======================================================================
-- Password hashes (bcrypt 10 rounds):
--   admin1234  → $2b$10$NTqFqtnQ/Hu9tbrF7CstT.7xb7WjaalYRZcKW38ylhHpMniq5d1AG
--   Password123! → $2b$10$ptf02DPzITnDhj0JbbhItO3CVBooc8qYATEkH.ULodflGfNS6qMo.
--   Travel2026!  → $2b$10$/oGCyV0fXDqvMihMCTZM0uJ0Be7EAwFLGPLzRkiQMe8H5eAd4r5ne

INSERT INTO users (
  id, username, password, email, first_name, last_name, full_name,
  phone, avatar_url, role, is_active, provider, created_at, updated_at
) VALUES
-- u01 admin
(
  'a3f1b2c4-8d9e-4f5a-b6c7-1d2e3f4a5b6c',
  'admin',
  '$2b$10$NTqFqtnQ/Hu9tbrF7CstT.7xb7WjaalYRZcKW38ylhHpMniq5d1AG',
  'admin@gotrip.co.th',
  'ผู้ดูแล', 'ระบบ', 'ผู้ดูแลระบบ',
  '0891234567', NULL,
  'admin'::users_role_enum, true, 'local',
  NOW() - INTERVAL '180 day', NOW() - INTERVAL '1 day'
),
-- u02 สมชาย วงศ์สุวรรณ
(
  'd7e8f9a0-1b2c-4d3e-a5f6-7890abcdef12',
  'somchai_w',
  '$2b$10$ptf02DPzITnDhj0JbbhItO3CVBooc8qYATEkH.ULodflGfNS6qMo.',
  'somchai.w@gmail.com',
  'สมชาย', 'วงศ์สุวรรณ', 'สมชาย วงศ์สุวรรณ',
  '0812345678', NULL,
  'customer'::users_role_enum, true, 'local',
  NOW() - INTERVAL '95 day', NOW() - INTERVAL '2 day'
),
-- u03 พิมพ์ชนก ศรีสมบัติ
(
  '2c4b6a8d-0e1f-4c3b-9a8d-7e6f5d4c3b2a',
  'pim_srisombat',
  '$2b$10$ptf02DPzITnDhj0JbbhItO3CVBooc8qYATEkH.ULodflGfNS6qMo.',
  'pimchanok.s@gmail.com',
  'พิมพ์ชนก', 'ศรีสมบัติ', 'พิมพ์ชนก ศรีสมบัติ',
  '0923456789', NULL,
  'customer'::users_role_enum, true, 'local',
  NOW() - INTERVAL '72 day', NOW() - INTERVAL '3 day'
),
-- u04 ณัฐพงศ์ จันทร์เจริญ
(
  'f1e2d3c4-b5a6-4978-8c7d-6e5f4a3b2c1d',
  'nattapong_j',
  '$2b$10$/oGCyV0fXDqvMihMCTZM0uJ0Be7EAwFLGPLzRkiQMe8H5eAd4r5ne',
  'nattapong.jan@hotmail.com',
  'ณัฐพงศ์', 'จันทร์เจริญ', 'ณัฐพงศ์ จันทร์เจริญ',
  '0634567890', NULL,
  'user'::users_role_enum, true, 'local',
  NOW() - INTERVAL '58 day', NOW() - INTERVAL '4 day'
),
-- u05 กรรณิการ์ ธนะวัฒน์
(
  '8a7b6c5d-4e3f-4a2b-91c0-d8e9f0a1b2c3',
  'kannika',
  '$2b$10$ptf02DPzITnDhj0JbbhItO3CVBooc8qYATEkH.ULodflGfNS6qMo.',
  'kannika.th@outlook.co.th',
  'กรรณิการ์', 'ธนะวัฒน์', 'กรรณิการ์ ธนะวัฒน์',
  '0895678901', NULL,
  'customer'::users_role_enum, true, 'local',
  NOW() - INTERVAL '45 day', NOW() - INTERVAL '1 day'
),
-- u06 ธนกฤต พิทักษ์ธรรม
(
  '3d4e5f6a-7b8c-4d9e-a0f1-2345678abcde',
  'thanakrit_p',
  '$2b$10$/oGCyV0fXDqvMihMCTZM0uJ0Be7EAwFLGPLzRkiQMe8H5eAd4r5ne',
  'thanakrit.pi@gmail.com',
  'ธนกฤต', 'พิทักษ์ธรรม', 'ธนกฤต พิทักษ์ธรรม',
  '0956789012', NULL,
  'customer'::users_role_enum, true, 'local',
  NOW() - INTERVAL '38 day', NOW() - INTERVAL '2 day'
),
-- u07 รุ่งเรือง มาลัยทอง
(
  'c9b8a7d6-e5f4-4321-b0a9-8c7d6e5f4a3b',
  'rungruang',
  '$2b$10$/oGCyV0fXDqvMihMCTZM0uJ0Be7EAwFLGPLzRkiQMe8H5eAd4r5ne',
  'rungruang.m@yahoo.com',
  'รุ่งเรือง', 'มาลัยทอง', 'รุ่งเรือง มาลัยทอง',
  '0867890123', NULL,
  'user'::users_role_enum, true, 'local',
  NOW() - INTERVAL '30 day', NOW() - INTERVAL '5 day'
),
-- u08 ศิริพร ใจดี
(
  '5f6a7b8c-9d0e-4f1a-b2c3-d4e5f6a7b8c9',
  'siriporn_j',
  '$2b$10$ptf02DPzITnDhj0JbbhItO3CVBooc8qYATEkH.ULodflGfNS6qMo.',
  'siriporn.jaidee@gmail.com',
  'ศิริพร', 'ใจดี', 'ศิริพร ใจดี',
  '0648901234', NULL,
  'customer'::users_role_enum, true, 'local',
  NOW() - INTERVAL '25 day', NOW() - INTERVAL '3 day'
),
-- u09 วิชัย นาคสุวรรณ
(
  'e4d3c2b1-a0f9-4e8d-97c6-b5a4d3c2b1a0',
  'wichai_n',
  '$2b$10$/oGCyV0fXDqvMihMCTZM0uJ0Be7EAwFLGPLzRkiQMe8H5eAd4r5ne',
  'wichai.nak@gmail.com',
  'วิชัย', 'นาคสุวรรณ', 'วิชัย นาคสุวรรณ',
  '0819012345', NULL,
  'user'::users_role_enum, true, 'local',
  NOW() - INTERVAL '18 day', NOW() - INTERVAL '2 day'
),
-- u10 ฟ้าใส ปัญญาวิชัย (Google account)
(
  '7b8c9d0e-1f2a-4b3c-8d4e-5f6a7b8c9d0e',
  'fahsai.panyawichai@gmail.com',
  '$2b$10$/oGCyV0fXDqvMihMCTZM0uJ0Be7EAwFLGPLzRkiQMe8H5eAd4r5ne',
  'fahsai.panyawichai@gmail.com',
  'ฟ้าใส', 'ปัญญาวิชัย', 'ฟ้าใส ปัญญาวิชัย',
  '0920123456', NULL,
  'user'::users_role_enum, true, 'google',
  NOW() - INTERVAL '12 day', NOW() - INTERVAL '6 hour'
),
-- u11 ปาริฉัตร เลิศสกุล (inactive / ถูกระงับ)
(
  '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  'parichat_l',
  '$2b$10$ptf02DPzITnDhj0JbbhItO3CVBooc8qYATEkH.ULodflGfNS6qMo.',
  'parichat.lerdskuln@gmail.com',
  'ปาริฉัตร', 'เลิศสกุล', 'ปาริฉัตร เลิศสกุล',
  '0631234567', NULL,
  'user'::users_role_enum, false, 'local',
  NOW() - INTERVAL '60 day', NOW() - INTERVAL '15 day'
);


-- ======================================================================
-- 2. TOURS  (10 ทัวร์ — ข้อมูลภาษาไทย)
-- ======================================================================
INSERT INTO tours (
  id, title, description, price, child_price, province, region, duration,
  max_group_size, rating, review_count, image_cover, images, highlights,
  preparation, itinerary, itinerary_data, included, excluded, conditions,
  category, is_active, is_recommended, created_at, updated_at
) VALUES
-- t01 เกาะพีพี-เกาะไม้ไผ่ ดำน้ำสปีดโบ๊ท
(
  'b4c8a2f1-3e7d-4a19-92c5-6d8e0f2a4b7c',
  'เกาะพีพี-เกาะไม้ไผ่ ดำน้ำสปีดโบ๊ท',
  'ทริปเรือสปีดโบ๊ทสุดมันส์ ไปดำน้ำชมปะการังที่เกาะพีพี ถ่ายรูปที่อ่าวมาหยา แวะเล่นน้ำเกาะไม้ไผ่ พร้อมอาหารกลางวันบุฟเฟ่ต์บนเกาะ เหมาะสำหรับครอบครัวและกลุ่มเพื่อน',
  3500.00, 2400.00,
  'ภูเก็ต', 'South'::tours_region_enum, '1 day'::tours_duration_enum,
  25, 0, 0,
  '/uploads/tours/phiphi-cover.jpg',
  ARRAY['/uploads/tours/phiphi-1.jpg','/uploads/tours/phiphi-2.jpg','/uploads/tours/phiphi-3.jpg']::text[],
  ARRAY['จุดดำน้ำปะการังน้ำตื้น','อ่าวมาหยา จุดถ่ายรูปสุดฮิต','อาหารกลางวันบุฟเฟ่ต์บนเกาะ','ชมฝูงปลาเขตร้อน']::text[],
  ARRAY['สำเนาบัตรประชาชน/พาสปอร์ต','ครีมกันแดดชนิดเป็นมิตรกับปะการัง','กระเป๋ากันน้ำ','ชุดว่ายน้ำใส่มาจากที่พักได้เลย']::text[],
  'ทริป 1 วัน เต็มอิ่มกับทะเลอันดามัน ดำน้ำ ถ่ายรูป กินอาหาร',
  '[{"day":1,"time":"07:30","detail":"รับจากโรงแรมในตัวเมืองภูเก็ต"},{"day":1,"time":"08:30","detail":"ออกเรือจากท่าเรือฉลอง"},{"day":1,"time":"10:00","detail":"ดำน้ำชมปะการังเกาะพีพีเล"},{"day":1,"time":"12:00","detail":"อาหารกลางวันบุฟเฟ่ต์บนเกาะพีพีดอน"},{"day":1,"time":"13:30","detail":"ถ่ายรูปอ่าวมาหยา-อ่าวปิเละ"},{"day":1,"time":"15:00","detail":"แวะเล่นน้ำเกาะไม้ไผ่"},{"day":1,"time":"17:00","detail":"เดินทางกลับถึงท่าเรือ ส่งกลับโรงแรม"}]'::jsonb,
  'รถรับ-ส่ง, เรือสปีดโบ๊ท, อุปกรณ์ดำน้ำ, อาหารกลางวัน, ประกันอุบัติเหตุ, ไกด์',
  'ค่าใช้จ่ายส่วนตัว, ค่าเช่าฟินว่ายน้ำ, เครื่องดื่มแอลกอฮอล์',
  'โปรแกรมอาจเปลี่ยนแปลงตามสภาพอากาศ ไม่แนะนำสำหรับหญิงตั้งครรภ์และผู้ที่มีปัญหาหัวใจ',
  'Sea'::tours_category_enum, true, true,
  NOW() - INTERVAL '150 day', NOW() - INTERVAL '2 day'
),
-- t02 เชียงใหม่ ดอยอินทนนท์ สัมผัสยอดดอย
(
  'e9d7c5b3-a1f0-4e82-b6d4-8c2a0e4f6d8b',
  'เชียงใหม่ ดอยอินทนนท์ สัมผัสยอดดอย',
  'เดินทางขึ้นยอดดอยอินทนนท์ จุดสูงสุดของประเทศไทย ชมพระมหาธาตุนภเมทนีดลและนภพลภูมิสิริ เดินศึกษาเส้นทางธรรมชาติอ่างกา สัมผัสอากาศเย็นสบายตลอดทริป พร้อมที่พักโฮมสเตย์กลางหุบเขา',
  5500.00, 3800.00,
  'เชียงใหม่', 'North'::tours_region_enum, '2 days 1 night'::tours_duration_enum,
  18, 0, 0,
  '/uploads/tours/doiinthanon-cover.jpg',
  ARRAY['/uploads/tours/doiinthanon-1.jpg','/uploads/tours/doiinthanon-2.jpg','/uploads/tours/doiinthanon-3.jpg']::text[],
  ARRAY['ยอดดอยอินทนนท์ จุดสูงสุดของไทย','พระมหาธาตุฯ สถาปัตยกรรมกลางหมอก','เส้นทางศึกษาธรรมชาติอ่างกา','โฮมสเตย์หมู่บ้านม้ง ทานอาหารพื้นเมือง']::text[],
  ARRAY['รองเท้าเดินป่า','เสื้อกันหนาว (อุณหภูมิ 8-15°C)','กระติกน้ำส่วนตัว','ยาประจำตัว']::text[],
  '2 วัน 1 คืน สัมผัสยอดดอยสูงสุดของไทย นอนโฮมสเตย์กลางขุนเขา',
  '[{"day":1,"time":"06:00","detail":"รับจากสนามบินหรือที่พักในตัวเมืองเชียงใหม่"},{"day":1,"time":"09:00","detail":"ถึงอุทยานฯ ดอยอินทนนท์ เดินชมเส้นทางธรรมชาติ"},{"day":1,"time":"12:00","detail":"อาหารกลางวันร้านท้องถิ่น"},{"day":1,"time":"14:00","detail":"ชมพระมหาธาตุนภเมทนีดลและนภพลภูมิสิริ"},{"day":1,"time":"17:00","detail":"เข้าที่พักโฮมสเตย์ ทานอาหารเย็นพื้นเมือง"},{"day":2,"time":"06:30","detail":"ชมพระอาทิตย์ขึ้นจากจุดชมวิว"},{"day":2,"time":"08:00","detail":"อาหารเช้า แล้วเดินเส้นทางอ่างกา"},{"day":2,"time":"12:00","detail":"อาหารกลางวัน แล้วเดินทางกลับเชียงใหม่"},{"day":2,"time":"15:00","detail":"ถึงตัวเมือง ส่งที่จุดหมาย"}]'::jsonb,
  'รถตู้ปรับอากาศ, ไกด์ท้องถิ่น, อาหาร 3 มื้อ, ที่พักโฮมสเตย์, ค่าเข้าอุทยาน, ประกันอุบัติเหตุ',
  'ตั๋วเครื่องบิน, ประกันการเดินทาง, ค่าใช้จ่ายส่วนตัว',
  'ต้องสามารถเดินได้ต่อเนื่องอย่างน้อย 2 ชม. ไม่แนะนำสำหรับผู้มีปัญหาข้อเข่า',
  'Mountain'::tours_category_enum, true, true,
  NOW() - INTERVAL '130 day', NOW() - INTERVAL '3 day'
),
-- t03 อยุธยา ย้อนรอยอารยธรรม
(
  '71a3b5c7-d9e1-4f03-a245-b6c8d0e2f4a6',
  'อยุธยา ย้อนรอยอารยธรรม',
  'เที่ยวชมเมืองมรดกโลก กราบไหว้วัดมหาธาตุ วัดราชบูรณะ วัดไชยวัฒนาราม นั่งเรือชมแม่น้ำเจ้าพระยา พร้อมไกด์ท้องถิ่นผู้เชี่ยวชาญประวัติศาสตร์ อยุธยาอยู่ไม่ไกลจากกรุงเทพฯ เดินทางสะดวก',
  2200.00, 1600.00,
  'อยุธยา', 'Central'::tours_region_enum, '1 day'::tours_duration_enum,
  30, 0, 0,
  '/uploads/tours/ayutthaya-cover.jpg',
  ARRAY['/uploads/tours/ayutthaya-1.jpg','/uploads/tours/ayutthaya-2.jpg']::text[],
  ARRAY['วัดมหาธาตุ เศียรพระในรากไม้','วัดไชยวัฒนาราม ริมแม่น้ำ','ล่องเรือรอบเกาะเมืองเก่า','อาหารกลางวันร้านอาหารริมน้ำ']::text[],
  ARRAY['หมวกและร่มกันแดด','รองเท้าสวมใส่สบาย','ชุดสุภาพเข้าวัด']::text[],
  'ทัวร์ 1 วัน เที่ยวครบโบราณสถานสำคัญพร้อมไกด์ประวัติศาสตร์',
  '[{"day":1,"time":"07:30","detail":"ออกเดินทางจากกรุงเทพฯ"},{"day":1,"time":"09:30","detail":"ถึงอยุธยา ชมวัดมหาธาตุ"},{"day":1,"time":"11:00","detail":"วัดราชบูรณะ"},{"day":1,"time":"12:30","detail":"อาหารกลางวันร้านริมน้ำ"},{"day":1,"time":"14:00","detail":"วัดไชยวัฒนาราม"},{"day":1,"time":"15:30","detail":"ล่องเรือรอบเกาะเมือง"},{"day":1,"time":"17:00","detail":"เดินทางกลับกรุงเทพฯ"}]'::jsonb,
  'รถตู้ปรับอากาศ, ไกด์, น้ำดื่ม, ค่าเข้าชม',
  'อาหารกลางวัน, กิจกรรมเสริม',
  'กรุณาแต่งกายสุภาพเข้าชมวัด สวมเสื้อมีแขนและกางเกงขายาว',
  'Cultural'::tours_category_enum, true, true,
  NOW() - INTERVAL '120 day', NOW() - INTERVAL '4 day'
),
-- t04 เขาใหญ่ ผจญภัยป่าดงดิบ
(
  '4f6e8d0c-2b4a-4796-8e1f-3d5c7a9b1e0f',
  'เขาใหญ่ ผจญภัยป่าดงดิบ',
  'สัมผัสธรรมชาติอุทยานแห่งชาติเขาใหญ่มรดกโลก เดินป่าชมน้ำตกเหวสุวัต จุดชมวิวผาเดียวดาย ส่องสัตว์ป่ายามเย็นกับเรนเจอร์ประจำอุทยาน อากาศเย็นสบายเหมาะหนีร้อน',
  2900.00, 2100.00,
  'นครราชสีมา', 'Northeast'::tours_region_enum, '1 day'::tours_duration_enum,
  20, 0, 0,
  '/uploads/tours/khaoyai-cover.jpg',
  ARRAY['/uploads/tours/khaoyai-1.jpg','/uploads/tours/khaoyai-2.jpg','/uploads/tours/khaoyai-3.jpg']::text[],
  ARRAY['น้ำตกเหวสุวัต จากฉากหนังดัง','ผาเดียวดาย จุดชมวิวพาโนรามา','ส่องสัตว์ป่ายามเย็นกับเจ้าหน้าที่','ผ่านเส้นทางป่าดิบที่อุดมสมบูรณ์']::text[],
  ARRAY['กางเกงขายาว','ยาทากันยุง','รองเท้าผ้าใบพื้นยาง','เสื้อแขนยาว']::text[],
  'เดินทาง 1 วัน สัมผัสธรรมชาติเขาใหญ่แบบเต็มอิ่ม',
  '[{"day":1,"time":"06:00","detail":"ออกเดินทางจากกรุงเทพฯ"},{"day":1,"time":"09:00","detail":"ถึงอุทยานฯ เขาใหญ่ เดินชมน้ำตกเหวสุวัต"},{"day":1,"time":"12:00","detail":"อาหารกลางวันร้านในอุทยาน"},{"day":1,"time":"13:30","detail":"จุดชมวิวผาเดียวดาย"},{"day":1,"time":"15:30","detail":"ส่องสัตว์ป่ายามเย็นกับเรนเจอร์"},{"day":1,"time":"17:30","detail":"เดินทางกลับกรุงเทพฯ"}]'::jsonb,
  'รถตู้ปรับอากาศ, ไกด์, ค่าเข้าอุทยาน, ประกันอุบัติเหตุ',
  'อาหาร, ของว่าง',
  'เส้นทางอาจเปลี่ยนแปลงตามสภาพอากาศ ไม่แนะนำสำหรับเด็กอายุต่ำกว่า 6 ปี',
  'Nature'::tours_category_enum, true, false,
  NOW() - INTERVAL '105 day', NOW() - INTERVAL '2 day'
),
-- t05 กรุงเทพ สตรีทฟู้ดทัวร์ เยาวราช
(
  '9c1e3a5b-7d0f-4284-a6b8-d2e4f6c8a0b3',
  'กรุงเทพ สตรีทฟู้ดทัวร์ เยาวราช',
  'ทัวร์ชิมอาหารริมทางย่านเยาวราชและเมืองเก่า ชิมก๋วยเตี๋ยวเจ้าเก่า ขนมหวานตำรับดั้งเดิม ข้าวหมูแดงร้านดัง พร้อมเรื่องเล่าประวัติชุมชนจากไกด์ท้องถิ่น เดินทัวร์ช่วงเย็นบรรยากาศสุดเจ๋ง',
  1800.00, 1200.00,
  'กรุงเทพมหานคร', 'Central'::tours_region_enum, '1 day'::tours_duration_enum,
  15, 0, 0,
  '/uploads/tours/yaowarat-cover.jpg',
  ARRAY['/uploads/tours/yaowarat-1.jpg','/uploads/tours/yaowarat-2.jpg']::text[],
  ARRAY['ชิมอาหาร 10+ ร้านดัง','ไกด์เล่าเรื่องประวัติชุมชน','บรรยากาศเยาวราชยามค่ำ','ก๋วยเตี๋ยว-ติ่มซำ-ขนมหวาน']::text[],
  ARRAY['เงินสดสำหรับซื้อเพิ่ม','รองเท้าสวมใส่สบาย','กระเป๋าเล็กคล่องตัว']::text[],
  'ทัวร์เดินชิมช่วงเย็น ยาวราชและเมืองเก่า',
  '[{"day":1,"time":"16:30","detail":"นัดพบที่สถานี MRT วัดมังกร"},{"day":1,"time":"17:00","detail":"เริ่มชิมก๋วยเตี๋ยวเจ้าดัง"},{"day":1,"time":"18:00","detail":"ขนมหวานตำรับดั้งเดิม"},{"day":1,"time":"19:00","detail":"ข้าวหมูแดง-หมูกรอบ"},{"day":1,"time":"20:00","detail":"ติ่มซำสดร้อน"},{"day":1,"time":"21:00","detail":"จบทัวร์ที่วงเวียนโอเดียน"}]'::jsonb,
  'ไกด์ท้องถิ่น, ชุดชิมอาหาร (10+ อย่าง), น้ำดื่ม',
  'เครื่องดื่มแอลกอฮอล์, รถส่งกลับที่พัก',
  'กรุณาแจ้งอาหารที่แพ้ก่อนวันเดินทางอย่างน้อย 3 วัน',
  'City'::tours_category_enum, true, false,
  NOW() - INTERVAL '90 day', NOW() - INTERVAL '1 day'
),
-- t06 กระบี่ พายเรือคายัค แคมป์เกาะ
(
  '2a4c6e8f-0b1d-4a3c-95e7-f9d1b3a5c7e0',
  'กระบี่ พายเรือคายัค แคมป์เกาะ',
  'ผจญภัย 3 วัน พายคายัคสำรวจถ้ำทะเล ตั้งแคมป์นอนหาด ดูพระอาทิตย์ขึ้นกลางทะเล อุปกรณ์และอาหารครบพร้อม เหมาะสำหรับสายแอดเวนเจอร์ที่อยากลองประสบการณ์ใหม่',
  6900.00, 4900.00,
  'กระบี่', 'South'::tours_region_enum, '3 days 2 nights'::tours_duration_enum,
  12, 0, 0,
  '/uploads/tours/krabi-kayak-cover.jpg',
  ARRAY['/uploads/tours/krabi-kayak-1.jpg','/uploads/tours/krabi-kayak-2.jpg','/uploads/tours/krabi-kayak-3.jpg']::text[],
  ARRAY['เรียนพายคายัคกับครูผู้เชี่ยวชาญ','สำรวจถ้ำทะเลลึกลับ','แคมป์นอนหาดใต้แสงดาว','ชมพระอาทิตย์ขึ้นกลางทะเล']::text[],
  ARRAY['เสื้อผ้าแห้งเร็ว','รองเท้าลุยน้ำ','ไฟฉายคาดหัว','ครีมกันแดด']::text[],
  '3 วัน 2 คืน ผจญภัยทะเลกระบี่แบบแคมป์เกาะ',
  '[{"day":1,"time":"08:00","detail":"ปฐมนิเทศความปลอดภัย + ฝึกพายคายัค"},{"day":1,"time":"10:00","detail":"ออกพายคายัคสำรวจหน้าผาหินปูน"},{"day":1,"time":"12:30","detail":"อาหารกลางวันบนหาด"},{"day":1,"time":"14:00","detail":"สำรวจถ้ำทะเล"},{"day":1,"time":"17:00","detail":"ตั้งแคมป์ ทานอาหารเย็นริมหาด"},{"day":2,"time":"06:00","detail":"ชมพระอาทิตย์ขึ้น"},{"day":2,"time":"08:00","detail":"อาหารเช้า แล้วพายต่อไปเกาะถัดไป"},{"day":2,"time":"17:00","detail":"แคมป์คืนที่ 2"},{"day":3,"time":"07:00","detail":"อาหารเช้า เก็บแคมป์"},{"day":3,"time":"09:00","detail":"พายกลับฝั่ง"},{"day":3,"time":"14:00","detail":"ถึงฝั่ง อาบน้ำ เดินทางกลับ"}]'::jsonb,
  'ครูฝึก, อุปกรณ์คายัค, อาหารทุกมื้อ, อุปกรณ์แคมป์, ประกันอุบัติเหตุ',
  'ตั๋วเครื่องบิน, ประกันการเดินทาง, ของใช้ส่วนตัว',
  'อายุ 12 ปีขึ้นไป ว่ายน้ำได้ กรุณาแจ้งโรคประจำตัว',
  'Adventure'::tours_category_enum, true, true,
  NOW() - INTERVAL '80 day', NOW() - INTERVAL '1 day'
),
-- t07 เชียงราย วัดร่องขุ่น-ภูชี้ฟ้า
(
  'd5f7a9c1-e3b5-4d07-88a2-c4e6f8d0b2a4',
  'เชียงราย วัดร่องขุ่น-ภูชี้ฟ้า',
  'เที่ยวชมวัดร่องขุ่น สถาปัตยกรรมสีขาวสุดอลังการ แวะพิพิธภัณฑ์บ้านดำ สิงห์ปาร์ค เดินทางขึ้นชมพระอาทิตย์ขึ้นที่ภูชี้ฟ้า จุดชมวิวชายแดนไทย-ลาว กรุ๊ปเล็กดูแลทั่วถึง',
  4800.00, 3200.00,
  'เชียงราย', 'North'::tours_region_enum, '2 days 1 night'::tours_duration_enum,
  15, 0, 0,
  '/uploads/tours/chiangrai-cover.jpg',
  ARRAY['/uploads/tours/chiangrai-1.jpg','/uploads/tours/chiangrai-2.jpg','/uploads/tours/chiangrai-3.jpg']::text[],
  ARRAY['วัดร่องขุ่น ศิลปะระดับโลก','ภูชี้ฟ้า พระอาทิตย์ขึ้นงดงาม','พิพิธภัณฑ์บ้านดำ อาจารย์ถวัลย์','สิงห์ปาร์ค ไร่ชา-ทุ่งทานตะวัน']::text[],
  ARRAY['เสื้อกันหนาว (ภูชี้ฟ้าอากาศเย็น)','รองเท้าผ้าใบ','กล้องถ่ายรูป']::text[],
  '2 วัน 1 คืน เชียงราย-ภูชี้ฟ้า ครบทุกไฮไลท์',
  '[{"day":1,"time":"08:00","detail":"รับจากสนามบินเชียงราย"},{"day":1,"time":"09:30","detail":"ชมวัดร่องขุ่น"},{"day":1,"time":"11:30","detail":"พิพิธภัณฑ์บ้านดำ"},{"day":1,"time":"12:30","detail":"อาหารกลางวัน"},{"day":1,"time":"14:00","detail":"สิงห์ปาร์ค"},{"day":1,"time":"17:00","detail":"เข้าที่พักภูชี้ฟ้า"},{"day":2,"time":"05:00","detail":"ชมพระอาทิตย์ขึ้นที่ภูชี้ฟ้า"},{"day":2,"time":"08:00","detail":"อาหารเช้า เดินทางกลับ"},{"day":2,"time":"13:00","detail":"ถึงตัวเมืองเชียงราย"}]'::jsonb,
  'รถตู้ปรับอากาศ, ไกด์, อาหาร 3 มื้อ, ที่พัก 1 คืน, ค่าเข้าชมทุกแห่ง',
  'ตั๋วเครื่องบิน, ค่าใช้จ่ายส่วนตัว, ทิป',
  'เดินทางเช้ามืดเพื่อชมพระอาทิตย์ขึ้น กรุณาเตรียมตัวให้พร้อม',
  'Cultural'::tours_category_enum, true, true,
  NOW() - INTERVAL '75 day', NOW() - INTERVAL '3 day'
),
-- t08 เกาะเต่า-เกาะนางยวน ดำน้ำ
(
  '6b8d0f2a-4c6e-4891-a1b3-d5f7e9c1a3b5',
  'เกาะเต่า-เกาะนางยวน ดำน้ำ',
  'ดำน้ำดูปะการังน้ำใสที่เกาะเต่า ชมจุดดำน้ำชื่อดัง เดินข้ามสันทรายเกาะนางยวน พร้อมครูสอนดำน้ำมืออาชีพ น้ำทะเลใสเห็นปลาสารพัดชนิด',
  3200.00, 2400.00,
  'สุราษฎร์ธานี', 'South'::tours_region_enum, '1 day'::tours_duration_enum,
  20, 0, 0,
  '/uploads/tours/kohtao-cover.jpg',
  ARRAY['/uploads/tours/kohtao-1.jpg','/uploads/tours/kohtao-2.jpg']::text[],
  ARRAY['ดำน้ำจุดดังเกาะเต่า','สันทรายเกาะนางยวน','ครูสอนดำน้ำมืออาชีพ','ปลาการ์ตูนและปะการังสี']::text[],
  ARRAY['ชุดว่ายน้ำ','ครีมกันแดดกันน้ำ','ผ้าเช็ดตัว','กล้องกันน้ำ']::text[],
  'ทริป 1 วัน ดำน้ำเกาะเต่า-เกาะนางยวน',
  '[{"day":1,"time":"07:00","detail":"ออกเรือจากท่าเรือเกาะสมุย"},{"day":1,"time":"09:00","detail":"ถึงเกาะนางยวน ถ่ายรูปสันทราย"},{"day":1,"time":"10:30","detail":"ดำน้ำจุดที่ 1 Japanese Garden"},{"day":1,"time":"12:00","detail":"อาหารกลางวันบนเกาะเต่า"},{"day":1,"time":"13:30","detail":"ดำน้ำจุดที่ 2 Mango Bay"},{"day":1,"time":"15:30","detail":"พักผ่อนบนหาด"},{"day":1,"time":"16:30","detail":"เดินทางกลับเกาะสมุย"}]'::jsonb,
  'เรือ, อุปกรณ์ดำน้ำ, ครูสอน, อาหารกลางวัน, ค่าเข้าอุทยาน, ประกัน',
  'ของใช้ส่วนตัว, เครื่องดื่ม',
  'ต้องว่ายน้ำได้ ไม่แนะนำช่วงมรสุม (ต.ค.-ธ.ค.)',
  'Sea'::tours_category_enum, true, true,
  NOW() - INTERVAL '65 day', NOW() - INTERVAL '2 day'
),
-- t09 กาญจนบุรี ล่องแพ-น้ำตกเอราวัณ
(
  'a0c2e4f6-8b1d-4a73-96c5-e7f9d1b3a5c8',
  'กาญจนบุรี ล่องแพ-น้ำตกเอราวัณ',
  'นอนแพริมน้ำแคว ล่องแพเปียกสุดมันส์ ชมน้ำตกเอราวัณ 7 ชั้น แวะสะพานข้ามแม่น้ำแคว เที่ยวเส้นทางรถไฟสายมรณะ บรรยากาศเงียบสงบธรรมชาติล้อมรอบ',
  4200.00, 2800.00,
  'กาญจนบุรี', 'West'::tours_region_enum, '2 days 1 night'::tours_duration_enum,
  22, 0, 0,
  '/uploads/tours/kanchanaburi-cover.jpg',
  ARRAY['/uploads/tours/kanchanaburi-1.jpg','/uploads/tours/kanchanaburi-2.jpg','/uploads/tours/kanchanaburi-3.jpg']::text[],
  ARRAY['นอนแพริมน้ำแคว','น้ำตกเอราวัณ 7 ชั้น น้ำสีเขียวมรกต','ล่องแพเปียกสุดมันส์','สะพานข้ามแม่น้ำแคว-รถไฟสายมรณะ']::text[],
  ARRAY['ชุดที่เปียกได้','รองเท้าแตะรัดส้น','ชุดเปลี่ยน','ถุงกันน้ำ']::text[],
  '2 วัน 1 คืน กาญจนบุรี ล่องแพ-น้ำตก-ประวัติศาสตร์',
  '[{"day":1,"time":"06:30","detail":"ออกเดินทางจากกรุงเทพฯ"},{"day":1,"time":"10:00","detail":"สะพานข้ามแม่น้ำแคว + เส้นทางรถไฟสายมรณะ"},{"day":1,"time":"12:00","detail":"อาหารกลางวัน"},{"day":1,"time":"13:30","detail":"ล่องแพเปียก"},{"day":1,"time":"16:00","detail":"เข้าที่พักแพริมน้ำ อิสระ"},{"day":1,"time":"18:30","detail":"ทานอาหารเย็น + คาราโอเกะ"},{"day":2,"time":"07:30","detail":"อาหารเช้า"},{"day":2,"time":"09:00","detail":"น้ำตกเอราวัณ เดินชมทั้ง 7 ชั้น"},{"day":2,"time":"13:00","detail":"อาหารกลางวัน แล้วเดินทางกลับ"},{"day":2,"time":"17:00","detail":"ถึงกรุงเทพฯ"}]'::jsonb,
  'รถตู้, ไกด์, อาหาร 4 มื้อ, ที่พักแพ 1 คืน, ค่าล่องแพ, ค่าเข้าอุทยาน, ประกัน',
  'เครื่องดื่มแอลกอฮอล์, ค่าคาราโอเกะ, ค่าใช้จ่ายส่วนตัว',
  'เด็กอายุต่ำกว่า 7 ปี ต้องมีผู้ปกครองดูแลตลอด',
  'Nature'::tours_category_enum, true, false,
  NOW() - INTERVAL '55 day', NOW() - INTERVAL '2 day'
),
-- t10 ภูกระดึง ท้าลมหนาว
(
  '3e5a7c9d-1f3b-4c05-b2d4-f6a8e0c2d4f7',
  'ภูกระดึง ท้าลมหนาว',
  'เดินขึ้นภูกระดึงกับทีมนำทาง 3 วัน 2 คืน ชมทุ่งหญ้าสะวันนาบนยอดดอย จุดชมวิวผาหล่มสัก ผานกแอ่น ทะเลหมอกยามเช้า สัมผัสอากาศหนาวกลางป่าเขา ประสบการณ์ที่คนรักธรรมชาติไม่ควรพลาด',
  5800.00, 4200.00,
  'เลย', 'Northeast'::tours_region_enum, '3 days 2 nights'::tours_duration_enum,
  16, 0, 0,
  '/uploads/tours/phukradung-cover.jpg',
  ARRAY['/uploads/tours/phukradung-1.jpg','/uploads/tours/phukradung-2.jpg','/uploads/tours/phukradung-3.jpg']::text[],
  ARRAY['ผาหล่มสัก จุดชมวิวอันดับ 1','ทุ่งหญ้าสะวันนาสุดลูกหูลูกตา','น้ำตกเพ็ญพบธารและถ้ำ','ทะเลหมอกยามเช้าสุดฟิน']::text[],
  ARRAY['รองเท้าเดินป่า (จำเป็นมาก)','เสื้อกันหนาว-ถุงนอน (คืนละ 5-10°C)','ไฟฉาย','ยาประจำตัว','อาหารว่างเสริม']::text[],
  '3 วัน 2 คืน เดินขึ้นภูกระดึง ชมธรรมชาติสุดอลังการ',
  '[{"day":1,"time":"05:00","detail":"ออกเดินทางจากจุดนัดพบ จ.เลย"},{"day":1,"time":"07:00","detail":"ถึงหน่วยพิทักษ์ เริ่มเดินขึ้นเขา"},{"day":1,"time":"12:00","detail":"ถึงซำแฮก พักทานอาหาร"},{"day":1,"time":"15:00","detail":"ถึงยอดภู ตั้งแคมป์"},{"day":1,"time":"17:30","detail":"ชมพระอาทิตย์ตกที่ผาหล่มสัก"},{"day":2,"time":"05:30","detail":"ชมพระอาทิตย์ขึ้นที่ผานกแอ่น"},{"day":2,"time":"08:00","detail":"อาหารเช้า แล้วเดินชมทุ่งหญ้า"},{"day":2,"time":"12:00","detail":"อาหารกลางวัน"},{"day":2,"time":"13:30","detail":"น้ำตกเพ็ญพบธาร + สระอโนดาต"},{"day":2,"time":"17:00","detail":"กลับแคมป์ อาหารเย็น ชมดาว"},{"day":3,"time":"06:00","detail":"อาหารเช้า เก็บแคมป์"},{"day":3,"time":"08:00","detail":"เดินลงเขา"},{"day":3,"time":"12:00","detail":"ถึงหน่วยพิทักษ์ เดินทางกลับ"}]'::jsonb,
  'ไกด์นำทาง, อุปกรณ์แคมป์, อาหาร 5 มื้อ, ค่าเข้าอุทยาน, ลูกหาบ, ประกัน',
  'ตั๋วเดินทาง, ถุงนอนส่วนตัว, ค่าใช้จ่ายส่วนตัว',
  'ร่างกายแข็งแรง เดินได้ต่อเนื่อง 5-6 ชม. อุทยานเปิดเฉพาะ ต.ค.-พ.ค.',
  'Mountain'::tours_category_enum, true, false,
  NOW() - INTERVAL '45 day', NOW() - INTERVAL '1 day'
);


-- ======================================================================
-- 3. TOUR_SCHEDULES  (20 รอบ — 2 ต่อทัวร์)
-- ======================================================================
INSERT INTO tour_schedules (
  id, tour_id, available_date, max_capacity_override, is_available, created_at
) VALUES
-- t01 เกาะพีพี
('ae2c4f6b-8d3e-4a17-91c5-2b4d6f8a0c3e', 'b4c8a2f1-3e7d-4a19-92c5-6d8e0f2a4b7c', (CURRENT_DATE - INTERVAL '25 day')::date, 25, true, NOW()-INTERVAL '60 day'),
('bf3d5a7c-9e4f-4b28-82d6-3c5e7f9b1d4a', 'b4c8a2f1-3e7d-4a19-92c5-6d8e0f2a4b7c', (CURRENT_DATE + INTERVAL '14 day')::date, 25, true, NOW()-INTERVAL '5 day'),
-- t02 ดอยอินทนนท์
('c04e6b8d-a5f1-4c39-93e7-4d6f8a0c2e5b', 'e9d7c5b3-a1f0-4e82-b6d4-8c2a0e4f6d8b', (CURRENT_DATE - INTERVAL '15 day')::date, 18, true, NOW()-INTERVAL '45 day'),
('d15f7c9e-b6a2-4d40-84f8-5e7a9b1d3f6c', 'e9d7c5b3-a1f0-4e82-b6d4-8c2a0e4f6d8b', (CURRENT_DATE + INTERVAL '35 day')::date, 18, true, NOW()-INTERVAL '4 day'),
-- t03 อยุธยา
('e26a8d0f-c7b3-4e5b-95a9-6f8b0c2e4a7d', '71a3b5c7-d9e1-4f03-a245-b6c8d0e2f4a6', (CURRENT_DATE - INTERVAL '18 day')::date, 30, true, NOW()-INTERVAL '50 day'),
('f37b9e1a-d8c4-4f6c-86ba-7a9c1d3f5b8e', '71a3b5c7-d9e1-4f03-a245-b6c8d0e2f4a6', (CURRENT_DATE + INTERVAL '8 day')::date,  30, true, NOW()-INTERVAL '3 day'),
-- t04 เขาใหญ่
('a48c0f2b-e9d5-4a7d-97cb-8b0d2e4a6c9f', '4f6e8d0c-2b4a-4796-8e1f-3d5c7a9b1e0f', (CURRENT_DATE + INTERVAL '12 day')::date, 20, true, NOW()-INTERVAL '6 day'),
('b59d1a3c-f0e6-4b8e-a8dc-9c1e3f5b7d0a', '4f6e8d0c-2b4a-4796-8e1f-3d5c7a9b1e0f', (CURRENT_DATE + INTERVAL '28 day')::date, 20, true, NOW()-INTERVAL '3 day'),
-- t05 เยาวราช
('c6ae2b4d-a1f7-4c9f-b9ed-0d2f4a6c8e1b', '9c1e3a5b-7d0f-4284-a6b8-d2e4f6c8a0b3', (CURRENT_DATE - INTERVAL '7 day')::date,  15, true, NOW()-INTERVAL '20 day'),
('d7bf3c5e-b2a8-4d0a-8afe-1e3a5b7d9f2c', '9c1e3a5b-7d0f-4284-a6b8-d2e4f6c8a0b3', (CURRENT_DATE + INTERVAL '5 day')::date,  15, true, NOW()-INTERVAL '2 day'),
-- t06 กระบี่ คายัค
('e8ca4d6f-c3b9-4e1b-9baf-2f4b6c8e0a3d', '2a4c6e8f-0b1d-4a3c-95e7-f9d1b3a5c7e0', (CURRENT_DATE + INTERVAL '20 day')::date, 12, true, NOW()-INTERVAL '4 day'),
('f9db5e7a-d4c0-4f2c-acba-3a5c7d9f1b4e', '2a4c6e8f-0b1d-4a3c-95e7-f9d1b3a5c7e0', (CURRENT_DATE + INTERVAL '50 day')::date, 12, true, NOW()-INTERVAL '2 day'),
-- t07 เชียงราย
('0aec6f8b-e5d1-4a3d-bdcb-4b6d8e0a2c5f', 'd5f7a9c1-e3b5-4d07-88a2-c4e6f8d0b2a4', (CURRENT_DATE - INTERVAL '22 day')::date, 15, true, NOW()-INTERVAL '55 day'),
('1bfd7a9c-f6e2-4b4e-aedc-5c7e9f1b3d6a', 'd5f7a9c1-e3b5-4d07-88a2-c4e6f8d0b2a4', (CURRENT_DATE + INTERVAL '15 day')::date, 15, true, NOW()-INTERVAL '5 day'),
-- t08 เกาะเต่า
('2cae8b0d-a7f3-4c5f-bfed-6d8f0a2c4e7b', '6b8d0f2a-4c6e-4891-a1b3-d5f7e9c1a3b5', (CURRENT_DATE - INTERVAL '10 day')::date, 20, true, NOW()-INTERVAL '30 day'),
('3dbf9c1e-b8a4-4d6a-a0fe-7e9a1b3d5f8c', '6b8d0f2a-4c6e-4891-a1b3-d5f7e9c1a3b5', (CURRENT_DATE + INTERVAL '18 day')::date, 20, true, NOW()-INTERVAL '3 day'),
-- t09 กาญจนบุรี
('4ec0ad2f-c9b5-4e7b-91af-8f0b2c4e6a9d', 'a0c2e4f6-8b1d-4a73-96c5-e7f9d1b3a5c8', (CURRENT_DATE - INTERVAL '30 day')::date, 22, true, NOW()-INTERVAL '65 day'),
('5fd1be3a-d0c6-4f8c-a2ba-9a1c3d5f7b0e', 'a0c2e4f6-8b1d-4a73-96c5-e7f9d1b3a5c8', (CURRENT_DATE + INTERVAL '22 day')::date, 22, true, NOW()-INTERVAL '4 day'),
-- t10 ภูกระดึง
('6ae2cf4b-e1d7-4a9d-b3cb-0b2d4e6a8c1f', '3e5a7c9d-1f3b-4c05-b2d4-f6a8e0c2d4f7', (CURRENT_DATE + INTERVAL '30 day')::date, 16, true, NOW()-INTERVAL '5 day'),
('7bf3da5c-f2e8-4b0e-84dc-1c3e5f7b9d2a', '3e5a7c9d-1f3b-4c05-b2d4-f6a8e0c2d4f7', (CURRENT_DATE + INTERVAL '60 day')::date, 16, true, NOW()-INTERVAL '2 day');


-- ======================================================================
-- 4. BOOKINGS  (13 รายการ — ครบทุกสถานะ)
-- ======================================================================
INSERT INTO bookings (
  id, booking_reference, start_date, end_date, base_price, discount, total_price,
  status, contact_info, special_requests, cancellation_reason, refund_amount,
  created_at, updated_at, tour_id, user_id, payment_deadline,
  tour_schedule_id, travel_date, pax, selected_options, payment_slip_url
) VALUES
-- b01 confirmed (past) — สมชาย จองเกาะพีพี 2 คน
(
  '847a2c5f-1b9e-4d3f-a8c6-2e4f6b8d0a3c',
  'BK-M5AB9DXP',
  NULL, NULL,
  7000.00, 0.00, 7000.00,
  'confirmed'::bookings_status_enum,
  '{"name":"สมชาย วงศ์สุวรรณ","email":"somchai.w@gmail.com","phone":"0812345678"}'::jsonb,
  'ขอมื้อเที่ยงมังสวิรัติ 1 ที่ครับ',
  NULL, NULL,
  NOW()-INTERVAL '28 day', NOW()-INTERVAL '25 day',
  'b4c8a2f1-3e7d-4a19-92c5-6d8e0f2a4b7c',
  'd7e8f9a0-1b2c-4d3e-a5f6-7890abcdef12',
  NOW()-INTERVAL '27 day',
  'ae2c4f6b-8d3e-4a17-91c5-2b4d6f8a0c3e',
  (CURRENT_DATE - INTERVAL '25 day')::date,
  2,
  '{"adults":2,"children":0}'::jsonb,
  '/uploads/slips/slip-M5AB9DXP.jpg'
),
-- b02 confirmed (past) — พิมพ์ชนก จองดอยอินทนนท์ 3 คน (2ผู้ใหญ่+1เด็ก)
(
  '958b3d6a-2c0f-4e4a-b9d7-3f5a7c9e1b4d',
  'BK-M5A8KRTF',
  (CURRENT_DATE - INTERVAL '15 day')::date,
  (CURRENT_DATE - INTERVAL '14 day')::date,
  14800.00, 0.00, 14800.00,
  'confirmed'::bookings_status_enum,
  '{"name":"พิมพ์ชนก ศรีสมบัติ","email":"pimchanok.s@gmail.com","phone":"0923456789"}'::jsonb,
  'ขอรับที่สนามบินเชียงใหม่ค่ะ เที่ยวบิน TG102 ถึง 08:45',
  NULL, NULL,
  NOW()-INTERVAL '20 day', NOW()-INTERVAL '15 day',
  'e9d7c5b3-a1f0-4e82-b6d4-8c2a0e4f6d8b',
  '2c4b6a8d-0e1f-4c3b-9a8d-7e6f5d4c3b2a',
  NOW()-INTERVAL '19 day',
  'c04e6b8d-a5f1-4c39-93e7-4d6f8a0c2e5b',
  NULL,
  3,
  '{"adults":2,"children":1}'::jsonb,
  '/uploads/slips/slip-M5A8KRTF.jpg'
),
-- b03 confirmed (past) — ณัฐพงศ์ จองอยุธยา 2 คน
(
  'a69c4e7b-3d1a-4f5b-80e8-4a6b8d0f2c5e',
  'BK-M5A3W2QN',
  NULL, NULL,
  4400.00, 0.00, 4400.00,
  'confirmed'::bookings_status_enum,
  '{"name":"ณัฐพงศ์ จันทร์เจริญ","email":"nattapong.jan@hotmail.com","phone":"0634567890"}'::jsonb,
  NULL,
  NULL, NULL,
  NOW()-INTERVAL '22 day', NOW()-INTERVAL '18 day',
  '71a3b5c7-d9e1-4f03-a245-b6c8d0e2f4a6',
  'f1e2d3c4-b5a6-4978-8c7d-6e5f4a3b2c1d',
  NOW()-INTERVAL '21 day',
  'e26a8d0f-c7b3-4e5b-95a9-6f8b0c2e4a7d',
  (CURRENT_DATE - INTERVAL '18 day')::date,
  2,
  '{"adults":2,"children":0}'::jsonb,
  '/uploads/slips/slip-M5A3W2QN.jpg'
),
-- b04 confirmed (past) — กรรณิการ์ จองเยาวราช 1 คน
(
  'b70d5f8c-4e2b-4a6c-91f9-5b7c9e1a3d6f',
  'BK-M5A2HBYL',
  NULL, NULL,
  1800.00, 0.00, 1800.00,
  'confirmed'::bookings_status_enum,
  '{"name":"กรรณิการ์ ธนะวัฒน์","email":"kannika.th@outlook.co.th","phone":"0895678901"}'::jsonb,
  'แพ้อาหารทะเลค่ะ กรุณาแจ้งร้านด้วยนะคะ',
  NULL, NULL,
  NOW()-INTERVAL '10 day', NOW()-INTERVAL '7 day',
  '9c1e3a5b-7d0f-4284-a6b8-d2e4f6c8a0b3',
  '8a7b6c5d-4e3f-4a2b-91c0-d8e9f0a1b2c3',
  NOW()-INTERVAL '9 day',
  'c6ae2b4d-a1f7-4c9f-b9ed-0d2f4a6c8e1b',
  (CURRENT_DATE - INTERVAL '7 day')::date,
  1,
  '{"adults":1,"children":0}'::jsonb,
  '/uploads/slips/slip-M5A2HBYL.jpg'
),
-- b05 confirmed (past) — รุ่งเรือง จองเกาะเต่า 2 คน
(
  'c81e6a9d-5f3c-4b7d-a2a0-6c8d0f2b4e7a',
  'BK-M598VF3J',
  NULL, NULL,
  6400.00, 0.00, 6400.00,
  'confirmed'::bookings_status_enum,
  '{"name":"รุ่งเรือง มาลัยทอง","email":"rungruang.m@yahoo.com","phone":"0867890123"}'::jsonb,
  'ขอชูชีพไซส์ XL ด้วยครับ',
  NULL, NULL,
  NOW()-INTERVAL '14 day', NOW()-INTERVAL '10 day',
  '6b8d0f2a-4c6e-4891-a1b3-d5f7e9c1a3b5',
  'c9b8a7d6-e5f4-4321-b0a9-8c7d6e5f4a3b',
  NOW()-INTERVAL '13 day',
  '2cae8b0d-a7f3-4c5f-bfed-6d8f0a2c4e7b',
  (CURRENT_DATE - INTERVAL '10 day')::date,
  2,
  '{"adults":2,"children":0}'::jsonb,
  '/uploads/slips/slip-M598VF3J.jpg'
),
-- b06 confirmed (past) — ศิริพร จองกาญจนบุรี 2 คน
(
  'd92f7b0e-6a4d-4c8e-b3b1-7d9e1a3c5f8b',
  'BK-M595XT8A',
  (CURRENT_DATE - INTERVAL '30 day')::date,
  (CURRENT_DATE - INTERVAL '29 day')::date,
  8400.00, 0.00, 8400.00,
  'confirmed'::bookings_status_enum,
  '{"name":"ศิริพร ใจดี","email":"siriporn.jaidee@gmail.com","phone":"0648901234"}'::jsonb,
  'ขอห้องพักแพที่ติดน้ำเลยค่ะ',
  NULL, NULL,
  NOW()-INTERVAL '35 day', NOW()-INTERVAL '30 day',
  'a0c2e4f6-8b1d-4a73-96c5-e7f9d1b3a5c8',
  '5f6a7b8c-9d0e-4f1a-b2c3-d4e5f6a7b8c9',
  NOW()-INTERVAL '34 day',
  '4ec0ad2f-c9b5-4e7b-91af-8f0b2c4e6a9d',
  NULL,
  2,
  '{"adults":2,"children":0}'::jsonb,
  '/uploads/slips/slip-M595XT8A.jpg'
),
-- b07 confirmed (future) — สมชาย จองเขาใหญ่ 1 คน
(
  'ea3a8c1f-7b5e-4d9f-84c2-8e0f2b4d6a9c',
  'BK-M58CKNE4',
  NULL, NULL,
  2900.00, 0.00, 2900.00,
  'confirmed'::bookings_status_enum,
  '{"name":"สมชาย วงศ์สุวรรณ","email":"somchai.w@gmail.com","phone":"0812345678"}'::jsonb,
  NULL,
  NULL, NULL,
  NOW()-INTERVAL '5 day', NOW()-INTERVAL '4 day',
  '4f6e8d0c-2b4a-4796-8e1f-3d5c7a9b1e0f',
  'd7e8f9a0-1b2c-4d3e-a5f6-7890abcdef12',
  NOW()-INTERVAL '4 day',
  'a48c0f2b-e9d5-4a7d-97cb-8b0d2e4a6c9f',
  (CURRENT_DATE + INTERVAL '12 day')::date,
  1,
  '{"adults":1,"children":0}'::jsonb,
  '/uploads/slips/slip-M58CKNE4.jpg'
),
-- b08 pending_pay — ธนกฤต จองเขาใหญ่ 2 คน (ยังไม่จ่าย)
(
  'fb4b9d2a-8c6f-4e0a-95d3-9f1a3c5e7b0d',
  'BK-M56RJWP7',
  NULL, NULL,
  5800.00, 0.00, 5800.00,
  'pending_pay'::bookings_status_enum,
  '{"name":"ธนกฤต พิทักษ์ธรรม","email":"thanakrit.pi@gmail.com","phone":"0956789012"}'::jsonb,
  'จะพาแม่ไปด้วย ขอนั่งหน้ารถตู้ได้ไหมครับ',
  NULL, NULL,
  NOW()-INTERVAL '3 hour', NOW()-INTERVAL '3 hour',
  '4f6e8d0c-2b4a-4796-8e1f-3d5c7a9b1e0f',
  '3d4e5f6a-7b8c-4d9e-a0f1-2345678abcde',
  NOW()+INTERVAL '12 hour',
  'b59d1a3c-f0e6-4b8e-a8dc-9c1e3f5b7d0a',
  (CURRENT_DATE + INTERVAL '28 day')::date,
  2,
  '{"adults":2,"children":0}'::jsonb,
  NULL
),
-- b09 pending_pay — วิชัย จองภูกระดึง 2 คน (เคยโดน reject สลิป)
(
  '0c5c0e3b-9d7a-4f1b-a6e4-0a2b4d6f8c1e',
  'BK-M54DPLA2',
  (CURRENT_DATE + INTERVAL '30 day')::date,
  (CURRENT_DATE + INTERVAL '32 day')::date,
  11600.00, 0.00, 11600.00,
  'pending_pay'::bookings_status_enum,
  '{"name":"วิชัย นาคสุวรรณ","email":"wichai.nak@gmail.com","phone":"0819012345"}'::jsonb,
  'ขอเช่าถุงนอนเพิ่ม 2 ใบได้ไหมครับ',
  NULL, NULL,
  NOW()-INTERVAL '2 day', NOW()-INTERVAL '1 day',
  '3e5a7c9d-1f3b-4c05-b2d4-f6a8e0c2d4f7',
  'e4d3c2b1-a0f9-4e8d-97c6-b5a4d3c2b1a0',
  NOW()+INTERVAL '6 hour',
  '6ae2cf4b-e1d7-4a9d-b3cb-0b2d4e6a8c1f',
  NULL,
  2,
  '{"adults":2,"children":0}'::jsonb,
  '/uploads/slips/slip-M54DPLA2-rejected.jpg'
),
-- b10 pending_verify — กรรณิการ์ จองเชียงราย 2 คน
(
  '1d6d1f4c-0e8b-4a2c-87f5-1b3c5e7a9d2f',
  'BK-M52NB9QK',
  (CURRENT_DATE + INTERVAL '15 day')::date,
  (CURRENT_DATE + INTERVAL '16 day')::date,
  9600.00, 0.00, 9600.00,
  'pending_verify'::bookings_status_enum,
  '{"name":"กรรณิการ์ ธนะวัฒน์","email":"kannika.th@outlook.co.th","phone":"0895678901"}'::jsonb,
  'ห้องพักขอเตียงเดี่ยว 2 เตียงค่ะ',
  NULL, NULL,
  NOW()-INTERVAL '1 day', NOW()-INTERVAL '8 hour',
  'd5f7a9c1-e3b5-4d07-88a2-c4e6f8d0b2a4',
  '8a7b6c5d-4e3f-4a2b-91c0-d8e9f0a1b2c3',
  NOW()+INTERVAL '6 hour',
  '1bfd7a9c-f6e2-4b4e-aedc-5c7e9f1b3d6a',
  NULL,
  2,
  '{"adults":2,"children":0}'::jsonb,
  '/uploads/slips/slip-M52NB9QK.jpg'
),
-- b11 pending_verify — ฟ้าใส จองกระบี่คายัค 1 คน
(
  '2e7e2a5d-1f9c-4b3d-98a6-2c4d6f8b0e3a',
  'BK-M50AFCZM',
  (CURRENT_DATE + INTERVAL '20 day')::date,
  (CURRENT_DATE + INTERVAL '22 day')::date,
  6900.00, 0.00, 6900.00,
  'pending_verify'::bookings_status_enum,
  '{"name":"ฟ้าใส ปัญญาวิชัย","email":"fahsai.panyawichai@gmail.com","phone":"0920123456"}'::jsonb,
  'เป็นมือใหม่เรื่องคายัค ขอครูสอนเพิ่มเติมได้ไหมคะ',
  NULL, NULL,
  NOW()-INTERVAL '6 hour', NOW()-INTERVAL '4 hour',
  '2a4c6e8f-0b1d-4a3c-95e7-f9d1b3a5c7e0',
  '7b8c9d0e-1f2a-4b3c-8d4e-5f6a7b8c9d0e',
  NOW()+INTERVAL '10 hour',
  'e8ca4d6f-c3b9-4e1b-9baf-2f4b6c8e0a3d',
  NULL,
  1,
  '{"adults":1,"children":0}'::jsonb,
  '/uploads/slips/slip-M50AFCZM.jpg'
),
-- b12 cancelled — สมชาย จองกระบี่คายัค 2 คน (ยกเลิกเอง)
(
  '3f8f3b6e-2a0d-4c4e-a9b7-3d5e7a9c1f4b',
  'BK-M4YELG8V',
  (CURRENT_DATE + INTERVAL '50 day')::date,
  (CURRENT_DATE + INTERVAL '52 day')::date,
  13800.00, 0.00, 13800.00,
  'cancelled'::bookings_status_enum,
  '{"name":"สมชาย วงศ์สุวรรณ","email":"somchai.w@gmail.com","phone":"0812345678"}'::jsonb,
  NULL,
  'ติดธุระด่วนครับ ขอยกเลิกการจอง',
  13800.00,
  NOW()-INTERVAL '8 day', NOW()-INTERVAL '6 day',
  '2a4c6e8f-0b1d-4a3c-95e7-f9d1b3a5c7e0',
  'd7e8f9a0-1b2c-4d3e-a5f6-7890abcdef12',
  NOW()-INTERVAL '7 day',
  'f9db5e7a-d4c0-4f2c-acba-3a5c7d9f1b4e',
  NULL,
  2,
  '{"adults":2,"children":0}'::jsonb,
  NULL
),
-- b13 expired — ธนกฤต จองเกาะพีพี 1 คน (หมดเวลาจ่าย)
(
  '4a9a4c7f-3b1e-4d5f-b0c8-4e6f8b0d2a5c',
  'BK-M4WH7RDU',
  NULL, NULL,
  3500.00, 0.00, 3500.00,
  'expired'::bookings_status_enum,
  '{"name":"ธนกฤต พิทักษ์ธรรม","email":"thanakrit.pi@gmail.com","phone":"0956789012"}'::jsonb,
  NULL,
  NULL, NULL,
  NOW()-INTERVAL '5 day', NOW()-INTERVAL '3 day',
  'b4c8a2f1-3e7d-4a19-92c5-6d8e0f2a4b7c',
  '3d4e5f6a-7b8c-4d9e-a0f1-2345678abcde',
  NOW()-INTERVAL '4 day',
  'bf3d5a7c-9e4f-4b28-82d6-3c5e7f9b1d4a',
  (CURRENT_DATE + INTERVAL '14 day')::date,
  1,
  '{"adults":1,"children":0}'::jsonb,
  NULL
);


-- ======================================================================
-- 5. PAYMENTS  (10 รายการ — approved / pending_verify / rejected)
-- ======================================================================
INSERT INTO payments (
  id, amount, slip_url, status, "verifiedAt", "uploadedAt", "bookingId"
) VALUES
-- p01 approved → b01
('5b0b5d8a-4c2f-4e6a-b1d9-5f7a9c1e3b6d', 7000.00,  '/uploads/slips/slip-M5AB9DXP.jpg',          'approved',       NOW()-INTERVAL '25 day', NOW()-INTERVAL '27 day', '847a2c5f-1b9e-4d3f-a8c6-2e4f6b8d0a3c'),
-- p02 approved → b02
('6c1c6e9b-5d3a-4f7b-82e0-6a8b0d2f4c7e', 14800.00, '/uploads/slips/slip-M5A8KRTF.jpg',          'approved',       NOW()-INTERVAL '15 day', NOW()-INTERVAL '18 day', '958b3d6a-2c0f-4e4a-b9d7-3f5a7c9e1b4d'),
-- p03 approved → b03
('7d2d7f0c-6e4b-4a8c-93f1-7b9c1e3a5d8f', 4400.00,  '/uploads/slips/slip-M5A3W2QN.jpg',          'approved',       NOW()-INTERVAL '18 day', NOW()-INTERVAL '21 day', 'a69c4e7b-3d1a-4f5b-80e8-4a6b8d0f2c5e'),
-- p04 approved → b04
('8e3e8a1d-7f5c-4b9d-a4a2-8c0d2f4b6e9a', 1800.00,  '/uploads/slips/slip-M5A2HBYL.jpg',          'approved',       NOW()-INTERVAL '7 day',  NOW()-INTERVAL '9 day',  'b70d5f8c-4e2b-4a6c-91f9-5b7c9e1a3d6f'),
-- p05 approved → b05
('9f4f9b2e-8a6d-4c0e-b5b3-9d1e3a5c7f0b', 6400.00,  '/uploads/slips/slip-M598VF3J.jpg',          'approved',       NOW()-INTERVAL '10 day', NOW()-INTERVAL '12 day', 'c81e6a9d-5f3c-4b7d-a2a0-6c8d0f2b4e7a'),
-- p06 approved → b06
('0a5a0c3f-9b7e-4d1f-86c4-0e2f4b6d8a1c', 8400.00,  '/uploads/slips/slip-M595XT8A.jpg',          'approved',       NOW()-INTERVAL '30 day', NOW()-INTERVAL '33 day', 'd92f7b0e-6a4d-4c8e-b3b1-7d9e1a3c5f8b'),
-- p07 approved → b07
('1b6b1d4a-0c8f-4e2a-97d5-1f3a5c7e9b2d', 2900.00,  '/uploads/slips/slip-M58CKNE4.jpg',          'approved',       NOW()-INTERVAL '3 day',  NOW()-INTERVAL '4 day',  'ea3a8c1f-7b5e-4d9f-84c2-8e0f2b4d6a9c'),
-- p08 pending_verify → b10
('2c7c2e5b-1d9a-4f3b-a8e6-2a4b6d8f0c3e', 9600.00,  '/uploads/slips/slip-M52NB9QK.jpg',          'pending_verify', NULL,                    NOW()-INTERVAL '8 hour', '1d6d1f4c-0e8b-4a2c-87f5-1b3c5e7a9d2f'),
-- p09 pending_verify → b11
('3d8d3f6c-2e0b-4a4c-b9f7-3b5c7e9a1d4f', 6900.00,  '/uploads/slips/slip-M50AFCZM.jpg',          'pending_verify', NULL,                    NOW()-INTERVAL '4 hour', '2e7e2a5d-1f9c-4b3d-98a6-2c4d6f8b0e3a'),
-- p10 rejected → b09 (สลิปโอนไม่ตรงยอด)
('4e9e4a7d-3f1c-4b5d-8a08-4c6d8f0b2e5a', 11600.00, '/uploads/slips/slip-M54DPLA2-rejected.jpg', 'rejected',       NOW()-INTERVAL '1 day',  NOW()-INTERVAL '2 day',  '0c5c0e3b-9d7a-4f1b-a6e4-0a2b4d6f8c1e');


-- ======================================================================
-- 6. REVIEWS  (6 รีวิว — เฉพาะ confirmed booking ที่เดินทางแล้ว)
-- ======================================================================
INSERT INTO reviews (
  id, user_id, tour_id, booking_id, rating, comment,
  is_recommended, created_at, updated_at
) VALUES
-- r01 สมชาย → เกาะพีพี (5 ดาว)
(
  '5faf5b8e-4a2d-4c6e-91b9-5d7e9a1c3f6b',
  'd7e8f9a0-1b2c-4d3e-a5f6-7890abcdef12',
  'b4c8a2f1-3e7d-4a19-92c5-6d8e0f2a4b7c',
  '847a2c5f-1b9e-4d3f-a8c6-2e4f6b8d0a3c',
  5,
  'ทริปดีมากครับ ทีมเรือดูแลดี อาหารอร่อย น้ำทะเลใสมาก อ่าวมาหยาสวยสุดๆ ถ่ายรูปได้ทุกมุม ประทับใจมากครับ จะพาครอบครัวมาอีกแน่นอน',
  true,
  NOW()-INTERVAL '24 day', NOW()-INTERVAL '24 day'
),
-- r02 พิมพ์ชนก → ดอยอินทนนท์ (4 ดาว)
(
  '6aba6c9f-5b3e-4d7f-a2c0-6e8f0b2d4a7c',
  '2c4b6a8d-0e1f-4c3b-9a8d-7e6f5d4c3b2a',
  'e9d7c5b3-a1f0-4e82-b6d4-8c2a0e4f6d8b',
  '958b3d6a-2c0f-4e4a-b9d7-3f5a7c9e1b4d',
  4,
  'ไกด์เก่งมากค่ะ อธิบายละเอียด อากาศเย็นสบายมาก แต่เส้นทางเดินค่อนข้างลำบากหน่อยสำหรับคนไม่ค่อยออกกำลังกาย รวมแล้วคุ้มค่ามากเลยค่ะ',
  false,
  NOW()-INTERVAL '13 day', NOW()-INTERVAL '13 day'
),
-- r03 ณัฐพงศ์ → อยุธยา (5 ดาว)
(
  '7bcb7d0a-6c4f-4e8a-b3d1-7f9a1c3e5b8d',
  'f1e2d3c4-b5a6-4978-8c7d-6e5f4a3b2c1d',
  '71a3b5c7-d9e1-4f03-a245-b6c8d0e2f4a6',
  'a69c4e7b-3d1a-4f5b-80e8-4a6b8d0f2c5e',
  5,
  'บรรยากาศวัดสวยมากครับ ไกด์ให้ความรู้ประวัติศาสตร์ดีมาก ถ่ายรูปสวยทุกมุม เหมาะมาวันเดียวเที่ยวครบ แนะนำเลยครับ',
  true,
  NOW()-INTERVAL '16 day', NOW()-INTERVAL '16 day'
),
-- r04 กรรณิการ์ → เยาวราช (3 ดาว)
(
  '8cdc8e1b-7d5a-4f9b-84e2-8a0b2d4f6c9e',
  '8a7b6c5d-4e3f-4a2b-91c0-d8e9f0a1b2c3',
  '9c1e3a5b-7d0f-4284-a6b8-d2e4f6c8a0b3',
  'b70d5f8c-4e2b-4a6c-91f9-5b7c9e1a3d6f',
  3,
  'อาหารอร่อยดีค่ะ แต่เดินเยอะมากจนเหนื่อย เวลาค่อนข้างจำกัดเกินไปหน่อย อยากให้เพิ่มเวลาแต่ละร้านสักนิด แต่ไกด์เล่าเรื่องสนุกค่ะ',
  false,
  NOW()-INTERVAL '5 day', NOW()-INTERVAL '5 day'
),
-- r05 รุ่งเรือง → เกาะเต่า (5 ดาว)
(
  '9ded9f2c-8e6b-4a0c-95f3-9b1c3e5a7d0f',
  'c9b8a7d6-e5f4-4321-b0a9-8c7d6e5f4a3b',
  '6b8d0f2a-4c6e-4891-a1b3-d5f7e9c1a3b5',
  'c81e6a9d-5f3c-4b7d-a2a0-6c8d0f2b4e7a',
  5,
  'น้ำใสมากครับ เห็นปลาเยอะมาก ครูสอนดำน้ำดูแลดีมาก เกาะนางยวนสวยไม่ผิดหวัง สันทรายงดงามสุดๆ ต้องมาอีกครับ!',
  true,
  NOW()-INTERVAL '8 day', NOW()-INTERVAL '8 day'
),
-- r06 ศิริพร → กาญจนบุรี (4 ดาว)
(
  '0efeaa3d-9f7c-4b1d-a6a4-0c2d4f6b8e1a',
  '5f6a7b8c-9d0e-4f1a-b2c3-d4e5f6a7b8c9',
  'a0c2e4f6-8b1d-4a73-96c5-e7f9d1b3a5c8',
  'd92f7b0e-6a4d-4c8e-b3b1-7d9e1a3c5f8b',
  4,
  'บรรยากาศดีมากค่ะ นอนแพเงียบสงบ เสียงน้ำไหลผ่อนคลายมาก น้ำตกเอราวัณสวยจริงๆ แต่เดินทางจากกรุงเทพฯ ไกลหน่อย รวมแล้วคุ้มค่ามากค่ะ',
  true,
  NOW()-INTERVAL '28 day', NOW()-INTERVAL '28 day'
);


-- ======================================================================
-- 7. TICKETS  (5 ข้อความ — pending / resolved / cancelled)
-- ======================================================================
INSERT INTO tickets (
  id, first_name, last_name, email, phone, message, status, created_at
) VALUES
(
  '1fafbb4e-0a8d-4c2e-87b5-1d3e5a7c9f2b',
  'สุดา', 'ประดิษฐ์',
  'suda.pradit@gmail.com', '0892345671',
  'สอบถามราคากรุ๊ปส่วนตัว 10 คน ไปเกาะพีพี วันที่ 5-6 เม.ย. 69 ได้ไหมคะ อยากได้ใบเสนอราคาค่ะ',
  'pending',
  NOW()-INTERVAL '6 hour'
),
(
  '2abccc5f-1b9e-4d3f-98c6-2e4f6b8d0a3c',
  'ประวิทย์', 'สมบูรณ์ดี',
  'prawit.somboon@hotmail.com', '0923456782',
  'ขอเปลี่ยนวันเดินทางจาก 15 เม.ย. เป็น 22 เม.ย. ได้ไหมครับ รหัสจอง BK-M5A8KRTF ครับ',
  'pending',
  NOW()-INTERVAL '2 day'
),
(
  '3bcddd6a-2c0f-4e4a-a9d7-3f5a7c9e1b4d',
  'วรรณา', 'ชัยพร',
  'wanna.chai@gmail.com', '0864567893',
  'ต้องการใบกำกับภาษีเต็มรูปแบบสำหรับการจอง BK-M5A3W2QN ชื่อบริษัท บจก.ไทยทราเวล จำกัด เลขที่ 0105562012345 ค่ะ',
  'resolved',
  NOW()-INTERVAL '5 day'
),
(
  '4cdeee7b-3d1a-4f5b-b0e8-4a6b8d0f2c5e',
  'อนุชา', 'เจริญผล',
  'anucha.j@outlook.com', '0615678904',
  'กรอกเบอร์โทรผิดตอนจองทัวร์ครับ จาก 0956789012 เป็น 0956789021 ช่วยแก้ไขให้ด้วยครับ',
  'resolved',
  NOW()-INTERVAL '4 day'
),
(
  '5defff8c-4e2b-4a6c-81f9-5b7c9e1a3d6f',
  'พรทิพย์', 'สมศักดิ์',
  'porntip.somsak@gmail.com', '0946789015',
  'สนใจจัดทริป CSR บริษัท ทีมงาน 30 คน ไปกาญจนบุรี ล่องแพ ช่วงปลายเดือนพฤษภาคม สะดวกคุยรายละเอียดได้ตลอดค่ะ',
  'pending',
  NOW()-INTERVAL '1 day'
);


-- ======================================================================
-- 8. RECALCULATE tour rating & review_count จากข้อมูลรีวิวจริง
-- ======================================================================
WITH review_stats AS (
  SELECT
    tour_id,
    COUNT(*)::int AS review_count,
    ROUND(AVG(rating)::numeric, 1) AS avg_rating
  FROM reviews
  GROUP BY tour_id
)
UPDATE tours t
SET
  review_count = COALESCE(s.review_count, 0),
  rating = COALESCE(s.avg_rating, 0)
FROM review_stats s
WHERE t.id = s.tour_id;

-- Tours ที่ยังไม่มีรีวิว → rating = 0
UPDATE tours
SET review_count = 0, rating = 0
WHERE id NOT IN (SELECT DISTINCT tour_id FROM reviews);


COMMIT;

-- ===== SUMMARY =====
SELECT 'users' AS "ตาราง", COUNT(*) AS "จำนวน" FROM users
UNION ALL SELECT 'tours', COUNT(*) FROM tours
UNION ALL SELECT 'tour_schedules', COUNT(*) FROM tour_schedules
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'tickets', COUNT(*) FROM tickets
ORDER BY "ตาราง";

SQL

echo ""
echo "✅ Seed สำเร็จ!"
echo ""
echo "บัญชีทดสอบ:"
echo "  admin         / admin1234       (แอดมิน)"
echo "  somchai_w     / Password123!    (ลูกค้า)"
echo "  pim_srisombat / Password123!    (ลูกค้า)"
echo "  nattapong_j   / Travel2026!     (ผู้ใช้)"
echo "  kannika       / Password123!    (ลูกค้า)"
echo "  thanakrit_p   / Travel2026!     (ลูกค้า)"
echo "  rungruang     / Travel2026!     (ผู้ใช้)"
echo "  siriporn_j    / Password123!    (ลูกค้า)"
echo "  wichai_n      / Travel2026!     (ผู้ใช้)"
echo "  fahsai.*@gmail.com (Google)     (ผู้ใช้)"
echo "  parichat_l    / Password123!    (ถูกระงับ)"
