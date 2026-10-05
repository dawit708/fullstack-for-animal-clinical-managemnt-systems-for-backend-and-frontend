import DashboardLayout from '../../layouts/DashboardLayout';
import { UserPlus } from 'lucide-react';

export default function WalkIn() {
  return (
    <DashboardLayout title="Walk-in" subtitle="Urgent patient check-in">
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <UserPlus className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        <h2 className="text-xl font-extrabold text-black mb-2">Walk-in Patient</h2>
        <p className="text-sm font-semibold text-gray-600">
          Quick check-in for walk-in patients
        </p>
      </div>
    </DashboardLayout>
  );
}