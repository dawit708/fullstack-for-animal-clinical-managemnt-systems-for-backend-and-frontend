import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, Calendar, CheckCircle2, FileText, UserPlus,
  ArrowRight, Search, Plus, Clock, User, Phone,
} from 'lucide-react';

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [receptionist, setReceptionist] = useState(null);
  const [queue, setQueue] = useState([]);
  const [filter, setFilter] = useState('all');

  // ============================================
  // LOAD DATA
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, queueRes] = await Promise.all([
        API.get('/receptionist/dashboard'),
        API.get('/receptionist/check-in-queue'),
      ]);

      setStats(dashRes.data.stats);
      setReceptionist(dashRes.data.receptionist);
      setQueue(queueRes.data.queue || []);
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // CHECK-IN PATIENT
  // ============================================
  const handleCheckIn = async (appointmentId) => {
    try {
      await API.put(`/receptionist/check-in/${appointmentId}`);
      toast.success('Patient checked in ✅');
      loadData();
    } catch (err) {
      toast.error('Failed to check in');
    }
  };

  // ============================================
  // FILTER QUEUE
  // ============================================
  const filteredQueue = queue.filter((item) => {
    if (filter === 'waiting') return item.display_status === 'checked_in';
    if (filter === 'with_clinician') return item.display_status === 'with_clinician';
    if (filter === 'expected') return item.display_status === 'expected';
    return true;
  });

  const filterCounts = {
    all: queue.length,
    waiting: queue.filter(q => q.display_status === 'checked_in').length,
    with_clinician: queue.filter(q => q.display_status === 'with_clinician').length,
    expected: queue.filter(q => q.display_status === 'expected').length,
  };

  // ============================================
  // STATUS BADGES
  // ============================================
  const getStatusBadge = (status) => {
    const badges = {
      triage_now: { bg: 'bg-red-100', text: 'text-red-700', label: 'Triage now' },
      checked_in: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Checked in' },
      with_clinician: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'With clinician' },
      expected: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Expected' },
      arrived: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Arrived' },
    };
    return badges[status] || badges.expected;
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <DashboardLayout title="Front Desk">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </DashboardLayout>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <DashboardLayout
      title="Front desk operations"
      subtitle={receptionist?.branch_name ? `${receptionist.branch_name} · Thursday, 1 October` : 'Riverside Clinic · Thursday, 1 October'}
    >
      {/* ============================================ */}
      {/* STAT CARDS - 4 */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Card 1: Appointments today */}
        <button
          onClick={() => navigate('/receptionist/appointments')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-7 h-7 text-teal-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Appointments today
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.appointments_today?.total || 0}
              </p>
              <p className="text-xs font-semibold text-teal-600">
                {stats?.appointments_today?.completed || 0} completed
                <span className="text-gray-400"> · </span>
                <span className="text-gray-600">
                  {stats?.appointments_today?.changes || 0} changes
                </span>
              </p>
            </div>
          </div>
        </button>

        {/* Card 2: Checked in */}
        <button
          onClick={() => navigate('/receptionist/check-in')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-7 h-7 text-green-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Checked in
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.checked_in?.count || 0}
              </p>
              <p className="text-xs font-semibold text-green-600">
                Average wait {stats?.checked_in?.average_wait_minutes || 0} min
              </p>
            </div>
          </div>
        </button>

        {/* Card 3: Unpaid invoices */}
        <button
          onClick={() => navigate('/receptionist/invoices')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-orange-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Unpaid invoices
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.unpaid_invoices?.count || 0}
              </p>
              <p className="text-xs font-semibold text-orange-600">
                ${stats?.unpaid_invoices?.outstanding_amount?.toFixed(2) || '0.00'} outstanding
              </p>
            </div>
          </div>
        </button>

        {/* Card 4: New registrations */}
        <button
          onClick={() => navigate('/receptionist/register')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-7 h-7 text-blue-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                New registrations
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.new_registrations?.count || 0}
              </p>
              <p className="text-xs font-semibold text-blue-600">
                {stats?.new_registrations?.awaiting_consultation || 0} awaiting cons.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* ============================================ */}
      {/* MAIN GRID */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ============================================ */}
        {/* LEFT - CHECK-IN QUEUE (8 cols) */}
        {/* ============================================ */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-black">
                  Check-in queue
                </h3>
                <p className="text-sm font-semibold text-gray-500">
                  Live arrivals and waiting patients
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/receptionist/check-in')}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => navigate('/receptionist/walk-in')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Check in patient
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  filter === 'all' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                All {filterCounts.all}
              </button>
              <button
                onClick={() => setFilter('waiting')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  filter === 'waiting' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Waiting {filterCounts.waiting}
              </button>
              <button
                onClick={() => setFilter('with_clinician')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  filter === 'with_clinician' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                With clinician {filterCounts.with_clinician}
              </button>
              <button
                onClick={() => setFilter('expected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  filter === 'expected' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Expected {filterCounts.expected}
              </button>
            </div>
          </div>

          {/* Queue Table */}
          {filteredQueue.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-700">No patients in queue</p>
              <p className="text-sm font-medium text-gray-500">
                Check-in patients to see them here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase">
                      Patient & Owner
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase">
                      Time
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-extrabold text-gray-500 uppercase">
                      Wait
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-extrabold text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredQueue.map((item) => {
                    const badge = getStatusBadge(item.display_status);
                    return (
                      <tr key={item.appointment_id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-black">
                                {item.owner_initials || 'AB'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-black truncate">
                                {item.animal_name}
                              </p>
                              <p className="text-xs font-medium text-gray-500 truncate">
                                {item.owner_name}
                                {item.reason && ` · ${item.reason}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-extrabold text-black">
                            {new Date(item.appointment_date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-bold ${
                            item.wait_minutes > 30 ? 'text-red-600' :
                            item.wait_minutes > 15 ? 'text-orange-600' : 'text-gray-700'
                          }`}>
                            {item.wait_minutes || 0} min
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {item.display_status === 'expected' && (
                            <button
                              onClick={() => handleCheckIn(item.appointment_id)}
                              className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold"
                            >
                              Check in
                            </button>
                          )}
                          {item.display_status === 'checked_in' && (
                            <button
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold"
                            >
                              Waiting
                            </button>
                          )}
                          {item.display_status === 'with_clinician' && (
                            <span className="text-xs font-bold text-purple-600">
                              In consultation
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* RIGHT - 2 PANELS (4 cols) */}
        {/* ============================================ */}
        <div className="lg:col-span-4 space-y-5">
          {/* Panel 1: Owner & Animal Registration */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black mb-0.5">
                Owner & animal registration
              </h3>
              <p className="text-xs font-semibold text-gray-500">
                Create a linked client record
              </p>
            </div>

            <div className="p-5 space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Owner
                </p>
                <p className="text-sm font-bold text-black">
                  {queue[0]?.owner_name || 'Maya Hernandez'} ·{' '}
                  {queue[0]?.owner_phone || '(555) 018-4271'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Animal name
                </p>
                <p className="text-sm font-bold text-black">
                  {queue[0]?.animal_name || 'Olive'}
                </p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-teal-500 text-white rounded-lg text-xs font-bold">
                  Owner
                </button>
                <button className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold">
                  Animal
                </button>
              </div>

              <button
                onClick={() => navigate('/receptionist/register')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                           bg-teal-500 text-white rounded-lg text-sm font-bold"
              >
                <ArrowRight className="w-4 h-4" />
                Continue registration
              </button>
            </div>
          </div>

          {/* Panel 2: Invoice & Payment */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black mb-0.5">
                Invoice & payment
              </h3>
              <p className="text-xs font-semibold text-gray-500">
                INV-10984 · Cooper Davis
              </p>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">
                  Consultation
                </span>
                <span className="text-sm font-extrabold text-black">
                  $150.00
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">
                  Total
                </span>
                <span className="text-lg font-black text-teal-600">
                  $575.00
                </span>
              </div>

              <button
                onClick={() => navigate('/receptionist/invoices')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                           bg-teal-500 text-white rounded-lg text-sm font-bold"
              >
                <FileText className="w-4 h-4" />
                Process payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}