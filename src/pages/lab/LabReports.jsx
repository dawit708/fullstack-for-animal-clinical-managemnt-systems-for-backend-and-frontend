import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, FileText, RefreshCw } from 'lucide-react';

export default function LabReports() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/lab/reports');
      setReports(data.reports || []);
      setStats(data.stats);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardLayout title="Diagnostic Reports" subtitle="Completed lab tests">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-bold text-gray-600 uppercase mb-1">Total</p>
          <p className="text-3xl font-black text-black">{stats?.total_completed || 0}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
          <p className="text-xs font-bold text-red-700 uppercase mb-1">Abnormal</p>
          <p className="text-3xl font-black text-red-700">{stats?.abnormal_count || 0}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <p className="text-xs font-bold text-blue-700 uppercase mb-1">Avg TAT</p>
          <p className="text-3xl font-black text-blue-700">{stats?.average_tat_minutes || 0} min</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-black">All Reports</h2>
        <button onClick={loadData} className="p-2.5 bg-white border-2 border-gray-300 rounded-lg">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No reports yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Lab No.</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Patient</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Test</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Completed</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">TAT</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-extrabold text-teal-600">{r.lab_number}</td>
                  <td className="px-6 py-4 text-sm font-bold text-black">{r.animal_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.test_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {r.completed_at ? new Date(r.completed_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-black">{r.tat_minutes || 0} min</td>
                  <td className="px-6 py-4">
                    {r.is_abnormal ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-extrabold">Abnormal</span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-extrabold">Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}