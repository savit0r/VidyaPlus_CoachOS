import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import {
  Wallet,
  Plus,
  Clock,
  CreditCard,
  IndianRupee,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

type WalletTransaction = {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string | null;
  referenceNo: string | null;
  createdAt: string;
};

type WalletResponse = {
  balance: number;
  transactions: WalletTransaction[];
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/wallet');
      // API returns { success, data: { balance, transactions } }
      const payload = data.data as WalletResponse;
      setWallet(payload);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const balance = wallet?.balance ?? 0;
  const lastTxn = wallet?.transactions?.[0];

  const parsedAmount = useMemo(() => {
    const n = Number(topUpAmount);
    return Number.isFinite(n) ? n : NaN;
  }, [topUpAmount]);

  const canTopUp = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handleTopUp = async () => {
    setError(null);

    if (!canTopUp) {
      setError('Enter a valid amount');
      return;
    }

    if (!confirm(`Top-up wallet by ₹${parsedAmount.toLocaleString()}? (Mock payment)`)) return;

    setSaving(true);
    try {
      await api.post('/wallet/top-up', {
        amount: parsedAmount,
        paymentMethod,
      });

      setTopUpAmount('');
      await fetchWallet();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to top up');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-primary-50 text-primary-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Wallet</h1>
            <p className="text-sm text-surface-500 mt-1">Variable-cost protection for WhatsApp/SMS spend</p>
          </div>
        </div>

        <button
          onClick={fetchWallet}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-bold text-ink"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl border border-danger-200 bg-danger-50 text-danger-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <div className="font-bold text-sm">{error}</div>
            <div className="text-xs text-danger-700 mt-1">If you just logged in, try refreshing.</div>
          </div>
        </div>
      )}

      {loading && !wallet ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl shadow-card border border-surface-100 md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-500">Current balance</p>
                  <h3 className="text-3xl font-extrabold text-surface-900 mt-1">
                    ₹{balance.toLocaleString()}
                  </h3>
                  <p className="text-xs text-surface-400 mt-2">Wallet is pass-through for messaging costs.</p>
                </div>
                <div className="p-4 rounded-2xl bg-accent-50 text-accent-600">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-card border border-surface-100">
              <p className="text-sm font-medium text-surface-500">Last transaction</p>
              {lastTxn ? (
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-surface-500" />
                    <p className="text-xs text-surface-500">
                      {new Date(lastTxn.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-bold text-ink">
                    {lastTxn.type === 'credit' ? '+' : '-'} ₹{Math.abs(lastTxn.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-surface-400 mt-1 line-clamp-2">
                    {lastTxn.description || '—'}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-surface-400">No transactions yet</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-card border border-surface-100 p-8">
                <h2 className="text-lg font-bold text-surface-900">Top-up (Mock)</h2>
                <p className="text-sm text-surface-500 mt-1">Add credits to protect margins from messaging costs.</p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                      Amount (₹)
                    </label>
                    <input
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="e.g. 500"
                      inputMode="numeric"
                      className="w-full px-4 py-3 rounded-2xl text-sm font-bold bg-slate-50 border border-surface-200 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                      Payment method
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {([
                        ['upi', 'UPI'],
                        ['card', 'Card'],
                        ['netbanking', 'Netbanking'],
                      ] as const).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPaymentMethod(key)}
                          className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                            paymentMethod === key
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-surface text-ink border-surface-200 hover:border-primary-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleTopUp}
                    disabled={!canTopUp || saving}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    {saving ? 'Processing...' : 'Top-up wallet'}
                  </button>

                  <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-surface-500" />
                      <p className="text-xs text-surface-500 font-bold">Note</p>
                    </div>
                    <p className="text-xs text-surface-400 mt-2">
                      Wallet top-up uses the backend mock payment gateway in this build.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-card border border-surface-100 overflow-hidden">
                <div className="px-6 py-6 border-b border-surface-100">
                  <h2 className="text-lg font-bold text-surface-900">Recent transactions</h2>
                  <p className="text-sm text-surface-500 mt-1">Last 50 wallet updates</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-50/50 border-b border-surface-100 text-[11px] uppercase tracking-widest text-surface-400 font-bold">
                        <th className="px-6 py-5">Date</th>
                        <th className="px-6 py-5">Type</th>
                        <th className="px-6 py-5">Amount</th>
                        <th className="px-6 py-5">Description</th>
                        <th className="px-6 py-5">Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {wallet?.transactions?.length ? (
                        wallet.transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-surface-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-surface-600">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                  t.type === 'credit'
                                    ? 'bg-accent-50 text-accent-700 border-accent-200'
                                    : 'bg-danger-50 text-danger-700 border-danger-200'
                                }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-ink">
                              {t.type === 'credit' ? '+' : '-'} ₹{Math.abs(t.amount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-surface-600 line-clamp-2">
                              {t.description || '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-surface-500">
                              {t.referenceNo || '—'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-surface-500">
                            No transactions yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

