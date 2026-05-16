import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Staff } from './StaffPage';
import { X, Shield, Check, Loader2, UserPlus, Mail } from 'lucide-react';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSuccess: () => void;
}

const PERMISSION_GROUPS = [
  {
    title: 'Students & Inquiries',
    items: [
      { id: 'students.view', label: 'View student directory' },
      { id: 'students.add', label: 'Enroll new students' },
      { id: 'students.edit', label: 'Modify student data' },
      { id: 'students.delete', label: 'Remove student records' },
    ]
  },
  {
    title: 'Academics & Attendance',
    items: [
      { id: 'batches.view', label: 'View batch schedules' },
      { id: 'batches.edit', label: 'Manage batch settings' },
      { id: 'attendance.mark', label: 'Mark daily attendance' },
      { id: 'attendance.view', label: 'View attendance reports' },
      { id: 'attendance.edit', label: 'Correct past attendance' },
    ]
  },
  {
    title: 'Financials & Fees',
    items: [
      { id: 'fees.view', label: 'Access fee dashboard' },
      { id: 'fees.collect', label: 'Process fee payments' },
      { id: 'fees.edit', label: 'Edit fee structures' },
      { id: 'fees.delete', label: 'Void/Delete receipts' },
    ]
  },
  {
    title: 'Analytics & Reports',
    items: [
      { id: 'reports.view', label: 'View operational reports' },
      { id: 'reports.export', label: 'Download data exports' },
    ]
  },
  {
    title: 'Communications',
    items: [
      { id: 'notifications.view', label: 'View notification logs' },
      { id: 'notifications.send', label: 'Send broadcast alerts' },
    ]
  },
  {
    title: 'System & Team',
    items: [
      { id: 'staff.view', label: 'View staff members' },
      { id: 'staff.manage', label: 'Manage staff & payroll' },
      { id: 'settings.manage', label: 'Institute settings access' },
    ]
  }
];

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  teacher: ['attendance.mark', 'attendance.view', 'batches.view', 'students.view', 'notifications.view'],
  accountant: ['fees.view', 'fees.collect', 'fees.edit', 'batches.view', 'students.view', 'reports.view', 'staff.view'],
  admin: PERMISSION_GROUPS.flatMap(g => g.items.map(p => p.id)),
  custom: []
};

