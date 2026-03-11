/**
 * Helper functions for API calls in e2e tests
 */

const API_BASE_URL = "http://localhost:3000";

interface AuthResponse {
  accessToken: string;
  user_id?: string;
}

interface TourData {
  id: string;
  title: string;
  description: string;
  price: number;
}

interface TourScheduleData {
  id: string;
  available_date: string;
  max_capacity: number;
}

/**
 * Login as admin and get JWT token
 */
export async function adminLogin(
  username: string,
  password: string,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(`Admin login failed: ${response.statusText}`);
  }

  const data = (await response.json()) as AuthResponse;
  return data.accessToken;
}

/**
 * Create a tour (admin only)
 */
export async function createTour(
  adminToken: string,
  tourData: Partial<TourData>,
): Promise<TourData> {
  const response = await fetch(`${API_BASE_URL}/api/tours`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: tourData.title || "Test Tour - Doi Inthanon",
      description: tourData.description || "A beautiful mountain tour",
      price: tourData.price || 1500,
      child_price: 750,
      province: "เชียงใหม่",
      max_group_size: 30,
      region: "North",
      category: "Adventure",
      duration: "1 day",
      image_cover: "uploads/default.jpg",
      highlights: [],
      preparation: [],
      included: "รถรับส่ง, มัคคุเทศก์, ประกันการเดินทาง",
      excluded: "ค่าใช้จ่ายส่วนตัว",
      conditions: "ชำระเงินก่อนวันเดินทาง",
      is_active: true,
      is_recommended: false,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Create tour failed: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }

  return (await response.json()) as TourData;
}

/**
 * Create a tour schedule (admin only)
 */
export async function createTourSchedule(
  adminToken: string,
  tourId: string,
  availableDate: string,
  maxCapacity: number = 10,
): Promise<TourScheduleData> {
  const response = await fetch(
    `${API_BASE_URL}/api/tours/${tourId}/schedules`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        available_date: availableDate,
        max_capacity_override: maxCapacity,
        is_available: true,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Create tour schedule failed: ${response.statusText} - ${error}`,
    );
  }

  return (await response.json()) as TourScheduleData;
}

/**
 * Get tour by ID
 */
export async function getTour(tourId: string): Promise<TourData> {
  const response = await fetch(`${API_BASE_URL}/api/tours/${tourId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Get tour failed: ${response.statusText}`);
  }

  return (await response.json()) as TourData;
}

/**
 * User login and get JWT token
 */
export async function userLogin(
  username: string,
  password: string,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(`User login failed: ${response.statusText}`);
  }

  const data = (await response.json()) as AuthResponse;
  return data.accessToken;
}
