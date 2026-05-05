import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';
import {
  Users, CalendarCheck, IndianRupee, BookOpen,
  AlertTriangle, ArrowRight, Loader2,
  UserPlus, ClipboardList, Receipt, TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 lg:space-y-10 pb-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
            {greeting()}, {user?.name?.split(' ')[0] || 'Rahul'} 👋
          </h2>
          <p className="text-slate-500 text-xs lg:text-sm mt-1">Snapshot of your institute's performance.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="btn-secondary hidden sm:flex"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid - 2x2 on small, 4-col on large */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {[
          {
            title: 'Students',
            value: stats.totalStudents,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: 'Active'
          },
          {
            title: 'Batches',
            value: stats.totalBatches,
            icon: BookOpen,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            trend: 'Running'
          },
          {
            title: 'Collected',
            value: `₹${(stats.totalCollected / 1000).toFixed(1)}k`,
            icon: IndianRupee,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: 'Revenue'
          },
          {
            title: 'Dues',
            value: `₹${(stats.totalOutstanding / 1000).toFixed(1)}k`,
            icon: AlertTriangle,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            trend: 'Pending',
            critical: true
          },
        ].map((stat) => (
          <div
            key={stat.title}
            className={`premium-card p-4 lg:p-6 flex flex-col group ${stat.critical ? 'hover:border-rose-200' : 'hover:border-primary-200'}`}
          >
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
            <div>
              <p className="text-[11px] lg:text-sm font-medium text-slate-500 mb-0.5 lg:mb-1">{stat.title}</p>
              <h3 className="text-lg lg:text-2xl font-bold text-slate-900">{stat.value}</h3>
              <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-wider mt-2 lg:mt-3 ${stat.critical ? 'text-rose-600' : 'text-slate-400'}`}>
                {stat.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - 2 Column Grid on Mobile */}
      <div className="space-y-4 lg:space-y-6">
        <h3 className="text-base lg:text-lg font-bold text-slate-900">Quick Command</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {[
            { icon: UserPlus, label: 'New Student', path: '/students', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: BookOpen, label: 'Batches', path: '/batches', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { icon: CalendarCheck, label: 'Attendance', path: '/attendance', color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: Receipt, label: 'Fees', path: '/fees', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(({ icon: Icon, label, path, color, bg }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="premium-card p-4 flex flex-col items-center justify-center gap-3 group text-center active:scale-95 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="block text-xs lg:text-sm font-bold text-slate-900">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Institute Health Overview */}
        <div className="lg:col-span-12 space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base lg:text-lg font-bold text-slate-900">Institute Health</h3>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs lg:text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors"
            >
              All Reports <TrendingUp className="w-4 h-4" />
            </button>
          </div>

          <div className="premium-card overflow-hidden">
            <div className="p-5 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
              <div className="space-y-5 lg:space-y-8">
                <div>
                  <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Academic Status</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-4xl font-black text-slate-900">{stats.totalStudents}</span>
                    <span className="text-xs lg:text-sm font-medium text-slate-500">Active Students</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full mt-3 lg:mt-4">
                    <div className="h-full bg-blue-500 rounded-full w-[85%]" />
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Live Batches</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-4xl font-black text-slate-900">{stats.totalBatches}</span>
                    <span className="text-xs lg:text-sm font-medium text-slate-500">Ongoing cohorts</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 lg:space-y-8">
                <div className="p-4 lg:p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 lg:mb-4">Revenue Health</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm lg:text-lg font-bold text-emerald-600">₹{stats.totalCollected.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">Collected</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm lg:text-lg font-bold text-rose-500">₹{stats.totalOutstanding.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">Pending</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[11px] font-bold uppercase tracking-wider">Cloud Systems Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
