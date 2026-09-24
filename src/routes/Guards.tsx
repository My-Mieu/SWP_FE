import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { actions, selectCurrentUser, selectData } from '../app/store';

function useValidSession() {
  const dispatch = useAppDispatch();
  const { currentUserId, users } = useAppSelector(selectData);
  const current = users.find((user) => user.id === currentUserId);
  const invalid = Boolean(currentUserId && (!current || current.status !== 'active'));
  useEffect(() => {
    if (invalid) dispatch(actions.logout());
  }, [dispatch, invalid]);
  const user = useAppSelector(selectCurrentUser);
  return invalid ? null : user;
}

const isAdminUser = (user: ReturnType<typeof useValidSession>) => user?.role === 'admin';

export function PublicRoute() {
  const user = useValidSession();
  return isAdminUser(user) ? <Navigate to="/admin" replace /> : <Outlet />;
}

export function GuestOnlyRoute() {
  const user = useValidSession();
  return user ? <Navigate to={isAdminUser(user) ? '/admin' : '/'} replace /> : <Outlet />;
}

export function ProtectedRoute() {
  const user = useValidSession();
  if (isAdminUser(user)) return <Navigate to="/admin" replace />;
  return user?.status === 'active' ? <Outlet /> : <Navigate to="/login" replace />;
}

export function ProfileRoute() {
  const user = useValidSession();
  return user?.status === 'active' ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const user = useValidSession();
  if (!user) return <Navigate to="/login" replace />;
  if (user.status !== 'active' || user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
