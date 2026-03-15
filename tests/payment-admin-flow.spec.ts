import { test, expect } from '@playwright/test';
import { userLogin } from './helpers/api';

test.describe('Payment and Admin Verification Flow', () => {

  test('ผู้ใช้อัปโหลดสลิป -> แอดมินตรวจสอบ -> ผู้ใช้ได้รับ E-Ticket', async ({ browser }) => {
    // 💡 กำหนดตัวแปรจำลองข้อมูล
    const mockBookingId = '99999';
    let currentBookingStatus = 'pending_pay'; // เริ่มต้นที่สถานะรอชำระเงิน

    // =========================================================
    // 🧑 ส่วนที่ 1: ฝั่งผู้ใช้งาน (User Flow)
    // =========================================================
    console.log("🧑 USER: Preparing User window...");
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    
    // 1.1 ล็อกอินและยัด Token ให้ผู้ใช้ (ใช้ Helper ของเพื่อน)
    const userToken = await userLogin('somchai_w', 'Password123!');
    await userPage.addInitScript((token) => {
      localStorage.setItem('jwt_token', token);
    }, userToken);

    // 🌟 1.2 ดักจับและจำลอง API ฝั่ง User (Mocking)
    // จำลอง QR Code
    await userPage.route(`**/api/payments/qr/${mockBookingId}`, async (route) => {
      await route.fulfill({ 
        json: { payload: 'mock-qr', amount: 5000, paymentDeadline: new Date(Date.now() + 15 * 60000).toISOString() } 
      });
    });

    // จำลองดึงข้อมูล Booking ปัจจุบัน
    await userPage.route(`**/api/bookings/${mockBookingId}`, async (route) => {
      await route.fulfill({ 
        json: { id: mockBookingId, status: currentBookingStatus, totalPrice: 5000, pax: 2, tour: { title: "ทัวร์เกาะพีพี (Mock)" } } 
      });
    });
    // จำลองรายการในหน้า Booking History
    await userPage.route(`**/api/bookings/my-bookings`, async (route) => {
      await route.fulfill({ 
        json: [{ id: mockBookingId, status: currentBookingStatus, totalPrice: 5000, pax: 2, tour: { title: "ทัวร์เกาะพีพี (Mock)" } }] 
      });
    });

    // จำลองการอัปโหลดสลิป (เปลี่ยนสถานะในความจำ)
    await userPage.route(`**/api/bookings/${mockBookingId}/upload-slip`, async (route) => {
      currentBookingStatus = 'pending_verify'; // เปลี่ยนสถานะเป็นรอตรวจสอบ
      await route.fulfill({ json: { success: true }, status: 200 });
    });

    // 1.3 เริ่ม Test ฝั่ง User: เข้าหน้าชำระเงินและอัปโหลดสลิป
    await userPage.goto(`http://localhost:5173/payment/${mockBookingId}`);
    
    console.log("📸 SLIP UPLOAD: User uploading slip...");
    const fileInput = userPage.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/mock-slip.jpg'); // ดึงรูปที่เตรียมไว้มาอัปโหลด
    await expect(userPage.locator('img[alt="Slip Preview"]')).toBeVisible();
    
    await userPage.getByRole('button', { name: 'ยืนยันการโอนเงินด้วยสลิป' }).click();
    await expect(userPage.getByText('ส่งสลิปการโอนเงินสำเร็จ')).toBeVisible();
    await userPage.getByRole('button', { name: 'ตกลง' }).click();
    
    // รอจนกว่าจะเด้งไปหน้าประวัติการจอง
    await expect(userPage).toHaveURL(/.*\/booking-history/);
    await expect(userPage.locator('text=รอตรวจสอบ').first()).toBeVisible();


    // =========================================================
    // 👨‍💼 ส่วนที่ 2: ฝั่งแอดมิน (Admin Flow)
    // =========================================================
    console.log("\n👨‍💼 ADMIN: Opening Admin window...");
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // 🌟 2.1 ดักจับและจำลอง API ฝั่ง Admin
    // จำลองตารางการจองของแอดมินให้มีรายการของ User
    await adminPage.route('**/api/admin/bookings*', async (route) => {
      await route.fulfill({
        json: {
          data: [{ id: mockBookingId, status: currentBookingStatus, tour: { title: 'ทัวร์เกาะพีพี (Mock)' }, totalPrice: 5000 }]
        }
      });
    });

    // จำลองการกดปุ่มยืนยันของแอดมิน
    await adminPage.route(`**/api/admin/bookings/${mockBookingId}/status`, async (route) => {
      currentBookingStatus = 'confirmed'; // เปลี่ยนสถานะเป็นยืนยันแล้ว!
      await route.fulfill({ json: { success: true } });
    });

    // 2.2 แอดมินล็อกอิน
    await adminPage.goto('http://localhost:5173/login');
    await adminPage.getByPlaceholder('Username').fill('admin'); // **แก้ Username แอดมินให้ตรงกับระบบคุณ**
    await adminPage.getByPlaceholder('Password').fill('admin1234'); // **แก้ Password แอดมินให้ตรงกับระบบคุณ**
    await adminPage.locator('form').getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

    // ไปที่หน้าตารางจัดการการจอง
    await adminPage.waitForURL(/.*\/admin/);
    await adminPage.goto('http://localhost:5173/admin/bookings');

    console.log("🔍 Admin approving the payment...");
    // 2.3 แอดมินหาคอลัมน์แล้วกดยืนยัน 
    const approveBtn = adminPage.locator(`tr:has-text("${mockBookingId}")`).getByRole('button', { name: /ยืนยัน|Approve/i });
    if (await approveBtn.count() > 0) {
      await approveBtn.first().click();
      const confirmModalBtn = adminPage.getByRole('button', { name: /ตกลง|ใช่/ });
      if (await confirmModalBtn.isVisible()) await confirmModalBtn.click();
    }
    
    // แอดมินทำงานเสร็จ ปิดเบราว์เซอร์แอดมินทิ้งได้เลย
    await adminPage.waitForTimeout(1000);
    await adminContext.close();


    // =========================================================
    // 🧑 ส่วนที่ 3: กลับมาที่ฝั่งผู้ใช้งาน (User Verificaion)
    // =========================================================
    console.log("\n🧑 USER: Verifying updated status...");
    
    // 3.1 ผู้ใช้รีเฟรชหน้าประวัติการจอง
    await userPage.reload();
    
    // 3.2 ตรวจสอบว่าหน้าเว็บขึ้นว่า "ยืนยันแล้ว" และมีปุ่ม "ดู E-ticket" โผล่มา
    await expect(userPage.locator('text=ยืนยันแล้ว').first()).toBeVisible();
    await expect(userPage.getByRole('button', { name: /ดู E-ticket/i }).first()).toBeVisible();

    console.log("✅ E2E Flow complete: User uploaded -> Admin verified -> User gets E-ticket!");
    
    // ปิดเบราว์เซอร์ผู้ใช้ จบการทดสอบ
    await userContext.close();
  });

});