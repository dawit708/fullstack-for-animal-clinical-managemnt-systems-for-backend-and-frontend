import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, UserPlus, ArrowLeft, CheckCircle,
  User, PawPrint, RefreshCw, Edit, Trash2, Search
} from 'lucide-react';

export default function Registration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    owner_full_name: '',
    owner_email: '',
    owner_phone: '',
    owner_address: '',
    animal_name: '',
    animal_species: 'dog',
    animal_breed: '',
    animal_age_months: '',
    animal_gender: 'male',
    animal_weight_kg: '',
    animal_color: '',
  });

  // ============================================
  // LOAD OWNERS
  // ============================================
  const loadOwners = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/receptionist/new-registrations');
      setOwners(data.registrations || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  // ============================================
  // SUBMIT REGISTRATION
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/receptionist/register', form);
      toast.success('Registration successful ✅');
      setForm({
        owner_full_name: '', owner_email: '', owner_phone: '', owner_address: '',
        animal_name: '', animal_species: 'dog', animal_breed: '',
        animal_age_months: '', animal_gender: 'male',
        animal_weight_kg: '', animal_color: '',
      });
      setShowForm(false);
      loadOwners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // FILTER
  // ============================================
  const filtered = owners.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.full_name?.toLowerCase().includes(q) ||
      o.phone?.includes(q) ||
      o.email?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Owner & Animal Registration" subtitle="Register new clients">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-black mb-1">
              Registered Clients
            </h2>
            <p className="text-sm font-semibold text-gray-600">
              {owners.length} clients registered
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadOwners}
              className="p-2.5 bg-white border-2 border-gray-300 rounded-lg"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-bold"
            >
              <UserPlus className="w-4 h-4" />
              {showForm ? 'View List' : 'New Registration'}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* REGISTRATION FORM */}
      {/* ============================================ */}
      {showForm ? (
        <div className="max-w-4xl bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-black">New Registration</h3>
              <p className="text-sm font-semibold text-gray-600">
                Register owner + first animal
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner Section */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-teal-100">
                <User className="w-4 h-4 text-teal-600" />
                <h4 className="text-base font-extrabold text-black">Owner Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={form.owner_full_name}
                    onChange={(e) => setForm({ ...form, owner_full_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={form.owner_phone}
                    onChange={(e) => setForm({ ...form, owner_phone: e.target.value })}
                    placeholder="0911234567"
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Email</label>
                  <input
                    type="email"
                    value={form.owner_email}
                    onChange={(e) => setForm({ ...form, owner_email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Address</label>
                  <input
                    type="text"
                    value={form.owner_address}
                    onChange={(e) => setForm({ ...form, owner_address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Animal Section */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-teal-100">
                <PawPrint className="w-4 h-4 text-teal-600" />
                <h4 className="text-base font-extrabold text-black">Animal Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Animal Name *</label>
                  <input
                    type="text"
                    value={form.animal_name}
                    onChange={(e) => setForm({ ...form, animal_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Species *</label>
                  <select
                    value={form.animal_species}
                    onChange={(e) => setForm({ ...form, animal_species: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="rabbit">Rabbit</option>
                    <option value="horse">Horse</option>
                    <option value="cow">Cow</option>
                    <option value="sheep">Sheep</option>
                    <option value="goat">Goat</option>
                    <option value="chicken">Chicken</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Breed</label>
                  <input
                    type="text"
                    value={form.animal_breed}
                    onChange={(e) => setForm({ ...form, animal_breed: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Age (months)</label>
                  <input
                    type="number"
                    value={form.animal_age_months}
                    onChange={(e) => setForm({ ...form, animal_age_months: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Gender *</label>
                  <select
                    value={form.animal_gender}
                    onChange={(e) => setForm({ ...form, animal_gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.animal_weight_kg}
                    onChange={(e) => setForm({ ...form, animal_weight_kg: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">Color</label>
                  <input
                    type="text"
                    value={form.animal_color}
                    onChange={(e) => setForm({ ...form, animal_color: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-black rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Registering...</>
                ) : (
                  <><UserPlus className="w-4 h-4" />Register</>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ============================================ */
        /* TABLE VIEW */
        /* ============================================ */
        <>
          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-700 mb-1">No clients registered</p>
              <p className="text-sm font-medium text-gray-500 mb-4">
                Register your first client to get started
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg font-bold"
              >
                Register First Client
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Owner</th>
                      <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Contact</th>
                      <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Animals</th>
                      <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Registered</th>
                      <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm">
                              {o.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-black">{o.full_name}</p>
                              <p className="text-xs font-medium text-gray-500">{o.address || 'Addis Ababa'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-black">{o.phone}</p>
                          <p className="text-xs font-medium text-gray-500">{o.email || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-extrabold">
                            {o.animal_count || 0} animal{o.animal_count !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(o.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {o.awaiting_consultation > 0 ? (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-extrabold">
                              Awaiting consultation
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-extrabold">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}