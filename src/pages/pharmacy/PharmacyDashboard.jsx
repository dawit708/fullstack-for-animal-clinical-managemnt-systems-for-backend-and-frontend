import DashboardLayout from '../../layouts/DashboardLayout';

export default function PharmacyDashboard() {
  return (
    <DashboardLayout
      title="Pharmacy & inventory"
      subtitle="Central dispensary · Stock synchronized across 3 branches"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Dispensing queue" value="8" note="1 priority prescription" color="blue" />
        <StatCard label="Ready for pickup" value="5" note="Oldest ready 34 min" color="green" />
        <StatCard label="Low-stock items" value="11" note="4 below critical level" color="red" />
        <StatCard label="Expiring in 60 days" value="7" note="$614 inventory" color="orange" />
      </div>
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Prescription dispensing queue</h3>
        <p className="text-gray-500 text-sm">Coming soon...</p>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, note, color = 'teal' }) {
  const colors = { teal: 'text-teal-600', blue: 'text-blue-600', green: 'text-green-600', red: 'text-red-600', orange: 'text-orange-600' };
  return (
    <div className="card">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className={`text-xs font-medium ${colors[color]}`}>{note}</p>
    </div>
  );
}