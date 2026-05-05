import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  Plus, X, IndianRupee, Users, Calendar, AlertTriangle,
  CheckCircle2, Loader2, Pencil,
} from 'lucide-react';

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: 'Monthly', quarterly: 'Quarterly', course: 'One-time Course', installment: 'Installment',
};
const FREQUENCY_COLORS: Record<string, string> = {
  monthly: 'bg-primary-50 text-primary-700', quarterly: 'bg-accent-50 text-accent-700',
  course: 'bg-warn-50 text-warn-700', installment: 'bg-purple-50 text-purple-700',
};

interface FeePlan {
  id: string; name: string; amount: string; frequency: string; dueDay: number | null;
  description: string | null; status: string; activeStudents: number; createdAt: string;
}

export default function FeePlansPage() {
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/fee-plans');
      setFeePlans(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Fee Plans</h1>
          <p className="text-sm text-surface-500 mt-1">Define fee structures for your students</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98]">
          <Plus className="w-5 h-5" /> Create Fee Plan
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-card p-5 animate-pulse">
              <div className="h-5 w-36 bg-surface-100 rounded mb-3" />
              <div className="h-8 w-28 bg-surface-100 rounded mb-3" />
              <div className="h-4 w-20 bg-surface-100 rounded" />
            </div>
          ))}
        </div>
      ) : feePlans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-16 text-center">
          <IndianRupee className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 font-medium">No fee plans yet</p>
          <p className="text-surface-400 text-sm mt-1">Create fee plans to track student payments</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
            <Plus className="w-4 h-4 inline mr-1" /> Create Fee Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feePlans.map(fp => (
            <div key={fp.id} className="bg-white rounded-3xl shadow-card p-6 hover:shadow-premium transition-shadow duration-300 border border-surface-100">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-surface-900">{fp.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${FREQUENCY_COLORS[fp.frequency] || 'bg-surface-100 text-surface-600'}`}>
                  {FREQUENCY_LABELS[fp.frequency] || fp.frequency}
                </span>
              </div>

              <p className="text-3xl font-black text-surface-900 mb-1">
                ₹{Number(fp.amount).toLocaleString()}
                <span className="text-sm font-medium text-surface-400">/{fp.frequency}</span>
              </p>

              {fp.description && <p className="text-sm text-surface-500 mb-3">{fp.description}</p>}

              <div className="flex items-center gap-4 text-xs text-surface-500 pt-3 border-t border-surface-100">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{fp.activeStudents} students</span>
                {fp.dueDay && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Due on {fp.dueDay}{fp.dueDay === 1 ? 'st' : fp.dueDay === 2 ? 'nd' : fp.dueDay === 3 ? 'rd' : 'th'}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CreateFeePlanModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); fetchPlans(); }} />}
    </div>
  );
}

// ============================================
// Create Fee Plan Modal
// ============================================
function CreateFeePlanModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', amount: '', frequency: 'monthly', dueDay: '5', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/fee-plans', {
        name: form.name,
        amount: parseFloat(form.amount),
        frequency: form.frequency,
        dueDay: form.frequency === 'monthly' || form.frequency === 'quarterly' ? parseInt(form.dueDay) : undefined,
        description: form.description || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create fee plan');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-modal p-8 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-surface-900">Create Fee Plan</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100"><X className="w-6 h-6" /></button>
        </div>

        {error && <div className="mb-4 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-danger-600 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Plan Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Monthly Tuition"
              className="w-full px-4 py-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-surface-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Amount (₹) *</label>
              <input name="amount" type="number" value={form.amount} onChange={handleChange} required placeholder="2500" min="0" step="0.01"
                className="w-full px-4 py-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-surface-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Frequency *</label>
              <select name="frequency" value={form.frequency} onChange={handleChange}
                className="w-full px-4 py-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-surface-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="course">One-time Course</option>
                <option value="installment">Installment</option>
              </select>
            </div>
          </div>

          {(form.frequency === 'monthly' || form.frequency === 'quarterly') && (
            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Due Day of Month</label>
              <input name="dueDay" type="number" value={form.dueDay} onChange={handleChange} min="1" max="31"
                className="w-full px-4 py-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-surface-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Optional description..."
              className="w-full px-4 py-3.5 bg-surface-50 border border-surface-200 rounded-2xl text-surface-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-2xl text-sm font-bold text-surface-600 hover:bg-surface-100 transition-all">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-8 py-3 rounded-2xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary-500/25 active:scale-[0.98]">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <><CheckCircle2 className="w-5 h-5" /> Create Plan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
