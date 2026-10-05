import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import { toast } from 'react-toastify';
import {
  Bell, Loader2, Check, CheckCheck, Trash2,
  Calendar, Pill, FlaskConical, CreditCard,
  AlertTriangle, Info
} from 'lucide-react';

const TYPE_ICONS = {
  appointment: Calendar,
  vaccination: FlaskConical,
  payment: CreditCard,
  lab_result: FlaskConical,
  prescription: Pill,
  stock: AlertTriangle,
  general: Info,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const params = filter === 'unread' ? '?unread_only=true' : '';
      const { data } = await API.get(`/notifications${params}`);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleMarkRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    loadData();
  };

  const handleMarkAllRead = async () => {
    await API.put('/notifications/read-all');
    toast.success('All marked as read ✅');
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    await API.delete(`/notifications/${id}`);
    toast.success('Deleted ✅');
    loadData();
  };

  return (
    <DashboardLayout title="Notifications" subtitle="All your notifications">
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              All Notifications
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount} unread
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className="btn-secondary text-sm"
            >
              {filter === 'all' ? 'Show unread' : 'Show all'}
            </button>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn-primary text-sm flex items-center gap-2">
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((n) => {
              const Icon = TYPE_ICONS[n.type] || Info;
              return (
                <div
                  key={n.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    !n.is_read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {n.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">{n.time_display}</p>
                        </div>
                        <div className="flex gap-1">
                          {!n.is_read && (
                            <button
                              onClick={() => handleMarkRead(n.id)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}