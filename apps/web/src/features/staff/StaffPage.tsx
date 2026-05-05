import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Users, UserPlus, CreditCard, Shield, Edit2, Trash2,
  Loader2, CheckCircle2, History, X
} from 'lucide-react';
import StaffModal from './StaffModal';
import PayrollModal from './PayrollModal';

export interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: 'teacher' | 'accountant' | 'admin' | 'custom';
  baseSalary: number;
  permissions: string[];
  status: 'active' | 'inactive';
}

export interface Payroll {
  id: string;
  staffName: string;
  staffPhone: string;
  role: string;
  amount: number;
  paymentMode: string;
  referenceNo?: string;
  period: string;
  paymentDate: string;
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View mode toggles
  const [viewMode, setViewMode] = useState<'staff' | 'payroll'>('staff');

  // Modal control
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [payrollStaff, setPayrollStaff] = useState<Staff | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/staff');
      setStaffList(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/staff/payroll');
      setPayrollHistory(data.data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'staff') {
      fetchStaff();
    } else {
      fetchPayrollHistory();
    }
  }, [viewMode]);

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.delete(`/staff/${staffId}`);
      alert('Staff member deleted successfully');
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete staff member');
    }
  };

  const handleOpenAdd = () => {
    setSelectedStaff(null);
    setIsStaffModalOpen(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsStaffModalOpen(true);
  };

  const handleOpenPay = (staff: Staff) => {
    setPayrollStaff(staff);
    setIsPayrollModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Staff Management</h1>
          <p className="text-sm text-surface-500 mt-1">Manage team roles, permissions, and salary payroll</p>
        </div>
        <div className="flex gap-4">
          <div className="flex rounded-2xl p-1.5 bg-surface-100 border border-surface-200">
            <button onClick={() => setViewMode('staff')}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${viewMode === 'staff' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-800'}`}>
              Staff Registry
            </button>
            <button onClick={() => setViewMode('payroll')}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${viewMode === 'payroll' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-800'}`}>
              Payroll & History
            </button>
          </div>
          {viewMode === 'staff' && (
            <button onClick={handleOpenAdd}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98]">
              <UserPlus className="w-5 h-5" /> Add New Staff
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {!loading && viewMode === 'staff' && (
        <div className="bg-white rounded-3xl shadow-card border border-surface-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/50 border-b border-surface-100 text-[11px] uppercase tracking-widest text-surface-400 font-bold">
                  <th className="px-6 py-5">Name</th>
                  <th className="px-6 py-5">Contact</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Base Salary</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {staffList.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-surface-500">No staff members registered.</td></tr>
                ) : (
                  staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-surface-900">{staff.name}</p>
                        <p className="text-xs text-surface-400">ID: {staff.id.split('-')[0]}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600">
                        {staff.phone}
                        {staff.email && <span className="block text-xs text-surface-400">{staff.email}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize px-2.5 py-1 bg-surface-100 border border-surface-200 rounded-lg text-xs font-medium text-surface-700">
                          {staff.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-surface-900">
                        ₹{staff.baseSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${staff.status === 'active' ? 'bg-accent-50 text-accent-700 border-accent-200' : 'bg-surface-100 text-surface-600 border-surface-200'}`}>
                          {staff.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenPay(staff)}
                            className="p-2 text-accent-600 hover:bg-accent-50 rounded-xl transition-colors" title="Pay Salary">
                            <CreditCard className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleOpenEdit(staff)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors" title="Edit Staff Details">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(staff.id)}
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-xl transition-colors" title="Delete Staff">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && viewMode === 'payroll' && (
        <div className="bg-white rounded-3xl shadow-card border border-surface-100 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50/50 border-b border-surface-100 text-[11px] uppercase tracking-widest text-surface-400 font-bold">
                  <th className="px-6 py-5">Staff Member</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Month/Year</th>
                  <th className="px-6 py-5">Amount Paid</th>
                  <th className="px-6 py-5">Method & Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {payrollHistory.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-surface-500">No payroll records found.</td></tr>
                ) : (
                  payrollHistory.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-surface-900">{p.staffName}</p>
                        <p className="text-xs text-surface-400">{p.staffPhone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-xs font-medium text-surface-700">
                          {p.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-surface-700">
                        {p.period}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-primary-600">
                        ₹{p.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600">
                        <div>{p.paymentMode.toUpperCase()} {p.referenceNo && `• ${p.referenceNo}`}</div>
                        <span className="text-xs text-surface-400">{p.paymentDate}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Add/Edit Modal */}
      {isStaffModalOpen && (
        <StaffModal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
          staff={selectedStaff}
          onSuccess={fetchStaff}
        />
      )}

      {/* Payroll record Modal */}
      {isPayrollModalOpen && payrollStaff && (
        <PayrollModal
          isOpen={isPayrollModalOpen}
          onClose={() => setIsPayrollModalOpen(false)}
          staff={payrollStaff}
          onSuccess={() => { setViewMode('payroll'); fetchPayrollHistory(); }}
        />
      )}
    </div>
  );
}
