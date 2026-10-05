import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';
import {
  Bell, X, Check, CheckCheck, Loader2,
  Calendar, Pill, FlaskConical, CreditCard,
  AlertTriangle, Info, Trash2
} from 'lucide-react';

// Icon per notification type
const TYPE_ICONS = {
  appointment: Calendar,
  vaccination: FlaskConical,
  payment: CreditCard,
  lab_result: FlaskConical,
  prescription: Pill,
  stock: AlertTriangle,
  general: Info,
};

const TYPE_COLORS = {
  appointment: 'bg-blue-50 text-blue-600',
  vaccination: 'bg-teal-50 text-teal-600',
  payment: 'bg-green-50 text-green-600',
  lab_result: 'bg-pink-50 text-pink-600',
  prescription: 'bg-orange-50 text-orange-600',
  stock: 'bg-red-50 text-red-600',
  general: 'bg-gray-50 text-gray-600',
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all | unread
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ============================================
  // LOAD NOTIFICATIONS
  // ============================================
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === 'unread' ? '?unread_only=true' : '';
      const { data } = await API.get(`/notifications${params}`);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Load notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and every 30 seconds (auto-refresh)
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s
    return () => clearInterval(interval);
  }, [filter]);

  // Reload when dropdown opens
  useEffect(() => {
    if (isOpen) loadNotifications();
  }, [isOpen]);

  // ============================================
  // CLOSE ON OUTSIDE CLICK
  // ============================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================
  // MARK SINGLE AS READ
  // ============================================
  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================
  // MARK ALL AS READ
  // ============================================
  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All marked as read ✅');
    } catch (err) {
      toast.error('Failed');
    }
  };

  // ============================================
  // DELETE
  // ============================================
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Deleted ✅');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  // ============================================
  // CLICK NOTIFICATION → Navigate
  // ============================================
  const handleClick = async (n) => {
    // Mark as read
    if (!n.is_read) {
      await handleMarkRead(n.id, { stopPropagation: () => {} });
    }

    // Navigate based on type
    const routes = {
      appointment: '/vet/dashboard',
      prescription: '/pharmacy/dashboard',
      lab_result: '/lab/dashboard',
      payment: '/receptionist/dashboard',
      vaccination: '/owner/dashboard',
      stock: '/pharmacy/alerts',
    };

    const route = routes[n.type];
    if (route) {
      navigate(route);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  filter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  filter === 'unread'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((n) => {
                  const Icon = TYPE_ICONS[n.type] || Info;
                  const color = TYPE_COLORS[n.type] || TYPE_COLORS.general;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition ${
                        !n.is_read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${
                              !n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {n.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-400">
                              {n.time_display}
                            </span>
                            <div className="flex items-center gap-1">
                              {!n.is_read && (
                                <button
                                  onClick={(e) => handleMarkRead(n.id, e)}
                                  className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 rounded"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDelete(n.id, e)}
                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
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

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}