import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  Plus, X, BookOpen, Users, Clock, Calendar, MapPin,
  AlertTriangle, CheckCircle2, Loader2, MoreVertical,
  Ticket, RefreshCcw, IndianRupee, Edit2, Trash2
} from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Batch {
  id: string; name: string; subject: string | null; room: string | null;
  daysJson: string[]; startTime: string; endTime: string; capacity: number; status: string;
  teacher: { id: string; name: string } | null; enrolledStudents: number; createdAt: string;
  admissionFee?: string | number;
  feePlan?: { amount: string; frequency: string } | null;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/batches');
      setBatches(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const deleteBatch = async (id: string) => {
    if (!window.confirm('Archive this batch? Enrolled students will be deactivated.')) return;
    try {
      await api.delete(`/batches/${id}`);
      fetchBatches();
    } catch (err) { alert('Operation failed'); }
  };

  return (
    <div className="space-y-10 animate-fade-in" onClick={() => setActiveMenu(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-hairline pb-10">
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight uppercase tracking-widest">Academic Batches</h1>
          <p className="text-sm text-slate mt-1">Configure schedules and financial blueprints for student cohorts.</p>
        </div>
        <button 
          onClick={() => { setEditBatch(null); setShowModal(true); }} 
          className="mint-btn-primary h-12 px-8 text-[10px] uppercase tracking-[0.2em]"
        >
          <Plus className="w-4 h-4" /> New Batch
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mint-card h-64 animate-pulse bg-surface/50" />
          ))}
        </div>
      ) : batches.length === 0 ? (
        <div className="mint-card py-24 text-center flex flex-col items-center border-dashed">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-6 border border-hairline text-stone">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-ink uppercase tracking-widest">No Cohorts Detected</h3>
          <p className="text-xs text-slate mt-2 mb-8 max-w-xs mx-auto">Initialize your first batch to begin student enrollment and schedule management.</p>
          <button onClick={() => { setEditBatch(null); setShowModal(true); }} className="text-brand-green font-black text-xs uppercase tracking-widest hover:underline">
            + Deploy Initial Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {batches.map(batch => {
             const occupancy = (batch.enrolledStudents / batch.capacity) * 100;
             const isFull = occupancy >= 95;
             return (
              <div key={batch.id} className="mint-card p-0 flex flex-col group relative overflow-hidden bg-canvas">
                {/* Atmospheric Subtle Detail */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-green/5 blur-3xl -mr-20 -mt-20 pointer-events-none" />
                
                <div className="p-8 pb-4">
                  <div className="flex items-start justify-between mb-6">
                      <div className="space-y-2 overflow-hidden">
                         <h3 className="text-lg font-black text-ink truncate tracking-tight">{batch.name}</h3>
                         <span className="mint-badge !rounded-md px-1.5 py-0.5 text-[9px] bg-surface text-brand-tag border-hairline">
                           {batch.subject || 'GENERAL_CORE'}
                         </span>
                      </div>
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === batch.id ? null : batch.id); }}
                          className={`p-2 rounded-full transition-all border ${activeMenu === batch.id ? 'bg-ink text-canvas border-ink shadow-lg' : 'text-stone border-hairline hover:text-ink hover:bg-surface'}`}
                        >
                           <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenu === batch.id && (
                          <div className="absolute right-0 mt-3 w-48 bg-canvas rounded-lg shadow-premium border border-hairline z-50 py-2 animate-slide-up origin-top-right">
                             <button 
                               onClick={(e) => { e.stopPropagation(); setEditBatch(batch); setShowModal(true); setActiveMenu(null); }}
                               className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-ink hover:bg-surface transition-colors"
                             >
                               <Edit2 className="w-3.5 h-3.5" /> Modify Settings
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); deleteBatch(batch.id); setActiveMenu(null); }}
                               className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-brand-error hover:bg-brand-error/5 transition-colors"
                             >
                               <Trash2 className="w-3.5 h-3.5" /> Deactivate Batch
                             </button>
                          </div>
                        )}
                      </div>
                  </div>

                  {/* Financial Metrics - Geist Mono */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                     <div className="p-4 bg-surface rounded-md border border-hairline group-hover:border-ink transition-colors">
                        <p className="text-[8px] font-black text-slate uppercase tracking-widest mb-1 flex items-center gap-1.5 opacity-60">
                          <Ticket className="w-2.5 h-2.5" /> Admission
                        </p>
                        <p className="text-sm font-black text-ink font-mono tracking-tighter">₹{batch.admissionFee || '0'}</p>
                     </div>
                     <div className="p-4 bg-brand-green-soft rounded-md border border-brand-green/10 group-hover:border-brand-green transition-colors">
                        <p className="text-[8px] font-black text-brand-green-deep uppercase tracking-widest mb-1 flex items-center gap-1.5 opacity-60">
                          <RefreshCcw className="w-2.5 h-2.5" /> Tuition
                        </p>
                        <p className="text-sm font-black text-brand-green-deep font-mono tracking-tighter">₹{batch.feePlan?.amount || '0'}</p>
                     </div>
                  </div>

                  {/* Schedule Density */}
                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {DAYS.map(day => {
                      const isActive = (batch.daysJson as string[]).includes(day);
                      return (
                        <span 
                          key={day} 
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-black transition-all border ${
                            isActive 
                              ? 'bg-ink text-canvas border-ink shadow-sm' 
                              : 'bg-canvas text-stone border-hairline opacity-40'
                          }`}
                        >
                          {day.charAt(0)}
                        </span>
                      );
                    })}
                  </div>

                  {/* Operational Details */}
                  <div className="space-y-3 mb-8">
                     <div className="flex items-center gap-3 text-[10px] font-black text-slate uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5 text-brand-tag" />
                        <span>{batch.startTime} — {batch.endTime}</span>
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-black text-slate uppercase tracking-widest">
                        <MapPin className="w-3.5 h-3.5 text-brand-tag" />
                        <span className="truncate">{batch.room || 'VIRTUAL_LOBBY'}</span>
                     </div>
                  </div>
                </div>

                {/* Utilization Progress */}
                <div className="mt-auto px-8 py-6 bg-surface/50 border-t border-hairline space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-stone" /> Payload ({batch.enrolledStudents}/{batch.capacity})
                      </span>
                      <span className={`text-[10px] font-black font-mono tracking-tighter ${isFull ? 'text-brand-error' : 'text-ink'}`}>
                        {Math.round(occupancy)}%
                      </span>
                   </div>
                   <div className="h-1.5 w-full bg-canvas rounded-full overflow-hidden border border-hairline">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-in-out ${
                          isFull ? 'bg-brand-error' : occupancy > 80 ? 'bg-amber-500' : 'bg-brand-green shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        }`} 
                        style={{ width: `${Math.min(occupancy, 100)}%` }} 
                      />
                   </div>
                </div>
              </div>
             );
          })}
        </div>
      )}

      {showModal && (
        <BatchModal 
          batch={editBatch} 
          onClose={() => { setShowModal(false); setEditBatch(null); }} 
          onSaved={() => { setShowModal(false); setEditBatch(null); fetchBatches(); }} 
        />
      )}
    </div>
  );
}

