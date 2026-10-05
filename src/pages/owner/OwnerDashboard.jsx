import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export default function OwnerDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.full_name?.split(' ')[0]}`}
      subtitle="Your animals' care, appointments and records in one place"
    >
      {/* Next Appointment */}
      <div className="bg-sidebar-bg text-white rounded-xl p-6 mb-6">
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
          Next appointment
        </p>
        <h2 className="text-3xl font-bold mb-2">
          Thursday, 15 October · 9:30 AM
        </h2>
        <p className="text-gray-300 mb-4">
          Cooper's dermatology recheck with Dr. Amara Mensah
        </p>
        <div className="flex gap-3">
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs">
            📍 Riverside Clinic
          </span>
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs">
            ⏱️ 30 minutes
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="My animals" value="2" note="Cooper & Milo" color="teal" />
        <StatCard label="Upcoming visits" value="1" note="Next: 15 Oct" color="blue" />
        <StatCard label="Pending care" value="3" note="In checklist" color="orange" />
      </div>

      {/* Animals */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">My animals</h3>
        <p className="text-gray-500 text-sm">Coming soon...</p>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, note, color = 'teal' }) {
  const colors = { teal: 'text-teal-600', blue: 'text-blue-600', green: 'text-green-600', orange: 'text-orange-600' };
  return (
    <div className="card">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className={`text-xs font-medium ${colors[color]}`}>{note}</p>
    </div>
  );
}