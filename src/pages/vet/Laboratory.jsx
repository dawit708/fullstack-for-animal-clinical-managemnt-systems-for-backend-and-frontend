import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, FlaskConical, Plus, RefreshCw, Search,
  Eye, Play, Upload, CheckCircle, Trash2,
} from 'lucide-react';

export default function Laboratory() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // ============================================
  // LOAD DATA
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/vet/results-to-review');
      setTests(data.results || []);
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Failed to load lab tests');
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
  const filtered = tests.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.lab_number?.toLowerCase().includes(s) ||
      t.test_type?.toLowerCase().includes(s) ||
      t.animal_name?.toLowerCase().includes(s) ||
      t.owner_name?.toLowerCase().includes(s)
    );
  });

  // ============================================
  // STATUS BADGES
  // ============================================
  const getStatusBadge = (status, isAbnormal) => {
    if (status === 'completed' && isAbnormal) {
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Abnormal' };
    }
    if (status === 'completed') {
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' };
    }
    if (status === 'received') {
      return { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Received' };
    }
    if (status === 'processing') {
      return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' };
    }
    if (status === 'awaiting_validation') {
      return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Awaiting' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  };

  // ============================================
  // ACTIONS
  // ============================================
  const handleView = (test) => {
    toast.info(`Viewing ${test.lab_number}`);
  };

  const handleStart = async (test) => {
    setActionLoading(test.id);
    try {
      toast.success(`Processing started: ${test.lab_number}`);
      loadData();
    } catch (err) {
      toast.error('Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = (test) => {
    toast.info(`Submit findings for ${test.lab_number}`);
  };

  const handleValidate = (test) => {
    toast.success(`Validated: ${test.lab_number}`);
    loadData();
  };

  // ============================================
  // RENDER ACTIONS
  // ============================================
  const renderActions = (test) => {
    const isLoading = actionLoading === test.id;

    // Received → Start
    if (test.status === 'received') {
      return (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleStart(test)}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Start
          </button>
          <button
            onClick={() => handleView(test)}
            className="px-4 py-2 bg-white border-2 border-red-200 text-red-600 rounded-lg text-sm font-bold"
          >
            Cancel
          </button>
        </div>
      );
    }

    // Processing → Submit
    if (test.status === 'processing') {
      return (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleSubmit(test)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            Submit
          </button>
          <button
            onClick={() => handleView(test)}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-black rounded-lg text-sm font-bold"
          >
            View
          </button>
        </div>
      );
    }

    // Awaiting → Validate
    if (test.status === 'awaiting_validation') {
      return (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleValidate(test)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            Validate
          </button>
          <button
            onClick={() => handleView(test)}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-black rounded-lg text-sm font-bold"
          >
            View
          </button>
        </div>
      );
    }

    // Completed → View
    return (
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => handleView(test)}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5"
        >
          <Eye className="w-4 h-4" />
          View Result
        </button>
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <DashboardLayout
      title="Laboratory"
      subtitle="Orders and digital results"
    >
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-black mb-1">
              All Lab Tests
            </h2>
            <p className="text-sm font-semibold text-gray-600">
              {tests.length} tests total
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
              onClick={() => navigate('/vet/lab-order')}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              Order Laboratory
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
            placeholder="Search lab tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-20">
          <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700 mb-1">
            {search ? 'No matching lab tests' : 'No lab tests'}
          </p>
          <p className="text-sm font-medium text-gray-500 mb-4">
            {search ? 'Try a different search' : 'Order your first lab test'}
          </p>
          {!search && (
            <button
              onClick={() => navigate('/vet/lab-order')}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg font-bold"
            >
              Order Laboratory Test
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Test Type
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((test) => {
                  const badge = getStatusBadge(test.status, test.is_abnormal);
                  return (
                    <tr key={test.id} className="hover:bg-gray-50">
                      {/* Time */}
                      <td className="px-6 py-5">
                        <span className="text-sm font-extrabold text-black">
                          {new Date(test.received_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </span>
                      </td>

                      {/* Patient */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-black">
                          {test.animal_name}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                          {test.species}
                        </p>
                      </td>

                      {/* Owner */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-black">
                          {test.owner_name}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                          {test.owner_phone}
                        </p>
                      </td>

                      {/* Test Type */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-gray-700">
                          {test.test_type}
                        </p>
                        {test.lab_number && (
                          <p className="text-xs font-bold text-teal-600">
                            {test.lab_number}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        {renderActions(test)}
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