export const Routes = {
  // Main routes
  HOME: '/',
  TOURS: '/tours',
  TOUR_DETAIL: (id: number | string) => `/tours/${id}`,
  DESTINATIONS: '/destinations',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_SETUP: '/admin/setup',
  ADMIN_INQUIRIES: '/admin/inquiries',
  ADMIN_INQUIRY_DETAIL: (id: number | string) => `/admin/inquiry/${id}`,
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_BOOKING_DETAIL: (id: number | string) => `/admin/bookings/${id}`,
  ADMIN_STAFF: '/admin/staff',
  
  // Worker (staff) routes
  WORKER: '/worker',
  WORKER_LOGIN: '/worker',  // Added explicit login path
  WORKER_DASHBOARD: '/worker/dashboard',
  WORKER_BOOKINGS: '/worker/bookings',
  WORKER_BOOKING_DETAIL: (id: number | string) => `/worker/bookings/${id}`,
  WORKER_PROFILE: '/worker/profile',
  WORKER_DESTINATIONS: '/worker/destinations',
};