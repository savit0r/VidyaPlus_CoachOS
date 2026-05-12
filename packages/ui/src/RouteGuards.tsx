import { Navigate, Outlet } from 'react-router-dom';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { AuthState } from './auth.store';

interface RouteGuardProps {
  useAuthStore: UseBoundStore<StoreApi<AuthState>>;
  loginPath?: string;
  dashboardPath?: string;
}

export function ProtectedRoute({ useAuthStore, loginPath = '/login' }: RouteGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to={loginPath} replace />;
  return <Outlet />;
}

export function PublicOnlyRoute({ useAuthStore, dashboardPath = '/dashboard' }: RouteGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to={dashboardPath} replace />;
  return <Outlet />;
}
