import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import {
  X, CheckCircle2, Clock, AlertCircle, FileText,
  CreditCard, Loader2, IndianRupee, Printer, ArrowRight,
  Search, Wallet, TrendingUp, MessageCircle, ArrowDownCircle,
  ArrowUpCircle, ChevronRight, History, Briefcase, Calendar
} from 'lucide-react';

interface SalaryRecord {
  id: string;
  month: string;
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'pending';
  payouts: Payout[];
  attendance?: {
    present: number;
    absent: number;
    late: number;
  };
}

interface Payout {
  id: string;
  amount: number;
  date: string;
  mode: string;
  referenceNo?: string;
}

interface PayrollDrawerProps {
  staffId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PayrollDrawer({ staffId, onClose, onSuccess }: PayrollDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [staff, setStaff] = useState<any>(null);
  const [summary, setSummary] = useState({ totalPending: 0, totalPaid: 0 });

  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMode, setPayoutMode] = useState('bank');
  const [referenceNo, setReferenceNo] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchSalaryLedger = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      const res = await api.get(`/staff/${staffId}`);
      setStaff(res.data.data);

      const mockRecords: SalaryRecord[] = [
        {
          id: 'sal_1',
          month: 'May',
          year: 2024,
          baseSalary: 25000,
          bonus: 2000,
          deductions: 500,
          netSalary: 26500,
          paidAmount: 0,
          status: 'pending',
          payouts: [],
          attendance: { present: 22, absent: 2, late: 1 }
        },
        {
          id: 'sal_2',
          month: 'April',
          year: 2024,
          baseSalary: 25000,
          bonus: 0,
          deductions: 0,
          netSalary: 25000,
          paidAmount: 25000,
          status: 'paid',
          payouts: [
            { id: 'p_1', amount: 25000, date: '2024-04-05', mode: 'bank', referenceNo: 'TXN882910' }
          ],
          attendance: { present: 25, absent: 0, late: 0 }
        }
      ];
      setRecords(mockRecords);
      setSummary({ totalPending: 26500, totalPaid: 25000 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    if (staffId) {
      fetchSalaryLedger();
      setShowPayoutForm(false);
    }
  }, [staffId, fetchSalaryLedger]);

  const handlePayClick = (record: SalaryRecord) => {
    setSelectedRecord(record);
    setPayoutAmount((record.netSalary - record.paidAmount).toString());
    setShowPayoutForm(true);
  };

