import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import {
  Building2, CreditCard, Settings, Users, TrendingUp, AlertTriangle, Activity,
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
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/super-admin/kpis').then(({ data }) => setKpiData(data.data)).catch(console.error);
    api.get('/super-admin/institutes', { params: { page: 1, limit: 5 } })
      .then(({ data }) => setRecentInstitutes(data.data))
      .catch(console.error);
  }, []);

  const kpis = kpiData ? [
    { label: 'Active Institutes', value: kpiData.activeInstitutes.toString(), icon: Building2, color: '#6366f1', trend: `${kpiData.totalInstitutes} total` },
    { label: 'Total Users', value: kpiData.totalUsers.toString(), icon: Users, color: '#10b981', trend: `${kpiData.totalStudents} students` },
    { label: 'Platform Health', value: '100%', icon: Activity, color: '#22c55e', trend: 'All systems operational' },
    { label: 'Suspended', value: kpiData.suspendedInstitutes.toString(), icon: AlertTriangle, color: kpiData.suspendedInstitutes > 0 ? '#f59e0b' : '#22c55e', trend: kpiData.suspendedInstitutes === 0 ? 'No alerts' : 'Needs attention' },
  ] : [];

  return (
    <div className="animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiData ? kpis.map((kpi) => (
          <div key={kpi.label} className="glass-card rounded-2xl p-5 hover:shadow-glow transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.color + '15' }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <TrendingUp className="w-4 h-4 text-accent-500" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{kpi.value}</p>
            <p className="text-sm text-surface-400">{kpi.label}</p>
            <p className="text-xs text-surface-500 mt-1">{kpi.trend}</p>
          </div>
        )) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-surface-700/30 mb-3 animate-pulse" />
              <div className="h-7 w-16 bg-surface-700/30 rounded mb-2 animate-pulse" />
              <div className="h-4 w-24 bg-surface-700/30 rounded animate-pulse" />
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => navigate('/institutes')} className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/50 border border-surface-700/30 hover:border-admin-500/30 hover:bg-admin-600/10 transition-all group">
            <Building2 className="w-5 h-5 text-admin-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-sm font-medium text-white">Manage Institutes</p>
              <p className="text-xs text-surface-500">Create and manage coaching centers</p>
            </div>
          </button>
          <button onClick={() => navigate('/plans')} className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/50 border border-surface-700/30 hover:border-accent-500/30 hover:bg-accent-600/10 transition-all group">
            <CreditCard className="w-5 h-5 text-accent-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-sm font-medium text-white">Manage Plans</p>
              <p className="text-xs text-surface-500">Configure subscription tiers</p>
            </div>
          </button>
          <button onClick={() => navigate('/settings')} className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/50 border border-surface-700/30 hover:border-warn-500/30 hover:bg-warn-600/10 transition-all group">
            <Settings className="w-5 h-5 text-warn-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-sm font-medium text-white">Platform Settings</p>
              <p className="text-xs text-surface-500">Global configuration</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Institutes */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Institutes</h2>
          <button onClick={() => navigate('/institutes')} className="text-xs text-admin-400 hover:text-admin-300 transition-colors">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/30">
                {['Institute', 'Plan', 'Status', 'Owner'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-surface-400 uppercase tracking-wider pb-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentInstitutes.map((inst: any) => (
                <tr key={inst.id} className="border-b border-surface-800/30 hover:bg-surface-800/30 transition-colors cursor-pointer" onClick={() => navigate(`/institutes/${inst.id}`)}>
                  <td className="py-3">
                    <p className="text-sm font-medium text-white">{inst.name}</p>
                    <p className="text-xs text-surface-500">{inst.subdomain}.coachos.in</p>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-admin-600/20 text-admin-300">
                      {inst.plan?.name || 'No plan'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${inst.status === 'active' ? 'text-accent-400' : 'text-warn-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${inst.status === 'active' ? 'bg-accent-500' : 'bg-warn-500'}`} />
                      {inst.status.charAt(0).toUpperCase() + inst.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-surface-300">{inst.owner?.name || '—'}</td>
                </tr>
              ))}
              {recentInstitutes.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-surface-500 text-sm">No institutes yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
