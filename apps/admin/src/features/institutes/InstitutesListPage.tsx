import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  Building2, Search, Plus, MoreVertical, ChevronLeft, ChevronRight,
  Users, BookOpen, Filter, X, AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react';

interface Institute {
  id: string;
  name: string;
  subdomain: string;
  phone: string;
  email: string | null;
  status: string;
  setupCompleted: boolean;
  createdAt: string;
  plan: { id: string; name: string; priceMonthly: string } | null;
  _count: { users: number; batches: number; studentProfiles: number };
  owner: { id: string; name: string; phone: string; email: string | null } | null;
}

interface Meta { page: number; limit: number; total: number; totalPages: number }

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-accent-500/10', text: 'text-accent-400', dot: 'bg-accent-500' },
  suspended: { bg: 'bg-warn-500/10', text: 'text-warn-400', dot: 'bg-warn-500' },
  inactive: { bg: 'bg-danger-500/10', text: 'text-danger-400', dot: 'bg-danger-500' },
};

export default function InstitutesListPage() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const fetchInstitutes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/super-admin/institutes', { params });
      setInstitutes(data.data);
      setMeta(data.meta);
    } catch (err) {
      console.error('Failed to fetch institutes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchInstitutes(); }, [fetchInstitutes]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Institutes</h1>
          <p className="text-sm text-surface-400 mt-1">Manage all coaching centers on the platform</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white text-sm transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
        >
          <Plus className="w-4 h-4" />
          Create Institute
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by name, subdomain, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-admin-500/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/30 appearance-none cursor-pointer min-w-[140px]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/30">
                {['Institute', 'Plan', 'Students', 'Owner', 'Status', 'Created', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-surface-400 uppercase tracking-wider px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-800/30">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-surface-700/50 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : institutes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Building2 className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                    <p className="text-surface-400 text-sm">No institutes found</p>
                    <p className="text-surface-500 text-xs mt-1">Create one to get started</p>
                  </td>
                </tr>
              ) : (
                institutes.map((inst) => {
                  const statusStyle = STATUS_COLORS[inst.status] || STATUS_COLORS.inactive;
                  return (
                    <tr
                      key={inst.id}
                      className="border-b border-surface-800/20 hover:bg-surface-800/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/institutes/${inst.id}`)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-admin-600/20 flex items-center justify-center text-admin-300 text-sm font-bold flex-shrink-0">
                            {inst.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{inst.name}</p>
                            <p className="text-xs text-surface-500">{inst.subdomain}.coachos.in</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {inst.plan ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-admin-600/20 text-admin-300">
                            {inst.plan.name}
                          </span>
                        ) : (
                          <span className="text-xs text-surface-500">No plan</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-surface-300">
                          <Users className="w-3.5 h-3.5 text-surface-500" />
                          {inst._count.studentProfiles}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {inst.owner ? (
                          <div>
                            <p className="text-sm text-surface-200">{inst.owner.name}</p>
                            <p className="text-xs text-surface-500">{inst.owner.phone}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-surface-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {inst.status.charAt(0).toUpperCase() + inst.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-surface-400">
                        {new Date(inst.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-surface-700/30">
            <p className="text-xs text-surface-500">
              Showing {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={meta.page <= 1}
                onClick={() => fetchInstitutes(meta.page - 1)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-surface-400 px-2">Page {meta.page} of {meta.totalPages}</span>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchInstitutes(meta.page + 1)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateInstituteModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchInstitutes(); }}
        />
      )}
    </div>
  );
}


// ============================================
// Create Institute Modal
// ============================================
interface Plan { id: string; name: string; maxStudents: number; maxStaff: number; priceMonthly: string }

function CreateInstituteModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '', subdomain: '', phone: '', email: '', address: '',
    planId: '', academicYear: '2026-2027',
    ownerName: '', ownerPhone: '', ownerEmail: '', ownerPassword: '',
  });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/super-admin/plans').then(({ data }) => setPlans(data.data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'name') {
      setForm(prev => ({ ...prev, subdomain: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/super-admin/institutes', {
        ...form,
        planId: form.planId || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create institute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Institute</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-danger-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Institute Info */}
          <div>
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">Institute Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Institute Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sharma Coaching" required />
              <InputField label="Subdomain *" name="subdomain" value={form.subdomain} onChange={handleChange} placeholder="e.g. sharma-coaching" required suffix=".coachos.in" />
              <InputField label="Phone *" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" required />
              <InputField label="Email" name="email" value={form.email} onChange={handleChange} placeholder="info@institute.com" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Plan</label>
                <select
                  name="planId"
                  value={form.planId}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-admin-500/30"
                >
                  <option value="">No plan</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — ₹{Number(p.priceMonthly).toLocaleString()}/mo</option>
                  ))}
                </select>
              </div>
              <InputField label="Academic Year" name="academicYear" value={form.academicYear} onChange={handleChange} placeholder="2026-2027" />
            </div>
          </div>

          {/* Owner Info */}
          <div className="border-t border-surface-700/30 pt-5">
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">Owner Account</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Owner Name *" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="e.g. Rahul Sharma" required />
              <InputField label="Owner Phone *" name="ownerPhone" value={form.ownerPhone} onChange={handleChange} placeholder="9876543210" required />
              <InputField label="Owner Email" name="ownerEmail" value={form.ownerEmail} onChange={handleChange} placeholder="owner@institute.com" />
              <InputField label="Owner Password *" name="ownerPassword" value={form.ownerPassword} onChange={handleChange} placeholder="Min 8 characters" required type="password" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-300 hover:text-white hover:bg-surface-700 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Create Institute</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ============================================
// Reusable Input Field
// ============================================
function InputField({ label, name, value, onChange, placeholder, required, type = 'text', suffix }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; type?: string; suffix?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-admin-500/30 transition-all ${suffix ? 'pr-28' : ''}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-500">{suffix}</span>}
      </div>
    </div>
  );
}
