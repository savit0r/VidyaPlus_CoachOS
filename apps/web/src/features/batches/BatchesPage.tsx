import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  Plus, X, BookOpen, Users, Clock, Calendar, MapPin,
  AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_COLORS: Record<string, string> = {
  Mon: 'bg-blue-100 text-blue-700', Tue: 'bg-green-100 text-green-700', Wed: 'bg-purple-100 text-purple-700',
  Thu: 'bg-orange-100 text-orange-700', Fri: 'bg-pink-100 text-pink-700', Sat: 'bg-yellow-100 text-yellow-700', Sun: 'bg-red-100 text-red-700',
};

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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Batches</h1>
          <p className="text-sm text-surface-500 mt-1">{batches.length} batches</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white text-sm bg-primary-600 hover:bg-primary-700 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Create Batch
        </button>
      </div>

      {/* Batch Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-card p-5 animate-pulse">
              <div className="h-5 w-40 bg-surface-100 rounded mb-3" />
              <div className="h-4 w-24 bg-surface-100 rounded mb-4" />
              <div className="flex gap-2 mb-4">{Array.from({ length: 3 }).map((_, j) => <div key={j} className="h-6 w-12 bg-surface-100 rounded" />)}</div>
              <div className="h-4 w-32 bg-surface-100 rounded" />
            </div>
          ))}
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-16 text-center">
          <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 font-medium">No batches yet</p>
          <p className="text-surface-400 text-sm mt-1">Create your first batch to organize your students</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4 inline mr-1" /> Create Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map(batch => (
            <div key={batch.id} className="bg-white rounded-xl shadow-card p-5 hover:shadow-elevated transition-shadow duration-300 border border-surface-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-surface-900">{batch.name}</h3>
                  {batch.subject && <p className="text-sm text-primary-600 font-medium">{batch.subject}</p>}
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  batch.status === 'active' ? 'bg-accent-50 text-accent-600' : 'bg-surface-100 text-surface-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${batch.status === 'active' ? 'bg-accent-500' : 'bg-surface-400'}`} />
                  {batch.status}
                </span>
              </div>

              {/* Days */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(batch.daysJson as string[]).map(d => (
                  <span key={d} className={`px-2 py-0.5 rounded text-xs font-medium ${DAY_COLORS[d] || 'bg-surface-100 text-surface-600'}`}>{d}</span>
                ))}
              </div>

              {/* Time & Capacity */}
              <div className="flex items-center gap-4 text-xs text-surface-500 mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{batch.startTime} - {batch.endTime}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{batch.enrolledStudents}/{batch.capacity}</span>
                {batch.room && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{batch.room}</span>}
              </div>

              {/* Teacher */}
              {batch.teacher && (
                <div className="pt-3 border-t border-surface-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700">{batch.teacher.name.charAt(0)}</div>
                  <span className="text-sm text-surface-600">{batch.teacher.name}</span>
                </div>
              )}

              {/* Capacity Bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    batch.enrolledStudents / batch.capacity > 0.9 ? 'bg-danger-500' :
                    batch.enrolledStudents / batch.capacity > 0.7 ? 'bg-warn-500' : 'bg-accent-500'
                  }`} style={{ width: `${Math.min((batch.enrolledStudents / batch.capacity) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
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
    if (form.daysJson.length === 0) { setError('Select at least one day'); return; }
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
      const details = err.response?.data?.details;
      setError(details ? `${msg}: ${details.join(', ')}` : msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-modal p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-surface-900">Create Batch</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="mb-4 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-danger-600 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Batch Name *" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. JEE Mains 2026" />
            <Field label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Physics" />
          </div>

          {/* Days */}
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-2">Days *</label>
            <div className="flex gap-2">
              {DAYS.map(d => (
                <button key={d} type="button" onClick={() => toggleDay(d)}
                  className={`w-10 h-10 rounded-lg text-xs font-medium transition-all ${
                    form.daysJson.includes(d) ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
                  }`}>{d}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Start Time *" name="startTime" value={form.startTime} onChange={handleChange} type="time" required />
            <Field label="End Time *" name="endTime" value={form.endTime} onChange={handleChange} type="time" required />
            <Field label="Capacity" name="capacity" value={form.capacity} onChange={handleChange} type="number" />
          </div>
          <Field label="Room" name="room" value={form.room} onChange={handleChange} placeholder="e.g. Room 101" />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 shadow-sm">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><CheckCircle2 className="w-4 h-4" /> Create Batch</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = 'text', placeholder }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-600 mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white border border-surface-200 rounded-xl text-surface-900 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-sm" />
    </div>
  );
}
