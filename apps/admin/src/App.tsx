import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuthStore } from './stores/auth.store';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './features/auth/AdminLoginPage';
import AdminDashboardPage from './features/dashboard/AdminDashboardPage';
import InstitutesListPage from './features/institutes/InstitutesListPage';
import InstituteDetailPage from './features/institutes/InstituteDetailPage';

export default function App() {
  const { isAuthenticated } = useAdminAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<AdminLoginPage />} />
        </Route>

        {/* Protected routes with shared layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<AdminDashboardPage />} />
            <Route path="/institutes" element={<InstitutesListPage />} />
            <Route path="/institutes/:id" element={<InstituteDetailPage />} />
            <Route path="/plans" element={<div className="text-surface-400 text-center py-20">Plans & Billing page — coming next</div>} />
            <Route path="/settings" element={<div className="text-surface-400 text-center py-20">Platform settings — coming next</div>} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
