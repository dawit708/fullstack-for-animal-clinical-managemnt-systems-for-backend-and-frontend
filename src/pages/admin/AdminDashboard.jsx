import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { toast } from 'react-toastify';
import {
  Users, Building2, ShieldCheck, Database,
  Loader2, ArrowRight, CheckCircle, AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [security, setSecurity] = useState(null);

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [dashRes, usersRes, secRes] = await Promise.all([
          API.get('/admin/dashboard'),
          API.get('/admin/users'),
          API.get('/admin/security'),
        ]);

        setStats(dashRes.data.stats);
        // Get 4 most recent users
        setRecentUsers((usersRes.data.users || []).slice(0, 4));
        setSecurity(secRes.data.security);
      } catch (err) {
        console.error('Dashboard error:', err);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Get role badge color
  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-50 text-purple-700',
      vet: 'bg-teal-50 text-teal-700',
      receptionist: 'bg-blue-50 text-blue-700',
      pharmacy: 'bg-orange-50 text-orange-700',
      lab: 'bg-pink-50 text-pink-700',
      owner: 'bg-gray-50 text-gray-700',
    };
    return colors[role] || 'bg-gray-50 text-gray-700';
  };

  return (
    <DashboardLayout
      title="Platform overview"
      subtitle="Northstar Animal Health network"
    >
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.full_name?.split(' ')[0]}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's your platform overview
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* ============================================ */}
          {/* STAT CARDS - 4 */}
          {/* ============================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Users}
              label="Active staff accounts"
              value={stats?.active_staff?.total || 0}
              note={`${stats?.active_staff?.invitations_pending || 0} invitations pending`}
              color="teal"
            />
            <StatCard
              icon={Building2}
              label="Clinic branches"
              value={stats?.clinic_branches?.total || 0}
              note={`${stats?.clinic_branches?.active || 0} accepting appointments`}
              color="blue"
            />
            <StatCard
              icon={ShieldCheck}
              label="Security posture"
              value={`${stats?.security_posture?.score || 0}%`}
              note={stats?.security_posture?.no_critical_findings ? 'No critical findings' : 'Review needed'}
              color="green"
            />
            <StatCard
              icon={Database}
              label="Last backup"
              value={stats?.last_backup?.status === 'success' ? '✅' : '⚠️'}
              note={`${stats?.last_backup?.minutes_ago || 0} min ago`}
              color="purple"
            />
          </div>

          {/* ============================================ */}
          {/* MAIN GRID */}
          {/* ============================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT - User Management (No Add button) */}
            <div className="lg:col-span-2 card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    User account management
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vets, reception, pharmacy and laboratory teams
                  </p>
                </div>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  View all users
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Users Table */}
              {recentUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No users yet
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left px-6 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Team member
                        </th>
                        <th className="text-left px-6 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="text-left px-6 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Branch
                        </th>
                        <th className="text-left px-6 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {recentUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-xs">
                                {u.initials || u.full_name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {u.full_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${getRoleColor(u.role)}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {u.branch_name || '—'}
                          </td>
                          <td className="px-6 py-3">
                            {u.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                Inactive
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-6 py-3 text-xs text-gray-500 text-center border-t border-gray-100 dark:border-gray-700">
                    Showing {recentUsers.length} of {stats?.active_staff?.total || 0} accounts
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT - Security & Continuity */}
            <div className="card">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Security & continuity
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Live platform checks
                </p>
              </div>

              {/* Score Circle */}
              <div className="flex items-center justify-center py-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="64" cy="64" r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64" cy="64" r="56"
                      stroke="#14b8a6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - (security?.score || 0) / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {security?.score || 0}
                    </span>
                    <span className="text-xs text-gray-500">out of 100</span>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-teal-600 font-medium mb-4">
                {security?.no_critical_findings ? '✅ Strong security' : '⚠️ Review needed'}
              </p>

              {/* Security Items */}
              <div className="space-y-1">
                <SecurityItem
                  label="Access review"
                  ok={!security?.access_review?.needed}
                  note={security?.access_review?.count > 0 ? `${security.access_review.count} need review` : 'All clear'}
                />
                <SecurityItem
                  label="Nightly backup"
                  ok={security?.last_backup?.status === 'success'}
                  note={security?.last_backup?.backup_name ? 'Completed' : 'No backup'}
                />
                <SecurityItem
                  label="Credentials expiring"
                  ok={security?.credentials_expiring?.count === 0}
                  note={`${security?.credentials_expiring?.count || 0} credentials`}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ icon: Icon, label, value, note, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{note}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECURITY ITEM
// ============================================
function SecurityItem({ label, ok, note }) {
  return (
    <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-orange-500" />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <span className={`text-xs font-medium ${ok ? 'text-green-600' : 'text-orange-600'}`}>
        {note}
      </span>
    </div>
  );
}