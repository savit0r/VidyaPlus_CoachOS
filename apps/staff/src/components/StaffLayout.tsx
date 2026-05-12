import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import {
  GraduationCap, Users, CalendarCheck, IndianRupee, Bell,
  BookOpen, TrendingUp, LayoutDashboard, User, LogOut,
  Menu, X, ChevronLeft, Search, Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Students', path: '/students', permission: 'students.view' },
  { icon: BookOpen, label: 'Batches', path: '/batches', permission: 'batches.view' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance', permission: 'attendance.view' },
  { icon: IndianRupee, label: 'Fees', path: '/fees', permission: 'fees.view' },
  { icon: TrendingUp, label: 'Reports', path: '/reports', permission: 'reports.view' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
];

const MY_ITEMS = [
  { icon: User, label: 'My Profile', path: '/my-profile' },
  { icon: CalendarCheck, label: 'My Attendance', path: '/my-attendance' },
  { icon: IndianRupee, label: 'My Salary', path: '/my-salary' },
];

export default function StaffLayout() {
  const { user, logout, hasPermission } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNav = NAV_ITEMS.filter(item => !item.permission || hasPermission(item.permission));

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans pb-16 lg:pb-0 lg:flex-row">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-60 bg-canvas border-r border-hairline transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-30 ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-hairline flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-brand-green" />
            </div>
            {(sidebarOpen || window.innerWidth < 1024) && (
              <div className="ml-3 overflow-hidden whitespace-nowrap">
                <h1 className="font-bold text-ink tracking-tight">VidyaPlus</h1>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest leading-none">Staff</p>
              </div>
            )}
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 rounded-lg hover:bg-surface-hover text-ink-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {/* Institute Section */}
            {(sidebarOpen || window.innerWidth < 1024) && (
              <p className="px-3 py-2 text-[9px] font-bold text-steel uppercase tracking-widest">Institute</p>
            )}
            {filteredNav.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
              return (
                <button
                  key={label}
                  onClick={() => { navigate(path); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                  className={`w-full flex items-center h-9 px-3 rounded-md text-sm font-medium transition-all group ${
                    isActive ? 'bg-surface text-brand-green' : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
                  }`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-green' : 'text-ink-muted group-hover:text-ink'}`} />
                  {(sidebarOpen || window.innerWidth < 1024) && <span className="ml-3 truncate">{label}</span>}
                </button>
              );
            })}

            {/* My Section */}
            {(sidebarOpen || window.innerWidth < 1024) && (
              <p className="px-3 py-2 mt-4 text-[9px] font-bold text-steel uppercase tracking-widest">Personal</p>
            )}
            {MY_ITEMS.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={label}
                  onClick={() => { navigate(path); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                  className={`w-full flex items-center h-9 px-3 rounded-md text-sm font-medium transition-all group ${
                    isActive ? 'bg-surface text-brand-green' : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
                  }`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-green' : 'text-ink-muted group-hover:text-ink'}`} />
                  {(sidebarOpen || window.innerWidth < 1024) && <span className="ml-3 truncate">{label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-hairline-soft space-y-1 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full hidden lg:flex items-center h-10 px-3 rounded-md text-sm font-medium text-steel hover:bg-surface transition-colors group"
            >
              <ChevronLeft className={`w-4 h-4 flex-shrink-0 text-steel transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
              {sidebarOpen && <span className="ml-3">Collapse</span>}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center h-10 px-3 rounded-md text-sm font-medium text-steel hover:bg-surface hover:text-brand-error transition-colors group"
            >
              <LogOut className="w-4 h-4 flex-shrink-0 text-steel group-hover:text-brand-error" />
              {(sidebarOpen || window.innerWidth < 1024) && <span className="ml-3">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-hairline px-4 sm:px-8 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface text-ink-muted">
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden">
              <h1 className="text-sm font-bold text-ink tracking-tight">VidyaPlus</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleDarkMode} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-steel hover:bg-surface transition-colors">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-3 pl-1">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-ink leading-tight truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[11px] font-semibold text-steel uppercase tracking-[0.5px] mt-0.5">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-md bg-surface border border-hairline flex items-center justify-center overflow-hidden flex-shrink-0">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-ink">{user?.name?.charAt(0)}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
