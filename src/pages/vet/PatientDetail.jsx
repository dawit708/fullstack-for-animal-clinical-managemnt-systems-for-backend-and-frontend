import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, ArrowLeft, Pill, FlaskConical } from 'lucide-react';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/vet/patients/${id}`);
        setPatient(data.patient);
      } catch (err) {
        toast.error('Failed to load patient');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Patient Details">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout title="Patient Not Found">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-base font-bold text-gray-700">Patient not found</p>
          <button
            onClick={() => navigate('/vet/patients')}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg font-bold"
          >
            Back to Patients
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={patient.name}
      subtitle={`${patient.breed} · ${patient.gender}`}
    >
      <button
        onClick={() => navigate('/vet/patients')}
        className="mb-5 flex items-center gap-2 text-sm font-bold text-teal-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-extrabold text-black mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Name" value={patient.name} />
              <InfoItem label="Species" value={patient.species} />
              <InfoItem label="Breed" value={patient.breed} />
              <InfoItem label="Gender" value={patient.gender} />
              <InfoItem label="Age" value={`${patient.age_years || 0} years`} />
              <InfoItem label="Weight" value={`${patient.weight_kg} kg`} />
              <InfoItem label="Microchip" value={patient.microchip_id || 'N/A'} />
              <InfoItem label="Owner" value={patient.owner_name} />
            </div>
          </div>

          {/* Tags */}
          {(patient.allergies?.length > 0 || patient.chronic_conditions?.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-extrabold text-black mb-4">Medical Alerts</h2>
              <div className="flex flex-wrap gap-2">
                {patient.allergies?.map((a) => (
                  <span key={a.id} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                    ⚠️ Allergy: {a.allergen}
                  </span>
                ))}
                {patient.chronic_conditions?.map((c) => (
                  <span key={c.id} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                    {c.condition_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SOAP Notes */}
          {patient.latest_soap_note && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-extrabold text-black mb-4">Latest SOAP Note</h2>
              <div className="space-y-3">
                <SOAPSection letter="S" title="SUBJECTIVE" content={patient.latest_soap_note.subjective} />
                <SOAPSection letter="O" title="OBJECTIVE" content={patient.latest_soap_note.objective} />
                <SOAPSection letter="A" title="ASSESSMENT" content={patient.latest_soap_note.assessment} highlighted />
                <SOAPSection letter="P" title="PLAN" content={patient.latest_soap_note.plan} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Vitals */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-extrabold text-black mb-4">Latest Vitals</h3>
            <div className="space-y-3">
              <VitalRow label="Temperature" value={patient.latest_vitals?.temperature ? `${patient.latest_vitals.temperature} °C` : '—'} />
              <VitalRow label="Heart rate" value={patient.latest_vitals?.heart_rate ? `${patient.latest_vitals.heart_rate} bpm` : '—'} />
              <VitalRow label="Respiration" value={patient.latest_vitals?.respiration ? `${patient.latest_vitals.respiration} rpm` : '—'} />
              <VitalRow label="BCS" value={patient.latest_vitals?.bcs ? `${patient.latest_vitals.bcs} / 9` : '—'} />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-extrabold text-black mb-4">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/vet/lab-order')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-bold"
              >
                <FlaskConical className="w-4 h-4" />
                Order Lab Test
              </button>
              <button
                onClick={() => navigate('/vet/prescriptions')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-black rounded-lg text-sm font-bold"
              >
                <Pill className="w-4 h-4" />
                New Prescription
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-black">{value || '—'}</p>
    </div>
  );
}

function VitalRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <span className="text-sm font-extrabold text-black">{value}</span>
    </div>
  );
}

function SOAPSection({ letter, title, content, highlighted }) {
  if (!content) return null;
  return (
    <div className={`p-4 rounded-xl border-2 ${highlighted ? 'bg-teal-50 border-teal-300' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${highlighted ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
          {letter}
        </div>
        <div className="flex-1">
          <p className="text-xs font-extrabold text-gray-600 uppercase mb-1">{title}</p>
          <p className="text-sm font-medium text-black">{content}</p>
        </div>
      </div>
    </div>
  );
}