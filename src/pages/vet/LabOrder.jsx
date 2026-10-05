import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, FlaskConical, ArrowLeft, CheckCircle } from 'lucide-react';

const TEST_TYPES = [
  'CBC + chemistry',
  'Ear cytology',
  'Urinalysis',
  'Blood Test',
  'X-Ray',
  'Ultrasound',
  'Skin scraping',
  'Fecal exam',
  'Thyroid panel',
  'Joint fluid analysis',
  'Renal panel',
  'Pre-op CBC',
];

const SAMPLE_TYPES = ['Blood', 'Urine', 'Ear swab', 'Skin', 'Fecal', 'Joint fluid', 'Other'];

export default function LabOrder() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    animal_id: '',
    test_type: TEST_TYPES[0],
    sample_type: SAMPLE_TYPES[0],
    priority: 'normal',
    notes: '',
  });

  // ============================================
  // LOAD PATIENTS
  // ============================================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/vet/patients');
        console.log('Patients loaded:', data.patients?.length);
        setPatients(data.patients || []);

        if (data.patients?.length === 0) {
          toast.warning('No patients available. Please add a patient first.');
        }
      } catch (err) {
        console.error('Load error:', err);
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.post('/vet/lab-order', form);
      console.log('Lab order response:', data);
      toast.success(`Lab test ordered: ${data.lab_test.lab_number} ✅`);
      setSuccess(data.lab_test);
      setTimeout(() => navigate('/vet/laboratory'), 2000);
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Failed to order');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <DashboardLayout title="Order Laboratory">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </DashboardLayout>
    );
  }

  // ============================================
  // SUCCESS VIEW
  // ============================================
  if (success) {
    return (
      <DashboardLayout title="Lab Test Ordered">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-teal-200 p-8 text-center">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-black mb-2">
              Lab Test Ordered Successfully!
            </h2>
            <p className="text-sm font-semibold text-gray-600 mb-6">
              The lab technicians have been notified
            </p>

            <div className="bg-teal-50 rounded-xl p-4 text-left mb-6">
              <p className="text-sm font-bold text-teal-800 mb-1">
                Lab Number
              </p>
              <p className="text-2xl font-black text-teal-700 mb-3">
                {success.lab_number}
              </p>

              <p className="text-sm font-bold text-teal-800 mb-1">
                Test Type
              </p>
              <p className="text-base font-semibold text-black mb-3">
                {success.test_type}
              </p>

              <p className="text-sm font-bold text-teal-800 mb-1">
                Patient
              </p>
              <p className="text-base font-semibold text-black">
                {success.animal_name}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSuccess(null)}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-black rounded-lg font-bold"
              >
                Order Another
              </button>
              <button
                onClick={() => navigate('/vet/laboratory')}
                className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-bold"
              >
                View Laboratory
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================
  // FORM VIEW
  // ============================================
  return (
    <DashboardLayout title="Order Laboratory" subtitle="Create a new lab test order">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-2 text-sm font-bold text-teal-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="max-w-2xl bg-white rounded-2xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-black">New Lab Test</h2>
            <p className="text-sm font-semibold text-gray-600">
              Order a laboratory test for your patient
            </p>
          </div>
        </div>

        {/* Warning if no patients */}
        {patients.length === 0 && (
          <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
            <p className="text-sm font-bold text-orange-800">
              ⚠️ No patients available
            </p>
            <p className="text-xs font-medium text-orange-700 mt-1">
              Please add a patient first before ordering lab tests.
            </p>
            <button
              onClick={() => navigate('/vet/patients')}
              className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm"
            >
              Add Patient
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Patient * ({patients.length} available)
            </label>
            <select
              value={form.animal_id}
              onChange={(e) => setForm({ ...form, animal_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
              required
              disabled={patients.length === 0}
            >
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.owner_name}) - {p.species}
                </option>
              ))}
            </select>
          </div>

          {/* Test Type + Sample Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Test Type *
              </label>
              <select
                value={form.test_type}
                onChange={(e) => setForm({ ...form, test_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
              >
                {TEST_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Sample Type
              </label>
              <select
                value={form.sample_type}
                onChange={(e) => setForm({ ...form, sample_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
              >
                {SAMPLE_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Priority
            </label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${
                form.priority === 'normal' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="normal"
                  checked={form.priority === 'normal'}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                />
                <span className="text-sm font-bold text-black">Normal</span>
              </label>
              <label className={`flex-1 flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${
                form.priority === 'STAT' ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="STAT"
                  checked={form.priority === 'STAT'}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                />
                <span className="text-sm font-bold text-red-600">🚨 STAT (Urgent)</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Clinical Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows="3"
              placeholder="Reason for test, symptoms, etc..."
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-black rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || patients.length === 0}
              className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Ordering...</>
              ) : (
                <><FlaskConical className="w-4 h-4" />Order Test</>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}