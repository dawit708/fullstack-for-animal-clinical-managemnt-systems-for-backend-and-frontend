import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Stethoscope, Clock, User } from 'lucide-react';

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/appointments?status=in_consultation');
        setConsultations(data.appointments || []);
      } catch (err) {
        toast.error('Failed to load consultations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout
      title="Consultations"
      subtitle={`${consultations.length} active consultations`}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : consultations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-20">
          <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No active consultations</p>
          <p className="text-sm font-medium text-gray-500">Active consultations will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {consultations.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-black">{c.animal_name}</h3>
                  <p className="text-xs font-semibold text-gray-600">{c.species}</p>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-extrabold">
                  In progress
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{c.owner_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    Started {new Date(c.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
              </div>

              <p className="mt-4 p-3 bg-gray-50 rounded-lg text-xs font-medium text-gray-700">
                {c.reason || 'Consultation in progress'}
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}