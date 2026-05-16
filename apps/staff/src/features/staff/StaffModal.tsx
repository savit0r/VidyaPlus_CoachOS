import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Staff } from '../../types/staff';
import { X, Shield, Check, Loader2, UserPlus, Mail, ChevronRight } from 'lucide-react';
import { MODULAR_DELEGATION_ENGINE } from '../../lib/PermissionRegistry';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSuccess: () => void;
}

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  teacher: [
    'students.view',
    'batches.view',
    'attendance.view',
    'attendance.mark',
    'notifications.view'
  ],
  accountant: [
    'students.view',
    'batches.view',
    'fees.view',
    'fees.collect',
    'fees.edit',
    'fees.delete',
    'reports.view',
    'notifications.view',
    'staff.view'
  ],
  admin: MODULAR_DELEGATION_ENGINE.flatMap(g => g.permissions.map(p => p.id)),
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
      setBaseSalary(staff.baseSalary?.toString() || '0');
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
    setPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    // Step 1: Send OTP for NEW staff
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
      } else {
         setStep('form');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-ink/40 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-hidden" onClick={onClose}>
      <div 
        className="bg-canvas rounded-[2.5rem] shadow-premium w-full max-w-4xl overflow-hidden animate-slide-up flex flex-col h-[95vh] sm:h-[90vh] border border-hairline"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-hairline flex items-center justify-between bg-surface/30 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-green/10 rounded-2xl shrink-0">
              <Shield className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight uppercase tracking-widest">
                {staff ? 'Refine Responsibility' : 'Delegate Authority'}
              </h3>
              <p className="text-[10px] text-slate font-black uppercase tracking-[0.2em] opacity-60">
                {step === 'otp' ? 'Security verification required' : 'Set identity and access parameters'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate hover:text-ink hover:bg-surface rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar space-y-10">
          {error && (
            <div className="p-5 bg-brand-error/10 border border-brand-error/20 rounded-2xl text-brand-error text-[10px] font-black uppercase tracking-widest text-center animate-shake">
              {error}
            </div>
          )}

          {step === 'form' && (
            <form id="staff-form" onSubmit={handleSubmit} className="space-y-12 animate-fade-in">
              {/* Profile Data */}
              <div className="space-y-8">
                <SectionHeader label="Team Identity" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <FormField label="Full Name" value={name} onChange={setName} required placeholder="Legal Name" />
                  <FormField label="Contact Number" value={phone} onChange={setPhone} required placeholder="98765-XXXXX" />
                  <FormField label="Official Email" value={email} onChange={setEmail} type="email" required placeholder="name@institute.com" />
                  <FormField label="Base Renumeration (₹)" value={baseSalary} onChange={setBaseSalary} type="number" placeholder="0" />
                </div>
              </div>

              {/* Archetype Selection */}
              <div className="space-y-8">
                <SectionHeader label="System Archetype" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['teacher', 'accountant', 'admin', 'custom'].map((r) => (
                    <button key={r} type="button" onClick={() => handleRoleChange(r)}
                      className={`py-4 px-6 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        role === r ? 'bg-ink text-canvas border-ink shadow-lg scale-[1.02]' : 'bg-surface/50 text-slate border-hairline hover:border-brand-green'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modular Delegation Matrix */}
              <div className="space-y-8 border-t border-hairline pt-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <SectionHeader label="Responsibility Matrix" />
                    <p className="text-xs text-steel font-medium mt-2">Modular features allowed for this role.</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${role === 'custom' ? 'bg-brand-green/5 border-brand-green/20' : 'bg-surface border-hairline'}`}>
                    <div className={`w-2 h-2 rounded-full ${role === 'custom' ? 'bg-brand-green animate-pulse' : 'bg-stone opacity-30'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${role === 'custom' ? 'text-brand-green-deep' : 'text-stone opacity-60'}`}>
                      {role === 'custom' ? 'Custom Engine Unlocked' : 'Template Locked'}
                    </span>
                  </div>
                </div>                <div className="space-y-12">
                  {MODULAR_DELEGATION_ENGINE.map((module) => (
                    <div key={module.id} className="space-y-6 animate-slide-up">
                      <div className="flex items-center justify-between border-b border-hairline pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-green/5 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-brand-green" />
                          </div>
                          <h4 className="text-xs font-black text-ink uppercase tracking-widest">{module.label}</h4>
                        </div>
                        {role === 'custom' && (
                          <button 
                            type="button"
                            onClick={() => {
                              const modulePerms = module.permissions.map(p => p.id);
                              const allSelected = modulePerms.every(p => permissions.includes(p));
                              if (allSelected) {
                                setPermissions(prev => prev.filter(p => !modulePerms.includes(p)));
                              } else {
                                setPermissions(prev => [...new Set([...prev, ...modulePerms])]);
                              }
                            }}
                            className="text-[9px] font-black text-brand-green uppercase tracking-widest hover:underline"
                          >
                            {module.permissions.every(p => permissions.includes(p.id)) ? 'Deselect Module' : 'Select Module'}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {module.permissions.map((perm) => {
                          const isSelected = permissions.includes(perm.id);
                          const isDisabled = role !== 'custom' && role !== 'admin';
                          
                          return (
                            <div 
                              key={perm.id} 
                              onClick={() => togglePermission(perm.id)}
                              className={`flex flex-col text-left p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                                isSelected ? 'bg-canvas border-brand-green shadow-premium-subtle' : 'bg-surface/30 border-hairline opacity-60 grayscale-[0.5]'
                              } ${isDisabled ? 'cursor-not-allowed' : 'hover:scale-[1.02] hover:border-brand-green hover:grayscale-0 cursor-pointer active:scale-95'}`}
                            >
                              {isSelected && (
                                <div className="absolute top-0 right-0 p-1">
                                  <div className="w-3 h-3 bg-brand-green rounded-bl-lg" />
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4 mb-3">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'bg-brand-green border-brand-green text-white shadow-[0_0_12px_rgba(0,212,164,0.3)]' 
                                    : 'bg-canvas border-hairline group-hover:border-slate'
                                }`}>
                                  {isSelected && <Check className="w-4 h-4 stroke-[4]" />}
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? 'text-ink' : 'text-slate'}`}>
                                  {perm.label}
                                </span>
                              </div>
                              <p className={`text-[10px] font-medium leading-relaxed ${isSelected ? 'text-slate' : 'text-stone'}`}>
                                {perm.description}
                              </p>
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
            <form id="staff-form" onSubmit={handleSubmit} className="space-y-12 animate-fade-in text-center max-w-sm mx-auto mt-20">
              <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-green">
                <Mail className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black text-ink uppercase tracking-widest">Security Bridge</h3>
                <p className="text-xs text-steel font-medium leading-relaxed">
                  We've dispatched a 6-digit authorization code to <br/>
                  <span className="font-bold text-ink border-b border-hairline-dark">{email}</span>
                </p>
              </div>
              <div className="space-y-4 text-left">
                <label className="block text-[10px] font-black text-slate uppercase tracking-widest ml-1 opacity-60">Verification Code</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  placeholder="••••••"
                  required
                  className="mint-input w-full h-16 sm:h-20 text-center text-3xl tracking-[0.6em] font-mono shadow-inner" 
                />
              </div>
              <button type="button" onClick={() => setStep('form')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate hover:text-ink transition-colors">
                Return to Details
              </button>
            </form>
          )}
        </div>

        <div className="px-6 sm:px-12 py-6 sm:py-10 border-t border-hairline bg-surface/30 flex flex-col sm:flex-row justify-end gap-4 sm:gap-6 sticky bottom-0 z-20">
          <button onClick={onClose}
            className="order-2 sm:order-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate hover:text-ink transition-all py-4 sm:py-0">Cancel</button>
          <button form="staff-form" type="submit" disabled={loading || (step === 'otp' && otp.length !== 6)}
            className="order-1 sm:order-2 mint-btn-primary h-14 sm:h-16 px-12 sm:px-16 flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-brand-green/10">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            <span className="text-[10px] uppercase tracking-widest font-black">
              {step === 'form' && email && !staff ? 'Authorize Member' : 'Deploy Changes'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
       <h4 className="text-[11px] font-black text-ink uppercase tracking-[0.25em]">{label}</h4>
    </div>
  );
}

function FormField({ label, value, onChange, required, type = 'text', placeholder }: any) {
  return (
    <div className="space-y-2.5">
      <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1 opacity-60">{label} {required && '*'}</label>
      <input 
        type={type} 
        required={required} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="mint-input w-full h-12 sm:h-14 font-bold text-sm" 
        placeholder={placeholder} 
      />
    </div>
  );
}
