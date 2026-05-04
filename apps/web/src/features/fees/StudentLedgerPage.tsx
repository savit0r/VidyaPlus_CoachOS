import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  ArrowLeft, CheckCircle2, Clock, AlertCircle, FileText,
  CreditCard, Loader2, IndianRupee, Printer, X
} from 'lucide-react';

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

export default function StudentLedgerPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalDues: 0, totalPaid: 0, balance: 0 });
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [student, setStudent] = useState<any>(null);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      // First get student details
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
  };

  useEffect(() => {
    if (studentId) fetchLedger();
  }, [studentId]);

  const handlePay = (record: FeeRecord) => {
    setSelectedRecord(record);
    setPaymentAmount(record.balance.toString());
    setPaymentMode('cash');
    setReferenceNo('');
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!selectedRecord) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedRecord.balance) {
      alert('Invalid amount');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post('/fees/payments', {
        feeRecordId: selectedRecord.id,
        amount,
        paymentMode,
        referenceNo: referenceNo || undefined,
      });
      alert(`Payment recorded successfully! Receipt: ${res.data.data.receipt.receiptNumber}`);
      setShowPaymentModal(false);
      fetchLedger();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-2.5 py-1 bg-accent-50 text-accent-700 text-xs font-medium rounded-full border border-accent-200">Paid</span>;
      case 'partial': return <span className="px-2.5 py-1 bg-warn-50 text-warn-700 text-xs font-medium rounded-full border border-warn-200">Partial</span>;
      default: return <span className="px-2.5 py-1 bg-danger-50 text-danger-700 text-xs font-medium rounded-full border border-danger-200">Pending</span>;
    }
  };

  if (loading && !student) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 text-surface-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{student?.name}'s Fee Ledger</h1>
          <p className="text-sm text-surface-500 mt-1">{student?.phone} • {student?.studentProfile?.studentCode}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-card border border-surface-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary-50 text-primary-600"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-surface-500 mb-1">Total Dues</p>
            <h3 className="text-2xl font-bold text-surface-900">₹{summary.totalDues.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-card border border-surface-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-accent-50 text-accent-600"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-surface-500 mb-1">Total Paid</p>
            <h3 className="text-2xl font-bold text-surface-900">₹{summary.totalPaid.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-card border border-danger-200 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-danger-50 text-danger-600"><AlertCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-surface-500 mb-1">Outstanding Balance</p>
            <h3 className="text-2xl font-bold text-danger-600">₹{summary.balance.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Fee Records */}
      <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-100">
          <h3 className="font-semibold text-surface-900">Dues & Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100 text-xs uppercase tracking-wider text-surface-500 font-medium">
                <th className="px-6 py-4">Fee Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {records.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-surface-500">No fee records found.</td></tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-surface-900">{record.planName} <span className="text-surface-400 text-sm">({record.periodLabel})</span></p>
                      <p className="text-xs text-surface-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due: {new Date(record.dueDate).toLocaleDateString()}
                      </p>
                      {/* Payment History Sub-list */}
                      {record.payments.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-surface-100 pt-2">
                          {record.payments.map(p => (
                            <div key={p.id} className="flex items-center gap-3 text-xs text-surface-600 bg-surface-50 p-2 rounded-lg">
                              <span className="font-semibold text-accent-600">+₹{p.amount.toLocaleString()}</span>
                              <span>• {p.mode.toUpperCase()}</span>
                              <span>• {p.date}</span>
                              <button onClick={() => navigate(`/fees/receipt/${p.receiptNumber}`)}
                                className="ml-auto text-primary-600 hover:underline flex items-center gap-1">
                                <Printer className="w-3 h-3" /> {p.receiptNumber}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top pt-5">{getStatusBadge(record.status)}</td>
                    <td className="px-6 py-4 align-top pt-5 text-sm font-medium text-surface-900">₹{record.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 align-top pt-5 text-sm font-bold text-danger-600 text-right">₹{record.balance.toLocaleString()}</td>
                    <td className="px-6 py-4 align-top pt-4 text-right">
                      {record.balance > 0 && (
                        <button onClick={() => handlePay(record)}
                          className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl hover:bg-primary-100 transition-colors flex items-center gap-2 ml-auto">
                          <IndianRupee className="w-4 h-4" /> Collect
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h3 className="font-bold text-surface-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" /> Record Payment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-surface-50 p-4 rounded-xl border border-surface-100 mb-4">
                <p className="text-sm text-surface-500 mb-1">Fee Plan</p>
                <p className="font-medium text-surface-900">{selectedRecord.planName} ({selectedRecord.periodLabel})</p>
                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-surface-600">Outstanding Balance:</span>
                  <span className="font-bold text-danger-600">₹{selectedRecord.balance.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Amount Paying</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="w-4 h-4 text-surface-400" />
                  </div>
                  <input type="number" min="1" max={selectedRecord.balance} step="0.01"
                    value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Payment Mode</label>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 outline-none">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer / NEFT</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {paymentMode !== 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Reference No. (Txn ID/Cheque No)</label>
                  <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 outline-none" 
                    placeholder="Enter reference number" />
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-surface-100 bg-surface-50 flex justify-end gap-3">
              <button onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900">Cancel</button>
              <button onClick={submitPayment} disabled={processing}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
