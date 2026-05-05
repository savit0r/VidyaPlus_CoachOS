import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  Plus, X, BookOpen, Users, Clock, Calendar, MapPin,
  AlertTriangle, CheckCircle2, Loader2, MoreVertical
} from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Batch {
  id: string; name: string; subject: string | null; room: string | null;
  daysJson: string[]; startTime: string; endTime: string; capacity: number; status: string;
  teacher: { id: string; name: string } | null; enrolledStudents: number; createdAt: string;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/batches');
      setBatches(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Batches</h1>
          <p className="text-sm text-slate-500 mt-1">Organize your teaching schedule and student groups.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create New Batch
        </button>
      </div>

      {/* Batch Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="premium-card p-6 animate-pulse">
              <div className="h-6 w-3/4 bg-slate-100 rounded mb-4" />
              <div className="h-4 w-1/2 bg-slate-50 rounded mb-6" />
              <div className="flex gap-2 mb-6">
                 {Array.from({ length: 4 }).map((_, j) => <div key={j} className="h-8 w-8 bg-slate-50 rounded-lg" />)}
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : batches.length === 0 ? (
        <div className="premium-card py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 text-slate-300">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No active batches</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">Create batches to start assigning students and marking attendance.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Create Your First Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(batch => {
             const occupancy = (batch.enrolledStudents / batch.capacity) * 100;
             const isFull = occupancy >= 95;
             return (
              <div key={batch.id} className="premium-card p-6 flex flex-col group">
                <div className="flex items-start justify-between mb-4">
                   <div className="space-y-1 overflow-hidden">
                      <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{batch.name}</h3>
                      <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{batch.subject || 'General'}</p>
                   </div>
                   <button className="p-1 rounded-md text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                   </button>
                </div>

                {/* Days Tracker */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {DAYS.map(day => {
                    const isActive = (batch.daysJson as string[]).includes(day);
                    return (
                      <span 
                        key={day} 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all border ${
                          isActive 
                            ? 'bg-primary-50 text-primary-700 border-primary-100' 
                            : 'bg-white text-slate-300 border-slate-100'
                        }`}
                      >
                        {day.slice(0, 2)}
                      </span>
                    );
                  })}
                </div>

                {/* Details List */}
                <div className="space-y-3 mb-6">
                   <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.startTime} — {batch.endTime}</span>
                   </div>
                   <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.room || 'No Room Assigned'}</span>
                   </div>
                   <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.enrolledStudents} / {batch.capacity} Students Enrolled</span>
                   </div>
                </div>

                {/* Occupancy Progress */}
                <div className="mt-auto pt-4 border-t border-slate-50 space-y-2">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacity Usage</span>
                      <span className={`text-[10px] font-bold ${isFull ? 'text-rose-600' : 'text-slate-500'}`}>
                        {Math.round(occupancy)}% Full
                      </span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull ? 'bg-rose-500' : occupancy > 80 ? 'bg-amber-500' : 'bg-primary-500'
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

      {showModal && <CreateBatchModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); fetchBatches(); }} />}
    </div>
  );
}

// ============================================
// Create Batch Modal
// ============================================
function CreateBatchModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', subject: '', room: '', startTime: '09:00', endTime: '10:00', capacity: '30', daysJson: [] as string[] });
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
    if (form.daysJson.length === 0) { setError('Please select at least one day for the schedule'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/batches', {
        ...form,
        capacity: parseInt(form.capacity),
        subject: form.subject || undefined,
        room: form.room || undefined,
      });
      onCreated();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create batch';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-modal overflow-hidden flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Academic Batch</h2>
            <p className="text-xs text-slate-500 mt-1">Set up a new cohort, schedule, and room assignment.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form id="create-batch-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Batch Name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Physics 101" />
              <Field label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Science" />
            </div>

            {/* Days Selection */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Weekly Schedule</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(d => {
                  const selected = form.daysJson.includes(d);
                  return (
                    <button 
                      key={d} 
                      type="button" 
                      onClick={() => toggleDay(d)}
                      className={`w-11 h-11 rounded-lg text-xs font-bold transition-all border ${
                        selected 
                          ? 'bg-primary-600 border-primary-600 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-primary-300'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Field label="Start Time" name="startTime" value={form.startTime} onChange={handleChange} type="time" required />
              <Field label="End Time" name="endTime" value={form.endTime} onChange={handleChange} type="time" required />
              <Field label="Max Capacity" name="capacity" value={form.capacity} onChange={handleChange} type="number" />
            </div>

            <Field label="Room Assignment" name="room" value={form.room} onChange={handleChange} placeholder="e.g. Hall A, Lab 1" />
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button 
            form="create-batch-form"
            type="submit" 
            disabled={loading}
            className="btn-primary min-w-[140px] flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Create Batch</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = 'text', placeholder }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label} {required && <span className="text-red-500">*</span>}</label>
      <input 
        type={type} 
        name={name} 
        value={value} 
        onChange={onChange} 
        required={required}
        placeholder={placeholder}
        className="input-field h-[46px] placeholder:text-slate-300" 
      />
    </div>
  );
}
