import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, Plus, Briefcase, CheckCircle, PauseCircle,
  Layers, Trash2
} from 'lucide-react';

// ============================================
// CATEGORY CONFIG
// ============================================
const CATEGORY_LABELS = {
  consultation: 'Consultations',
  vaccination: 'Vaccines',
  lab: 'Laboratory',
  surgery: 'Procedures',
  grooming: 'Grooming',
  other: 'Other Services',
};

const CATEGORY_ORDER = [
  'consultation',
  'vaccination',
  'surgery',
  'lab',
  'grooming',
  'other',
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function Services() {
  const [data, setData] = useState({ stats: null, groups: {} });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'consultation',
    description: '',
    price: '',
    duration_minutes: 30,
  });

  // ============================================
  // LOAD DATA
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/services');
      setData({
        stats: response.data.stats,
        groups: response.data.groups,
        services: response.data.services,
      });
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // MODAL - CREATE
  // ============================================
  const handleCreate = () => {
    setEditingService(null);
    setForm({
      name: '',
      category: 'consultation',
      description: '',
      price: '',
      duration_minutes: 30,
    });
    setShowModal(true);
  };

  // ============================================
  // MODAL - EDIT
  // ============================================
  const handleEdit = (service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description || '',
      price: service.price,
      duration_minutes: service.duration_minutes,
    });
    setShowModal(true);
  };

  // ============================================
  // SAVE (Create / Update)
  // ============================================
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingService) {
        await API.put(`/admin/services/${editingService.id}`, form);
        toast.success('Service updated ✅');
      } else {
        await API.post('/admin/services', form);
        toast.success('Service created ✅');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // TOGGLE STATUS
  // ============================================
  const handleToggleStatus = async (service) => {
    try {
      await API.put(`/admin/services/${service.id}`, {
        is_active: !service.is_active,
      });
      toast.success(service.is_active ? 'Disabled' : 'Enabled');
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // ============================================
  // UPDATE PRICE (Inline)
  // ============================================
  const handlePriceUpdate = async (service, newPrice) => {
    if (!newPrice || parseFloat(newPrice) === parseFloat(service.price)) return;

    try {
      await API.put(`/admin/services/${service.id}`, { price: newPrice });
      toast.success('Price updated ✅');
      loadData();
    } catch (err) {
      toast.error('Failed to update price');
    }
  };

  // ============================================
  // DELETE SERVICE
  // ============================================
  const handleDelete = async (service) => {
    if (!window.confirm(`Delete "${service.name}"?`)) return;
    setDeleting(service.id);
    try {
      await API.delete(`/admin/services/${service.id}`);
      toast.success('Service deleted ✅');
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <DashboardLayout title="Services & pricing">
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
      title="Services & pricing"
      subtitle={`Standard catalog · ${data.stats?.total || 0} services across all branches`}
    >
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Briefcase}
          color="teal"
          label="Total services"
          value={data.stats?.total || 0}
          note="Across all categories"
        />
        <StatCard
          icon={CheckCircle}
          color="blue"
          label="Active"
          value={data.stats?.active || 0}
          note="Currently bookable"
        />
        <StatCard
          icon={PauseCircle}
          color="orange"
          label="Inactive"
          value={data.stats?.inactive || 0}
          note="Hidden from booking"
        />
        <StatCard
          icon={Layers}
          color="purple"
          label="Categories"
          value={data.stats?.categories || 0}
          note="Service groupings"
        />
      </div>

      {/* SERVICE GROUPS */}
      {CATEGORY_ORDER.map((categoryKey) => {
        const services = data.groups?.[categoryKey] || [];
        if (services.length === 0) return null;

        return (
          <div
            key={categoryKey}
            className="bg-white rounded-xl mb-6 overflow-hidden border border-gray-200"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-extrabold text-black">
                  {CATEGORY_LABELS[categoryKey]}
                </h2>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">
                  {services.length} service{services.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 
                           bg-white 
                           border-2 border-gray-300 
                           text-black 
                           rounded-lg text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Add service
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Price (USD)
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <ServiceRow
                      key={service.id}
                      service={service}
                      deleting={deleting}
                      onToggle={handleToggleStatus}
                      onPriceUpdate={handlePriceUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {(!data.services || data.services.length === 0) && (
        <div className="bg-white rounded-xl text-center py-20 border border-gray-200">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-bold mb-4">No services yet</p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg font-bold"
          >
            Add First Service
          </button>
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Service Name *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 
                         bg-white 
                         border-2 border-gray-300 
                         rounded-lg 
                         text-black font-semibold
                         placeholder-gray-400
                         focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 
                         outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Dermatology consultation"
              required
            />
          </div>

          {/* Category + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Category *
              </label>
              <select
                className="w-full px-4 py-2.5 
                           bg-white 
                           border-2 border-gray-300 
                           rounded-lg 
                           text-black font-semibold
                           focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 
                           outline-none"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="consultation">Consultation</option>
                <option value="vaccination">Vaccination</option>
                <option value="surgery">Procedure</option>
                <option value="lab">Laboratory</option>
                <option value="grooming">Grooming</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Duration (min)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2.5 
                           bg-white 
                           border-2 border-gray-300 
                           rounded-lg 
                           text-black font-semibold
                           focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 
                           outline-none"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Price (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-2.5 
                         bg-white 
                         border-2 border-gray-300 
                         rounded-lg 
                         text-black font-semibold
                         placeholder-gray-400
                         focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 
                         outline-none"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="e.g. 125"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 
                         bg-white 
                         border-2 border-gray-300 
                         rounded-lg 
                         text-black font-semibold
                         placeholder-gray-400
                         focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 
                         outline-none"
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2.5 
                         bg-white 
                         border-2 border-gray-300 
                         text-black 
                         rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 
                         bg-teal-500 
                         text-white 
                         rounded-lg font-bold 
                         flex items-center justify-center gap-2 
                         disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : editingService ? (
                'Update Service'
              ) : (
                'Create Service'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

// ============================================
// SERVICE ROW COMPONENT
// ============================================
function ServiceRow({ service, deleting, onToggle, onPriceUpdate, onDelete }) {
  const [price, setPrice] = useState(service.price);

  const handleBlur = () => {
    if (price !== service.price) {
      onPriceUpdate(service, price);
    }
  };

  return (
    <tr className="border-t border-gray-100">
      {/* Code */}
      <td className="px-6 py-4">
        <span className="text-sm font-extrabold text-teal-600">
          {service.code}
        </span>
      </td>

      {/* Service Name */}
      <td className="px-6 py-4">
        <p className="text-sm font-bold text-black">
          {service.name}
        </p>
      </td>

      {/* Duration */}
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-black">
          {service.duration_minutes} min
        </span>
      </td>

      {/* Price (White Input) */}
      <td className="px-6 py-4">
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={handleBlur}
          className="w-24 px-3 py-1.5 
                     bg-white 
                     border-2 border-gray-300 
                     rounded-md 
                     text-sm font-bold text-black 
                     focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 
                     outline-none"
        />
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        {service.is_active ? (
          <span className="inline-flex items-center px-3 py-1 
                          bg-teal-100 text-teal-800 
                          rounded-full text-xs font-extrabold">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 
                          bg-gray-200 text-gray-700 
                          rounded-full text-xs font-extrabold">
            Inactive
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          {/* Toggle Button */}
          <button
            onClick={() => onToggle(service)}
            className="px-4 py-1.5 
                       bg-white 
                       border-2 border-gray-300 
                       text-black 
                       rounded-lg text-xs font-bold"
          >
            {service.is_active ? 'Disable' : 'Enable'}
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(service)}
            disabled={deleting === service.id}
            className="p-2 
                       bg-white 
                       border-2 border-red-200 
                       text-red-600 
                       rounded-lg 
                       disabled:opacity-50"
            title="Delete"
          >
            {deleting === service.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ icon: Icon, color, label, value, note }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-700 mb-1">
            {label}
          </p>
          <p className="text-4xl font-black text-black mb-1">
            {value}
          </p>
          <p className="text-xs font-semibold text-gray-500 truncate">
            {note}
          </p>
        </div>
      </div>
    </div>
  );
}