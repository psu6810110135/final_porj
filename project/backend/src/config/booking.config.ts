export const BOOKING_CONFIG = {
  MAX_ACTIVE_BOOKINGS_PER_USER: 5,
  ACTIVE_BOOKING_STATUSES: ['pending_pay', 'pending_verify', 'confirmed'],
} as const;
