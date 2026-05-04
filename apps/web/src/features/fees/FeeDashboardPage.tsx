import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Wallet, TrendingUp, AlertCircle, FileText, ChevronRight,
  Loader2, DollarSign, RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeeKPIs {
  totalDues: number;
  totalCollected: number;
  totalOutstanding: number;
  totalOverdueAmount: number;
  overdueRecordsCount: number;
}

interface OverdueRecord {
  id: string;
  studentId: string;
  studentName: string;
  planName: string;
  dueDate: string;
  periodLabel: string;
  amount: number;
  balance: number;
}

export default function FeeDashboardPage() {
  const [kpis, setKpis] = useState<FeeKPIs | null>(null);
  const [overdueList, setOverdueList] = useState<OverdueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/fees/dashboard');
      setKpis(data.data.kpis);
      setOverdueList(data.data.overdueList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleGenerateDues = async () => {
    if (!confirm('Generate fee dues for the current month? This will process all active enrollments.')) return;
    setGenerating(true);
    try {
      const d = new Date();
      const res = await api.post('/fees/dues/generate', { month: d.getMonth() + 1, year: d.getFullYear() });
      alert(`Dues generated: ${res.data.data.createdCount} created, ${res.data.data.skippedCount} skipped.`);
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate dues');
    } finally {
      setGenerating(false);
    }
  };

  if (loading && !kpis) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Fee Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">Track collections and overdue payments</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleGenerateDues} disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Generate Monthly Dues
          </button>
        </div>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Collections', value: `₹${kpis.totalCollected.toLocaleString()}`, icon: Wallet, color: 'text-accent-600', bg: 'bg-accent-50' },
            { label: 'Total Outstanding', value: `₹${kpis.totalOutstanding.toLocaleString()}`, icon: TrendingUp, color: 'text-warn-600', bg: 'bg-warn-50' },
            { label: 'Overdue Amount', value: `₹${kpis.totalOverdueAmount.toLocaleString()}`, icon: AlertCircle, color: 'text-danger-600', bg: 'bg-danger-50' },
            { label: 'Total Expected', value: `₹${kpis.totalDues.toLocaleString()}`, icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-card border border-surface-100 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-500 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-surface-900">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overdue List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-danger-600 font-semibold">
                <AlertCircle className="w-5 h-5" />
                <h3>Overdue Payments</h3>
              </div>
              <span className="text-sm text-surface-500">{kpis?.overdueRecordsCount} records</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-100 text-xs uppercase tracking-wider text-surface-500 font-medium">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Fee Plan</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {overdueList.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-surface-500">No overdue payments! 🎉</td></tr>
                  ) : (
                    overdueList.map((record) => (
                      <tr key={record.id} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-surface-900">{record.studentName}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-surface-600">
                          {record.planName}
                          <span className="block text-xs text-surface-400">{record.periodLabel}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-danger-600 font-medium">
                          {new Date(record.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-surface-900 text-right">
                          ₹{record.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => navigate(`/fees/student/${record.studentId}`)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View Ledger">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-6">
            <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/students')}
                className="w-full text-left px-4 py-3 rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                <p className="font-medium text-surface-900 group-hover:text-primary-700">Find Student Ledger</p>
                <p className="text-xs text-surface-500 mt-1">Search student to collect fee</p>
              </button>
              <button onClick={() => navigate('/fees/plans')}
                className="w-full text-left px-4 py-3 rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                <p className="font-medium text-surface-900 group-hover:text-primary-700">Manage Fee Plans</p>
                <p className="text-xs text-surface-500 mt-1">Create or edit fee structures</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
