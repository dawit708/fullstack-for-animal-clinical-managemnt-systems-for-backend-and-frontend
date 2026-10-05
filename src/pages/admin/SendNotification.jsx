import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Send, Users, Loader2, Bell, User } from 'lucide-react';

export default function SendNotification() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('role'); // 'role' | 'single'
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    role: 'vet',
    user_id: '',
    title: '',
    message: '',
    type: 'general',
  });

  // Load users for single mode
  useEffect(() => {
    API.get('/admin/users')
      .then((res) => setUsers(res.data.users || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'role') {
        const { data } = await API.post('/notifications/broadcast', {
          role: form.role,
          title: form.title,
          message: form.message,
          type: form.type,
        });
        toast.success(`Sent to ${data.recipients} users ✅`);
      } else {
        await API.post('/notifications', {
          user_id: parseInt(form.user_id),
          title: form.title,
          message: form.message,
          type: form.type,
        });
        toast.success('Notification sent ✅');
      }
      setForm({ ...form, title: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Send Notification"
      subtitle="Broadcast messages to staff"
    >
      <div className="max-w-2xl">
        {/* Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-black">
                Send Notification
              </h2>
              <p className="text-sm font-semibold text-gray-600">
                Broadcast messages to staff or specific users
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mode */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Send To
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('role')}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                    mode === 'role'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Users className={`w-5 h-5 ${mode === 'role' ? 'text-teal-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className="font-bold text-sm text-black">By Role</p>
                    <p className="text-xs font-medium text-gray-500">All users with role</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                    mode === 'single'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <User className={`w-5 h-5 ${mode === 'single' ? 'text-teal-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className="font-bold text-sm text-black">Single User</p>
                    <p className="text-xs font-medium text-gray-500">One specific user</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Target */}
            {mode === 'role' ? (
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Select Role *
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                >
                  <option value="vet">All Veterinarians</option>
                  <option value="receptionist">All Receptionists</option>
                  <option value="pharmacy">All Pharmacists</option>
                  <option value="lab">All Lab Technicians</option>
                  <option value="owner">All Pet Owners</option>
                  <option value="admin">All Admins</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Select User *
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose user --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Type */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Notification Type
              </label>
              <select
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="general">General</option>
                <option value="appointment">Appointment</option>
                <option value="prescription">Prescription</option>
                <option value="lab_result">Lab Result</option>
                <option value="payment">Payment</option>
                <option value="vaccination">Vaccination</option>
                <option value="stock">Stock Alert</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Title *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
                placeholder="e.g. Staff meeting tomorrow"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={100}
              />
              <p className="text-xs font-medium text-gray-500 mt-1">
                {form.title.length}/100
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Message *
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
                rows="4"
                placeholder="Write your message here..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>

            {/* Preview */}
            {form.title && form.message && (
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Preview
                </label>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-bold text-black">
                    {form.title}
                  </p>
                  <p className="text-sm font-medium text-gray-600 mt-1">
                    {form.message}
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setForm({ ...form, title: '', message: '' })}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-black rounded-lg font-bold"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}