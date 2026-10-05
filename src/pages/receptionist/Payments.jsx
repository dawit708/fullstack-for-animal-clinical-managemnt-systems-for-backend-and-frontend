import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, DollarSign, RefreshCw, Search,
  TrendingUp, Wallet, CreditCard, Building2,
  CheckCircle, Calendar,
} from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // ============================================
  // LOAD DATA
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, statsRes] = await Promise.all([
        API.get('/receptionist/payments'),
        API.get('/receptionist/payments/stats'),
      ]);

      setPayments(paymentsRes.data.payments || []);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // FILTER
  // ============================================
  const filtered = payments.filter((p) => {
    // Filter by method
    if (filter !== 'all' && p.payment_method !== filter) return false;

    // Search
    if (search) {
      const q = search.toLowerCase();
      return (
        p.owner_name?.toLowerCase().includes(q) ||
        p.invoice_number?.toLowerCase().includes(q) ||
        p.transaction_id?.toLowerCase().includes(q) ||
        p.animal_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: payments.length,
    cash: payments.filter(p => p.payment_method === 'cash').length,
    telebirr: payments.filter(p => p.payment_method === 'telebirr').length,
    cbe: payments.filter(p => p.payment_method === 'cbe').length,
    chapa: payments.filter(p => p.payment_method === 'chapa').length,
  };

  // ============================================
  // BADGES
  // ============================================
  const getMethodBadge = (method) => {
    const badges = {
      cash: { bg: 'bg-green-100', text: 'text-green-700', label: '💵 Cash', icon: Wallet },
      telebirr: { bg: 'bg-purple-100', text: 'text-purple-700', label: '📱 Telebirr', icon: CreditCard },
      cbe: { bg: 'bg-blue-100', text: 'text-blue-700', label: '🏦 CBE', icon: Building2 },
      chapa: { bg: 'bg-orange-100', text: 'text-orange-700', label: '💳 Chapa', icon: CreditCard },
    };
    return badges[method] || badges.cash;
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      refunded: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refunded' },
    };
    return badges[status] || badges.pending;
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <DashboardLayout title="Payments" subtitle="Financial tracking">
      {/* ============================================ */}
      {/* STATS CARDS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase opacity-90">
              Today's Revenue
            </p>
            <TrendingUp className="w-6 h-6 opacity-70" />
          </div>
          <p className="text-4xl font-black mb-1">
            ${stats?.today?.total?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs font-semibold opacity-90">
            {stats?.today?.count || 0} transactions
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase text-gray-600">
              This Week
            </p>
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-4xl font-black text-black mb-1">
            ${stats?.this_week?.total?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs font-semibold text-gray-500">
            {stats?.this_week?.count || 0} transactions
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase text-gray-600">
              This Month
            </p>
            <DollarSign className="w-6 h-6 text-teal-500" />
          </div>
          <p className="text-4xl font-black text-black mb-1">
            ${stats?.this_month?.total?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs font-semibold text-gray-500">
            {stats?.this_month?.count || 0} transactions
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* METHOD BREAKDOWN */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
          <p className="text-xs font-bold text-green-700 uppercase mb-1">💵 Cash</p>
          <p className="text-2xl font-black text-green-700">{counts.cash}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
          <p className="text-xs font-bold text-purple-700 uppercase mb-1">📱 Telebirr</p>
          <p className="text-2xl font-black text-purple-700">{counts.telebirr}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <p className="text-xs font-bold text-blue-700 uppercase mb-1">🏦 CBE</p>
          <p className="text-2xl font-black text-blue-700">{counts.cbe}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
          <p className="text-xs font-bold text-orange-700 uppercase mb-1">💳 Chapa</p>
          <p className="text-2xl font-black text-orange-700">{counts.chapa}</p>
        </div>
      </div>

      {/* ============================================ */}
      {/* HEADER + FILTERS */}
      {/* ============================================ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-black mb-1">
              Payment History
            </h2>
            <p className="text-sm font-semibold text-gray-600">
              {payments.length} transactions total
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-2.5 bg-white border-2 border-gray-300 rounded-lg"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: `All (${counts.all})`, color: 'teal' },
              { key: 'cash', label: `Cash (${counts.cash})`, color: 'green' },
              { key: 'telebirr', label: `Telebirr (${counts.telebirr})`, color: 'purple' },
              { key: 'cbe', label: `CBE (${counts.cbe})`, color: 'blue' },
              { key: 'chapa', label: `Chapa (${counts.chapa})`, color: 'orange' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  filter === f.key
                    ? f.color === 'teal' ? 'bg-teal-500 text-white'
                    : f.color === 'green' ? 'bg-green-500 text-white'
                    : f.color === 'purple' ? 'bg-purple-500 text-white'
                    : f.color === 'blue' ? 'bg-blue-500 text-white'
                    : 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* TABLE */}
      {/* ============================================ */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700 mb-1">No payments found</p>
          <p className="text-sm font-medium text-gray-500">
            {search ? 'Try a different search' : 'Process payments from the Invoices page'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Transaction</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Invoice</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Owner</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Method</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const methodBadge = getMethodBadge(p.payment_method);
                  const statusBadge = getStatusBadge(p.payment_status);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-gray-700">
                          {p.transaction_id || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-teal-600">
                          {p.invoice_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-black">{p.owner_name}</p>
                        <p className="text-xs font-medium text-gray-500">{p.animal_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base font-black text-black">
                          ${parseFloat(p.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${methodBadge.bg} ${methodBadge.text}`}>
                          {methodBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.paid_at
                          ? new Date(p.paid_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${statusBadge.bg} ${statusBadge.text}`}>
                          <CheckCircle className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}