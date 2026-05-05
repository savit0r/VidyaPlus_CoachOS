import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  Building2, CreditCard, Settings, Users, AlertTriangle, Activity,
  ChevronRight, ArrowUpRight, Globe, Zap
} from 'lucide-react';

interface KpiData {
  totalInstitutes: number;
  activeInstitutes: number;
  suspendedInstitutes: number;
  totalUsers: number;
  totalStudents: number;
  expiringPlans: number;
}

export default function AdminDashboardPage() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [recentInstitutes, setRecentInstitutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kpiRes, instRes] = await Promise.all([
          api.get('/super-admin/kpis'),
          api.get('/super-admin/institutes', { params: { page: 1, limit: 5 } })
        ]);
        setKpiData(kpiRes.data.data);
        setRecentInstitutes(instRes.data.data || []);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpis = kpiData ? [
    { 
      label: 'Active Institutes', 
      value: (kpiData.activeInstitutes ?? 0).toLocaleString(), 
      icon: Building2, 
      color: 'indigo', 
      trend: `${kpiData.totalInstitutes ?? 0} total` 
    },
    { 
      label: 'Total Users', 
      value: (kpiData.totalUsers ?? 0).toLocaleString(), 
      icon: Users, 
      color: 'emerald', 
      trend: `${kpiData.totalStudents ?? 0} students` 
    },
    { 
      label: 'Platform Health', 
      value: '100%', 
      icon: Activity, 
      color: 'blue', 
      trend: 'All systems operational' 
    },
    { 
      label: 'Suspended', 
      value: (kpiData.suspendedInstitutes ?? 0).toString(), 
      icon: AlertTriangle, 
      color: (kpiData.suspendedInstitutes ?? 0) > 0 ? 'orange' : 'emerald', 
      trend: (kpiData.suspendedInstitutes ?? 0) === 0 ? 'No alerts' : 'Needs attention' 
    },
  ] : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Command</h1>
          <p className="text-sm text-slate-500 mt-1">Global oversight and infrastructure management.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-2">
             <span className="w-2 h-2 bg-emerald-500 rounded-full" />
             <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Live View</span>
           </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {!loading && kpiData ? kpis.map((kpi) => (
          <div key={kpi.label} className="premium-card p-6 group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${
                kpi.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                kpi.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                kpi.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                'bg-orange-50 text-orange-600'
              }`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{kpi.value}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-semibold text-slate-500">{kpi.trend}</p>
              </div>
            </div>
          </div>
        )) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="premium-card p-6 h-40 animate-pulse">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
              <div className="h-8 w-20 bg-slate-100 rounded mb-2" />
              <div className="h-4 w-32 bg-slate-50 rounded" />
            </div>
          ))
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Institutes Table */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                 <Building2 className="w-5 h-5 text-primary-600" /> Recent Institute Onboarding
              </h2>
              <button onClick={() => navigate('/institutes')} className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">
                View All Registry →
              </button>
           </div>
           <div className="premium-card overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institute</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tier</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ownership</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {!loading && recentInstitutes.map((inst: any) => (
                     <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => navigate(`/institutes/${inst.id}`)}>
                       <td className="px-6 py-4">
                         <div>
                           <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{inst.name}</p>
                           <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                             <Globe className="w-3 h-3" /> {inst.subdomain}.vidyaplus.in
                           </p>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                           {inst.plan?.name || 'Trial'}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              inst.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${inst.status === 'active' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                              {inst.status}
                            </span>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-700">{inst.owner?.name || '—'}</p>
                       </td>
                     </tr>
                   ))}
                   {!loading && recentInstitutes.length === 0 && (
                     <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm italic font-medium">No active registrations found</td></tr>
                   )}
                   {loading && Array.from({ length: 3 }).map((_, i) => (
                     <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-6 py-4"><div className="h-10 bg-slate-50 rounded" /></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
           <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-600" /> Platform Shortcuts
           </h2>
           <div className="space-y-3">
              <button onClick={() => navigate('/institutes')} className="w-full flex items-center gap-4 p-4 premium-card hover:bg-slate-50 text-left transition-all group">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Manage Institutes</p>
                  <p className="text-[11px] text-slate-500 font-medium">Provision and audit accounts</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />
              </button>
              
              <button onClick={() => navigate('/plans')} className="w-full flex items-center gap-4 p-4 premium-card hover:bg-slate-50 text-left transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Subscription Tiers</p>
                  <p className="text-[11px] text-slate-500 font-medium">Configure feature sets & pricing</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />
              </button>

              <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-4 p-4 premium-card hover:bg-slate-50 text-left transition-all group">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Platform Settings</p>
                  <p className="text-[11px] text-slate-500 font-medium">Global config and security</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />
              </button>
           </div>

           {/* Platform Status Card */}
           <div className="bg-primary-600 rounded-2xl p-6 text-white shadow-xl shadow-primary-600/20">
              <div className="flex items-center gap-3 mb-4">
                 <Shield className="w-6 h-6 text-primary-200" />
                 <p className="font-bold tracking-tight">Security Protocol</p>
              </div>
              <p className="text-xs text-primary-100 leading-relaxed mb-4">
                You are operating within the global admin console. All actions are logged for audit purposes.
              </p>
              <div className="h-1 w-full bg-primary-500 rounded-full overflow-hidden">
                <div className="h-full w-full bg-white animate-[pulse_2s_infinite]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
