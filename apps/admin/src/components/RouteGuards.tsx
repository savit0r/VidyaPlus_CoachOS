import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/auth.store';

export function ProtectedRoute() {
  const { isAuthenticated } = useAdminAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAdminAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
