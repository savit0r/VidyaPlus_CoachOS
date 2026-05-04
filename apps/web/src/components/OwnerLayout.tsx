import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import api from '../lib/api';
import {
  GraduationCap, Users, CalendarCheck, IndianRupee, Bell,
  TrendingUp, BookOpen, UserCog, Settings, LogOut, LayoutDashboard,
  Menu, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Students', path: '/students', permission: 'students.view' },
  { icon: BookOpen, label: 'Batches', path: '/batches', permission: 'batches.view' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance', permission: 'attendance.view' },
  { icon: IndianRupee, label: 'Fees', path: '/fees', permission: 'fees.view' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: TrendingUp, label: 'Reports', path: '/reports', permission: 'fees.view' },
  { icon: UserCog, label: 'Staff', path: '/staff', permission: 'settings.manage' },
  { icon: Settings, label: 'Settings', path: '/settings', permission: 'settings.manage' },
];

export default function OwnerLayout() {
  const { user, logout, hasPermission } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications');
      setUnreadCount(data.data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentNav = NAV_ITEMS.find(item =>
    location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
  );

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed left-0 top-0 h-full bg-surface-900 text-white flex flex-col z-50 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}`}>
        <div className={`px-5 h-16 flex items-center border-b border-surface-700 ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-sm">CoachOS</h1>
              <p className="text-xs text-surface-400 truncate">{user?.instituteName || 'Dashboard'}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.filter(item => !item.permission || hasPermission(item.permission)).map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
            return (
              <button
                key={label}
                onClick={() => {
                  navigate(path);
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800'
                }`}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {sidebarOpen && label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-surface-700">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-xs font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-surface-400 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-red-400 hover:bg-surface-800 transition-all`}
            title="Sign Out"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {sidebarOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 min-h-screen ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-surface-100 transition-colors text-surface-500"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="text-lg font-semibold text-surface-900">{currentNav?.label || 'Dashboard'}</h2>
                <p className="text-sm text-surface-500">
                  Welcome back, <span className="font-medium text-surface-700">{user?.name || 'User'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 rounded-lg hover:bg-surface-100 transition-colors"
                title="View Notifications"
              >
                <Bell className="w-5 h-5 text-surface-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-danger-500 text-white text-[10px] font-bold rounded-full select-none">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">{user?.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
