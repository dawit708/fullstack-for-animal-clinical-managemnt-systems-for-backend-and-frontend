import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Pill, Plus } from 'lucide-react';
import Modal from '../../components/Modal';

const MEDICINES = [
  'Mometamax otic', 'Doxycycline 100mg', 'Revolution Plus',
  'Meloxicam oral', 'Amoxicillin 500mg', 'Ivermectin',
  'Rabies Vaccine', 'Multivitamin Syrup',
];

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    animal_id: '',
    medicine_name: MEDICINES[0],
    dosage: '',
    frequency: 'Once daily',
    duration_days: 7,
    quantity: '',
    instructions: '',
    priority: 'normal',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rxRes, patRes] = await Promise.all([
        API.get('/pharmacy/dispensing-queue').catch(() => ({ data: { queue: [] } })),
        API.get('/vet/patients'),
      ]);
      setPrescriptions(rxRes.data.queue || []);
      setPatients(patRes.data.patients || []);
    } catch (err) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/vet/prescription', {
        ...form,
        medical_record_id: 1,
      });
      toast.success('Prescription created ✅');
      setShowModal(false);
      setForm({
        animal_id: '',
        medicine_name: MEDICINES[0],
        dosage: '',
        frequency: 'Once daily',
        duration_days: 7,
        quantity: '',
        instructions: '',
        priority: 'normal',
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Prescriptions" subtitle="Digital prescription management">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-black">All Prescriptions</h2>
          <p className="text-sm font-semibold text-gray-600">{prescriptions.length} prescriptions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-bold"
        >
          <Plus className="w-4 h-4" />
          New Prescription
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-20">
          <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No prescriptions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Pill className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-black truncate">
                    {rx.medicine_name}
                  </p>
                  <p className="text-xs font-bold text-teal-600">{rx.rx_number}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-gray-700">Patient: {rx.animal_name}</p>
                <p className="font-medium text-gray-600">Dosage: {rx.dosage}</p>
                <p className="font-medium text-gray-600">Frequency: {rx.frequency}</p>
              </div>
              <span className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                rx.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                rx.status === 'ready' ? 'bg-teal-100 text-teal-800' :
                'bg-gray-100 text-gray-700'
              }`}>
                {rx.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Prescription" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">Patient *</label>
            <select
              value={form.animal_id}
              onChange={(e) => setForm({ ...form, animal_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
              required
            >
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.owner_name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">Medicine *</label>
            <select
              value={form.medicine_name}
              onChange={(e) => setForm({ ...form, medicine_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
            >
              {MEDICINES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-black mb-2">Dosage *</label>
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="e.g. 1 tablet"
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
              >
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Three times daily</option>
                <option>As needed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-black mb-2">Duration (days)</label>
              <input
                type="number"
                value={form.duration_days}
                onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">Quantity</label>
              <input
                type="text"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g. 15g"
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">Instructions</label>
            <textarea
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              rows="2"
              placeholder="Give after food..."
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-black placeholder-gray-400 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-black rounded-lg font-bold">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}