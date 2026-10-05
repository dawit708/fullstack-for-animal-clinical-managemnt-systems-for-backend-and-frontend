import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Loader2, FlaskConical, ClipboardList, Beaker, Activity,
  CheckCircle, AlertTriangle, ArrowRight, Play,
  Clock, Package,
} from 'lucide-react';

export default function LabDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [lab, setLab] = useState(null);
  const [columns, setColumns] = useState({ received: [], processing: [], completed: [] });
  const [selectedSample, setSelectedSample] = useState(null);
  const [equipment, setEquipment] = useState([]);

  // ============================================
  // LOAD DATA
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, samplesRes, equipRes] = await Promise.all([
        API.get('/lab/dashboard'),
        API.get('/lab/samples'),
        API.get('/lab/equipment'),
      ]);

      setStats(dashRes.data.stats);
      setLab(dashRes.data.lab);
      setColumns(samplesRes.data.columns || { received: [], processing: [], completed: [] });
      setEquipment(equipRes.data.equipment || []);

      // Auto-select first processing or received sample
      const firstSample = 
        samplesRes.data.columns?.processing?.[0] ||
        samplesRes.data.columns?.received?.[0];
      setSelectedSample(firstSample || null);
    } catch (err) {
      console.error('Load error:', err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // START PROCESSING
  // ============================================
  const handleStart = async (sample) => {
    try {
      await API.put(`/lab/samples/${sample.id}/process`);
      toast.success(`${sample.lab_number} processing started`);
      loadData();
    } catch (err) {
      toast.error('Failed to start');
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <DashboardLayout title="Laboratory">
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
      title="Laboratory operations"
      subtitle={lab?.branch_name ? `${lab.branch_name} · Live sample workflow` : 'Central Hospital Laboratory'}
    >
      {/* ============================================ */}
      {/* STAT CARDS - 4 */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Card 1: Incoming */}
        <button
          onClick={() => navigate('/lab/requisitions')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-7 h-7 text-orange-500" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Incoming requisitions
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.incoming_requisitions?.total || 0}
              </p>
              <p className="text-xs font-semibold text-orange-500">
                {stats?.incoming_requisitions?.stat_priorities || 0} STAT priorities
              </p>
            </div>
          </div>
        </button>

        {/* Card 2: Processing */}
        <button
          onClick={() => navigate('/lab/samples')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Beaker className="w-7 h-7 text-teal-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Samples processing
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.samples_processing?.count || 0}
              </p>
              <p className="text-xs font-semibold text-teal-600">
                Average TAT {stats?.samples_processing?.average_tat_minutes || 42} min
              </p>
            </div>
          </div>
        </button>

        {/* Card 3: Awaiting */}
        <button
          onClick={() => navigate('/lab/findings')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Awaiting validation
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.awaiting_validation?.count || 0}
              </p>
              <p className="text-xs font-semibold text-red-500">
                {stats?.awaiting_validation?.abnormal_findings || 0} abnormal findings
              </p>
            </div>
          </div>
        </button>

        {/* Card 4: Equipment */}
        <button
          onClick={() => navigate('/lab/equipment')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-7 h-7 text-green-500" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Equipment online
              </p>
              <p className="text-4xl font-extrabold text-black leading-none mb-1.5">
                {stats?.equipment_online?.online || 0} / {stats?.equipment_online?.total || 6}
              </p>
              <p className="text-xs font-semibold text-green-600">
                All systems operational
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* ============================================ */}
      {/* MAIN GRID */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ============================================ */}
        {/* SAMPLE TRACKING (3 columns) */}
        {/* ============================================ */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-extrabold text-black">
                Sample tracking
              </h3>
              <button
                onClick={() => navigate('/lab/requisitions')}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg text-xs font-bold"
              >
                New requisition
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm font-semibold text-gray-500">
              Dragless workflow view · {columns.received.length + columns.processing.length + columns.completed.length} visible samples
            </p>
          </div>

          {/* 3 Columns */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Received */}
            <SampleColumn
              title="Received"
              count={columns.received.length}
              color="blue"
              samples={columns.received}
              onSelect={setSelectedSample}
              onAction={handleStart}
              actionLabel="Start"
              actionIcon={Play}
              actionColor="orange"
            />

            {/* Processing */}
            <SampleColumn
              title="Processing"
              count={columns.processing.length}
              color="teal"
              samples={columns.processing}
              onSelect={setSelectedSample}
              actionLabel="View"
              actionColor="teal"
            />

            {/* Completed */}
            <SampleColumn
              title="Completed"
              count={columns.completed.length}
              color="green"
              samples={columns.completed}
              onSelect={setSelectedSample}
              actionLabel="View"
              actionColor="green"
            />
          </div>
        </div>

        {/* ============================================ */}
        {/* RIGHT - Findings Entry + Equipment */}
        {/* ============================================ */}
        <div className="lg:col-span-4 space-y-5">
          {/* Findings Entry */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black mb-0.5">
                Findings entry
              </h3>
              {selectedSample ? (
                <p className="text-xs font-semibold text-gray-500">
                  {selectedSample.lab_number} · {selectedSample.animal_name}
                </p>
              ) : (
                <p className="text-xs font-semibold text-gray-400">
                  Select a sample from tracking
                </p>
              )}
            </div>

            {selectedSample ? (
              <div className="p-5 space-y-3">
                {/* Test info */}
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                  <p className="text-sm font-bold text-teal-800">
                    {selectedSample.test_type}
                  </p>
                  <p className="text-xs font-semibold text-teal-700 mt-1">
                    {selectedSample.sample_type} · {selectedSample.is_stat ? 'STAT' : 'Normal'}
                  </p>
                </div>

                {/* Findings */}
                {selectedSample.findings ? (
                  <div className={`p-3 rounded-xl border ${
                    selectedSample.is_abnormal
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className="text-xs font-extrabold text-gray-700 uppercase mb-1">
                      Findings
                    </p>
                    <p className="text-sm font-medium text-black">
                      {selectedSample.findings}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500">
                      No findings yet. Start processing to add.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {selectedSample.status === 'received' && (
                    <button
                      onClick={() => handleStart(selectedSample)}
                      className="w-full py-2.5 bg-orange-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Processing
                    </button>
                  )}

                  {(selectedSample.status === 'processing' || selectedSample.status === 'awaiting_validation') && (
                    <button
                      onClick={() => navigate(`/lab/findings/${selectedSample.id}`)}
                      className="w-full py-2.5 bg-teal-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Enter Findings
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FlaskConical className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">
                  No sample selected
                </p>
              </div>
            )}
          </div>

          {/* Equipment Integration */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black mb-0.5">
                Equipment integration
              </h3>
              <p className="text-xs font-semibold text-gray-500">
                Analyzer interface status
              </p>
            </div>

            <div className="p-4 space-y-2">
              {equipment.slice(0, 4).map((eq) => (
                <div key={eq.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      eq.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <p className="text-xs font-bold text-black truncate">
                      {eq.name}
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase ${
                    eq.status === 'online' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {eq.status}
                  </span>
                </div>
              ))}

              <button
                onClick={() => navigate('/lab/equipment')}
                className="w-full py-2 text-sm font-bold text-teal-600"
              >
                View all equipment →
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============================================
// SAMPLE COLUMN COMPONENT
// ============================================
function SampleColumn({ title, count, color, samples, onSelect, onAction, actionLabel, actionIcon: Icon, actionColor }) {
  const colors = {
    blue: 'bg-blue-500',
    teal: 'bg-teal-500',
    green: 'bg-green-500',
  };

  return (
    <div>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${colors[color]}`} />
          <h4 className="text-sm font-extrabold text-black">{title}</h4>
        </div>
        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-extrabold">
          {count}
        </span>
      </div>

      {/* Samples */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {samples.length === 0 ? (
          <div className="p-6 text-center bg-gray-50 rounded-xl">
            <p className="text-xs font-medium text-gray-400">No samples</p>
          </div>
        ) : (
          samples.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`w-full text-left p-3 rounded-xl border-2 ${
                s.is_abnormal
                  ? 'bg-red-50 border-red-200'
                  : s.is_stat
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-extrabold text-black">
                  {s.lab_number}
                </span>
                {s.is_stat && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-extrabold">
                    STAT
                  </span>
                )}
                {s.is_abnormal && !s.is_stat && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-extrabold">
                    ABN
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-black truncate">
                {s.animal_name}
              </p>
              <p className="text-[10px] font-medium text-gray-600 truncate mb-2">
                {s.species}
              </p>
              <p className="text-[10px] font-medium text-gray-600 truncate mb-2">
                {s.test_type}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-gray-500">
                  {s.time_display}
                </span>
                {Icon && onAction && (
                  <span className={`text-[10px] font-extrabold text-${actionColor}-600`}>
                    {actionLabel} →
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}