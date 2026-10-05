import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Package, RefreshCw, Download } from 'lucide-react';

export default function LabReagents() {
  const [reagents, setReagents] = useState([]);
  const [stats, setStats] = useState({ low_stock: 0, out_of_stock: 0, expiring: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/lab/reagents');
      setReagents(data.reagents || []);
      setStats({
        low_stock: data.low_stock || 0,
        out_of_stock: data.out_of_stock || 0,
        expiring: data.expiring || 0,
      });
    } catch (err) {
      toast.error('Failed to load reagents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // DOWNLOAD REPORT
  // ============================================
  const handleDownload = () => {
    const csv = [
      ['Name', 'Catalog Number', 'Quantity', 'Unit', 'Min Qty', 'Expiry Date', 'Status'],
      ...reagents.map(r => [
        r.name,
        r.catalog_number || '',
        r.quantity,
        r.unit || '',
        r.min_quantity,
        r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : '',
        r.alert_status,
      ]),
    ]
      .map(row => row.map(v => `"${v}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reagent-stock-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded ✅');
  };

  const getStatusBadge = (status) => {
    const badges = {
      ok: { bg: 'bg-green-100', text: 'text-green-700', label: 'OK' },
      low_stock: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Low Stock' },
      out_of_stock: { bg: 'bg-red-100', text: 'text-red-700', label: 'Out of Stock' },
      expiring: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Expiring' },
    };
    return badges[status] || badges.ok;
  };

  return (
    <DashboardLayout title="Reagent Stock" subtitle="Lab reagent inventory">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
          <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Low Stock</p>
          <p className="text-3xl font-black text-yellow-700">{stats.low_stock}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
          <p className="text-xs font-bold text-red-700 uppercase mb-1">Out of Stock</p>
          <p className="text-3xl font-black text-red-700">{stats.out_of_stock}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
          <p className="text-xs font-bold text-orange-700 uppercase mb-1">Expiring</p>
          <p className="text-3xl font-black text-orange-700">{stats.expiring}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-black">All Reagents</h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-bold"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button onClick={loadData} className="p-2.5 bg-white border-2 border-gray-300 rounded-lg">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : reagents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No reagents found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Catalog No.</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Quantity</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Min Qty</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Expiry</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reagents.map((r) => {
                const badge = getStatusBadge(r.alert_status);
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-bold text-black">{r.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">{r.catalog_number || '—'}</td>
                    <td className="px-6 py-4 text-sm font-extrabold text-black">
                      {r.quantity} {r.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.min_quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}