  const submitPayout = async () => {
    if (!selectedRecord) return;
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowPayoutForm(false);
      fetchSalaryLedger();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (!staffId) return null;

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-ink/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[160] w-full max-w-2xl bg-canvas shadow-premium flex flex-col animate-slide-in-right overflow-hidden rounded-l-lg border-l border-hairline">
        
        {/* Header - Dark Atmospheric Gradient */}
        <div className="bg-gradient-to-br from-[#08201D] to-[#2DD9AF] px-10 py-12 border-b border-hairline relative flex-shrink-0">
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">Payroll Ledger</h2>
              {staff && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-md bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-white">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{staff.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70 font-mono">{staff.employeeId || 'STAFF'}</p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 relative z-10">
            <div className="mint-card p-5 bg-white/5 border-white/10 backdrop-blur-md">
               <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Unpaid Amount</p>
               <h3 className="text-2xl font-black text-white font-mono">₹{summary.totalPending.toLocaleString()}</h3>
            </div>
            <div className="mint-card p-5 bg-white/5 border-white/10 backdrop-blur-md">
               <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Disbursed</p>
               <h3 className="text-2xl font-black text-white font-mono">₹{summary.totalPaid.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-surface p-10 space-y-10">
          {loading && !staff ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
              <p className="text-[11px] font-black text-steel uppercase tracking-widest mt-6">Syncing Payroll Data...</p>
            </div>
          ) : (
            <div className="space-y-8 relative">
               <div className="absolute left-[23px] top-6 bottom-6 w-[1px] bg-hairline" />

               {records.map((record) => (
                  <div key={record.id} className="relative pl-14 group">
                     <div className="absolute left-0 top-0 w-11 h-11 rounded-md bg-canvas border border-hairline flex items-center justify-center z-10 shadow-sm group-hover:border-brand-green transition-all">
                        <Briefcase className={`w-5 h-5 ${record.status === 'paid' ? 'text-brand-green' : 'text-brand-warn'}`} />
                     </div>

                     <div className="mint-card p-6 group-hover:border-brand-green transition-all bg-canvas">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <p className="text-[10px] font-black text-brand-tag uppercase tracking-widest mb-1">Salary Cycle</p>
                              <h4 className="text-base font-black text-ink font-mono">{record.month} {record.year}</h4>
                              {record.attendance && (
                                <div className="flex items-center gap-2 mt-3">
                                   <div className="mint-badge !rounded-md px-1.5 py-0.5 text-[8px] bg-brand-green-soft text-brand-green-deep border-brand-green/20">
                                      {record.attendance.present} PRESENT
                                   </div>
                                   <div className="mint-badge !rounded-md px-1.5 py-0.5 text-[8px] bg-brand-error/10 text-brand-error border-brand-error/20">
                                      {record.attendance.absent} ABSENT
                                   </div>
                                </div>
                              )}
                           </div>
                           <div className={`mint-badge !rounded-md px-1.5 py-0.5 text-[9px] ${
                              record.status === 'paid' ? 'bg-brand-green-soft text-brand-green-deep' : 'bg-brand-error/10 text-brand-error'
                           }`}>
                              {record.status}
                           </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 p-4 bg-surface rounded-md border border-hairline mb-6">
                           <div>
                              <p className="text-[8px] font-black text-steel uppercase mb-1">Base</p>
                              <p className="text-xs font-black text-ink font-mono">₹{record.baseSalary.toLocaleString()}</p>
                           </div>
                           <div className="border-l border-hairline pl-3">
                              <p className="text-[8px] font-black text-steel uppercase mb-1">Bonus</p>
                              <p className="text-xs font-black text-brand-green-deep font-mono">₹{record.bonus.toLocaleString()}</p>
                           </div>
                           <div className="border-l border-hairline pl-3">
                              <p className="text-[8px] font-black text-steel uppercase mb-1">Ded.</p>
                              <p className="text-xs font-black text-brand-error font-mono">₹{record.deductions.toLocaleString()}</p>
                           </div>
                           <div className="border-l border-hairline pl-3">
                              <p className="text-[8px] font-black text-steel uppercase mb-1">Net</p>
                              <p className="text-xs font-black text-ink font-mono">₹{record.netSalary.toLocaleString()}</p>
                           </div>
                        </div>

                        {record.payouts.length > 0 && (
                           <div className="space-y-3 mt-6 border-t border-hairline pt-6">
                              {record.payouts.map(p => (
                                 <div key={p.id} className="flex items-center justify-between p-4 bg-surface rounded-md border border-hairline group/payout hover:bg-canvas transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-8 h-8 rounded-md bg-brand-green-soft flex items-center justify-center">
                                          <ArrowUpCircle className="w-4 h-4 text-brand-green-deep" />
                                       </div>
                                       <div>
                                          <p className="text-xs font-black text-ink mb-0.5">₹{p.amount.toLocaleString()} Disbursed</p>
                                          <p className="text-[9px] font-medium text-steel uppercase tracking-widest font-mono">{p.mode} • {p.date}</p>
                                       </div>
                                    </div>
                                    <button className="p-2 text-steel hover:text-ink hover:bg-surface rounded-md transition-all">
                                       <Printer className="w-4 h-4" />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        )}

                        {record.status !== 'paid' && !showPayoutForm && (
                           <button onClick={() => handlePayClick(record)}
                             className="mint-btn-primary w-full mt-6 text-[10px] uppercase tracking-widest">
                              <IndianRupee className="w-3.5 h-3.5" /> Process Payout
                           </button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
          )}
        </div>

        {/* Payout Form */}
        {showPayoutForm && selectedRecord && (
          <div className="absolute inset-x-0 bottom-0 z-[170] bg-canvas border-t border-hairline shadow-premium p-10 animate-slide-up rounded-t-lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-ink tracking-tight uppercase tracking-widest">Disburse Salary</h3>
              <button onClick={() => setShowPayoutForm(false)} className="p-2 text-steel hover:text-ink hover:bg-surface rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-steel uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)}
                    className="mint-input w-full h-12 text-lg font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-steel uppercase tracking-widest ml-1">Method</label>
                  <select value={payoutMode} onChange={(e) => setPayoutMode(e.target.value)}
                    className="mint-input w-full h-12 uppercase font-black tracking-widest">
                    <option value="bank">Bank Transfer</option>
                    <option value="upi">UPI / GPay</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              <button onClick={submitPayout} disabled={processing}
                className="mint-btn-primary w-full h-14 text-xs tracking-[0.2em] uppercase">
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Confirm Disbursement
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
