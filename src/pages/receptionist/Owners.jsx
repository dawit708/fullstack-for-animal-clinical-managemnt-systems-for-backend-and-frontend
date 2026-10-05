import DashboardLayout from '../../layouts/DashboardLayout';
import { User } from 'lucide-react';

export default function Owners() {
  return (
    <DashboardLayout title="Owners & Animals" subtitle="Client directory">
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <User className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        <h2 className="text-xl font-extrabold text-black mb-2">Client Directory</h2>
        <p className="text-sm font-semibold text-gray-600">
          Search and manage clients
        </p>
      </div>
    </DashboardLayout>
  );
}