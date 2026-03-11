import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/tours");
  await page.waitForSelector('a[href*="/tours/"]');
  await page
    .getByRole("link")
    .filter({ hasText: /ดอยอินทนนท์/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: /เหลือ\s+\d+\s+ที่/ })
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ-นามสกุล" })
    .fill("Somchai Wisetchai");
  await page
    .getByRole("textbox", { name: "อีเมล" })
    .fill("somchai@example.com");
  await page
    .getByRole("textbox", { name: "เบอร์โทรศัพท์ (10 หลัก)" })
    .fill("0812345678");

  const bookingButtonCandidates = [
    page.getByRole("button", { name: /^จอง$/ }),
    page.getByRole("button", { name: /จองทัวร์เลย/ }),
    page.getByRole("button", { name: /กำลังดำเนินการ/ }),
  ];

  let bookingButton = bookingButtonCandidates[0];
  for (const candidate of bookingButtonCandidates) {
    if ((await candidate.count()) > 0) {
      bookingButton = candidate.first();
      break;
    }
  }

  await expect(bookingButton).toBeVisible({ timeout: 10000 });
  await bookingButton.click();
  await expect(
    page.getByRole("heading", { name: "กรุณาเข้าสู่ระบบก่อน" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "เข้าสู่ระบบ →" }).click();
  await page.waitForURL("**/login");
});
