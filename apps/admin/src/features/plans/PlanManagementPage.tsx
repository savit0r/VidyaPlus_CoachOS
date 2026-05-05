import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Plus, CreditCard, Users, Shield, HardDrive, Check,
  Pencil, Trash2, AlertTriangle, X, Loader2, Save, TrendingUp
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  maxStudents: number;
  maxStaff: number;
  maxStorageMb: number;
  priceMonthly: string | number;
  featuresJson: any;
  status: string;
  _count?: { institutes: number };
}

export default function PlanManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/super-admin/plans');
      setPlans(data.data);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Configure product tiers and platform limits</p>
        </div>
        <button
          onClick={() => { setEditingPlan(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Create New Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`glass-card rounded-3xl p-6 border transition-all ${
            plan.status === 'active' ? 'border-white/5' : 'border-rose-500/20 opacity-75'
          }`}>
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-all border border-white/5"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-black text-white tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white">₹{Number(plan.priceMonthly).toLocaleString()}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">/ Month</span>
              </div>
            </div>

            <div className="space-y-4 py-6 border-y border-white/5 mb-6">
               <FeatureItem icon={Users} label="Max Students" value={plan.maxStudents.toLocaleString()} />
               <FeatureItem icon={Shield} label="Max Staff" value={plan.maxStaff.toLocaleString()} />
               <FeatureItem icon={HardDrive} label="Storage" value={`${(plan.maxStorageMb / 1000).toFixed(1)} GB`} />
            </div>

            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Tenants</span>
                  <span className="text-sm font-bold text-slate-300">{plan._count?.institutes || 0}</span>
               </div>
               <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                 plan.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                 : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
               }`}>
                 {plan.status}
               </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <PlanModal
          plan={editingPlan}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchPlans(); }}
        />
      )}
    </div>
  );
}

function FeatureItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs font-bold text-slate-400">{label}</span>
      </div>
      <span className="text-xs font-black text-white">{value}</span>
    </div>
  );
}

function PlanModal({ plan, onClose, onSaved }: { plan: Plan | null, onClose: () => void, onSaved: () => void }) {
  const [form, setForm] = useState({
    name: plan?.name || '',
    maxStudents: plan?.maxStudents || 100,
    maxStaff: plan?.maxStaff || 10,
    maxStorageMb: plan?.maxStorageMb || 1000,
    priceMonthly: plan?.priceMonthly || 999,
    status: plan?.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (plan) {
        await api.patch(`/super-admin/plans/${plan.id}`, form);
      } else {
        await api.post('/super-admin/plans', form);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg glass-card rounded-3xl p-8 animate-scale-in border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-white tracking-tight">
            {plan ? `Configure Tier: ${plan.name}` : 'Design New Subscription Tier'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
             <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Plan Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Professional, Enterprise"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  required
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Monthly Price (₹)</label>
                   <input
                     type="number"
                     value={form.priceMonthly}
                     onChange={e => setForm({ ...form, priceMonthly: Number(e.target.value) })}
                     className="w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                     required
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Storage (MB)</label>
                   <input
                     type="number"
                     value={form.maxStorageMb}
                     onChange={e => setForm({ ...form, maxStorageMb: Number(e.target.value) })}
                     className="w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                     required
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Max Students</label>
                   <input
                     type="number"
                     value={form.maxStudents}
                     onChange={e => setForm({ ...form, maxStudents: Number(e.target.value) })}
                     className="w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                     required
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Max Staff Members</label>
                   <input
                     type="number"
                     value={form.maxStaff}
                     onChange={e => setForm({ ...form, maxStaff: Number(e.target.value) })}
                     className="w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                     required
                   />
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Visibility Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                   <option value="active">Public / Active</option>
                   <option value="inactive">Archived / Hidden</option>
                </select>
             </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {plan ? 'Apply Modifications' : 'Launch New Tier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
