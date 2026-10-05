import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, FlaskConical, ArrowLeft, CheckCircle,
  AlertTriangle, Save,
} from 'lucide-react';

export default function LabFindingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    findings: '',
    reference_range: '',
    is_abnormal: false,
    notes: '',
  });

  // ============================================
  // LOAD SAMPLE
  // ============================================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/lab/samples/${id}`);
        setSample(data.sample);
        setForm({
          findings: data.sample.findings || '',
          reference_range: data.sample.reference_range || '',
          is_abnormal: data.sample.is_abnormal || false,
          notes: data.sample.notes || '',
        });
      } catch (err) {
        console.error('Load error:', err);
        toast.error('Failed to load sample');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ============================================
  // SUBMIT FINDINGS
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post(`/lab/findings/${id}`, form);
      toast.success('Findings submitted ✅');
      setTimeout(() => navigate('/lab/findings'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <DashboardLayout title="Findings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!sample) {
    return (
      <DashboardLayout title="Not Found">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700 mb-4">Sample not found</p>
          <button
            onClick={() => navigate('/lab/findings')}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg font-bold"
          >
            Back to Findings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <DashboardLayout
      title={`Findings - ${sample.lab_number}`}
      subtitle={`${sample.test_type} · ${sample.animal_name}`}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('/lab/findings')}
        className="mb-5 flex items-center gap-2 text-sm font-bold text-teal-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Findings
      </button>

      <div className="max-w-3xl">
        {/* Sample Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-black">
                {sample.animal_name?.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xl font-extrabold text-black">
                    {sample.animal_name}
                  </h3>
                  <p className="text-sm font-semibold text-gray-600">
                    {sample.species} · {sample.breed} · {sample.age_months} months
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase">Priority</p>
                  <p className={`text-sm font-extrabold ${
                    sample.priority === 'STAT' ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {sample.priority || 'Normal'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Test</p>
                  <p className="text-sm font-bold text-black">{sample.test_type}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Sample</p>
                  <p className="text-sm font-bold text-black">{sample.sample_type || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                  <p className="text-sm font-bold text-black capitalize">{sample.status}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Owner</p>
                  <p className="text-sm font-bold text-black">{sample.owner_name || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Findings Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-black">Enter Findings</h2>
              <p className="text-sm font-semibold text-gray-600">
                Record test results
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Findings */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Findings *
              </label>
              <textarea
                value={form.findings}
                onChange={(e) => setForm({ ...form, findings: e.target.value })}
                rows="5"
                placeholder="Enter detailed test findings..."
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
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
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
              />
            </div>

            {/* Abnormal Toggle */}
            <div className={`p-4 rounded-xl border-2 ${
              form.is_abnormal
                ? 'bg-red-50 border-red-300'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_abnormal}
                  onChange={(e) => setForm({ ...form, is_abnormal: e.target.checked })}
                  className="w-5 h-5 rounded text-red-600"
                />
                <div>
                  <p className="text-sm font-bold text-black">
                    Mark as Abnormal
                  </p>
                  <p className="text-xs font-medium text-gray-600">
                    Flag this result for vet review
                  </p>
                </div>
                {form.is_abnormal && (
                  <AlertTriangle className="w-5 h-5 text-red-600 ml-auto" />
                )}
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Additional Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows="3"
                placeholder="Optional notes..."
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-5 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/lab/findings')}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-black rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Submit Findings
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