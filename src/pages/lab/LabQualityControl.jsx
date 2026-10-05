import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, ShieldCheck, RefreshCw, Download, Activity } from 'lucide-react';

export default function LabQualityControl() {
  const [qc, setQc] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/lab/quality-control');
      setQc(data.quality_control || null);
    } catch (err) {
      toast.error('Failed to load QC data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownload = () => {
    if (!qc) return;

    const lines = [
      'Quality Control Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Monthly Statistics',
      '------------------',
      `Total Tests: ${qc.monthly_stats?.total_tests || 0}`,
      `Abnormal Results: ${qc.monthly_stats?.abnormal_results || 0}`,
      `Average TAT: ${qc.monthly_stats?.average_tat_minutes || 0} min`,
      '',
      'Equipment Status',
      '-----------------',
      ...(qc.equipment_status || []).map(e => `${e.status}: ${e.count}`),
      '',
      `Reagent Alerts: ${qc.reagent_alerts || 0}`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qc-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded ✅');
  };

  if (loading) {
    return (
      <DashboardLayout title="Quality Control">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Quality Control" subtitle="Lab quality metrics">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-black">Quality Control</h2>
              <p className="text-sm font-semibold text-gray-600">Monthly metrics</p>
            </div>
          </div>
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <p className="text-xs font-bold text-gray-600 uppercase mb-1">Total Tests</p>
          <p className="text-3xl font-black text-black">{qc?.monthly_stats?.total_tests || 0}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
          <p className="text-xs font-bold text-red-700 uppercase mb-1">Abnormal</p>
          <p className="text-3xl font-black text-red-700">{qc?.monthly_stats?.abnormal_results || 0}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <p className="text-xs font-bold text-blue-700 uppercase mb-1">Avg TAT</p>
          <p className="text-3xl font-black text-blue-700">{qc?.monthly_stats?.average_tat_minutes || 0} min</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Equipment Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-extrabold text-black mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            Equipment Status
          </h3>
          <div className="space-y-2">
            {(qc?.equipment_status || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No equipment data</p>
            ) : (
              (qc?.equipment_status || []).map((eq, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold capitalize text-black">{eq.status}</span>
                  <span className="text-sm font-extrabold text-teal-600">{eq.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reagent Alerts */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-extrabold text-black mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            Reagent Alerts
          </h3>
          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <p className="text-sm font-bold text-yellow-800">Low stock items</p>
            <p className="text-4xl font-black text-yellow-700 mt-2">{qc?.reagent_alerts || 0}</p>
            <p className="text-xs font-medium text-yellow-700 mt-1">
              Needs restocking
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}