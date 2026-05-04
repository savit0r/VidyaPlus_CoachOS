import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  Users, CalendarCheck, IndianRupee, BookOpen,
  Clock, AlertTriangle, ArrowRight, Loader2, Plus, Sparkles
} from 'lucide-react';

function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string; value: string | number; icon: any; color: string; subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-100 hover:shadow-card transition-all duration-300 animate-fade-in flex items-center justify-between">
      <div>
        <p className="text-sm text-surface-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBatches: 0,
    totalCollected: 0,
    totalOutstanding: 0,
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [studentsRes, batchesRes, feesRes] = await Promise.all([
        api.get('/students'),
        api.get('/batches'),
        api.get('/fees/dashboard'),
      ]);

      const stds = studentsRes.data.data?.length || 0;
      const bchs = batchesRes.data.data?.length || 0;
      const collected = feesRes.data.data?.kpis?.totalCollected || 0;
      const outstanding = feesRes.data.data?.kpis?.totalOutstanding || 0;

      setStats({
        totalStudents: stds,
        totalBatches: bchs,
        totalCollected: collected,
        totalOutstanding: outstanding,
      });
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-6 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl text-white shadow-lg overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 -rotate-12" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">Good Day, Operational Hub</h2>
        <p className="text-sm text-indigo-100 mt-1.5 max-w-md">Manage your institute seamlessly with live enrollment tracking and collected fee analytics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="bg-primary-600" subtitle="Enrolled profiles" />
        <StatCard title="Total Batches" value={stats.totalBatches} icon={BookOpen} color="bg-indigo-600" subtitle="Academic cohorts" />
        <StatCard title="Collected Fees" value={`₹${stats.totalCollected.toLocaleString()}`} icon={IndianRupee} color="bg-accent-600" subtitle="Payments received" />
        <StatCard title="Pending Dues" value={`₹${stats.totalOutstanding.toLocaleString()}`} icon={AlertTriangle} color="bg-danger-600" subtitle="Awaiting payout" />
      </div>

      {/* Grid: Actions and Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
          <h3 className="font-bold text-surface-900 mb-5 flex items-center justify-between">
            <span>Quick Actions</span>
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
          </h3>
          <div className="space-y-3">
            {[
              { icon: Users, label: 'Manage Students', color: 'text-primary-600 bg-primary-50', path: '/students' },
              { icon: BookOpen, label: 'Manage Batches', color: 'text-indigo-600 bg-indigo-50', path: '/batches' },
              { icon: CalendarCheck, label: 'Mark Attendance', color: 'text-purple-600 bg-purple-50', path: '/attendance' },
              { icon: IndianRupee, label: 'Fees Management', color: 'text-accent-600 bg-accent-50', path: '/fees' },
            ].map(({ icon: Icon, label, color, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="w-full flex items-center justify-between p-3.5 bg-surface-50/50 hover:bg-surface-50 border border-surface-100 rounded-xl transition-all group hover:border-surface-200 text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-surface-700">{label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Class Status or Recent Enrollees */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-surface-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-surface-900">Institute Summary</h3>
              <button onClick={() => navigate('/reports')} className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
                View Reports <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-50/60 border border-surface-100 rounded-2xl flex items-start justify-between">
                <div>
                  <p className="text-xs text-surface-500 font-medium">Enrolled Students</p>
                  <p className="text-lg font-bold text-surface-800 mt-0.5">{stats.totalStudents} Active</p>
                </div>
                <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="p-4 bg-surface-50/60 border border-surface-100 rounded-2xl flex items-start justify-between">
                <div>
                  <p className="text-xs text-surface-500 font-medium">Ongoing Batches</p>
                  <p className="text-lg font-bold text-surface-800 mt-0.5">{stats.totalBatches} Cohorts</p>
                </div>
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-surface-100 flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-accent-500 rounded-full inline-block animate-pulse" /> Live server connection
            </span>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">Operational Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
