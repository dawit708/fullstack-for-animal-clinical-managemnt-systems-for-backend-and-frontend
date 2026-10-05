import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Scissors, Calendar, User } from 'lucide-react';

export default function Surgery() {
  const [surgeries, setSurgeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/appointments');
        const surgery = (data.appointments || []).filter(
          (a) => a.service_name?.toLowerCase().includes('surgery') ||
                 a.service_name?.toLowerCase().includes('procedure')
        );
        setSurgeries(surgery);
      } catch (err) {
        toast.error('Failed to load surgeries');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout title="Surgery schedule" subtitle="Upcoming surgeries and procedures">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : surgeries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-20">
          <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No surgeries scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {surgeries.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-black">{s.animal_name}</h3>
                  <p className="text-sm font-semibold text-gray-600">{s.service_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-black">
                    {new Date(s.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    {new Date(s.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}