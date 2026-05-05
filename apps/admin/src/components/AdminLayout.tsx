import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/auth.store';
import {
  LayoutDashboard, Building2, CreditCard, Settings, LogOut,
  Menu, X, ChevronRight, Shield, Bell, Search, ChevronLeft
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

  const currentNav = NAV_ITEMS.find(item =>
    location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
  );
  const pageTitle = currentNav?.label || 'Platform Overview';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-60' : 'w-20'
        } lg:relative lg:translate-x-0 ${!sidebarOpen && 'lg:w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="ml-3 overflow-hidden whitespace-nowrap">
                <h1 className="font-bold text-slate-900 tracking-tight">VidyaPlus</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Admin Console</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
              return (
                <button
                  key={label}
                  onClick={() => {
                    navigate(path);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center h-10 px-3 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  {sidebarOpen && <span className="ml-3 truncate">{label}</span>}
                  {isActive && sidebarOpen && (
                    <div className="ml-auto w-1 h-4 bg-primary-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-slate-100 space-y-1 flex-shrink-0">
             <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center h-10 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group hidden lg:flex"
            >
              <ChevronLeft className={`w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-slate-600 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
              {sidebarOpen && <span className="ml-3">Collapse</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center h-10 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group"
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-red-500" />
              {sidebarOpen && <span className="ml-3">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-wider">All Systems Operational</span>
             </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-3 pl-1">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mt-0.5">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                <span className="text-sm font-bold text-primary-600">{user?.name?.charAt(0) || 'A'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-10 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
