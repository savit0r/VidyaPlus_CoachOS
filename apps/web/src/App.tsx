import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/auth.store';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import OwnerLayout from './components/OwnerLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import StudentsPage from './features/students/StudentsPage';
import BatchesPage from './features/batches/BatchesPage';
import FeePlansPage from './features/fees/FeePlansPage';
import FeeDashboardPage from './features/fees/FeeDashboardPage';
import StudentLedgerPage from './features/fees/StudentLedgerPage';
import ReceiptView from './features/fees/ReceiptView';
import AttendancePage from './features/attendance/AttendancePage';
import StaffPage from './features/staff/StaffPage';
import NotificationPage from './features/notifications/NotificationPage';
import ReportsPage from './features/reports/ReportsPage';
import SettingsPage from './features/settings/SettingsPage';

export default function App() {
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes with Owner layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<OwnerLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Phase 2 — Live modules */}
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/batches" element={<BatchesPage />} />
            <Route path="/fees" element={<FeeDashboardPage />} />
            <Route path="/fees/plans" element={<FeePlansPage />} />
            <Route path="/fees/student/:studentId" element={<StudentLedgerPage />} />
            <Route path="/fees/receipt/:receiptNumber" element={<ReceiptView />} />
            {/* Phase 3+ — Placeholders */}
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">{title}</h2>
      <p className="text-sm text-surface-500 max-w-md">{description}</p>
      <p className="text-xs text-surface-400 mt-3">This module will be built in an upcoming phase</p>
    </div>
  );
}
