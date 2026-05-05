import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  ArrowLeft, Building2, Users, BookOpen, CreditCard, Settings,
  Mail, Phone, MapPin, Calendar, Shield, Loader2, AlertTriangle,
  CheckCircle2, XCircle, Pencil, Trash2, UserCheck, Zap, UserPlus, TrendingUp,
} from 'lucide-react';

interface InstituteDetail {
  id: string; name: string; subdomain: string; phone: string; email: string | null;
  address: string | null; logoUrl: string | null; status: string; academicYear: string | null;
  setupCompleted: boolean; createdAt: string; updatedAt: string;
  plan: { id: string; name: string; maxStudents: number; maxStaff: number; maxStorageMb: number; priceMonthly: string } | null;
  _count: { users: number; batches: number; studentProfiles: number; feePlans: number };
  users: { id: string; name: string; phone: string; email: string | null; role: string; status: string; lastLoginAt: string | null; createdAt: string }[];
  breakdown?: { roles: Record<string, number> };
}

const STATUS_ACTIONS: Record<string, { label: string; to: string; color: string }> = {
  active: { label: 'Suspend', to: 'suspended', color: 'bg-warn-500/10 text-warn-400 hover:bg-warn-500/20' },
  suspended: { label: 'Reactivate', to: 'active', color: 'bg-accent-500/10 text-accent-400 hover:bg-accent-500/20' },
  inactive: { label: 'Reactivate', to: 'active', color: 'bg-accent-500/10 text-accent-400 hover:bg-accent-500/20' },
};

const ROLE_BADGES: Record<string, string> = {
  owner: 'bg-indigo-500/20 text-indigo-300',
  teacher: 'bg-emerald-500/15 text-emerald-400',
  accountant: 'bg-amber-500/15 text-amber-400',
  staff: 'bg-slate-600/30 text-slate-300',
  student: 'bg-slate-700/30 text-slate-400',
  parent: 'bg-slate-700/30 text-slate-400',
};