function BatchModal({ batch, onClose, onSaved }: { batch?: Batch | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!batch;
  const [form, setForm] = useState({ 
    name: batch?.name || '', 
    subject: batch?.subject || '', 
    room: batch?.room || '', 
    startTime: batch?.startTime || '09:00', 
    endTime: batch?.endTime || '10:00', 
    capacity: batch?.capacity?.toString() || '30', 
    daysJson: batch?.daysJson || [] as string[],
    admissionFee: batch?.admissionFee?.toString() || '',
    feeAmount: batch?.feePlan?.amount || '', 
    feeType: batch?.feePlan?.frequency || 'monthly' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      daysJson: prev.daysJson.includes(day) ? prev.daysJson.filter(d => d !== day) : [...prev.daysJson, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.daysJson.length === 0) { setError('Schedule must include at least one operation day'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        capacity: parseInt(form.capacity),
        admissionFee: form.admissionFee ? parseFloat(form.admissionFee) : undefined,
        feeAmount: form.feeAmount ? parseFloat(form.feeAmount) : undefined,
        feeType: form.feeAmount ? form.feeType : undefined,
        subject: form.subject || undefined,
        room: form.room || undefined,
      };

      if (isEdit) {
        await api.patch(`/batches/${batch.id}`, payload);
      } else {
        await api.post('/batches', payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error || 'System failed to deploy batch config');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-canvas rounded-lg shadow-premium overflow-hidden flex flex-col max-h-[92vh] animate-slide-up border border-hairline" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-10 py-10 border-b border-hairline flex items-center justify-between bg-canvas sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-black text-ink tracking-tight uppercase tracking-widest">{isEdit ? 'Update Cohort' : 'Deploy Batch'}</h2>
            <p className="text-[10px] font-black text-slate mt-2 uppercase tracking-[0.2em] opacity-60">Academic & Financial Blueprint Configuration</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone hover:text-ink hover:bg-surface rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12">
          {error && (
            <div className="p-5 bg-brand-error/10 border border-brand-error/20 rounded-md text-brand-error text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          <form id="batch-form" onSubmit={handleSubmit} className="space-y-12">
            <FormSection icon={BookOpen} title="Identity Metrics">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Field label="Descriptor" name="name" value={form.name} onChange={handleChange} required placeholder="PHYSICS_SECTION_A" />
                 <Field label="Domain" name="subject" value={form.subject} onChange={handleChange} placeholder="THEORETICAL_PHYSICS" />
               </div>
            </FormSection>

            <FormSection icon={IndianRupee} title="Revenue Framework">
               <div className="p-10 bg-surface/30 rounded-lg border border-hairline space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate uppercase tracking-widest ml-1">
                           <Ticket className="w-4 h-4 text-brand-tag" /> Admission Surcharge
                        </label>
                        <input 
                           type="number" name="admissionFee" value={form.admissionFee} onChange={handleChange}
                           className="mint-input w-full h-14 font-mono text-lg"
                           placeholder="0.00"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate uppercase tracking-widest ml-1">
                           <RefreshCcw className="w-4 h-4 text-brand-tag" /> Tuition Cycle Value
                        </label>
                        <div className="flex gap-2">
                           <input 
                              type="number" name="feeAmount" value={form.feeAmount} onChange={handleChange}
                              className="flex-1 mint-input h-14 font-mono text-lg"
                              placeholder="0.00"
                           />
                           <select 
                              name="feeType" value={form.feeType} onChange={handleChange}
                              className="w-36 mint-input h-14 uppercase tracking-widest font-black text-[10px]"
                           >
                              <option value="monthly">Monthly</option>
                              <option value="one-time">Total</option>
                           </select>
                        </div>
                     </div>
                  </div>
               </div>
            </FormSection>

            <FormSection icon={Calendar} title="Operational Schedule">
               <div className="space-y-10">
                  <div className="space-y-4">
                     <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1">Cycle Activation Days</label>
                     <div className="flex flex-wrap gap-2">
                        {DAYS.map(d => (
                           <button 
                              key={d} type="button" onClick={() => toggleDay(d)}
                              className={`px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all ${
                                 form.daysJson.includes(d) 
                                    ? 'bg-ink border-ink text-canvas shadow-lg' 
                                    : 'bg-canvas border-hairline text-stone hover:border-ink'
                              }`}
                           >
                              {d}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <Field label="Deployment Time" name="startTime" value={form.startTime} onChange={handleChange} type="time" required />
                     <Field label="Termination Time" name="endTime" value={form.endTime} onChange={handleChange} type="time" required />
                     <Field label="Cohort Capacity" name="capacity" value={form.capacity} onChange={handleChange} type="number" />
                  </div>
                  <Field label="Location / Node" name="room" value={form.room} onChange={handleChange} placeholder="LAB_ALPHA / VIRTUAL_ROOM_1" />
               </div>
            </FormSection>
          </form>
        </div>

        <div className="px-12 py-10 bg-surface/50 border-t border-hairline flex items-center justify-end gap-6 sticky bottom-0 z-20">
          <button type="button" onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate hover:text-ink transition-all">
            Cancel
          </button>
          <button 
            form="batch-form" type="submit" disabled={loading}
            className="mint-btn-primary h-14 px-12 text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand-green/10"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Commit Blueprint</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ icon: Icon, title, children }: any) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 pb-4 border-b border-hairline">
        <div className="w-10 h-10 rounded-md bg-surface text-brand-tag flex items-center justify-center border border-hairline">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-[11px] font-black text-ink uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className="space-y-8">{children}</div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = 'text', placeholder }: any) {
  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1">{label} {required && <span className="text-brand-error">*</span>}</label>
      <input 
        type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="mint-input w-full h-14" 
      />
    </div>
  );
}
