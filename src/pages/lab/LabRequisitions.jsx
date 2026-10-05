import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, ClipboardList, RefreshCw } from 'lucide-react';

export default function LabRequisitions() {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/lab/requisitions');
      setRequisitions(data.requisitions || []);
    } catch (err) {
      toast.error('Failed to load requisitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardLayout title="Test Requisitions" subtitle="Incoming lab requests">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-black mb-1">All Requisitions</h2>
            <p className="text-sm font-semibold text-gray-600">
              {requisitions.length} requests
            </p>
          </div>
          <button onClick={loadData} className="p-2.5 bg-white border-2 border-gray-300 rounded-lg">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : requisitions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No requisitions</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Lab No.</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Patient</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Owner</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Test Type</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Priority</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requisitions.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-extrabold text-teal-600">{r.lab_number}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-black">{r.animal_name}</p>
                    <p className="text-xs font-medium text-gray-500">{r.species}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-black">{r.owner_name}</p>
                    <p className="text-xs font-medium text-gray-500">{r.owner_phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.test_type}</td>
                  <td className="px-6 py-4">
                    {r.priority === 'STAT' ? (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-extrabold">
                        STAT
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-extrabold">
                      {r.status}
                    </span>
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