export default function InstituteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState<InstituteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'payments'>('overview');
  const [logs, setLogs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/super-admin/institutes/${id}`)
      .then(({ data }) => setInstitute(data.data))
      .catch(() => navigate('/institutes'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab === 'audit' && logs.length === 0) {
      setLogsLoading(true);
      api.get(`/super-admin/institutes/${id}/audit-logs`)
        .then(({ data }) => setLogs(data.data))
        .finally(() => setLogsLoading(false));
    }
    if (activeTab === 'payments' && payments.length === 0) {
      api.get(`/super-admin/institutes/${id}/payments`)
        .then(({ data }) => setPayments(data.data));
    }
  }, [activeTab, id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!institute) return;
    setUpdating(true);
    try {
      await api.patch(`/super-admin/institutes/${institute.id}`, { status: newStatus });
      setInstitute(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleImpersonate = async (ownerId: string) => {
    try {
      const { data } = await api.post(`/super-admin/impersonate/${ownerId}`);
      const { accessToken, user } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.open('http://localhost:5173/dashboard', '_blank');
    } catch (err) {
      alert('Impersonation failed. Make sure the institute has an active owner.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-admin-400 animate-spin" />
      </div>
    );
  }

  if (!institute) return null;

  const statusAction = STATUS_ACTIONS[institute.status];
  const owner = institute.users.find(u => u.role === 'owner');
  const staffMembers = institute.users.filter(u => u.role !== 'student' && u.role !== 'parent');

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate('/institutes')} className="flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Institutes
      </button>

      {/* Header Card */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-2xl font-black shadow-inner">
              {institute.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tight">{institute.name}</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  institute.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${institute.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {institute.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1">{institute.subdomain}.coachos.in</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             {owner && (
               <button
                 onClick={() => handleImpersonate(owner.id)}
                 className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
               >
                 <Zap className="w-3.5 h-3.5" /> Impersonate Owner
               </button>
             )}
             {statusAction && (
               <button
                 onClick={() => handleStatusChange(statusAction.to)}
                 disabled={updating}
                 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/5 ${statusAction.color}`}
               >
                 {updating ? 'Processing...' : statusAction.label}
               </button>
             )}
             <button className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white border border-white/5">
                <Settings className="w-4 h-4" />
             </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
           {[
             { icon: Phone, label: 'Support Phone', value: institute.phone },
             { icon: Mail, label: 'Billing Email', value: institute.email || '—' },
             { icon: MapPin, label: 'Location', value: institute.address || 'Global' },
             { icon: Calendar, label: 'Academic Year', value: institute.academicYear || '—' },
           ].map((item, i) => (
             <div key={i} className="flex flex-col gap-1">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                 <item.icon className="w-3 h-3" /> {item.label}
               </span>
               <span className="text-xs font-bold text-slate-300">{item.value}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl w-fit border border-white/5">
        {[
          { key: 'overview', label: 'Overview', icon: Building2 },
          { key: 'users', label: 'User Directory', icon: Users },
          { key: 'audit', label: 'Audit Logs', icon: Shield },
          { key: 'payments', label: 'Platform Fees', icon: CreditCard },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* KPI Section */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Total Users', value: institute._count.users, icon: Users, color: 'indigo' },
                 { label: 'Total Students', value: institute._count.studentProfiles, icon: UserPlus, color: 'emerald' },
                 { label: 'Active Batches', value: institute._count.batches, icon: BookOpen, color: 'amber' },
                 { label: 'Revenue Generated', value: `₹${(institute._count.feePlans * 1500).toLocaleString()}`, icon: TrendingUp, color: 'rose' },
               ].map((stat, idx) => (
                 <div key={idx} className="glass-card p-5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 mb-4 group-hover:scale-110 transition-transform`}>
                       <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                 </div>
               ))}

               {/* Role Breakdown Chart (Simplified) */}
               <div className="col-span-full glass-card p-6 rounded-2xl border border-white/5 mt-2">
                  <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                     <Users className="w-4 h-4 text-indigo-400" /> User Distribution
                  </h3>
                  <div className="space-y-4">
                     {Object.entries(institute.breakdown?.roles || {}).map(([role, count]) => {
                        const total = institute.users.length || 1;
                        const percent = Math.round((count / total) * 100);
                        return (
                          <div key={role} className="space-y-1.5">
                             <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                                <span className="uppercase tracking-wider">{role.replace('_', ' ')}</span>
                                <span>{count} ({percent}%)</span>
                             </div>
                             <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${percent}%` }} />
                             </div>
                          </div>
                        );
                     })}
                  </div>
               </div>
            </div>

            {/* Plan and Owner Detail */}
            <div className="lg:col-span-4 space-y-6">
               <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-white uppercase tracking-widest">Platform Plan</h3>
                     <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400"><CreditCard className="w-4 h-4" /></span>
                  </div>
                  {institute.plan ? (
                    <div className="space-y-5">
                       <div>
                          <p className="text-xl font-black text-white">{institute.plan.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">₹{Number(institute.plan.priceMonthly).toLocaleString()}/month</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Students</p>
                             <p className="text-sm font-bold text-slate-200">{institute.plan.maxStudents}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Staff</p>
                             <p className="text-sm font-bold text-slate-200">{institute.plan.maxStaff}</p>
                          </div>
                       </div>
                       <button className="w-full py-2.5 rounded-xl border border-indigo-500/20 text-indigo-400 text-xs font-bold hover:bg-indigo-500/10 transition-all">
                          Upgrade Plan
                       </button>
                    </div>
                  ) : <p className="text-sm text-slate-600 italic">No plan assigned</p>}
               </div>

               {owner && (
                 <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Account Owner</h3>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-white/5">
                          {owner.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">{owner.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{owner.phone}</p>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    {['Staff Member', 'Role', 'Status', 'Last Activity', ''].map(h => (
                      <th key={h} className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staffMembers.map(user => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{user.name}</p>
                            <p className="text-[11px] text-slate-500">{user.email || user.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${ROLE_BADGES[user.role] || ROLE_BADGES.staff}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${user.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {user.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-1.5 rounded-lg text-slate-600 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
             <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Recent Tenant Actions</h3>
                {logsLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
             </div>
             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                         <th className="px-6 py-4 text-left">Action</th>
                         <th className="px-6 py-4 text-left">User</th>
                         <th className="px-6 py-4 text-left">Time</th>
                         <th className="px-6 py-4 text-left">Entity</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {logs.map((log, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                           <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-200">{log.action.replace('.', ' ')}</span>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-[11px] font-bold text-indigo-400">{log.user.name}</p>
                              <p className="text-[9px] text-slate-600 uppercase tracking-tighter">{log.user.role}</p>
                           </td>
                           <td className="px-6 py-4 text-xs text-slate-500">
                              {new Date(log.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                           </td>
                           <td className="px-6 py-4 text-[10px] font-medium text-slate-500 italic">
                              {log.entityType} ID: ...{log.entityId?.slice(-6)}
                           </td>
                        </tr>
                      ))}
                      {logs.length === 0 && !logsLoading && (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-600 text-sm">No activity recorded for this tenant</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'payments' && (
           <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="px-6 py-4 text-left">Period</th>
                          <th className="px-6 py-4 text-left">Plan</th>
                          <th className="px-6 py-4 text-left">Amount</th>
                          <th className="px-6 py-4 text-left">Mode</th>
                          <th className="px-6 py-4 text-left">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {payments.map((p, i) => (
                         <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-200">{p.feeRecord?.periodLabel || 'System'}</td>
                            <td className="px-6 py-4 text-xs font-medium text-slate-400">{p.feeRecord?.feePlan?.name || 'Subscription'}</td>
                            <td className="px-6 py-4 text-sm font-black text-white">₹{Number(p.amount).toLocaleString()}</td>
                            <td className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.paymentMode}</td>
                            <td className="px-6 py-4">
                               <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                  {p.status}
                               </span>
                            </td>
                         </tr>
                       ))}
                       {payments.length === 0 && (
                         <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-600 text-sm">No platform payments found</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
