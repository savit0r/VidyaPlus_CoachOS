import { useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  IndianRupee,
  Bell,
  TrendingUp,
  Clock,
  AlertTriangle,
  LogOut,
  Settings,
  LayoutDashboard,
  BookOpen,
  UserCog,
} from 'lucide-react';

// Placeholder stat card
function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string;
  value: string;
  icon: any;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-card hover:shadow-elevated transition-shadow duration-300 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-900 text-white flex flex-col z-50">
        <div className="p-5 border-b border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm">CoachOS</h1>
              <p className="text-xs text-surface-400 truncate">{user?.instituteName || 'Dashboard'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: Users, label: 'Students' },
            { icon: BookOpen, label: 'Batches' },
            { icon: CalendarCheck, label: 'Attendance' },
            { icon: IndianRupee, label: 'Fees' },
            { icon: Bell, label: 'Notifications' },
            { icon: TrendingUp, label: 'Reports' },
            { icon: UserCog, label: 'Staff' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-red-400 hover:bg-surface-800 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Dashboard</h2>
              <p className="text-sm text-surface-500">
                Welcome back, <span className="font-medium text-surface-700">{user?.name || 'User'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-surface-100 transition-colors">
                <Bell className="w-5 h-5 text-surface-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
              </button>
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Students" value="0" icon={Users} color="bg-primary-600" subtitle="Active enrollments" />
            <StatCard title="Today's Attendance" value="—" icon={CalendarCheck} color="bg-accent-500" subtitle="No data yet" />
            <StatCard title="Fee Collection" value="₹0" icon={IndianRupee} color="bg-warn-500" subtitle="This month" />
            <StatCard title="Pending Dues" value="₹0" icon={AlertTriangle} color="bg-danger-500" subtitle="Overdue" />
          </div>

          {/* Quick Actions + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-surface-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: Users, label: 'Add Student', color: 'text-primary-600 bg-primary-50' },
                  { icon: BookOpen, label: 'Create Batch', color: 'text-accent-600 bg-accent-50' },
                  { icon: IndianRupee, label: 'Record Payment', color: 'text-warn-600 bg-warn-50' },
                  { icon: CalendarCheck, label: 'Mark Attendance', color: 'text-purple-600 bg-purple-50' },
                ].map(({ icon: Icon, label, color }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors text-left"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-sm font-medium text-surface-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming Classes */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-900">Upcoming Classes</h3>
                <span className="text-xs text-surface-400">Next 2 hours</span>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                <Clock className="w-10 h-10 mb-3 text-surface-300" />
                <p className="text-sm font-medium">No upcoming classes</p>
                <p className="text-xs mt-1">Create your first batch to get started</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
