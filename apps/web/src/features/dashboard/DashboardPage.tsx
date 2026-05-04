import {
  Users, CalendarCheck, IndianRupee, BookOpen,
  Clock, AlertTriangle,
} from 'lucide-react';

function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string; value: string; icon: any; color: string; subtitle?: string;
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
  return (
    <div className="animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Students" value="0" icon={Users} color="bg-primary-600" subtitle="Active enrollments" />
        <StatCard title="Today's Attendance" value="—" icon={CalendarCheck} color="bg-accent-500" subtitle="No data yet" />
        <StatCard title="Fee Collection" value="₹0" icon={IndianRupee} color="bg-warn-500" subtitle="This month" />
        <StatCard title="Pending Dues" value="₹0" icon={AlertTriangle} color="bg-danger-500" subtitle="Overdue" />
      </div>

      {/* Quick Actions + Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-surface-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: Users, label: 'Add Student', color: 'text-primary-600 bg-primary-50', path: '/students' },
              { icon: BookOpen, label: 'Create Batch', color: 'text-accent-600 bg-accent-50', path: '/batches' },
              { icon: IndianRupee, label: 'Record Payment', color: 'text-warn-600 bg-warn-50', path: '/fees' },
              { icon: CalendarCheck, label: 'Mark Attendance', color: 'text-purple-600 bg-purple-50', path: '/attendance' },
            ].map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="text-sm font-medium text-surface-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

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
  );
}
