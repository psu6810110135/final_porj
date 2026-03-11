import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  testIgnore: "**/backend/**",
  use: {
    /* ตั้งค่า baseURL ให้ Playwright รู้จักเว็บเรา */
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: [
    {
      command: "npm run start:dev",
      cwd: "project/backend",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        ...process.env,
        PORT: "3000",
        NODE_ENV: "test",
        DATABASE_URL:
          process.env.DATABASE_URL ||
          "postgresql://thai_tours:thai_tours_password@127.0.0.1:5433/thai_tours",
        JWT_SECRET:
          process.env.JWT_SECRET || "dev-secret-key-change-in-production",
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
      },
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173",
      cwd: "project/frontend",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        ...process.env,
        VITE_API_URL: process.env.VITE_API_URL || "http://127.0.0.1:3000",
      },
    },
  ],
});
