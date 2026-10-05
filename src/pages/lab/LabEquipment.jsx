import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Activity, RefreshCw, CheckCircle, AlertTriangle, Download } from 'lucide-react';

export default function LabEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, maintenance: 0 });

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/lab/equipment');
      setEquipment(data.equipment || []);
      setStats({
        total: data.total || 0,
        online: data.online || 0,
        offline: data.offline || 0,
        maintenance: data.maintenance || 0,
      });
    } catch (err) {
      toast.error('Failed to load equipment');
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
      ['Name', 'Serial Number', 'Status', 'Last Check', 'Next Maintenance'],
      ...equipment.map(e => [
        e.name,
        e.serial_number || '',
        e.status,
        e.last_check ? new Date(e.last_check).toLocaleDateString() : '',
        e.next_maintenance ? new Date(e.next_maintenance).toLocaleDateString() : '',
      ]),
    ]
      .map(row => row.map(v => `"${v}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded ✅');
  };

  return (
    <DashboardLayout title="Equipment" subtitle="Analyzer interface status">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-black mb-1">Equipment Status</h2>
            <p className="text-sm font-semibold text-gray-600">
              {stats.total} equipment · {stats.online} online
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-bold"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={loadData}
              className="p-2.5 bg-white border-2 border-gray-300 rounded-lg"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <p className="text-xs font-bold text-gray-600 uppercase mb-1">Total</p>
          <p className="text-3xl font-black text-black">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
          <p className="text-xs font-bold text-green-700 uppercase mb-1">Online</p>
          <p className="text-3xl font-black text-green-700">{stats.online}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
          <p className="text-xs font-bold text-red-700 uppercase mb-1">Offline</p>
          <p className="text-3xl font-black text-red-700">{stats.offline}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
          <p className="text-xs font-bold text-orange-700 uppercase mb-1">Maintenance</p>
          <p className="text-3xl font-black text-orange-700">{stats.maintenance}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : equipment.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No equipment found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Serial No.</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Last Check</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Next Maintenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {equipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-bold text-black">{eq.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">{eq.serial_number || '—'}</td>
                    <td className="px-6 py-4">
                      {eq.status === 'online' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-extrabold">
                          <CheckCircle className="w-3 h-3" /> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-extrabold">
                          <AlertTriangle className="w-3 h-3" /> {eq.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {eq.last_check ? new Date(eq.last_check).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {eq.next_maintenance ? new Date(eq.next_maintenance).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}