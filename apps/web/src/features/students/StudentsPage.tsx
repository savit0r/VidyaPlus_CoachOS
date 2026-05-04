import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  Search, Plus, X, Users, Phone, Calendar, Filter,
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';

interface Student {
  id: string; name: string; phone: string; email: string | null; status: string;
  photoUrl: string | null; dob: string | null; createdAt: string;
  profile: { id: string; studentCode: string; parentName: string | null; parentPhone: string | null; enrolledAt: string } | null;
  batches: { id: string; name: string; subject: string | null }[];
}

interface Batch { id: string; name: string; subject: string | null }
interface FeePlan { id: string; name: string; amount: string; frequency: string }

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/students', { params });
      setStudents(data.data);
      setMeta(data.meta);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Students</h1>
          <p className="text-sm text-surface-500 mt-1">{meta.total} total students</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white text-sm bg-primary-600 hover:bg-primary-700 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input type="text" placeholder="Search by name, phone, or student code..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-surface-900 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"><X className="w-4 h-4" /></button>}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-surface-200 rounded-xl text-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none cursor-pointer min-w-[140px] shadow-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="alumni">Alumni</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                {['Student', 'Code', 'Parent', 'Batches', 'Status', 'Enrolled', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-surface-100">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-100 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} /></td>
                  ))}
                </tr>
              )) : students.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center">
                  <Users className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-500 font-medium">No students yet</p>
                  <p className="text-surface-400 text-sm mt-1">Add your first student to get started</p>
                  <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
                    <Plus className="w-4 h-4 inline mr-1" /> Add Student
                  </button>
                </td></tr>
              ) : students.map(s => (
                <tr key={s.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900">{s.name}</p>
                        <p className="text-xs text-surface-400 flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className="text-xs font-mono text-surface-500 bg-surface-100 px-2 py-1 rounded">{s.profile?.studentCode}</span></td>
                  <td className="px-5 py-3">
                    {s.profile?.parentName ? (
                      <div>
                        <p className="text-sm text-surface-700">{s.profile.parentName}</p>
                        <p className="text-xs text-surface-400">{s.profile.parentPhone}</p>
                      </div>
                    ) : <span className="text-xs text-surface-400">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.batches.length > 0 ? s.batches.map(b => (
                        <span key={b.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">{b.name}</span>
                      )) : <span className="text-xs text-surface-400">No batch</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === 'active' ? 'bg-accent-50 text-accent-600' :
                      s.status === 'alumni' ? 'bg-primary-50 text-primary-600' :
                      'bg-surface-100 text-surface-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        s.status === 'active' ? 'bg-accent-500' : s.status === 'alumni' ? 'bg-primary-500' : 'bg-surface-400'
                      }`} />
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-surface-500">
                    {s.profile?.enrolledAt ? new Date(s.profile.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-surface-200">
            <p className="text-xs text-surface-500">Showing {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}</p>
            <div className="flex items-center gap-1">
              <button disabled={meta.page <= 1} onClick={() => fetchStudents(meta.page - 1)} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-surface-400 px-2">Page {meta.page}/{meta.totalPages}</span>
              <button disabled={meta.page >= meta.totalPages} onClick={() => fetchStudents(meta.page + 1)} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showModal && <AddStudentModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); fetchStudents(); }} />}
    </div>
  );
}

// ============================================
// Add Student Modal
// ============================================
function AddStudentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', dob: '', address: '', parentName: '', parentPhone: '', batchIds: [] as string[], feePlanId: '' });
  const [batches, setBatches] = useState<Batch[]>([]);
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/batches').then(({ data }) => setBatches(data.data)).catch(console.error);
    api.get('/fee-plans').then(({ data }) => setFeePlans(data.data)).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleBatch = (id: string) => {
    setForm(prev => ({
      ...prev,
      batchIds: prev.batchIds.includes(id) ? prev.batchIds.filter(b => b !== id) : [...prev.batchIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/students', {
        ...form,
        batchIds: form.batchIds.length > 0 ? form.batchIds : undefined,
        feePlanId: form.feePlanId || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add student');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-modal p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-surface-900">Add Student</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-all"><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-danger-600 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student Info */}
          <div>
            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">Student Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name *" name="name" value={form.name} onChange={handleChange} required />
              <Field label="Phone *" name="phone" value={form.phone} onChange={handleChange} required />
              <Field label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
              <Field label="Date of Birth" name="dob" value={form.dob} onChange={handleChange} type="date" />
            </div>
          </div>

          {/* Parent */}
          <div className="border-t border-surface-200 pt-5">
            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">Parent / Guardian</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Parent Name" name="parentName" value={form.parentName} onChange={handleChange} />
              <Field label="Parent Phone" name="parentPhone" value={form.parentPhone} onChange={handleChange} />
            </div>
          </div>

          {/* Batch Assignment */}
          <div className="border-t border-surface-200 pt-5">
            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">Assign to Batches</h3>
            {batches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {batches.map(b => (
                  <button key={b.id} type="button" onClick={() => toggleBatch(b.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      form.batchIds.includes(b.id)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-surface-600 border-surface-200 hover:border-primary-300'
                    }`}>
                    {b.name} {b.subject ? `(${b.subject})` : ''}
                  </button>
                ))}
              </div>
            ) : <p className="text-sm text-surface-400">No batches created yet. Create one first.</p>}
          </div>

          {/* Fee Plan */}
          <div className="border-t border-surface-200 pt-5">
            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">Fee Plan</h3>
            <select name="feePlanId" value={form.feePlanId} onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-surface-200 rounded-xl text-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 shadow-sm">
              <option value="">No fee plan</option>
              {feePlans.map(fp => <option key={fp.id} value={fp.id}>{fp.name} — ₹{Number(fp.amount).toLocaleString()}/{fp.frequency}</option>)}
            </select>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 transition-all">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : <><CheckCircle2 className="w-4 h-4" /> Add Student</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = 'text' }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-600 mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required}
        className="w-full px-3 py-2.5 bg-white border border-surface-200 rounded-xl text-surface-900 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-sm" />
    </div>
  );
}
