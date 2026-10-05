import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'vet',
    branch_id: '',
    address: '',
  });

  // ============================================
  // LOAD DATA
  // ============================================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterRole) params.append('role', filterRole);

      const [usersRes, branchesRes] = await Promise.all([
        API.get(`/admin/users?${params}`),
        API.get('/admin/branches'),
      ]);

      setUsers(usersRes.data.users || []);
      setBranches(branchesRes.data.branches || []);
    } catch (err) {
      console.error('Load error:', err);
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, filterRole]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  // ============================================
  // OPEN MODAL - CREATE
  // ============================================
  const handleCreate = () => {
    setEditingUser(null);
    setForm({
      full_name: '',
      email: '',
      phone: '',
      password: 'pass123',
      role: 'vet',
      branch_id: '',
      address: '',
    });
    setShowModal(true);
  };

  // ============================================
  // OPEN MODAL - EDIT
  // ============================================
  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'vet',
      branch_id: user.branch_id ? String(user.branch_id) : '',
      address: user.address || '',
    });
    setShowModal(true);
  };

  // ============================================
  // SAVE (CREATE or UPDATE)
  // ============================================
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate
      if (!form.full_name.trim()) {
        toast.error('Full name is required');
        return;
      }
      if (!form.email.trim()) {
        toast.error('Email is required');
        return;
      }
      if (!form.phone.trim()) {
        toast.error('Phone is required');
        return;
      }
      if (!editingUser && !form.password.trim()) {
        toast.error('Password is required for new users');
        return;
      }

      // Build clean payload
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role,
        branch_id: form.branch_id ? parseInt(form.branch_id) : null,
        address: form.address?.trim() || null,
      };

      // Add password only for create
      if (!editingUser) {
        payload.password = form.password;
      }

      console.log('Sending payload:', payload);

      if (editingUser) {
        // UPDATE
        const res = await API.put(`/admin/users/${editingUser.id}`, payload);
        console.log('Update response:', res.data);
        toast.success('User updated successfully ✅');
      } else {
        // CREATE
        const res = await API.post('/admin/users', payload);
        console.log('Create response:', res.data);
        toast.success('User created successfully ✅');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Save error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save user';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE (DEACTIVATE)
  // ============================================
  const handleDelete = async (user) => {
    if (!window.confirm(`Deactivate ${user.full_name}?`)) return;
    try {
      await API.delete(`/admin/users/${user.id}`);
      toast.success('User deactivated ✅');
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  // ============================================
  // ROLE COLOR
  // ============================================
  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-50 text-purple-700',
      vet: 'bg-teal-50 text-teal-700',
      receptionist: 'bg-blue-50 text-blue-700',
      pharmacy: 'bg-orange-50 text-orange-700',
      lab: 'bg-pink-50 text-pink-700',
      owner: 'bg-gray-50 text-gray-700',
    };
    return colors[role] || 'bg-gray-50 text-gray-700';
  };

  return (
    <DashboardLayout
      title="User accounts"
      subtitle="Vets, reception, pharmacy and laboratory teams"
    >
      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                className="input-field pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter */}
            <select
              className="input-field max-w-[180px]"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="vet">Veterinarian</option>
              <option value="receptionist">Receptionist</option>
              <option value="pharmacy">Pharmacist</option>
              <option value="lab">Lab Technician</option>
              <option value="owner">Pet Owner</option>
            </select>

            {/* Refresh */}
            <button
              onClick={loadData}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add team member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500">Total users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.is_active).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter((u) => !u.is_active).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Branches</p>
          <p className="text-2xl font-bold text-blue-600">{branches.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-2">No users found</p>
            <button onClick={handleCreate} className="text-primary-600 hover:underline text-sm">
              Create the first user →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Team member
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
                          {user.initials || user.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.branch_name || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Add Team Member'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-field"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Dr. John Doe"
              required
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@vetracare.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0911234567"
                required
              />
            </div>
          </div>

          {/* Role + Branch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                className="input-field"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              >
                <option value="admin">Admin</option>
                <option value="vet">Veterinarian</option>
                <option value="receptionist">Receptionist</option>
                <option value="pharmacy">Pharmacist</option>
                <option value="lab">Lab Technician</option>
                <option value="owner">Pet Owner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                className="input-field"
                value={form.branch_id}
                onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
              >
                <option value="">No branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password (only for create) */}
          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Default password suggestion: <code className="bg-gray-100 px-1 rounded">pass123</code>
              </p>
            </div>
          )}

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              className="input-field"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Addis Ababa, Ethiopia"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary flex-1"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : editingUser ? (
                'Update User'
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}