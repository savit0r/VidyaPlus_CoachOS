import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';
import {
  Users, CalendarCheck, IndianRupee, BookOpen,
  AlertTriangle, ArrowRight, Loader2,
  UserPlus, ClipboardList, Receipt, TrendingUp,
  Clock, CheckCircle2, History, CreditCard, Bell
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
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

// ============================================
// Student Specialized Dashboard
// ============================================
function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [attendanceRes, feeRes] = await Promise.all([
          api.get('/attendance/my-summary'),
          api.get('/fees/my-ledger')
        ]);
        setData({
          attendance: attendanceRes.data.data,
          fees: feeRes.data.data
        });
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const attendanceRate = data?.attendance?.summary?.attendanceRate || 0;
  const pendingFees = data?.fees?.summary?.balance || 0;

  return (
    <div className="space-y-6 lg:space-y-10 pb-6 animate-fade-in">
      {/* Student Greeting */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Your Academic Overview 📚</h2>
        <p className="text-slate-500 text-xs lg:text-sm">Track your progress and upcoming dues.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Attendance KPI */}
        <div className="premium-card p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between relative">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 shadow-sm">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance Rate</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{attendanceRate}%</h3>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-1000 ${attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-orange-500'}`}
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 italic">
            {attendanceRate >= 75 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
            {attendanceRate >= 75 ? 'Excellent attendance!' : 'Needs improvement'}
          </p>
        </div>

        {/* Fee Status KPI */}
        <div className="premium-card p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
           <div className="flex items-center justify-between relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Balance</p>
              <h3 className={`text-2xl font-black mt-1 ${pendingFees > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹{pendingFees.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <button 
            onClick={() => navigate('/fees')}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              pendingFees > 0 ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            {pendingFees > 0 ? 'Clear Dues Now' : 'Fee History'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Next Batch / Activity */}
        <div className="premium-card p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
           <div className="flex items-center justify-between relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 shadow-sm">
              <Bell className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Batches</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.attendance?.byBatch?.length || 0}</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
             {data?.attendance?.byBatch?.map((b: any) => (
                <span key={b.batchName} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {b.batchName}
                </span>
             ))}
          </div>
        </div>
      </div>

      {/* Recent History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center justify-between px-1">
             <h3 className="text-lg font-bold text-slate-900">Recent Attendance</h3>
             <button className="text-xs font-bold text-primary-600 flex items-center gap-1">Full Report <History className="w-3.5 h-3.5" /></button>
           </div>
           
           <div className="premium-card overflow-hidden">
             <div className="divide-y divide-slate-100">
               {data?.attendance?.recentRecords?.length > 0 ? data.attendance.recentRecords.slice(0, 5).map((rec: any, idx: number) => (
                 <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                       rec.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                     }`}>
                       <Clock className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-900">{rec.batchName}</p>
                       <p className="text-[11px] text-slate-500 font-medium mt-0.5">{new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                     </div>
                   </div>
                   <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                     rec.status === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                   }`}>
                     {rec.status}
                   </span>
                 </div>
               )) : (
                 <div className="p-10 text-center text-slate-500 font-medium italic">No attendance records yet</div>
               )}
             </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <h3 className="text-lg font-bold text-slate-900 px-1">Quick Links</h3>
           <div className="grid grid-cols-1 gap-4">
              <button className="premium-card p-5 flex items-center justify-between hover:border-primary-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                  <span className="text-sm font-bold text-slate-900">Study Materials</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500" />
              </button>
              <button className="premium-card p-5 flex items-center justify-between hover:border-primary-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><Bell className="w-5 h-5" /></div>
                  <span className="text-sm font-bold text-slate-900">Notifications</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
