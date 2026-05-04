import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { ArrowLeft, Printer, Loader2, Download } from 'lucide-react';

export default function ReceiptView() {
  const { receiptNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const { data } = await api.get(`/fees/receipt/${receiptNumber}`);
        setReceipt(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (receiptNumber) fetchReceipt();
  }, [receiptNumber]);

  if (loading && !receipt) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-surface-900">Receipt Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg">Go Back</button>
      </div>
    );
  }

  const inst = receipt.institute;
  const pay = receipt.payment;
  const stu = pay.feeRecord.student;
  const plan = pay.feeRecord.feePlan;

  return (
    <div className="max-w-2xl mx-auto bg-surface-50 min-h-screen py-8 px-4">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => navigate(-1)} className="p-2 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 text-surface-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-3">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-700 rounded-xl text-sm font-medium hover:bg-surface-50 shadow-sm transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable Receipt Area */}
      <div className="bg-white rounded-xl shadow-card border border-surface-200 p-8 print:shadow-none print:border-none print:p-0">
        <div className="text-center border-b border-surface-200 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-surface-900 uppercase tracking-wide">{inst.name}</h1>
          <p className="text-surface-600 text-sm mt-1">{inst.address}</p>
          <p className="text-surface-500 text-xs mt-1">{inst.phone} | {inst.email}</p>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl font-semibold text-surface-900">PAYMENT RECEIPT</h2>
            <p className="text-sm text-surface-500 mt-1">Receipt No: <span className="font-semibold text-surface-900">{receipt.receiptNumber}</span></p>
          </div>
          <div className="text-right text-sm text-surface-600">
            <p>Date: <span className="font-medium text-surface-900">{new Date(pay.paidAt).toLocaleDateString()}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 bg-surface-50 p-4 rounded-xl border border-surface-100">
          <div>
            <p className="text-xs text-surface-500 uppercase tracking-wide mb-1">Received From</p>
            <p className="font-semibold text-surface-900">{stu.user.name}</p>
            <p className="text-sm text-surface-600">{stu.user.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-surface-500 uppercase tracking-wide mb-1">Fee Description</p>
            <p className="font-semibold text-surface-900">{plan.name}</p>
          </div>
        </div>

        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-surface-200 text-left text-sm text-surface-500 uppercase">
              <th className="py-3 font-medium">Description</th>
              <th className="py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-surface-100">
              <td className="py-4 text-surface-900">
                Fee Payment - {plan.name}
              </td>
              <td className="py-4 text-right font-medium text-surface-900">
                ₹{Number(pay.amount).toLocaleString()}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="py-4 text-right font-bold text-surface-900 uppercase">Total Paid</td>
              <td className="py-4 text-right font-bold text-primary-600 text-xl">
                ₹{Number(pay.amount).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="text-sm text-surface-600 space-y-1 mb-12">
          <p>Payment Mode: <span className="font-medium text-surface-900 uppercase">{pay.paymentMode}</span></p>
          {pay.referenceNo && <p>Reference No: <span className="font-medium text-surface-900">{pay.referenceNo}</span></p>}
        </div>

        <div className="flex justify-between items-end pt-12 border-t border-surface-200">
          <p className="text-xs text-surface-400 italic">This is an auto-generated receipt.</p>
          <div className="text-center">
            <div className="w-32 border-b border-surface-300 mb-2"></div>
            <p className="text-sm font-medium text-surface-700">Authorized Signatory</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .max-w-2xl {
            width: 100% !important;
            max-width: none !important;
          }
          .bg-surface-50 {
            background-color: white !important;
          }
          .bg-white {
            visibility: visible;
          }
          .bg-white * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
}
