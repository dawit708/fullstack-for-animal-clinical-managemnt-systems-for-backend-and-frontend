import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, ClipboardList, RefreshCw } from 'lucide-react';

export default function CheckInQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/receptionist/check-in-queue');
      setQueue(data.queue || []);
    } catch (err) {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async (id) => {
    try {
      await API.put(`/receptionist/check-in/${id}`);
      toast.success('Checked in ✅');
      loadData();
    } catch (err) {
      toast.error('Failed to check in');
    }
  };

  return (
    <DashboardLayout title="Check-in Queue" subtitle="Live patient arrivals">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-black mb-1">Check-in Queue</h2>
          <p className="text-sm font-semibold text-gray-600">{queue.length} patients</p>
        </div>
        <button onClick={loadData} className="p-2.5 bg-white border-2 border-gray-300 rounded-lg">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">Queue is empty</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Patient</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Owner</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Time</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {queue.map((item) => (
                <tr key={item.appointment_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-black">{item.animal_name}</p>
                    <p className="text-xs font-medium text-gray-500">{item.species}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-black">{item.owner_name}</p>
                    <p className="text-xs font-medium text-gray-500">{item.owner_phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-black">
                    {new Date(item.appointment_date).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit', hour12: false,
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-extrabold">
                      {item.display_status || item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status !== 'checked_in' && (
                      <button
                        onClick={() => handleCheckIn(item.appointment_id)}
                        className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold"
                      >
                        Check in
                      </button>
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