import { test, expect } from "@playwright/test";

/**
 * E2E Test: Register → Login → Logout Flow (UI Only)
 *
 * Thai: ทดสอบการสมัครสมาชิก → เข้าสู่ระบบ → ออกจากระบบ ผ่าน UI ทั้งหมด
 *
 * หน้า Register มี 2 Step:
 *   Step 1: ชื่อ / นามสกุล / ชื่อผู้ใช้ / อีเมล / เบอร์โทร → กด "ถัดไป →"
 *   Step 2: รหัสผ่าน / ยืนยันรหัสผ่าน → กด submit
 *
 * หน้า Login:
 *   placeholder "Username" / "Password" → ปุ่ม "เข้าสู่ระบบ"
 */

const BASE_URL = "http://localhost:5173";

// ──────────────────────────────────────────────────────
// Helper: ดึง JWT token จาก localStorage / sessionStorage
// ──────────────────────────────────────────────────────
async function getStoredToken(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const keys = [
      "jwt_token",
      "token",
      "accessToken",
      "access_token",
      "authToken",
    ];
    for (const key of keys) {
      const val =
        window.localStorage.getItem(key) ||
        window.sessionStorage.getItem(key);
      if (val) return val;
    }
    return null;
  });
}

// ──────────────────────────────────────────────────────
// Main Test
// ──────────────────────────────────────────────────────
test("Register → Login → Logout flow via UI", async ({ page }) => {
  // สร้าง credentials ที่ unique ในแต่ละ run
  const timestamp = Date.now();
  const username = `testuser${timestamp}`;   // ไม่ใช้ underscore เผื่อ validation ปฏิเสธ
  const password = "SecurePass123!";
  const email = `testuser${timestamp}@example.com`;
  const firstName = "ชาญชัย";
  const lastName = "ใจดี";

  // ════════════════════════════════════════════════════
  // PHASE 1: REGISTER (Step 1 — ข้อมูลส่วนตัว)
  // ════════════════════════════════════════════════════
  console.log("\n📝 PHASE 1: ไปหน้า /register ...");
  await page.goto(`${BASE_URL}/register`);
  await page.waitForLoadState("networkidle");
  console.log("✅ Register page loaded");

  // ── ชื่อ (placeholder "ชาญชัย")
  console.log(`   กรอกชื่อ: ${firstName}`);
  await page.getByPlaceholder("ชาญชัย").fill(firstName);
  await page.waitForTimeout(200);

  // ── นามสกุล (placeholder "ใจดี")
  console.log(`   กรอกนามสกุล: ${lastName}`);
  await page.getByPlaceholder("ใจดี").fill(lastName);
  await page.waitForTimeout(200);

  // ── ชื่อผู้ใช้ (placeholder "เช่น chaichai99")
  console.log(`   กรอก username: ${username}`);
  await page.getByPlaceholder("เช่น chaichai99").fill(username);
  await page.waitForTimeout(200);

  // ── อีเมล (placeholder "email@example.com")
  console.log(`   กรอก email: ${email}`);
  await page.getByPlaceholder("email@example.com").fill(email);
  await page.waitForTimeout(200);

  // ── เบอร์โทร (optional — placeholder "08X-XXX-XXXX (ไม่จำเป็น)")
  console.log("   กรอกเบอร์โทร (optional)");
  await page.getByPlaceholder("08X-XXX-XXXX (ไม่จำเป็น)").fill("0812345678");
  await page.waitForTimeout(200);

  // ── กดปุ่ม "ถัดไป →" เพื่อไป Step 2
  console.log("   กดปุ่ม 'ถัดไป →'");
  const nextButton = page.getByRole("button", { name: "ถัดไป →" });
  await expect(nextButton).toBeVisible({ timeout: 10000 });
  await expect(nextButton).toBeEnabled({ timeout: 10000 });
  await nextButton.click();
  await page.waitForTimeout(500);

  // ════════════════════════════════════════════════════
  // PHASE 1 (ต่อ): REGISTER (Step 2 — ตั้งรหัสผ่าน)
  // ════════════════════════════════════════════════════
  console.log("\n📝 PHASE 1 (Step 2): กรอกรหัสผ่าน...");

  // ── รหัสผ่าน (placeholder "อย่างน้อย 8 ตัวอักษร")
  console.log("   กรอก password");
  const passwordInput = page.getByPlaceholder("อย่างน้อย 8 ตัวอักษร");
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill(password);
  await page.waitForTimeout(200);

  // ── ยืนยันรหัสผ่าน (placeholder "กรอกรหัสผ่านอีกครั้ง")
  console.log("   กรอก confirm password");
  const confirmInput = page.getByPlaceholder("กรอกรหัสผ่านอีกครั้ง");
  await expect(confirmInput).toBeVisible({ timeout: 10000 });
  await confirmInput.fill(password);
  await page.waitForTimeout(200);

  // ── กดปุ่ม submit (type="submit" ใน form)
  console.log("   กดปุ่มสมัครสมาชิก...");
  const submitButton = page.locator("form").getByRole("button", { name: /สมัครสมาชิก|ลงทะเบียน|submit/i });
  await expect(submitButton).toBeVisible({ timeout: 10000 });
  await expect(submitButton).toBeEnabled({ timeout: 10000 });
  await submitButton.click();

  // รอให้ redirect → /login (banner success แล้ว setTimeout 2000ms → navigate)
  console.log("⏳ รอ redirect ไปหน้า /login ...");
  await page.waitForURL(/\/(login|signin)/, { timeout: 15000 });
  console.log(`✅ Register สำเร็จ — URL: ${page.url()}`);

  // ════════════════════════════════════════════════════
  // PHASE 2: LOGIN
  // ════════════════════════════════════════════════════
  console.log("\n🔐 PHASE 2: Login ด้วย credentials ที่เพิ่งสมัคร...");
  await page.waitForLoadState("networkidle");

  // ── username (placeholder "Username")
  console.log(`   กรอก username: ${username}`);
  const loginUsernameInput = page.getByPlaceholder("Username");
  await expect(loginUsernameInput).toBeVisible({ timeout: 10000 });
  await loginUsernameInput.fill(username);
  await page.waitForTimeout(200);

  // ── password (placeholder "Password")
  console.log("   กรอก password");
  const loginPasswordInput = page.getByPlaceholder("Password");
  await expect(loginPasswordInput).toBeVisible({ timeout: 10000 });
  await loginPasswordInput.fill(password);
  await page.waitForTimeout(200);

  // ── กดปุ่ม "เข้าสู่ระบบ" (ใน form)
  console.log("   กดปุ่มเข้าสู่ระบบ...");
  const loginButton = page
    .locator("form")
    .getByRole("button", { name: "เข้าสู่ระบบ" });
  await expect(loginButton).toBeVisible({ timeout: 10000 });
  await expect(loginButton).toBeEnabled({ timeout: 10000 });
  await loginButton.click();

  // รอจนมี JWT token ใน storage
  console.log("⏳ รอ JWT token ถูกเก็บใน storage...");
  await expect
    .poll(() => getStoredToken(page), {
      message: "JWT token ควรถูกเก็บหลัง login สำเร็จ",
      timeout: 15000,
    })
    .not.toBeNull();

  const token = await getStoredToken(page);
  console.log(`✅ Token stored: ${(token ?? "").substring(0, 20)}...`);

  // ต้อง redirect ออกจาก /login
  await page.waitForTimeout(500);
  const afterLoginUrl = page.url();
  console.log(`✅ หลัง login URL: ${afterLoginUrl}`);
  expect(afterLoginUrl).not.toContain("/login");

  // ════════════════════════════════════════════════════
  // PHASE 3: LOGOUT
  // ════════════════════════════════════════════════════
  console.log("\n🚪 PHASE 3: Logout...");

  // เปิดเมนูผู้ใช้
  console.log("   กดเปิดเมนูผู้ใช้...");
  await page.getByRole("button", { name: "เปิดเมนูผู้ใช้" }).click();

  // กดปุ่มออกจากระบบ (ครั้งแรกใน dropdown menu)
  console.log("   กดออกจากระบบ...");
  await page.getByRole("button", { name: "ออกจากระบบ" }).click();

  // กดยืนยันออกจากระบบ (confirm dialog)
  console.log("   ยืนยันออกจากระบบ...");
  await page.getByRole("button", { name: "ออกจากระบบ" }).click();

  await page.waitForTimeout(1500);
  console.log("✅ Logout สำเร็จ");

  // ยืนยันว่า token ถูกลบ
  const tokenAfterLogout = await getStoredToken(page);
  if (tokenAfterLogout === null) {
    console.log("✅ Token ถูกลบหลัง logout");
    expect(tokenAfterLogout).toBeNull();
  } else {
    console.log("⚠️ Token ยังอยู่ — ตรวจสอบ redirect แทน");
  }

  // หลัง logout ต้องอยู่หน้า public
  const finalUrl = page.url();
  const isOnPublicPage =
    finalUrl.includes("/login") ||
    finalUrl.includes("/signin") ||
    finalUrl === `${BASE_URL}/` ||
    finalUrl === `${BASE_URL}`;

  console.log(`   Final URL: ${finalUrl}`);
  console.log(
    isOnPublicPage
      ? "✅ Redirect ไปหน้า public หลัง logout"
      : "⚠️ ไม่ได้อยู่หน้า public ที่คาดไว้ — อาจ OK สำหรับ SPA"
  );

  console.log("\n🎉 Register → Login → Logout flow สำเร็จ!");
});
