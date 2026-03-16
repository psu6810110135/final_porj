import { test, expect } from '@playwright/test';

test.describe('Payment and Admin Verification Flow', () => {

  test('ผู้ใช้อัปโหลดสลิป -> แอดมินตรวจสอบ -> ผู้ใช้ได้รับ E-Ticket', async ({ browser }) => {
    const mockBookingId = '99999';
    let currentBookingStatus = 'pending_pay'; 

    // 🌟 สร้าง Token ปลอมเพื่อบายพาสการล็อกอิน (ไม่ต้องพึ่ง Database)
    const fakeUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTksInVzZXJuYW1lIjoic29tY2hhaV93Iiwicm9sZSI6InVzZXIiLCJleHAiOjk5OTk5OTk5OTl9.fake_sig";
    const fakeAdminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.fake_sig";

    // =========================================================
    // 🧑 ส่วนที่ 1: ฝั่งผู้ใช้งาน (User Flow)
    // =========================================================
    console.log("🧑 USER: Preparing User window...");
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    // 1. ยัด Token ให้ผู้ใช้
    await userPage.addInitScript((token) => {
      localStorage.setItem('jwt_token', token);
    }, fakeUserToken);

    // 2. ดัก API จำลองข้อมูลต่างๆ เพื่อไม่ให้เว็บพัง
    await userPage.route('**/api/users/profile', async (route) => {
      await route.fulfill({ json: { id: 99, username: 'somchai_w', role: 'user' } });
    });
    await userPage.route(`**/api/payments/qr/${mockBookingId}`, async (route) => {
      await route.fulfill({ json: { payload: 'mock-qr', amount: 5000, paymentDeadline: new Date(Date.now() + 15 * 60000).toISOString() } });
    });
    await userPage.route(`**/api/bookings/${mockBookingId}`, async (route) => {
      await route.fulfill({ json: { id: mockBookingId, status: currentBookingStatus, totalPrice: 5000, pax: 2, tour: { title: "ทัวร์เกาะพีพี (Mock)" } } });
    });
    await userPage.route(`**/api/bookings/my-bookings`, async (route) => {
      await route.fulfill({ json: [{ id: mockBookingId, status: currentBookingStatus, totalPrice: 5000, pax: 2, tour: { title: "ทัวร์เกาะพีพี (Mock)" } }] });
    });
    
    // 3. ดักตอนกดอัปโหลดสลิป ให้เปลี่ยนสถานะในตัวแปรทันที
    await userPage.route(`**/api/bookings/${mockBookingId}/upload-slip`, async (route) => {
      currentBookingStatus = 'pending_verify'; 
      await route.fulfill({ json: { success: true }, status: 200 });
    });

    // 4. เข้าหน้าเว็บและทำการเทสต์
// เปลี่ยนจาก: await userPage.goto(`http://localhost:5173/payment/${mockBookingId}`);
    await userPage.goto(`http://localhost:5173/payment/${mockBookingId}`, { waitUntil: 'domcontentloaded' });    
    console.log("📸 SLIP UPLOAD: User uploading slip...");
    await userPage.locator('input[type="file"]').setInputFiles('tests/fixtures/mock-slip.jpg'); 
    await expect(userPage.locator('img[alt="Slip Preview"]')).toBeVisible();
    
    await userPage.getByRole('button', { name: 'ยืนยันการโอนเงินด้วยสลิป' }).click();
    await expect(userPage.getByText('ส่งสลิปการโอนเงินสำเร็จ')).toBeVisible();
    await userPage.getByRole('button', { name: 'ตกลง' }).click();
    
    await expect(userPage).toHaveURL(/.*\/booking-history/);
    await expect(userPage.getByText('รอตรวจสอบ').first()).toBeVisible();


    // =========================================================
    // 👨‍💼 ส่วนที่ 2: ฝั่งแอดมิน (Admin Flow)
    // =========================================================
    console.log("\n👨‍💼 ADMIN: Opening Admin window...");
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // 1. ยัด Token แอดมิน
    await adminPage.addInitScript((token) => {
      localStorage.setItem('jwt_token', token);
    }, fakeAdminToken);

    // 2. ดัก API แอดมิน (🌟 แก้ให้ส่งข้อมูลเป็น Array ปกติ ตารางจะได้ไม่ว่างเปล่า)
    await adminPage.route('**/api/users/profile', async (route) => {
      await route.fulfill({ json: { id: 1, username: 'admin', role: 'admin' } });
    });
    await adminPage.route('**/api/admin/bookings*', async (route) => {
      await route.fulfill({
        json: [
          { 
            id: mockBookingId, 
            bookingReference: `B-${mockBookingId}`, 
            status: currentBookingStatus, 
            tour: { title: 'ทัวร์เกาะพีพี (Mock)' }, 
            totalPrice: 5000,
            pax: 2,
            createdAt: new Date().toISOString()
          }
        ]
      });
    });
    await adminPage.route(`**/api/admin/bookings/${mockBookingId}/status`, async (route) => {
      currentBookingStatus = 'confirmed'; 
      await route.fulfill({ json: { success: true } });
    });

   // 3. เข้าหน้าจัดการและกดยืนยัน
await adminPage.goto('http://localhost:5173/admin/bookings', { waitUntil: 'domcontentloaded' });    console.log("🔍 Admin approving the payment...");
    
    // หาแถวของ Booking นี้
    const row = adminPage.locator('tr', { hasText: mockBookingId });
    
  // 🎯 ล็อกเป้าแบบชัวร์ 100%: ต้องเป็นปุ่มที่มีคำว่า "รอตรวจสอบ" และมี "ไอคอนลูกศร (svg)" อยู่ข้างในเท่านั้น!
    const statusDropdown = row.locator('div').filter({ hasText: /^รอตรวจสอบ$/ }).first();
    await statusDropdown.click();
    
    // ⏳ รอแอนิเมชันของ Shadcn UI กางเมนูให้เสร็จก่อน (ประมาณครึ่งวินาที)
    await adminPage.waitForTimeout(500);
    
   // 🎯 หาตัวเลือกที่มีคำว่า "ยืนยันแล้ว" (ชี้เป้าแม่นๆ จาก Playwright Picker)
    await adminPage.getByText('ยืนยันแล้ว').click();

    await adminPage.waitForTimeout(1000);
    await adminContext.close();

    // =========================================================
    // 🧑 ส่วนที่ 3: กลับมาที่ฝั่งผู้ใช้งาน (User Verification)
    // =========================================================
    console.log("\n🧑 USER: Verifying updated status...");
    
    // รีเฟรชหน้าต่างผู้ใช้ แล้วรอให้ API ดึงข้อมูลใหม่เสร็จ
    const responsePromise = userPage.waitForResponse('**/api/bookings/my-bookings');
    await userPage.reload();
    await responsePromise; 
    
    // เช็คว่าสถานะเปลี่ยน และปุ่มดูตั๋วโผล่มา
    await expect(userPage.getByText('ยืนยันแล้ว').first()).toBeVisible();
    await expect(userPage.getByRole('button', { name: /E-ticket/i }).first()).toBeVisible();

    console.log("✅ E2E Flow complete: User uploaded -> Admin verified -> User gets E-ticket!");
    await userContext.close();
  });
});