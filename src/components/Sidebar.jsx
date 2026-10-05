import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  LayoutDashboard, Calendar, Users, PawPrint, FlaskConical,
  Pill, Stethoscope, ClipboardList, FileText, CreditCard,
  Package, Building2, Settings, LogOut, Bell, ChevronRight,
  ShieldCheck, ShoppingCart, Beaker, TrendingUp, Home,
  UserPlus, User, MessageSquare, Activity, Wrench, AlertTriangle,
  Upload, CheckCircle2, Database, TestTube2, Microscope,
} from 'lucide-react';

// Menu configuration per role
const MENU_CONFIG = {
  admin: [
    { label: 'Overview',        icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'User accounts',   icon: Users,           path: '/admin/users' },
    { label: 'Clinic branches', icon: Building2,       path: '/admin/branches' },
    { label: 'Services & pricing', icon: FileText,     path: '/admin/services' },
    { label: 'Send notification', icon: Bell,          path: '/admin/send-notification' },
    { label: 'Security & access', icon: ShieldCheck,   path: '/admin/security' },
    { label: 'Backups',         icon: Database,        path: '/admin/backups' },
    { label: 'System logs',     icon: FileText,        path: '/admin/logs' },
    { label: 'Maintenance',     icon: Wrench,          path: '/admin/maintenance' },
  ],
  vet: [
    { label: 'Today',           icon: LayoutDashboard, path: '/vet/dashboard' },
    { label: 'Appointments',    icon: Calendar,        path: '/vet/appointments' },
    { label: 'Patient records', icon: PawPrint,        path: '/vet/patients' },
    { label: 'Consultations',   icon: Stethoscope,     path: '/vet/consultations' },
    { label: 'Laboratory',      icon: FlaskConical,    path: '/vet/laboratory' },
    { label: 'Prescriptions',   icon: Pill,            path: '/vet/prescriptions' },
    { label: 'Surgery schedule',icon: ClipboardList,   path: '/vet/surgery' },
    { label: 'Follow-ups',      icon: Bell,            path: '/vet/follow-ups' },
  ],
  lab: [
    { label: 'Laboratory overview', icon: LayoutDashboard, path: '/lab/dashboard' },
    { label: 'Test requisitions',   icon: ClipboardList,   path: '/lab/requisitions' },
    { label: 'Sample tracking',     icon: Beaker,          path: '/lab/samples' },
    { label: 'Findings entry',      icon: FileText,        path: '/lab/findings' },
    { label: 'Diagnostic reports',  icon: TrendingUp,      path: '/lab/reports' },
    { label: 'Equipment',           icon: Activity,        path: '/lab/equipment' },
    { label: 'Reagent stock',       icon: Package,         path: '/lab/reagents' },
    { label: 'Quality control',     icon: ShieldCheck,     path: '/lab/quality-control' },
  ],
  receptionist: [
    { label: 'Front desk',        icon: LayoutDashboard, path: '/receptionist/dashboard' },
    { label: 'Appointments',      icon: Calendar,        path: '/receptionist/appointments' },
    { label: 'Check-in queue',    icon: ClipboardList,   path: '/receptionist/check-in' },
    { label: 'Owners & animals',  icon: User,            path: '/receptionist/owners' },
    { label: 'Registration',      icon: UserPlus,        path: '/receptionist/register' },
    { label: 'Billing & invoices',icon: FileText,        path: '/receptionist/invoices' },
    { label: 'Payments',          icon: CreditCard,      path: '/receptionist/payments' },
    { label: 'Messages',          icon: MessageSquare,   path: '/receptionist/messages' },
  ],
  pharmacy: [
    { label: 'Pharmacy overview', icon: LayoutDashboard, path: '/pharmacy/dashboard' },
    { label: 'Dispensing queue',  icon: Pill,            path: '/pharmacy/dispensing' },
    { label: 'Drug inventory',    icon: Package,         path: '/pharmacy/inventory' },
    { label: 'Vaccines',          icon: Beaker,          path: '/pharmacy/vaccines' },
    { label: 'Tools & consumables', icon: Settings,      path: '/pharmacy/tools' },
    { label: 'Stock alerts',      icon: AlertTriangle,   path: '/pharmacy/alerts' },
    { label: 'Purchase orders',   icon: ShoppingCart,    path: '/pharmacy/purchase-orders' },
    { label: 'Suppliers',         icon: Building2,       path: '/pharmacy/suppliers' },
  ],
  owner: [
    { label: 'Home',              icon: Home,           path: '/owner/dashboard' },
    { label: 'My animals',        icon: PawPrint,       path: '/owner/animals' },
    { label: 'Appointments',      icon: Calendar,       path: '/owner/appointments' },
    { label: 'Vaccinations',      icon: Beaker,         path: '/owner/vaccinations' },
    { label: 'Medical records',   icon: ClipboardList,  path: '/owner/medical-records' },
    { label: 'Lab reports',       icon: FlaskConical,   path: '/owner/lab-reports' },
    { label: 'Prescriptions',     icon: Pill,           path: '/owner/prescriptions' },
    { label: 'Invoices & payments', icon: CreditCard,   path: '/owner/invoices' },
  ],
};

const ROLE_TITLES = {
  admin: 'System administrator',
  vet: 'Veterinarian',
  lab: 'Laboratory technician',
  receptionist: 'Receptionist · Front desk',
  pharmacy: 'Pharmacist · Inventory manager',
  owner: 'Pet owner',
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = MENU_CONFIG[user?.role] || [];
  const roleTitle = ROLE_TITLES[user?.role] || 'User';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully 👋');
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-sidebar-bg text-white z-40
          flex flex-col
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-xl">
            🐾
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">VetraCare</h1>
            <p className="text-xs font-semibold text-gray-300">Northstar Animal Health</p>
          </div>
        </div>

        {/* Workspace Badge */}
        <div className="mx-4 mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
          <p className="text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-1">
            Workspace
          </p>
          <p className="text-sm font-bold text-white">
            {roleTitle}
          </p>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate font-bold">{item.label}</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-sm font-extrabold text-white">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-xs font-medium text-gray-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 
                       bg-red-500/20 
                       text-red-200
                       rounded-lg text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}