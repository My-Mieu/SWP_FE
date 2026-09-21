import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { AdminRoute, GuestOnlyRoute, ProtectedRoute, PublicRoute } from '../routes/Guards';
import { Home } from '../pages/public/Home';
import { Browse } from '../pages/public/Browse';
import { ProductDetail } from '../pages/public/ProductDetail';
import { AI } from '../pages/public/AI';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Post } from '../pages/user/Post';
import { Activities } from '../pages/user/Activities';
import { Messages } from '../pages/user/Messages';
import { Profile } from '../pages/user/Profile';
import { Credit } from '../pages/user/Credit';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { NotFound } from '../pages/NotFound';
import {
  AdminAuditLogs,
  AdminDashboard,
  AdminFinance,
  AdminModeration,
  AdminSettings,
  AdminContentPage,
  AdminTransactionDetail,
  AdminTransactions,
  AdminUserDetail,
  AdminUsers,
} from '../pages/admin/AdminPages';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/browse', element: <Browse /> },
          { path: '/product/:id', element: <ProductDetail /> },
          { path: '/ai', element: <AI /> },
        ],
      },
      {
        element: <GuestOnlyRoute />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/register', element: <Register /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/post', element: <Post /> },
          { path: '/activities', element: <Activities /> },
          { path: '/messages', element: <Messages /> },
          { path: '/profile', element: <Profile /> },
          { path: '/credit', element: <Credit /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: 'moderation', element: <AdminModeration /> },
              { path: 'expired-posts', element: <AdminContentPage kind="expired" /> },
              { path: 'categories', element: <AdminContentPage kind="categories" /> },
              { path: 'keywords', element: <AdminContentPage kind="keywords" /> },
              { path: 'districts', element: <AdminContentPage kind="districts" /> },
              { path: 'users', element: <AdminUsers /> },
              { path: 'users/:userId', element: <AdminUserDetail /> },
              { path: 'reputation', element: <AdminContentPage kind="reputation" /> },
              { path: 'locked-users', element: <AdminContentPage kind="locked" /> },
              { path: 'transactions', element: <AdminTransactions /> },
              { path: 'transactions/:transactionId', element: <AdminTransactionDetail /> },
              { path: 'disputes', element: <AdminContentPage kind="disputes" /> },
              { path: 'alerts', element: <AdminContentPage kind="alerts" /> },
              { path: 'finance', element: <AdminFinance /> },
              { path: 'finance/users/:userId', element: <AdminUserDetail /> },
              { path: 'settings/fees', element: <AdminSettings /> },
              { path: 'settings/ranks', element: <AdminContentPage kind="ranks" /> },
              { path: 'audit-logs', element: <AdminAuditLogs /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
