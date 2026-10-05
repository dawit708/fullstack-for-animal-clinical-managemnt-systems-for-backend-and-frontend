import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Calendar, Search, RefreshCw, Plus } from 'lucide-react';

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/receptionist/appointments?date=${selectedDate}`);
      setAppointments(data.appointments || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const filtered = appointments.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.animal_name?.toLowerCase().includes(q) ||
      a.owner_name?.toLowerCase().includes(q) ||
      a.vet_name?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' },
      in_consultation: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'In consultation' },
      checked_in: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Checked in' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    };
    return badges[status] || badges.pending;
  };

  return (
    <DashboardLayout title="Appointments" subtitle="Today's schedule">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-black mb-1">All Appointments</h2>
            <p className="text-sm font-semibold text-gray-600">
              {appointments.length} appointments
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black"
            />
            <button onClick={loadData} className="p-2.5 bg-white border-2 border-gray-300 rounded-lg">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No appointments</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Time</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Patient</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Owner</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Vet</th>
                <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((apt) => {
                const badge = getStatusBadge(apt.status);
                return (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-extrabold text-black">
                        {new Date(apt.appointment_date).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit', hour12: false,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-black">{apt.animal_name}</p>
                      <p className="text-xs font-medium text-gray-500">{apt.species}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-black">{apt.owner_name}</p>
                      <p className="text-xs font-medium text-gray-500">{apt.owner_phone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{apt.vet_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold ${badge.bg} ${badge.text}`}>
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