export default function StaffModal({ isOpen, onClose, staff, onSuccess }: StaffModalProps) {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'teacher' | 'accountant' | 'admin' | 'custom'>('teacher');
  const [baseSalary, setBaseSalary] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setPhone(staff.phone);
      setEmail(staff.email || '');
      setRole(staff.role);
      setBaseSalary(staff.baseSalary.toString());
      setPermissions(staff.permissions || []);
      setStatus(staff.status);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setRole('teacher');
      setBaseSalary('0');
      setPermissions(DEFAULT_PERMISSIONS['teacher']);
      setStatus('active');
    }
  }, [staff]);

  const handleRoleChange = (newRole: any) => {
    setRole(newRole);
    if (newRole !== 'custom') {
      setPermissions(DEFAULT_PERMISSIONS[newRole] || []);
    }
  };

  const togglePermission = (permId: string) => {
    if (role !== 'custom' && role !== 'admin') return;
    if (permissions.includes(permId)) {
      setPermissions(permissions.filter(p => p !== permId));
    } else {
      setPermissions([...permissions, permId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    // Step 1: Send OTP
    if (!staff && email && step === 'form') {
      setLoading(true); setError('');
      try {
        await api.post('/auth/otp/send-verification', { email: email.trim() });
        setStep('otp');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to send OTP. Please check the email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true); setError('');
    try {
      const payload: any = {
        name, phone, email: email || undefined,
        role, baseSalary: parseFloat(baseSalary) || 0,
        permissions: role === 'custom' || role === 'admin' ? permissions : DEFAULT_PERMISSIONS[role],
        status,
        otp: step === 'otp' ? otp : undefined,
      };

      if (staff) {
        await api.patch(`/staff/${staff.id}`, payload);
      } else {
        await api.post('/staff', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save staff member');
      if (err.response?.data?.error === 'Invalid OTP') {
         // stay on otp step
      } else {
         setStep('form');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-canvas rounded-[2rem] shadow-premium w-full max-w-3xl overflow-hidden animate-slide-up flex flex-col h-[85vh] border border-hairline">
        <div className="px-8 py-6 border-b border-hairline flex items-center justify-between bg-surface/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-green/10 rounded-2xl">
              <Shield className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">
                {staff ? 'Edit Member Details' : 'Add New Member'}
              </h3>
              <p className="text-xs text-slate font-medium">
                {step === 'otp' ? 'Verify member email' : 'Manage details and what they can access'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate hover:text-ink hover:bg-surface rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 p-4 bg-brand-error/10 border border-brand-error/20 rounded-xl text-brand-error text-xs font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          {step === 'form' && (
            <form id="staff-form" onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
              {/* Identity Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="mint-input w-full h-12" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Phone Number</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="mint-input w-full h-12" placeholder="e.g. 9876543210" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="mint-input w-full h-12" placeholder="e.g. john@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Monthly Salary (₹)</label>
                  <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)}
                    className="mint-input w-full h-12 font-bold text-brand-green-deep" placeholder="0" />
                </div>
              </div>

              {/* Role Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Role / Job Title</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['teacher', 'accountant', 'admin', 'custom'].map((r) => (
                    <button key={r} type="button" onClick={() => handleRoleChange(r)}
                      className={`py-3 px-4 rounded-2xl border text-xs font-bold capitalize transition-all ${
                        role === r ? 'bg-ink text-white border-ink shadow-lg' : 'bg-surface/50 text-slate border-hairline hover:border-brand-green'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delegation Matrix */}
              <div className="space-y-4 border-t border-hairline pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink tracking-tight">What can they do?</h4>
                    <p className="text-xs text-slate font-medium">Set exactly what this person is allowed to see or change.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-green/5 border border-brand-green/10 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                    <span className="text-[9px] font-bold text-brand-green uppercase tracking-widest">
                      {role === 'custom' ? 'Custom Mode Active' : 'Template Locked'}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-3">
                      <h5 className="text-[10px] font-black text-stone uppercase tracking-[0.15em]">{group.title}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {group.items.map(({ id, label }) => {
                            const isSelected = permissions.includes(id);
                            const isDisabled = role !== 'custom' && role !== 'admin';
                            return (
                              <div key={id} onClick={() => togglePermission(id)}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                                  isSelected ? 'bg-canvas border-brand-green shadow-premium' : 'bg-surface/30 border-hairline hover:bg-surface'
                                } ${isDisabled ? 'cursor-default opacity-80' : ''}`}>
                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                  isSelected ? 'bg-brand-green border-brand-green text-white' : 'bg-white border-hairline'
                                }`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <span className={`text-[11px] font-bold ${isSelected ? 'text-ink' : 'text-slate'}`}>{label}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form id="staff-form" onSubmit={handleSubmit} className="space-y-8 animate-fade-in text-center max-w-sm mx-auto mt-12">
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-green">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-ink uppercase tracking-widest mb-2">Verify Email</h3>
                <p className="text-xs text-slate">We've sent a 6-digit code to <span className="font-bold text-ink">{email}</span></p>
              </div>
              <div className="space-y-3 text-left">
                <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1">Verification Code</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  placeholder="••••••"
                  required
                  className="mint-input w-full h-16 text-center text-2xl tracking-[0.5em] font-mono" 
                />
              </div>
              <button type="button" onClick={() => setStep('form')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate hover:text-ink">
                Back to Edit Details
              </button>
            </form>
          )}
        </div>

        <div className="px-8 py-6 border-t border-hairline bg-surface/30 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-6 py-3 text-xs font-bold text-slate hover:text-ink transition-all">Cancel</button>
          <button form="staff-form" type="submit" disabled={loading || (step === 'otp' && otp.length !== 6)}
            className="mint-btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {step === 'form' && email && !staff ? 'Send Verification' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
