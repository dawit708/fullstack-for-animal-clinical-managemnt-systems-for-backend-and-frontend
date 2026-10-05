import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, CalendarCheck, RefreshCw, Search,
  Phone, Plus, Clock, AlertCircle, Eye,
} from 'lucide-react';

export default function FollowUps() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  // ============================================
  // LOAD DATA
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/vet/follow-ups');
      setFollowUps(data.follow_ups || []);
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // FILTER
  // ============================================
  const filtered = followUps.filter((f) => {
    // Filter
    if (filter === 'overdue' && f.days_until >= 0) return false;
    if (filter === 'week' && (f.days_until < 0 || f.days_until > 7)) return false;
    if (filter === 'upcoming' && f.days_until <= 7) return false;

    // Search
    if (search) {
      const s = search.toLowerCase();
      return (
        f.animal_name?.toLowerCase().includes(s) ||
        f.owner_name?.toLowerCase().includes(s) ||
        f.diagnosis?.toLowerCase().includes(s) ||
        f.owner_phone?.includes(s)
      );
    }

    return true;
  });

  const counts = {
    all: followUps.length,
    overdue: followUps.filter((f) => f.days_until < 0).length,
    week: followUps.filter((f) => f.days_until >= 0 && f.days_until <= 7).length,
    upcoming: followUps.filter((f) => f.days_until > 7).length,
  };

  // ============================================
  // DAYS LABEL + COLOR
  // ============================================
  const getDaysLabel = (days) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const getDaysBadge = (days) => {
    if (days < 0) {
      return { bg: 'bg-red-100', text: 'text-red-700', label: getDaysLabel(days) };
    }
    if (days <= 3) {
      return { bg: 'bg-orange-100', text: 'text-orange-700', label: getDaysLabel(days) };
    }
    if (days <= 7) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: getDaysLabel(days) };
    }
    return { bg: 'bg-blue-100', text: 'text-blue-700', label: getDaysLabel(days) };
  };

  // ============================================
  // ACTIONS
  // ============================================
  const handleCall = (f) => {
    if (f.owner_phone) {
      window.location.href = `tel:${f.owner_phone}`;
      toast.success(`Calling ${f.owner_name}...`);
    } else {
      toast.error('No phone number');
    }
  };

  const handleBook = (f) => {
    navigate('/vet/appointments', {
      state: { animal_id: f.animal_id, owner_id: f.owner_id },
    });
  };

  const handleView = (f) => {
    navigate(`/vet/patients/${f.animal_id}`);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <DashboardLayout
      title="Follow-ups"
      subtitle="Patient follow-up reminders"
    >
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-black mb-1">
              All Follow-ups
            </h2>
            <p className="text-sm font-semibold text-gray-600">
              {followUps.length} follow-ups scheduled
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="p-2.5 bg-white border-2 border-gray-300 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => navigate('/vet/appointments')}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTER TABS + SEARCH */}
      {/* ============================================ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'all'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'overdue'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              🔴 Overdue ({counts.overdue})
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'week'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              🟠 This Week ({counts.week})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'upcoming'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              🔵 Upcoming ({counts.upcoming})
            </button>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search follow-ups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* TABLE */}
      {/* ============================================ */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filtered.length === 0 ? (
        /* ============================================ */
        /* EMPTY STATE - Small & Clean */
        /* ============================================ */
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-bold text-black mb-1">
            {search || filter !== 'all' ? 'No matching follow-ups' : 'No follow-ups yet'}
          </h3>
          <p className="text-sm font-medium text-gray-500 mb-4">
            {search || filter !== 'all'
              ? 'Try adjusting your filters'
              : 'Follow-ups appear when you set them in SOAP notes'}
          </p>
          <button
            onClick={() => navigate('/vet/appointments')}
            className="px-5 py-2.5 bg-teal-500 text-white rounded-lg font-bold text-sm"
          >
            Schedule Appointment
          </button>
        </div>
      ) : (
        /* ============================================ */
        /* TABLE VIEW - Like Screenshot 1 */
        /* ============================================ */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Days Until
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((f) => {
                  const badge = getDaysBadge(f.days_until);
                  return (
                    <tr key={f.id} className="hover:bg-gray-50">
                      {/* Date */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-extrabold text-black">
                          {new Date(f.follow_up_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                          {new Date(f.follow_up_date).getFullYear()}
                        </p>
                      </td>

                      {/* Patient */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-black">
                          {f.animal_name}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                          {f.species}
                        </p>
                      </td>

                      {/* Owner */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-black">
                          {f.owner_name}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                          {f.owner_phone}
                        </p>
                      </td>

                      {/* Diagnosis */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-gray-700">
                          {f.diagnosis}
                        </p>
                      </td>

                      {/* Days Until */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCall(f)}
                            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5"
                            title="Call owner"
                          >
                            <Phone className="w-4 h-4" />
                            Call
                          </button>
                          <button
                            onClick={() => handleBook(f)}
                            className="px-4 py-2 bg-white border-2 border-gray-300 text-black rounded-lg text-sm font-bold flex items-center gap-1.5"
                            title="Book appointment"
                          >
                            <CalendarCheck className="w-4 h-4" />
                            Book
                          </button>
                          <button
                            onClick={() => handleView(f)}
                            className="px-3 py-2 bg-white border-2 border-gray-300 text-gray-600 rounded-lg"
                            title="View patient"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-700 text-center">
              Showing {filtered.length} of {followUps.length} follow-ups
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}