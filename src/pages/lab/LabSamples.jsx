import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Beaker, RefreshCw } from 'lucide-react';

export default function LabSamples() {
  const [columns, setColumns] = useState({ received: [], processing: [], completed: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/lab/samples');
      setColumns(data.columns || { received: [], processing: [], completed: [] });
    } catch (err) {
      toast.error('Failed to load samples');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const SampleCard = ({ sample }) => (
    <div className={`p-3 rounded-lg border-2 ${
      sample.is_abnormal ? 'bg-red-50 border-red-200' :
      sample.is_stat ? 'bg-orange-50 border-orange-200' :
      'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs font-extrabold text-teal-600">{sample.lab_number}</span>
        {sample.is_stat && (
          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-extrabold">STAT</span>
        )}
      </div>
      <p className="text-xs font-bold text-black">{sample.animal_name}</p>
      <p className="text-[10px] font-medium text-gray-600">{sample.test_type}</p>
      <p className="text-[10px] font-medium text-gray-500 mt-1">{sample.time_display}</p>
    </div>
  );

  return (
    <DashboardLayout title="Sample Tracking" subtitle="Live sample workflow">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-black">All Samples</h2>
          <button onClick={loadData} className="p-2.5 bg-white border-2 border-gray-300 rounded-lg">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Received */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-extrabold text-black">Received</h3>
              </div>
              <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-extrabold">{columns.received.length}</span>
            </div>
            <div className="space-y-2">
              {columns.received.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No samples</p>
              ) : (
                columns.received.map((s) => <SampleCard key={s.id} sample={s} />)
              )}
            </div>
          </div>

          {/* Processing */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <h3 className="text-sm font-extrabold text-black">Processing</h3>
              </div>
              <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-extrabold">{columns.processing.length}</span>
            </div>
            <div className="space-y-2">
              {columns.processing.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No samples</p>
              ) : (
                columns.processing.map((s) => <SampleCard key={s.id} sample={s} />)
              )}
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <h3 className="text-sm font-extrabold text-black">Completed</h3>
              </div>
              <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-extrabold">{columns.completed.length}</span>
            </div>
            <div className="space-y-2">
              {columns.completed.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No samples</p>
              ) : (
                columns.completed.map((s) => <SampleCard key={s.id} sample={s} />)
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}