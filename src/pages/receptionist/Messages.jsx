import DashboardLayout from '../../layouts/DashboardLayout';
import { MessageSquare } from 'lucide-react';

export default function Messages() {
  return (
    <DashboardLayout title="Messages" subtitle="Client communication">
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <MessageSquare className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        <h2 className="text-xl font-extrabold text-black mb-2">Messages</h2>
        <p className="text-sm font-semibold text-gray-600">
          Chat with clients
        </p>
      </div>
    </DashboardLayout>
  );
}