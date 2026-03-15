import { test, expect } from '@playwright/test';
// ❌ ลบ import { userLogin } ของเพื่อนทิ้งไปได้เลยครับ เราไม่พึ่งฐานข้อมูลแล้ว!

test.describe('Payment and Admin Verification Flow', () => {

  test('ผู้ใช้อัปโหลดสลิป -> แอดมินตรวจสอบ -> ผู้ใช้ได้รับ E-Ticket', async ({ browser }) => {
    const mockBookingId = '99999';
    let currentBookingStatus = 'pending_pay'; 

    // 🌟 สร้าง JWT Token จำลองที่ถอดรหัสได้ (เจาะจง Role เป็น user และ admin)
    // ทำให้บอทสามารถข้ามหน้า Login ไปได้เลยโดยไม่ต้องพิมพ์รหัสผ่าน
    const fakeUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTksInVzZXJuYW1lIjoic29tY2hhaV93Iiwicm9sZSI6InVzZXIiLCJleHAiOjk5OTk5OTk5OTl9.fake_sig";
    const fakeAdminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.fake_sig";

    // =========================================================
    // 🧑 ส่วนที่ 1: ฝั่งผู้ใช้งาน (User Flow)
    // =========================================================
    console.log("🧑 USER: Preparing User window...");
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    // 1.1 ยัด Token ปลอมให้ผู้ใช้
    await userPage.addInitScript((token) => {
      localStorage.setItem('jwt_token', token);
    }, fakeUserToken);

    // 1.2 ดักจับ API โปรไฟล์ เพื่อไม่ให้ Frontend พังเวลาอ่าน Token ปลอม
    await userPage.route('**/api/users/profile', async (route) => {
      await route.fulfill({ json: { id: 99, username: 'somchai_w', role: 'user' } });
    });

    // ดักจับ API หน้า Payment & Booking (เหมือนเดิม)
    await userPage.route(`**/api/payments/qr/${mockBookingId}`, async (route) => {
      await route.fulfill({ json: { payload: 'mock-qr', amount: 5000, paymentDeadline: new Date(Date.now() + 15 * 60000).toISOString() } });
    });
    await userPage.route(`**/api/bookings/${mockBookingId}`, async (route) => {
      await route.fulfill({ json: { id: mockBookingId, status: currentBookingStatus, totalPrice: 5000, pax: 2, tour: { title: "ทัวร์เกาะพีพี (Mock)" } } });
    });
    await userPage.route(`**/api/bookings/my-bookings`, async (route) => {
      await route.fulfill({ json: [{ id: mockBookingId, status: currentBookingStatus, totalPrice: 5000, pax: 2, tour: { title: "ทัวร์เกาะพีพี (Mock)" } }] });
    });
    await userPage.route(`**/api/bookings/${mockBookingId}/upload-slip`, async (route) => {
      currentBookingStatus = 'pending_verify'; 
      await route.fulfill({ json: { success: true }, status: 200 });
    });

    // 1.3 เริ่มเทสต์! เข้าหน้าชำระเงินโดยตรง
    await userPage.goto(`http://localhost:5173/payment/${mockBookingId}`);
    
    console.log("📸 SLIP UPLOAD: User uploading slip...");
    const fileInput = userPage.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/mock-slip.jpg'); 
    await expect(userPage.locator('img[alt="Slip Preview"]')).toBeVisible();
    
    await userPage.getByRole('button', { name: 'ยืนยันการโอนเงินด้วยสลิป' }).click();
    await expect(userPage.getByText('ส่งสลิปการโอนเงินสำเร็จ')).toBeVisible();
    await userPage.getByRole('button', { name: 'ตกลง' }).click();
    
    await expect(userPage).toHaveURL(/.*\/booking-history/);
    await expect(userPage.locator('text=รอตรวจสอบ').first()).toBeVisible();


    // =========================================================
    // 👨‍💼 ส่วนที่ 2: ฝั่งแอดมิน (Admin Flow)
    // =========================================================
    console.log("\n👨‍💼 ADMIN: Opening Admin window...");
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // 2.1 ยัด Token ปลอมให้ Admin (ข้ามหน้า Login ไปได้เลย ไม่ต้องเสียเวลาพิมพ์รหัส!)
    await adminPage.addInitScript((token) => {
      localStorage.setItem('jwt_token', token);
    }, fakeAdminToken);

    // 2.2 ดักจับ API แอดมิน
    await adminPage.route('**/api/users/profile', async (route) => {
      await route.fulfill({ json: { id: 1, username: 'admin', role: 'admin' } });
    });
    await adminPage.route('**/api/admin/bookings*', async (route) => {
      await route.fulfill({
        json: { data: [{ id: mockBookingId, status: currentBookingStatus, tour: { title: 'ทัวร์เกาะพีพี (Mock)' }, totalPrice: 5000 }] }
      });
    });
    await adminPage.route(`**/api/admin/bookings/${mockBookingId}/status`, async (route) => {
      currentBookingStatus = 'confirmed'; 
      await route.fulfill({ json: { success: true } });
    });

    // 2.3 เข้าหน้าจัดการการจองของแอดมินโดยตรง
    await adminPage.goto('http://localhost:5173/admin/bookings');

    console.log("🔍 Admin approving the payment...");
    const approveBtn = adminPage.locator(`tr:has-text("${mockBookingId}")`).getByRole('button', { name: /ยืนยัน|Approve/i });
    if (await approveBtn.count() > 0) {
      await approveBtn.first().click();
      const confirmModalBtn = adminPage.getByRole('button', { name: /ตกลง|ใช่/ });
      if (await confirmModalBtn.isVisible()) await confirmModalBtn.click();
    }
    
    await adminPage.waitForTimeout(1000);
    await adminContext.close();


    // =========================================================
    // 🧑 ส่วนที่ 3: กลับมาที่ฝั่งผู้ใช้งาน
    // =========================================================
    console.log("\n🧑 USER: Verifying updated status...");
    
    // 🌟 1. ดักรอให้ API โหลดข้อมูลเสร็จสมบูรณ์ก่อน
    const responsePromise = userPage.waitForResponse('**/api/bookings/my-bookings');
    await userPage.reload();
    await responsePromise; // รอจนกว่า API จะตอบกลับมาแล้วจริงๆ
    
    // 🌟 2. ใช้ getByText แทน locator ซึ่งจะหาข้อความบน React ได้แม่นกว่า
    await expect(userPage.getByText('ยืนยันแล้ว').first()).toBeVisible();
    await expect(userPage.getByRole('button', { name: /ดู E-ticket/i }).first()).toBeVisible();

    console.log("✅ E2E Flow complete: User uploaded -> Admin verified -> User gets E-ticket!");
    
    await userContext.close();
  });
});