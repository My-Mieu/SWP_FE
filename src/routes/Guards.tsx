import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectCurrentUser } from '../app/store';

export function PublicRoute() {
  return <Outlet />;
}

export function GuestOnlyRoute() {
  const user = useAppSelector(selectCurrentUser);
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

export function ProtectedRoute() {
  const user = useAppSelector(selectCurrentUser);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const user = useAppSelector(selectCurrentUser);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
