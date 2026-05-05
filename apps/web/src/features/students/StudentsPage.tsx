import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  Search, Plus, X, Users, Phone, Filter,
  Loader2, Mail, MoreVertical, BookOpen, Receipt, 
  Edit2, Trash2, ShieldAlert, CheckCircle2, 
  ExternalLink, Ban, UserCheck, MessageSquare, User
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
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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

  const toggleStatus = async (student: Student) => {
    try {
      const newStatus = student.status === 'active' ? 'inactive' : 'active';
      await api.patch(`/students/${student.id}`, { status: newStatus });
      fetchStudents(meta.page);
      setActiveMenu(null);
    } catch (err) { console.error('Failed to update status', err); }
  };

  const deleteStudent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents(meta.page);
      setActiveMenu(null);
    } catch (err) { console.error('Failed to delete student', err); }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in pb-20 lg:pb-0" onClick={() => setActiveMenu(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Student Registry</h1>
          <p className="text-xs lg:text-sm text-slate-500 mt-1">Manage profiles, batches and fee records.</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setShowModal(true); }} 
          className="btn-primary hidden sm:flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-3 lg:gap-4" onClick={e => e.stopPropagation()}>
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search name, phone or code..."
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none" 
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
             <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
             <select 
               value={statusFilter} 
               onChange={e => setStatusFilter(e.target.value)}
               className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none appearance-none cursor-pointer md:min-w-[140px]"
             >
               <option value="">All Status</option>
               <option value="active">Active Only</option>
               <option value="inactive">Inactive Only</option>
             </select>
          </div>
          <button onClick={() => fetchStudents()} className="btn-secondary h-[46px] w-[46px] sm:w-auto px-0 sm:px-4 flex items-center justify-center gap-2">
             <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Desktop View: Table */}
      <div className="hidden lg:block premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Student Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Enrolled Batches</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-6 py-5"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : students.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 text-sm font-black flex-shrink-0 shadow-sm">
                          {s.photoUrl ? <img src={s.photoUrl} className="w-full h-full object-cover rounded-2xl" /> : s.name.charAt(0)}
                        </div>
                        {s.status === 'active' && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{s.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">{s.profile?.studentCode || 'N/A'}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200 opacity-60'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {s.batches.length > 0 ? s.batches.map(b => (
                        <span key={b.id} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                          {b.name}
                        </span>
                      )) : <span className="text-[10px] font-medium text-slate-400 italic">No batches assigned</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); navigate(`/fees?studentId=${s.id}`); }}
                         className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                         title="Collect Fee"
                       >
                         <Receipt className="w-4 h-4" />
                       </button>
                       <div className="relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === s.id ? null : s.id); }}
                            className={`p-2 rounded-xl transition-all border ${activeMenu === s.id ? 'bg-white text-primary-600 border-primary-200 shadow-sm' : 'text-slate-400 border-transparent hover:bg-white hover:text-slate-600 hover:border-slate-200'}`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {activeMenu === s.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-premium border border-slate-100 z-50 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                              <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Student Controls</p>
                              <MenuAction icon={Edit2} label="Edit Profile" onClick={() => {}} />
                              <MenuAction icon={BookOpen} label="Assign Batch" onClick={() => {}} />
                              <MenuAction icon={MessageSquare} label="Send Message" onClick={() => {}} />
                              <div className="h-px bg-slate-50 my-1" />
                              <MenuAction 
                                icon={s.status === 'active' ? Ban : UserCheck} 
                                label={s.status === 'active' ? 'Mark Inactive' : 'Restore Active'} 
                                color={s.status === 'active' ? 'text-orange-600' : 'text-emerald-600'}
                                onClick={() => toggleStatus(s)} 
                              />
                              <MenuAction icon={Trash2} label="Delete Permanently" color="text-red-600" onClick={() => deleteStudent(s.id)} />
                            </div>
                          )}
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View: Cards */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="premium-card p-4 animate-pulse h-32" />
          ))
        ) : students.length === 0 ? (
          <div className="premium-card py-12 text-center text-slate-500">No students found matching criteria</div>
        ) : (
          students.map(s => (
            <div 
              key={s.id} 
              className="premium-card p-5 relative overflow-hidden active:scale-[0.98] transition-transform"
              onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === s.id ? null : s.id); }}
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 text-xl font-black flex-shrink-0 shadow-sm">
                  {s.photoUrl ? <img src={s.photoUrl} className="w-full h-full object-cover rounded-2xl" /> : s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 truncate pr-4">{s.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">{s.profile?.studentCode || 'VP-XXXX'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                     <a href={`tel:${s.phone}`} onClick={e => e.stopPropagation()} className="text-xs font-bold text-primary-600 flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-lg">
                       <Phone className="w-3 h-3" /> Call
                     </a>
                     <button onClick={e => { e.stopPropagation(); navigate(`/fees?studentId=${s.id}`); }} className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                       <Receipt className="w-3 h-3" /> Fee
                     </button>
                  </div>
                </div>
              </div>
              
              {/* Mobile Card Batches */}
              {s.batches.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-1.5">
                   {s.batches.map(b => (
                      <span key={b.id} className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[9px] font-bold border border-slate-100 uppercase">
                        {b.name}
                      </span>
                   ))}
                </div>
              )}

              {/* Mobile Actions Overlay */}
              {activeMenu === s.id && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-5 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Actions</p>
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} className="p-1 rounded-lg bg-slate-100"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MobileAction icon={Edit2} label="Edit" onClick={() => {}} />
                    <MobileAction icon={BookOpen} label="Batches" onClick={() => {}} />
                    <MobileAction 
                      icon={s.status === 'active' ? Ban : UserCheck} 
                      label={s.status === 'active' ? 'Suspend' : 'Activate'} 
                      onClick={() => toggleStatus(s)} 
                    />
                    <MobileAction icon={Trash2} label="Delete" color="text-red-600" onClick={() => deleteStudent(s.id)} />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between py-6 border-t border-slate-100">
          <button 
            disabled={meta.page <= 1} 
            onClick={(e) => { e.stopPropagation(); fetchStudents(meta.page - 1); }} 
            className="btn-secondary px-5 py-2.5 text-xs font-bold disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Page</span>
            <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-900">{meta.page}</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">of {meta.totalPages}</span>
          </div>
          <button 
            disabled={meta.page >= meta.totalPages} 
            onClick={(e) => { e.stopPropagation(); fetchStudents(meta.page + 1); }} 
            className="btn-secondary px-5 py-2.5 text-xs font-bold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* FAB - Mobile */}
      <button 
        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Add Student Modal */}
      {showModal && <AddStudentModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); fetchStudents(); }} />}
    </div>
  );
}

