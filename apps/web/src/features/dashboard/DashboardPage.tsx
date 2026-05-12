import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';
import {
  Users, CalendarCheck, IndianRupee, BookOpen,
  AlertTriangle, ArrowRight, Loader2,
  UserPlus, ClipboardList, Receipt, TrendingUp,
  Clock, CheckCircle2, History, CreditCard, Bell, 
  Settings, Image
} from 'lucide-react';
import SetupWizard from './components/SetupChecklist';

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
  const [institute, setInstitute] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [studentsRes, batchesRes, feesRes, settingsRes] = await Promise.all([
        api.get('/students'),
        api.get('/batches'),
        api.get('/fees/dashboard'),
        api.get('/settings/profile'),
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
      setInstitute(settingsRes.data.data);
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
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
          <p className="text-sm font-medium text-steel">Loading dashboard...</p>
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
    <div className="space-y-6 lg:space-y-10 pb-6 -mt-4 sm:-mt-6 lg:-mt-8">
      {/* Cinematic Atmospheric Hero */}
      <div className="hero-backdrop -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10 lg:py-16 border-b border-hairline relative mb-10">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-5xl font-extrabold text-ink tracking-tight animate-fade-in">
                {greeting()}, {user?.name?.split(' ')[0] || 'Rahul'}
              </h1>
              <p className="text-steel text-sm lg:text-base max-w-lg">
                A dense snapshot of academy performance, fee movement, and active operations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchDashboardData}
                className="mint-btn-secondary"
              >
                Refresh Data
              </button>
              <button 
                onClick={() => navigate('/reports')}
                className="mint-btn-brand"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto space-y-10">
        
        {/* Onboarding Wizard */}
        <SetupWizard stats={stats} institute={institute} onRefresh={fetchDashboardData} />

      {/* Stats Grid - 2x2 on small, 4-col on large */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {[
          {
            title: 'TOTAL STUDENTS',
            value: stats.totalStudents,
            icon: Users,
            color: 'text-ink',
            bg: 'bg-surface',
            trend: 'Currently Enrolled'
          },
          {
            title: 'ACTIVE BATCHES',
            value: stats.totalBatches,
            icon: BookOpen,
            color: 'text-ink',
            bg: 'bg-surface',
            trend: 'Ongoing Cohorts'
          },
          {
            title: 'REVENUE COLLECTED',
            value: `₹${(stats.totalCollected / 1000).toFixed(1)}k`,
            icon: IndianRupee,
            color: 'text-ink',
            bg: 'bg-brand-green-soft',
            trend: 'Last 30 Days'
          },
          {
            title: 'OUTSTANDING DUES',
            value: `₹${(stats.totalOutstanding / 1000).toFixed(1)}k`,
            icon: AlertTriangle,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            trend: 'Action Required',
            critical: true
          },
        ].map((stat) => (
          <div
            key={stat.title}
            className={`mint-card p-5 lg:p-6 flex flex-col group transition-all duration-300 ${stat.critical ? 'hover:border-rose-200' : 'hover:border-brand-green/30'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="h-6 px-2 flex items-center rounded-md bg-surface text-[10px] font-bold text-ink-muted border border-hairline uppercase tracking-widest">
                Real-time
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-2xl lg:text-3xl font-black text-ink font-mono tracking-tight">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-3">
                <div className={`w-1 h-1 rounded-full ${stat.critical ? 'bg-rose-500 animate-pulse' : 'bg-brand-green'}`} />
                <p className={`text-[10px] font-bold uppercase tracking-wider ${stat.critical ? 'text-rose-600' : 'text-ink-muted'}`}>
                  {stat.trend}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - 2 Column Grid on Mobile */}
      <div className="space-y-4 lg:space-y-6">
        <h3 className="text-base lg:text-lg font-semibold text-ink">Quick Command</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {[
            { icon: UserPlus, label: 'New Student', path: '/students', color: 'text-ink', bg: 'bg-brand-green-soft' },
            { icon: BookOpen, label: 'Batches', path: '/batches', color: 'text-ink', bg: 'bg-surface' },
            { icon: CalendarCheck, label: 'Attendance', path: '/attendance', color: 'text-ink', bg: 'bg-surface' },
            { icon: Receipt, label: 'Fees', path: '/fees', color: 'text-ink', bg: 'bg-brand-green-soft' },
          ].map(({ icon: Icon, label, path, color, bg }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="mint-card p-4 flex flex-col items-center justify-center gap-3 group text-center active:scale-95 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="block text-xs lg:text-sm font-bold text-ink">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Institute Health Overview */}
        <div className="lg:col-span-12 space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base lg:text-lg font-semibold text-ink">Institute Health</h3>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs lg:text-sm font-medium text-ink hover:underline flex items-center gap-1.5 transition-colors"
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
                    <span className="text-2xl lg:text-4xl font-black text-ink font-mono tracking-tight">{stats.totalStudents}</span>
                    <span className="text-xs lg:text-sm font-bold text-ink-muted">Active Students</span>
                  </div>
                  <div className="w-full h-2 bg-surface rounded-full mt-3 lg:mt-4 overflow-hidden">
                    <div className="h-full bg-brand-green rounded-full w-[85%] shadow-[0_0_10px_rgba(0,212,164,0.4)]" />
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] lg:text-xs font-bold text-ink-muted uppercase tracking-widest mb-1.5">Live Batches</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-4xl font-black text-ink font-mono tracking-tight">{stats.totalBatches}</span>
                    <span className="text-xs lg:text-sm font-bold text-ink-muted">Ongoing cohorts</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 lg:space-y-8">
                <div className="p-4 lg:p-6 rounded-2xl bg-surface border border-hairline">
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-3 lg:mb-4">Revenue Health</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm lg:text-lg font-semibold text-ink font-mono">₹{stats.totalCollected.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-ink-muted font-bold uppercase mt-0.5 opacity-60">Collected</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm lg:text-lg font-bold text-rose-500 font-mono">₹{stats.totalOutstanding.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-ink-muted font-bold uppercase mt-0.5 opacity-60">Pending</p>
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
  </div>
  );
}

