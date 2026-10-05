import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, FlaskConical, RefreshCw, Search,
  Edit, CheckCircle, AlertTriangle,
} from 'lucide-react';

export default function LabFindings() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    findings: '',
    reference_range: '',
    is_abnormal: false,
    notes: '',
  });

  // ============================================
  // LOAD DATA
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/lab/samples');
      const allSamples = [
        ...(data.columns?.received || []),
        ...(data.columns?.processing || []),
        ...(data.columns?.completed || []),
      ];
      setSamples(allSamples);
    } catch (err) {
      toast.error('Failed to load samples');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // OPEN MODAL
  // ============================================
  const handleEdit = (sample) => {
    setEditingSample(sample);
    setForm({
      findings: sample.findings || '',
      reference_range: '',
      is_abnormal: sample.is_abnormal || false,
      notes: '',
    });
    setShowModal(true);
  };

  // ============================================
  // SUBMIT FINDINGS
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post(`/lab/findings/${editingSample.id}`, form);
      toast.success('Findings submitted ✅');
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // FILTER
  // ============================================
  const filtered = samples.filter((s) => {
    if (filter === 'awaiting' && s.status !== 'awaiting_validation') return false;
    if (filter === 'abnormal' && !s.is_abnormal) return false;
    if (filter === 'completed' && s.status !== 'completed') return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        s.lab_number?.toLowerCase().includes(q) ||
        s.animal_name?.toLowerCase().includes(q) ||
        s.test_type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: samples.length,
    awaiting: samples.filter(s => s.status === 'awaiting_validation').length,
    abnormal: samples.filter(s => s.is_abnormal).length,
    completed: samples.filter(s => s.status === 'completed').length,
  };

  // ============================================
  // STATUS BADGE
  // ============================================
  const getStatusBadge = (status, isAbnormal) => {
    if (status === 'completed' && isAbnormal) {
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Abnormal' };
    }
    if (status === 'completed') {
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' };
    }
    if (status === 'awaiting_validation') {
      return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Awaiting' };
    }
    if (status === 'processing') {
      return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  };

  return (
    <DashboardLayout
      title="Findings Entry"
      subtitle="Record and manage lab findings"
    >
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-black mb-1">
              All Findings
            </h2>
            <p className="text-sm font-semibold text-gray-600">
              {samples.length} samples total
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-2.5 bg-white border-2 border-gray-300 rounded-lg"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
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
                filter === 'all' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter('awaiting')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'awaiting' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Awaiting ({counts.awaiting})
            </button>
            <button
              onClick={() => setFilter('abnormal')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'abnormal' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Abnormal ({counts.abnormal})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${
                filter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Completed ({counts.completed})
            </button>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search findings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
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
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700 mb-1">
            No findings found
          </p>
          <p className="text-sm font-medium text-gray-500">
            {search ? 'Try different search' : 'No findings yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Lab No.</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Patient</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Test Type</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Findings</th>
                  <th className="text-right px-6 py-4 text-xs font-extrabold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => {
                  const badge = getStatusBadge(s.status, s.is_abnormal);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-teal-600">
                          {s.lab_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-black">{s.animal_name}</p>
                        <p className="text-xs font-medium text-gray-500">{s.species}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-700">{s.test_type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        {s.findings ? (
                          <p className={`text-sm truncate ${s.is_abnormal ? 'text-red-700 font-bold' : 'text-gray-700 font-medium'}`} title={s.findings}>
                            {s.findings}
                          </p>
                        ) : (
                          <span className="text-xs font-medium text-gray-400">Pending...</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(s)}
                            className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            {s.findings ? 'Edit' : 'Add'}
                          </button>
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

      {/* ============================================ */}
      {/* MODAL */}
      {/* ============================================ */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Findings - ${editingSample?.lab_number || ''}`}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sample info */}
          {editingSample && (
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
              <p className="text-sm font-bold text-teal-800">
                {editingSample.test_type}
              </p>
              <p className="text-xs font-semibold text-teal-700 mt-1">
                {editingSample.animal_name} ({editingSample.species})
              </p>
            </div>
          )}

          {/* Findings */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Findings *
            </label>
            <textarea
              value={form.findings}
              onChange={(e) => setForm({ ...form, findings: e.target.value })}
              rows="4"
              placeholder="Enter test findings..."
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
              required
            />
          </div>

          {/* Reference Range */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Reference Range
            </label>
            <input
              type="text"
              value={form.reference_range}
              onChange={(e) => setForm({ ...form, reference_range: e.target.value })}
              placeholder="e.g. none to rare"
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
            />
          </div>

          {/* Abnormal checkbox */}
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
            <input
              type="checkbox"
              id="is_abnormal"
              checked={form.is_abnormal}
              onChange={(e) => setForm({ ...form, is_abnormal: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_abnormal" className="text-sm font-bold text-red-700 cursor-pointer">
              ⚠️ Mark as Abnormal
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows="2"
              placeholder="Additional notes..."
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-black rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
              ) : (
                <><CheckCircle className="w-4 h-4" />Submit Findings</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}