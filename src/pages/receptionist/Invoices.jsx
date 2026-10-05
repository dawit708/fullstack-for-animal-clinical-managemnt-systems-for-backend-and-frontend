import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, FileText, RefreshCw, Search,
  Eye, Download, Printer, DollarSign,
  AlertTriangle, CheckCircle, Clock,
} from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash',
    transaction_id: '',
  });

  // ============================================
  // LOAD DATA
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/receptionist/unpaid-invoices');
      setInvoices(data.invoices || []);
    } catch (err) {
      toast.error('Failed to load invoices');
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
  const filtered = invoices.filter((inv) => {
    if (filter !== 'all' && inv.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inv.invoice_number?.toLowerCase().includes(q) ||
        inv.owner_name?.toLowerCase().includes(q) ||
        inv.animal_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    unpaid: invoices.filter(i => i.status === 'unpaid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const unpaidAmount = invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

  // ============================================
  // STATUS BADGE
  // ============================================
  const getStatusBadge = (status) => {
    const badges = {
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid', icon: CheckCircle },
      unpaid: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
      overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue', icon: AlertTriangle },
      partial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Partial', icon: Clock },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled', icon: AlertTriangle },
    };
    return badges[status] || badges.unpaid;
  };

  // ============================================
  // VIEW INVOICE
  // ============================================
  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  // ============================================
  // DOWNLOAD INVOICE
  // ============================================
  const handleDownload = (invoice) => {
    const lines = [
      '='.repeat(60),
      '                 VETRACARE INVOICE',
      '          Northstar Animal Health',
      '='.repeat(60),
      '',
      `Invoice Number: ${invoice.invoice_number}`,
      `Date:           ${new Date(invoice.created_at).toLocaleDateString()}`,
      `Due Date:       ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}`,
      `Status:         ${invoice.status.toUpperCase()}`,
      '',
      '-'.repeat(60),
      'CLIENT INFORMATION',
      '-'.repeat(60),
      `Owner Name:     ${invoice.owner_name || 'N/A'}`,
      `Phone:          ${invoice.owner_phone || 'N/A'}`,
      `Animal:         ${invoice.animal_name || 'N/A'} (${invoice.species || ''})`,
      '',
      '-'.repeat(60),
      'BILLING DETAILS',
      '-'.repeat(60),
      `Subtotal:       $${parseFloat(invoice.subtotal || 0).toFixed(2)}`,
      `Tax:            $${parseFloat(invoice.tax || 0).toFixed(2)}`,
      `Discount:       -$${parseFloat(invoice.discount || 0).toFixed(2)}`,
      `Total:          $${parseFloat(invoice.total || 0).toFixed(2)}`,
      '',
      '='.repeat(60),
      `Generated: ${new Date().toLocaleString()}`,
      '='.repeat(60),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Invoice downloaded ✅');
  };

  // ============================================
  // PRINT INVOICE
  // ============================================
  const handlePrint = (invoice) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #14b8a6; text-align: center; }
            .info { margin: 20px 0; }
            .info p { margin: 5px 0; }
            .total { font-size: 24px; font-weight: bold; color: #14b8a6; }
            hr { border: 1px solid #e5e7eb; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <h1>🐾 VETRACARE</h1>
          <p style="text-align:center;">Northstar Animal Health</p>
          <hr />
          <div class="info">
            <p><strong>Invoice:</strong> ${invoice.invoice_number}</p>
            <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
          </div>
          <hr />
          <div class="info">
            <p><strong>Owner:</strong> ${invoice.owner_name || 'N/A'}</p>
            <p><strong>Phone:</strong> ${invoice.owner_phone || 'N/A'}</p>
            <p><strong>Animal:</strong> ${invoice.animal_name || 'N/A'}</p>
          </div>
          <hr />
          <table>
            <tr><td>Subtotal</td><td>$${parseFloat(invoice.subtotal || 0).toFixed(2)}</td></tr>
            <tr><td>Tax</td><td>$${parseFloat(invoice.tax || 0).toFixed(2)}</td></tr>
            <tr><td>Discount</td><td>-$${parseFloat(invoice.discount || 0).toFixed(2)}</td></tr>
            <tr><td class="total">TOTAL</td><td class="total">$${parseFloat(invoice.total || 0).toFixed(2)}</td></tr>
          </table>
          <hr />
          <p style="text-align:center; color: #6b7280;">Thank you for your business!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ============================================
  // OPEN PAYMENT MODAL
  // ============================================
  const handleProcessPayment = (invoice) => {
    setPaymentInvoice(invoice);
    setPaymentForm({
      amount: invoice.total,
      payment_method: 'cash',
      transaction_id: '',
    });
    setShowPaymentModal(true);
  };

  // ============================================
  // SUBMIT PAYMENT
  // ============================================
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/receptionist/payments', {
        invoice_id: paymentInvoice.id,
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        transaction_id: paymentForm.transaction_id || `TXN-${Date.now()}`,
      });
      toast.success('Payment processed ✅');
      setShowPaymentModal(false);
      setShowModal(false);
      setPaymentInvoice(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <DashboardLayout title="Billing & Invoices" subtitle="Financial tracking">
      {/* ============================================ */}
      {/* STAT CARDS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total</p>
              <p className="text-3xl font-black text-black">{counts.all}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase mb-1">Paid</p>
              <p className="text-3xl font-black text-green-700">{counts.paid}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-5 border-2 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Pending</p>
              <p className="text-3xl font-black text-yellow-700">{counts.unpaid}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-5 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-700 uppercase mb-1">Overdue</p>
              <p className="text-3xl font-black text-red-700">{counts.overdue}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FINANCIAL SUMMARY */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase mb-1 opacity-90">Total Billed</p>
              <p className="text-3xl font-black">${totalAmount.toFixed(2)}</p>
            </div>
            <DollarSign className="w-10 h-10 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase mb-1 opacity-90">Outstanding</p>
              <p className="text-3xl font-black">${unpaidAmount.toFixed(2)}</p>
            </div>
            <AlertTriangle className="w-10 h-10 opacity-50" />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-black mb-1">
              All Invoices
            </h2>
            <p className="text-sm font-semibold text-gray-600">
              {invoices.length} invoices total
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-2.5 bg-white border-2 border-gray-300 rounded-lg"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTERS + SEARCH */}
      {/* ============================================ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'all' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Paid ({counts.paid})
            </button>
            <button
              onClick={() => setFilter('unpaid')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'unpaid' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Pending ({counts.unpaid})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'overdue' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Overdue ({counts.overdue})
            </button>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
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
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700 mb-1">No invoices found</p>
          <p className="text-sm font-medium text-gray-500">
            {search ? 'Try a different search' : 'No invoices available'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Invoice</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Owner</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Animal</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((inv) => {
                  const badge = getStatusBadge(inv.status);
                  const BadgeIcon = badge.icon;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-teal-600">
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-black">{inv.owner_name}</p>
                        <p className="text-xs font-medium text-gray-500">{inv.owner_phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-black">{inv.animal_name || '—'}</p>
                        <p className="text-xs font-medium text-gray-500">{inv.species || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base font-black text-black">
                          ${parseFloat(inv.total).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(inv.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${badge.bg} ${badge.text}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(inv)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(inv)}
                            className="p-2 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrint(inv)}
                            className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                            title="Print"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* VIEW INVOICE MODAL */}
      {/* ============================================ */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Invoice ${selectedInvoice?.invoice_number || ''}`}
        size="md"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            {/* Status */}
            <div className="text-center">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-extrabold ${
                getStatusBadge(selectedInvoice.status).bg
              } ${getStatusBadge(selectedInvoice.status).text}`}>
                {selectedInvoice.status.toUpperCase()}
              </span>
            </div>

            {/* Client Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-extrabold text-gray-500 uppercase mb-2">
                Client Information
              </h4>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Owner</span>
                <span className="text-sm font-bold text-black">{selectedInvoice.owner_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Phone</span>
                <span className="text-sm font-bold text-black">{selectedInvoice.owner_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Animal</span>
                <span className="text-sm font-bold text-black">{selectedInvoice.animal_name}</span>
              </div>
            </div>

            {/* Billing Details */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-extrabold text-gray-500 uppercase mb-2">
                Billing Details
              </h4>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Subtotal</span>
                <span className="text-sm font-bold text-black">
                  ${parseFloat(selectedInvoice.subtotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Tax</span>
                <span className="text-sm font-bold text-black">
                  ${parseFloat(selectedInvoice.tax || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Discount</span>
                <span className="text-sm font-bold text-red-600">
                  -${parseFloat(selectedInvoice.discount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-gray-200">
                <span className="text-base font-extrabold text-black">Total</span>
                <span className="text-xl font-black text-teal-600">
                  ${parseFloat(selectedInvoice.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-600">Due Date</span>
              <span className="font-bold text-black">
                {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleDownload(selectedInvoice)}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-black rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => handlePrint(selectedInvoice)}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-black rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              {selectedInvoice.status !== 'paid' && (
                <button
                  onClick={() => handleProcessPayment(selectedInvoice)}
                  className="flex-1 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Pay
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================ */}
      {/* PAYMENT MODAL (NEW!) */}
      {/* ============================================ */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Process Payment - ${paymentInvoice?.invoice_number || ''}`}
        size="sm"
      >
        {paymentInvoice && (
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            {/* Invoice Summary */}
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-semibold text-teal-700">Owner</span>
                <span className="text-sm font-bold text-teal-900">{paymentInvoice.owner_name}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-semibold text-teal-700">Animal</span>
                <span className="text-sm font-bold text-teal-900">{paymentInvoice.animal_name}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-teal-200 mt-2">
                <span className="text-sm font-bold text-teal-700">Total Due</span>
                <span className="text-lg font-black text-teal-900">
                  ${parseFloat(paymentInvoice.total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Amount to Pay *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-lg font-bold text-black focus:border-teal-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Payment Method *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'cash', label: 'Cash', icon: '💵' },
                  { value: 'telebirr', label: 'Telebirr', icon: '📱' },
                  { value: 'cbe', label: 'CBE Bank', icon: '🏦' },
                  { value: 'chapa', label: 'Chapa', icon: '💳' },
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, payment_method: method.value })}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 ${
                      paymentForm.payment_method === method.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-sm font-bold text-black">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction ID */}
            {paymentForm.payment_method !== 'cash' && (
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Reference / Transaction ID
                </label>
                <input
                  type="text"
                  value={paymentForm.transaction_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
                  placeholder="e.g. TB123456789"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-black rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Process Payment
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}