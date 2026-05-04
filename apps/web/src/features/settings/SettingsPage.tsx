import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Settings, Save, Check, Loader2, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings/profile');
      if (data.success) {
        const i = data.data;
        setName(i.name || '');
        setPhone(i.phone || '');
        setEmail(i.email || '');
        setAddress(i.address || '');
        setAcademicYear(i.academicYear || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Name and phone number are required');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch('/settings/profile', {
        name,
        phone,
        email: email || null,
        address: address || null,
        academicYear: academicYear || null,
      });
      alert('Institute settings updated successfully');
      fetchProfile();
      // Force reload or trigger re-pull of layout name (or just do a fast window reload to sync with layout auth store)
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save institute profile');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary-500" /> Institute Configuration
          </h1>
          <p className="text-sm text-surface-500 mt-1">Configure institute brand, academic details, and contact profiles</p>
        </div>
        <button onClick={fetchProfile}
          className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg transition-all" title="Reload Settings">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSave} className="bg-white border border-surface-100 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Institute Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" placeholder="e.g. Vidya Coaching" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Support Phone</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" placeholder="e.g. 9876543210" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Contact Email (Optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" placeholder="e.g. info@vidyacoach.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Academic Session Year (Optional)</label>
              <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" placeholder="e.g. 2026-2027" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Mailing Address (Optional)</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" placeholder="Enter complete office address" />
          </div>

          <div className="pt-4 border-t border-surface-100 flex justify-end">
            <button type="submit" disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
