import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Settings, Save, Check, Loader2, RefreshCw, Camera, Image as ImageIcon } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
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
        setLogoUrl(i.logoUrl || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadToCloudinary(file);
      setLogoUrl(url);
    } catch (err) {
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
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
        logoUrl: logoUrl || null,
        academicYear: academicYear || null,
      });
      alert('Institute settings updated successfully');
      fetchProfile();
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
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-green" /> Institute Configuration
          </h1>
          <p className="text-sm text-steel mt-1">Configure institute brand, academic details, and contact profiles</p>
        </div>
        <button onClick={fetchProfile}
          className="p-2 text-steel hover:text-ink hover:bg-surface rounded-lg transition-all" title="Reload Settings">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSave} className="bg-white border border-hairline rounded-2xl p-6 shadow-sm space-y-8 animate-fade-in">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-hairline">
             <div className="relative group">
                <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-hairline bg-surface flex items-center justify-center overflow-hidden transition-colors group-hover:border-brand-green/50">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-steel" />
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
             </div>
             <div className="text-center">
               <h3 className="text-sm font-bold text-ink">Institute Logo</h3>
               <p className="text-[11px] text-steel mt-1 uppercase tracking-widest font-bold">Recommended: Square PNG/JPG</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">Institute Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl outline-none focus:border-brand-green transition-all" placeholder="e.g. Vidya Coaching" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">Support Phone</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl outline-none focus:border-brand-green transition-all" placeholder="e.g. 9876543210" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">Contact Email (Optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl outline-none focus:border-brand-green transition-all" placeholder="e.g. info@vidyacoach.com" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">Academic Session Year (Optional)</label>
              <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl outline-none focus:border-brand-green transition-all" placeholder="e.g. 2026-2027" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">Mailing Address (Optional)</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl outline-none focus:border-brand-green transition-all" placeholder="Enter complete office address" />
          </div>

          <div className="pt-6 border-t border-hairline flex justify-end">
            <button type="submit" disabled={actionLoading || uploadingLogo}
              className="mint-btn-brand px-10">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
