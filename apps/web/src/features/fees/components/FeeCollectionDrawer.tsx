import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import {
  X, CheckCircle2, Clock, AlertCircle, FileText,
  CreditCard, Loader2, IndianRupee, Printer, ArrowRight,
  Search, Wallet, TrendingUp, MessageCircle, ArrowDownCircle,
  ArrowUpCircle, ChevronRight, History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeeRecord {
  id: string;
  planName: string;
  frequency: string;
  periodLabel: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
  payments: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  mode: string;
  receiptNumber: string;
}

interface FeeCollectionDrawerProps {
  studentId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function FeeCollectionDrawer({ studentId, onClose, onSuccess }: FeeCollectionDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalDues: 0, totalPaid: 0, balance: 0 });
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [student, setStudent] = useState<any>(null);
  const navigate = useNavigate();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchLedger = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const stuRes = await api.get(`/students/${studentId}`);
      setStudent(stuRes.data.data);

      const res = await api.get(`/fees/student/${studentId}/ledger`);
      setSummary(res.data.data.summary);
      setRecords(res.data.data.records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchLedger();
      setShowPaymentForm(false);
    }
  }, [studentId, fetchLedger]);

  const handlePayClick = (record: FeeRecord) => {
    setSelectedRecord(record);
    setPaymentAmount(record.balance.toString());
    setPaymentMode('cash');
    setReferenceNo('');
    setShowPaymentForm(true);
  };

  const submitPayment = async () => {
    if (!selectedRecord) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedRecord.balance) {
      alert('Please enter a valid payment amount');
      return;
    }

    setProcessing(true);
    try {
      await api.post('/fees/payments', {
        feeRecordId: selectedRecord.id,
        amount,
        paymentMode,
        referenceNo: referenceNo || undefined,
      });
      setShowPaymentForm(false);
      fetchLedger();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setProcessing(false);
    }
  };

  if (!studentId) return null;

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-ink/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-[160] w-full max-w-2xl bg-canvas shadow-premium flex flex-col animate-slide-in-right overflow-hidden rounded-l-lg border-l border-hairline">
        
        {/* Header - Atmospheric Gradient */}
        <div className="hero-backdrop px-10 py-12 border-b border-hairline relative flex-shrink-0">
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-ink tracking-tight">Statement Ledger</h2>
              {student && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-md bg-canvas border border-hairline shadow-sm flex items-center justify-center font-black text-brand-green-deep">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-ink">{student.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate font-mono">{student.studentProfile?.studentCode}</p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-ink hover:bg-surface rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 relative z-10">
            <div className="mint-card p-5 bg-canvas/60 backdrop-blur-md">
               <p className="text-[10px] font-black text-steel uppercase tracking-widest mb-1">Net Balance</p>
               <h3 className="text-2xl font-black text-brand-error font-mono">₹{summary.balance.toLocaleString()}</h3>
            </div>
            <div className="mint-card p-5 bg-canvas/60 backdrop-blur-md">
               <p className="text-[10px] font-black text-steel uppercase tracking-widest mb-1">Total Collections</p>
               <h3 className="text-2xl font-black text-brand-green-deep font-mono">₹{summary.totalPaid.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-surface p-10 space-y-10">
          {loading && !student ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
              <p className="text-[11px] font-black text-steel uppercase tracking-widest mt-6">Generating Statement...</p>
            </div>
          ) : (
            <div className="space-y-8 relative">
               <div className="absolute left-[23px] top-6 bottom-6 w-[1px] bg-hairline" />

               {records.length === 0 ? (
                  <div className="mint-card p-12 text-center border-dashed">
                     <FileText className="w-10 h-10 text-stone mx-auto mb-4" />
                     <h4 className="text-xs font-black text-ink uppercase tracking-widest">No Transactions</h4>
                     <p className="text-[11px] text-slate mt-2">Financial dues will appear here once processed.</p>
                  </div>
               ) : (
                  records.map((record) => (
                    <div key={record.id} className="relative pl-14 group">
                       <div className="absolute left-0 top-0 w-11 h-11 rounded-md bg-canvas border border-hairline flex items-center justify-center z-10 shadow-sm group-hover:border-brand-green transition-all">
                          <ArrowDownCircle className={`w-5 h-5 ${record.status === 'paid' ? 'text-brand-green' : 'text-brand-error'}`} />
                       </div>

                       <div className="mint-card p-6 group-hover:border-brand-green transition-all bg-canvas">
                          <div className="flex justify-between items-start mb-6">
                             <div>
                                <p className="text-[10px] font-black text-brand-green uppercase tracking-widest mb-1">Fee Invoice</p>
                                <h4 className="text-base font-black text-ink">{record.planName}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                   <span className="mint-badge !rounded-md px-1.5 py-0.5 text-[9px] bg-surface text-steel border-hairline">
                                      {record.periodLabel}
                                   </span>
                                   <span className={`mint-badge !rounded-md px-1.5 py-0.5 text-[9px] ${
                                      record.status === 'paid' ? 'bg-brand-green-soft text-brand-green-deep border-brand-green/20' :
                                      'bg-brand-error/10 text-brand-error border-brand-error/20'
                                   }`}>
                                      {record.status}
                                   </span>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-steel uppercase tracking-widest mb-1">Due</p>
                                <p className="text-xs font-black text-ink font-mono">{new Date(record.dueDate).toLocaleDateString()}</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-4 bg-surface rounded-md border border-hairline mb-6">
                             <div>
                                <p className="text-[9px] font-black text-steel uppercase tracking-widest mb-1">Invoice</p>
                                <p className="text-sm font-black text-ink font-mono">₹{record.amount.toLocaleString()}</p>
                             </div>
                             <div className="border-x border-hairline px-4">
                                <p className="text-[9px] font-black text-steel uppercase tracking-widest mb-1">Paid</p>
                                <p className="text-sm font-black text-brand-green-deep font-mono">₹{record.paid.toLocaleString()}</p>
                             </div>
                             <div className="pl-4">
                                <p className="text-[9px] font-black text-steel uppercase tracking-widest mb-1">Balance</p>
                                <p className="text-sm font-black text-brand-error font-mono">₹{record.balance.toLocaleString()}</p>
                             </div>
                          </div>

                          {record.payments.length > 0 && (
                             <div className="space-y-3 mt-6 border-t border-hairline pt-6">
                                <p className="text-[9px] font-black text-steel uppercase tracking-widest mb-4 flex items-center gap-2">
                                   <History className="w-3 h-3 text-brand-green" /> Payment Activity
                                </p>
                                {record.payments.map(p => (
                                   <div key={p.id} className="flex items-center justify-between p-4 bg-surface rounded-md border border-hairline group/payment hover:bg-canvas transition-all">
                                      <div className="flex items-center gap-4">
                                         <div className="w-8 h-8 rounded-md bg-brand-green-soft flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-brand-green-deep" />
                                         </div>
                                         <div>
                                            <p className="text-xs font-black text-ink leading-none mb-1">₹{p.amount.toLocaleString()} Collected</p>
                                            <p className="text-[9px] font-medium text-steel uppercase tracking-widest font-mono">{p.mode} • {p.date}</p>
                                         </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                         <button className="p-2 text-steel hover:text-brand-green hover:bg-brand-green-soft rounded-md transition-all">
                                            <MessageCircle className="w-4 h-4" />
                                         </button>
                                         <button onClick={() => navigate(`/fees/receipt/${p.receiptNumber}`)}
                                           className="p-2 text-steel hover:text-ink hover:bg-surface rounded-md transition-all">
                                            <Printer className="w-4 h-4" />
                                         </button>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          )}

                          {record.balance > 0 && !showPaymentForm && (
                             <button onClick={() => handlePayClick(record)}
                               className="mint-btn-primary w-full mt-6 text-[10px] uppercase tracking-widest">
                                <IndianRupee className="w-3.5 h-3.5" /> Record Receipt
                             </button>
                          )}
                       </div>
                    </div>
                  ))
               )}
            </div>
          )}
        </div>

        {/* Transaction Panel */}
        {showPaymentForm && selectedRecord && (
          <div className="absolute inset-x-0 bottom-0 z-[170] bg-canvas border-t border-hairline shadow-premium p-10 animate-slide-up rounded-t-lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-ink tracking-tight uppercase tracking-widest">Collect Payment</h3>
              <button onClick={() => setShowPaymentForm(false)} className="p-2 text-steel hover:text-ink hover:bg-surface rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-steel uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input type="number" min="1" max={selectedRecord.balance}
                    value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                    className="mint-input w-full h-12 text-lg font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-steel uppercase tracking-widest ml-1">Method</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                    className="mint-input w-full h-12 uppercase font-black tracking-widest">
                    <option value="cash">Cash</option>
                    <option value="upi">UPI / GPay</option>
                    <option value="bank">Bank / IMPS</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {paymentMode !== 'cash' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-steel uppercase tracking-widest ml-1">Ref ID</label>
                  <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)}
                    className="mint-input w-full h-12 font-mono" placeholder="TXN12345..." />
                </div>
              )}

              <button onClick={submitPayment} disabled={processing}
                className="mint-btn-brand w-full h-14 text-xs tracking-[0.2em] uppercase shadow-lg shadow-brand-green/10">
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Complete Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
