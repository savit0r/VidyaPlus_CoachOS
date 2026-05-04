import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Staff } from './StaffPage';
import { X, Shield, Check, Loader2 } from 'lucide-react';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSuccess: () => void;
}

const PERMISSION_OPTIONS = [
  { id: 'students.view', label: 'View Students' },
  { id: 'students.add', label: 'Add Students' },
  { id: 'students.edit', label: 'Edit Students' },
  { id: 'students.delete', label: 'Delete Students' },
  { id: 'batches.view', label: 'View Batches' },
  { id: 'batches.edit', label: 'Edit Batches' },
  { id: 'batches.delete', label: 'Delete Batches' },
  { id: 'attendance.mark', label: 'Mark Attendance' },
  { id: 'attendance.view', label: 'View Attendance' },
  { id: 'attendance.edit', label: 'Edit & Lock Attendance' },
  { id: 'fees.view', label: 'View Fees' },
  { id: 'fees.collect', label: 'Collect Payment' },
  { id: 'fees.edit', label: 'Manage Fees' },
  { id: 'fees.delete', label: 'Delete Fees' },
  { id: 'settings.manage', label: 'Settings & Staff Mgmt' },
];

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  teacher: ['attendance.mark', 'attendance.view', 'batches.view'],
  accountant: ['fees.view', 'fees.collect', 'fees.edit'],
  admin: PERMISSION_OPTIONS.map(p => p.id),
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
    if (!name || !phone) {
      alert('Please fill name and phone number');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name,
        phone,
        email: email || undefined,
        role,
        baseSalary: parseFloat(baseSalary) || 0,
        permissions: role === 'custom' || role === 'admin' ? permissions : DEFAULT_PERMISSIONS[role],
        status,
        password: password || undefined,
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
    <div className="fixed inset-0 z-50 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up flex flex-col h-[90vh]">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <h3 className="font-bold text-surface-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            {staff ? 'Update Staff Member' : 'Add New Staff Member'}
          </h3>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Phone Number</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Base Salary (₹)</label>
              <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Default Role</label>
              <select value={role} onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none">
                <option value="teacher">Teacher</option>
                <option value="accountant">Accountant</option>
                <option value="admin">Administrator</option>
                <option value="custom">Custom permissions</option>
              </select>
            </div>
            {staff && (
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Account Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
            {!staff && (
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" placeholder="Default Password" />
              </div>
            )}
          </div>

          {/* Delegation Engine (Permission Grid) */}
          <div className="border-t border-surface-100 pt-6">
            <h4 className="text-sm font-semibold text-surface-900 mb-1">Granular Delegation Matrix</h4>
            <p className="text-xs text-surface-500 mb-4">Select permissions. Predefined roles have locked default permissions.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-50 p-4 rounded-xl border border-surface-200">
              {PERMISSION_OPTIONS.map(({ id, label }) => {
                const isSelected = permissions.includes(id);
                const isDisabled = role !== 'custom' && role !== 'admin';
                return (
                  <label key={id} onClick={() => togglePermission(id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      isSelected ? 'bg-primary-50/50 text-primary-900' : 'hover:bg-white text-surface-600'
                    } ${isDisabled ? 'opacity-80' : ''}`}>
                    <input type="checkbox" checked={isSelected} readOnly
                      className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm font-medium select-none">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-surface-100 bg-surface-50 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {staff ? 'Update' : 'Create Staff'}
          </button>
        </div>
      </div>
    </div>
  );
}
