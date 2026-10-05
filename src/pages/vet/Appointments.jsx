import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, Calendar, Search, Filter, Clock,
  CheckCircle, XCircle, AlertCircle, Plus
} from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (selectedDate) params.append('date', selectedDate);

      const { data } = await API.get(`/appointments?${params}`);
      setAppointments(data.appointments || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter, selectedDate]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, { status });
      toast.success(`Status updated to ${status} ✅`);
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = appointments.filter((apt) =>
    search
      ? apt.animal_name?.toLowerCase().includes(search.toLowerCase()) ||
        apt.owner_name?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' },
      in_consultation: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'In consultation' },
      checked_in: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Checked in' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      pending: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Pending' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      no_show: { bg: 'bg-red-100', text: 'text-red-700', label: 'No show' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  };

  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    checked_in: appointments.filter(a => a.status === 'checked_in').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  return (
    <DashboardLayout
      title="Appointments"
      subtitle={`${appointments.length} appointments for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
    >
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 
                         bg-white border-2 border-gray-300 rounded-lg 
                         text-sm font-semibold text-black placeholder-gray-400
                         focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 
                         outline-none"
            />
          </div>

          {/* Date */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 
                       bg-white border-2 border-gray-300 rounded-lg 
                       text-sm font-semibold text-black
                       focus:border-teal-500 outline-none"
          />

          {/* Filter dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 
                       bg-white border-2 border-gray-300 rounded-lg 
                       text-sm font-semibold text-black
                       focus:border-teal-500 outline-none"
          >
            <option value="all">All ({counts.all})</option>
            <option value="pending">Pending ({counts.pending})</option>
            <option value="confirmed">Confirmed ({counts.confirmed})</option>
            <option value="checked_in">Checked in ({counts.checked_in})</option>
            <option value="completed">Completed ({counts.completed})</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-20">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700 mb-1">
            No appointments
          </p>
          <p className="text-sm font-medium text-gray-500">
            No appointments scheduled for this date
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-extrabold text-gray-600 uppercase">Time</th>
                  <th className="text-left px-6 py-3 text-xs font-extrabold text-gray-600 uppercase">Patient</th>
                  <th className="text-left px-6 py-3 text-xs font-extrabold text-gray-600 uppercase">Owner</th>
                  <th className="text-left px-6 py-3 text-xs font-extrabold text-gray-600 uppercase">Reason</th>
                  <th className="text-left px-6 py-3 text-xs font-extrabold text-gray-600 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-extrabold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((apt) => {
                  const badge = getStatusBadge(apt.status);
                  return (
                    <tr key={apt.id}>
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-black">
                          {new Date(apt.appointment_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
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
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                          {apt.reason || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {apt.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                              className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold"
                            >
                              Confirm
                            </button>
                          )}
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'checked_in')}
                              className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold"
                            >
                              Check-in
                            </button>
                          )}
                          {apt.status === 'checked_in' && (
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'in_consultation')}
                              className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold"
                            >
                              Start
                            </button>
                          )}
                          {apt.status === 'in_consultation' && (
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'completed')}
                              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold"
                            >
                              Complete
                            </button>
                          )}
                          {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                              className="px-3 py-1.5 bg-white border-2 border-red-200 text-red-600 rounded-lg text-xs font-bold"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}