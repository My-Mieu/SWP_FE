export const ROUTES = {
  home: '/',
  browse: '/browse',
  ai: '/ai',
  login: '/login',
  register: '/register',
  post: '/post',
  activities: '/activities',
  messages: '/messages',
  profile: '/profile',
  credit: '/credit',
  admin: '/admin',
} as const;

export const CATEGORIES = [
  'Đồ điện tử',
  'Nội thất',
  'Sách',
  'Thời trang',
  'Đồ gia dụng',
  'Phụ kiện',
  'Nước hoa',
  'Đồ học tập',
] as const;

export const DISTRICTS = [
  'Quận 1',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Bình Thạnh',
  'Gò Vấp',
  'Phú Nhuận',
  'Tân Bình',
  'Tân Phú',
  'Bình Tân',
  'TP Thủ Đức',
] as const;

export const CONDITIONS = ['new', 'good', 'used'] as const;

export const ADMIN_ROUTES = [
  '/admin/moderation',
  '/admin/expired-posts',
  '/admin/categories',
  '/admin/keywords',
  '/admin/districts',
  '/admin/users',
  '/admin/reputation',
  '/admin/locked-users',
  '/admin/transactions',
  '/admin/disputes',
  '/admin/alerts',
  '/admin/finance',
  '/admin/settings/fees',
  '/admin/settings/ranks',
  '/admin/audit-logs',
] as const;
