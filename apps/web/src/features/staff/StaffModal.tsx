import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Staff } from './StaffPage';
import { X, Shield, Check, Loader2, UserPlus, Info } from 'lucide-react';

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
    ]
  },
  {
    title: 'Financials & Payouts',
    items: [
      { id: 'fees.view', label: 'Access fee dashboard' },
      { id: 'fees.collect', label: 'Process fee payments' },
      { id: 'fees.edit', label: 'Edit fee structures' },
      { id: 'settings.manage', label: 'Admin & Staff controls' },
    ]
  }
];

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  teacher: ['attendance.mark', 'attendance.view', 'batches.view', 'students.view'],
  accountant: ['fees.view', 'fees.collect', 'fees.edit'],
  admin: PERMISSION_GROUPS.flatMap(g => g.items.map(p => p.id)),
  custom: []
};

export default function StaffModal({ isOpen, onClose, staff, onSuccess }: StaffModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'teacher' | 'accountant' | 'admin' | 'custom'>('teacher');
  const [baseSalary, setBaseSalary] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [password, setPassword] = useState('Staff@123');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const payload = {
        name, phone, email: email || undefined,
        role, baseSalary: parseFloat(baseSalary) || 0,
        permissions: role === 'custom' || role === 'admin' ? permissions : DEFAULT_PERMISSIONS[role],
        status, password: password || undefined,
      };

      if (staff) {
        await api.patch(`/staff/${staff.id}`, payload);
      } else {
        await api.post('/staff', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-canvas rounded-[2rem] shadow-premium w-full max-w-3xl overflow-hidden animate-slide-up flex flex-col h-[85vh] border border-hairline">
        <div className="px-8 py-6 border-b border-hairline flex items-center justify-between bg-surface/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-green/10 rounded-2xl">
              <Shield className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">
                {staff ? 'Refine Profile' : 'New Team Member'}
              </h3>
              <p className="text-xs text-slate font-medium">Configure identity and delegation powers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate hover:text-ink hover:bg-surface rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
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
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mint-input w-full h-12" placeholder="e.g. john@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Base Salary (₹)</label>
              <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)}
                className="mint-input w-full h-12 font-bold text-brand-green-deep" placeholder="0" />
            </div>
          </div>

          {/* Role Section */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate uppercase tracking-widest px-1">Choose Core Role</label>
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
                <h4 className="font-bold text-ink tracking-tight">The Delegation Matrix</h4>
                <p className="text-xs text-slate font-medium">Fine-tune exactly what this person can see and do.</p>
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

        <div className="px-8 py-6 border-t border-hairline bg-surface/30 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-6 py-3 text-xs font-bold text-slate hover:text-ink transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="mint-btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {staff ? 'Update Team Member' : 'Welcome to Team'}
          </button>
        </div>
      </div>
    </div>
  );
}
