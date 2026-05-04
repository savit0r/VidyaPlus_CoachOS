import { useState } from 'react';
import api from '../../lib/api';
import { Staff } from './StaffPage';
import { X, CreditCard, Check, Loader2 } from 'lucide-react';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff;
  onSuccess: () => void;
}

export default function PayrollModal({ isOpen, onClose, staff, onSuccess }: PayrollModalProps) {
  const [amount, setAmount] = useState(staff.baseSalary.toString());
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank'>('cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) {
      alert('Amount is required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/staff/payroll', {
        staffId: staff.id,
        amount: parseFloat(amount),
        paymentMode,
        referenceNo: referenceNo || undefined,
        month: parseInt(month.toString()),
        year: parseInt(year.toString()),
      });
      alert('Salary payment recorded successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record salary payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up flex flex-col">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <h3 className="font-bold text-surface-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-500" /> Pay Staff Salary
          </h3>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-surface-50 p-3 rounded-xl border border-surface-200 mb-4">
            <p className="text-xs text-surface-500 font-medium">Paying To</p>
            <p className="font-bold text-surface-900 text-base">{staff.name}</p>
            <p className="text-xs text-surface-400">Default Salary: ₹{staff.baseSalary.toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Amount Paid (₹)</label>
            <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none text-base font-bold text-surface-900" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Month</label>
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Year</label>
              <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none">
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['cash', 'upi', 'bank'] as const).map((mode) => (
                <button type="button" key={mode} onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-1 text-sm font-medium rounded-xl border text-center transition-all ${
                    paymentMode === mode
                      ? 'bg-primary-50 text-primary-700 border-primary-500 shadow-sm'
                      : 'bg-white text-surface-600 border-surface-200 hover:bg-surface-50'
                  }`}>
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Reference No. (Optional)</label>
            <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl outline-none" placeholder="UPI TXN ID or bank reference" />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-surface-100 bg-surface-50 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent-600 text-white rounded-xl text-sm font-medium hover:bg-accent-700 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Record Payment
          </button>
        </div>
      </div>
    </div>
  );
}
