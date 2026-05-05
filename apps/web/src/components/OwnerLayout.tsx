import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import api from '../lib/api';
import {
  GraduationCap, Users, CalendarCheck, IndianRupee, Bell,
  TrendingUp, BookOpen, UserCog, Settings, LogOut, LayoutDashboard,
  Menu, X, Search, ChevronLeft, MoreHorizontal
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

const BOTTOM_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: BookOpen, label: 'Batches', path: '/batches' },
  { icon: MoreHorizontal, label: 'More', path: 'more' }, // 'more' will trigger sidebar/menu
];

export default function OwnerLayout() {
  const { user, logout, hasPermission } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile first: hidden by default
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications');
      setUnreadCount(data.data.unreadCount || 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0 lg:flex-row">
      {/* Sidebar - Hidden on mobile, fixed/sticky on desktop */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[60] bg-white border-r border-slate-200 transition-all duration-300 ease-in-out 
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'} 
          lg:relative lg:translate-x-0 lg:z-30 ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {(sidebarOpen || window.innerWidth < 1024) && (
              <div className="ml-3 overflow-hidden whitespace-nowrap">
                <h1 className="font-bold text-slate-900 tracking-tight">VidyaPlus</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">CoachOS</p>
              </div>
            )}
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.filter(item => !item.permission || hasPermission(item.permission)).map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
              return (
                <button
                  key={label}
                  onClick={() => {
                    navigate(path);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center h-11 px-3 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  {(sidebarOpen || window.innerWidth < 1024) && <span className="ml-3 truncate">{label}</span>}
                  {isActive && (sidebarOpen || window.innerWidth < 1024) && (
                    <div className="ml-auto w-1.5 h-1.5 bg-primary-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-slate-100 space-y-1 flex-shrink-0">
             <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full hidden lg:flex items-center h-11 px-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all group"
            >
              <ChevronLeft className={`w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-slate-600 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
              {sidebarOpen && <span className="ml-3">Collapse</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center h-11 px-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group"
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-red-500" />
              {(sidebarOpen || window.innerWidth < 1024) && <span className="ml-3">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - Always visible, compact on mobile */}
        <header className="h-16 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
             {/* Mobile Logo Only */}
             <div className="lg:hidden w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
             </div>
             <h1 className="lg:hidden text-base font-bold text-slate-900 tracking-tight">VidyaPlus</h1>
             
             {/* Desktop Search Placeholder */}
             <div className="relative max-w-md hidden lg:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none"
                />
             </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 relative group">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-3 pl-1">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                {(user?.photoUrl || user?.avatar) ? (
                  <img src={user.photoUrl || user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-primary-600">{user?.name?.charAt(0)}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {BOTTOM_NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = path === 'more' ? sidebarOpen : (location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path)));
            return (
              <button
                key={label}
                onClick={() => {
                  if (path === 'more') setSidebarOpen(true);
                  else navigate(path);
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                  isActive ? 'text-primary-600' : 'text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {label}
                </span>
                {isActive && path !== 'more' && (
                   <div className="absolute top-0 w-8 h-1 bg-primary-600 rounded-b-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
