import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';
import {
  Users, BookOpen, CalendarCheck, IndianRupee,
  Loader2, ArrowRight, Clock
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, batches: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises: Promise<any>[] = [];

        if (hasPermission('students.view')) {
          promises.push(api.get('/students').then(r => ({ students: r.data.data?.length || 0 })));
        }
        if (hasPermission('batches.view')) {
          promises.push(api.get('/batches').then(r => ({ batches: r.data.data?.length || 0 })));
        }

        const results = await Promise.allSettled(promises);
        const merged: any = {};
        results.forEach(r => {
          if (r.status === 'fulfilled') Object.assign(merged, r.value);
        });
        setStats({ students: merged.students || 0, batches: merged.batches || 0 });
      } catch (err) {
        console.error('Dashboard load failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const roleLabel = user?.role === 'teacher' ? 'Teacher' : user?.role === 'accountant' ? 'Accountant' : 'Staff';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[11px] font-bold text-steel uppercase tracking-widest">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6 animate-fade-in">
      {/* Greeting */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green-deep text-[10px] font-bold uppercase tracking-widest">
          {roleLabel} Portal
        </div>
        <h1 className="text-3xl font-bold text-ink tracking-tight">
          {greeting()}, {user?.name?.split(' ')[0] || 'Team'}
        </h1>
        <p className="text-sm text-steel">
          {user?.instituteName ? `${user.instituteName} — ` : ''}Your operational overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {hasPermission('students.view') && (
          <div className="mint-card p-5 cursor-pointer active:scale-[0.98] transition-all" onClick={() => navigate('/students')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                <Users className="w-5 h-5 text-ink" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">Students</p>
            <h3 className="text-2xl font-black text-ink font-mono">{stats.students}</h3>
          </div>
        )}

        {hasPermission('batches.view') && (
          <div className="mint-card p-5 cursor-pointer active:scale-[0.98] transition-all" onClick={() => navigate('/batches')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-ink" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">Batches</p>
            <h3 className="text-2xl font-black text-ink font-mono">{stats.batches}</h3>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-ink">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {hasPermission('attendance.mark') && (
            <button onClick={() => navigate('/attendance')} className="mint-card p-4 flex flex-col items-center justify-center gap-3 group active:scale-95 transition-all">
              <div className="w-12 h-12 rounded-lg bg-brand-green-soft flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 h-6 text-brand-green-deep" />
              </div>
              <span className="text-xs font-bold text-ink">Mark Attendance</span>
            </button>
          )}
          {hasPermission('fees.collect') && (
            <button onClick={() => navigate('/fees')} className="mint-card p-4 flex flex-col items-center justify-center gap-3 group active:scale-95 transition-all">
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                <IndianRupee className="w-6 h-6 text-ink" />
              </div>
              <span className="text-xs font-bold text-ink">Collect Fee</span>
            </button>
          )}
          {hasPermission('students.view') && (
            <button onClick={() => navigate('/students')} className="mint-card p-4 flex flex-col items-center justify-center gap-3 group active:scale-95 transition-all">
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-ink" />
              </div>
              <span className="text-xs font-bold text-ink">View Students</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mint-card p-5 flex items-center gap-4">
        <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
          You're logged in as {roleLabel}. Contact your admin to change permissions.
        </span>
      </div>
    </div>
  );
}
