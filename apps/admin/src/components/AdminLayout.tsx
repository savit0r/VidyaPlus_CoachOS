import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/auth.store';
import {
  LayoutDashboard, Building2, CreditCard, Settings, LogOut,
  Menu, X, ChevronRight, Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'institutes', label: 'Institutes', icon: Building2, path: '/institutes' },
  { id: 'plans', label: 'Plans & Billing', icon: CreditCard, path: '/plans' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAdminAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine page title from route
  const currentNav = NAV_ITEMS.find(item =>
    location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
  );
  const pageTitle = currentNav?.label || 'Platform Overview';

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-700/30">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <p className="text-sm font-bold text-white leading-tight">CoachOS</p>
              <p className="text-[10px] text-admin-300 uppercase tracking-wider">Admin Console</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-admin-600/20 text-admin-300 shadow-sm' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-admin-400' : ''}`} />
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && isActive && <ChevronRight className="w-4 h-4 ml-auto text-admin-400" />}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="px-3 pb-4 border-t border-surface-700/30 pt-4">
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} mb-3`}>
            <div className="w-9 h-9 rounded-full bg-admin-600/30 flex items-center justify-center text-admin-300 text-sm font-semibold flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 animate-fade-in">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-surface-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2 rounded-xl text-sm text-surface-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-6 border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
            All systems operational
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