// --------------------------------------------
// Components
// --------------------------------------------

function MenuAction({ icon: Icon, label, onClick, color = 'text-slate-600' }: any) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors ${color}`}
    >
      <Icon className="w-4 h-4 opacity-70" /> {label}
    </button>
  );
}

function MobileAction({ icon: Icon, label, onClick, color = 'text-slate-700' }: any) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 rounded-2xl active:bg-slate-100 transition-colors ${color}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

// ============================================
// Add Student Modal (Full-screen Mobile)
// ============================================
function AddStudentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ 
    name: '', phone: '', email: '', dob: '', address: '', 
    parentName: '', parentPhone: '', batchIds: [] as string[], feePlanId: '' 
  });
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
      const payload: any = { name: form.name.trim(), phone: form.phone.trim() };
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.dob) payload.dob = form.dob;
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.parentName.trim()) payload.parentName = form.parentName.trim();
      if (form.parentPhone.trim()) payload.parentPhone = form.parentPhone.trim();
      if (form.batchIds.length > 0) payload.batchIds = form.batchIds;
      if (form.feePlanId) payload.feePlanId = form.feePlanId;

      await api.post('/students', payload);
      onCreated();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to add student';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white lg:bg-slate-900/60 lg:backdrop-blur-sm lg:flex lg:items-center lg:justify-center lg:p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="w-full lg:max-w-2xl bg-white lg:rounded-[32px] shadow-2xl min-h-screen lg:min-h-0 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="sticky top-0 bg-white z-10 px-6 lg:px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Onboard Student</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Official Enrollment Form</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 lg:p-10 space-y-12">
          {error && (
            <div className="px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
              <ShieldAlert className="w-5 h-5" /> {error}
            </div>
          )}

          <form id="add-student-form" onSubmit={handleSubmit} className="space-y-12">
            <FormSection icon={User} title="Personal Details" color="bg-blue-50 text-blue-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. John Doe" />
                <Field label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required placeholder="Primary contact" />
                <Field label="Email Address" name="email" value={form.email} onChange={handleChange} type="email" placeholder="Optional" />
                <Field label="Date of Birth" name="dob" value={form.dob} onChange={handleChange} type="date" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Address</label>
                <textarea 
                  name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Residential info..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none transition-all resize-none"
                />
              </div>
            </FormSection>

            <FormSection icon={Users} title="Guardian Details" color="bg-indigo-50 text-indigo-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Parent/Guardian Name" name="parentName" value={form.parentName} onChange={handleChange} placeholder="Michael Doe" />
                <Field label="Guardian Phone" name="parentPhone" value={form.parentPhone} onChange={handleChange} placeholder="Emergency mobile" />
              </div>
            </FormSection>

            <FormSection icon={BookOpen} title="Course Assignments" color="bg-purple-50 text-purple-600">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Batches</label>
                <div className="flex flex-wrap gap-2.5">
                  {batches.map(b => (
                    <button 
                      key={b.id} type="button" onClick={() => toggleBatch(b.id)}
                      className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-all ${
                        form.batchIds.includes(b.id) ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-600/20' : 'bg-white border-slate-200 text-slate-600 hover:border-primary-200'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Choose Fee Plan</label>
                <select name="feePlanId" value={form.feePlanId} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none appearance-none cursor-pointer">
                  <option value="">No Plan (Custom Billing)</option>
                  {feePlans.map(fp => (
                    <option key={fp.id} value={fp.id}>{fp.name} — ₹{fp.amount}</option>
                  ))}
                </select>
              </div>
            </FormSection>
          </form>
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md px-6 py-6 border-t border-slate-50 lg:rounded-b-[32px]">
          <button 
            form="add-student-form" type="submit" disabled={loading}
            className="w-full py-5 px-8 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Complete Registration</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ icon: Icon, title, children, color }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = 'text', placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && <span className="text-rose-500">*</span>}</label>
      <input 
        type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300" 
      />
    </div>
  );
}
