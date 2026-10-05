import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ============================================
// AUTH
// ============================================
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// Public pages
import Home    from './pages/public/Home';
import About   from './pages/public/About';
import Service from './pages/public/Service';
import Contact from './pages/public/Contact';

// ============================================
// ADMIN
// ============================================
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import Branches from './pages/admin/Branches';
import Services from './pages/admin/Services';
import Security from './pages/admin/Security';
import Backups from './pages/admin/Backups';
import Logs from './pages/admin/Logs';
import Maintenance from './pages/admin/Maintenance';
import SendNotification from './pages/admin/SendNotification';

// ============================================
// VET
// ============================================
import VetDashboard from './pages/vet/VetDashboard';
import Appointments from './pages/vet/Appointments';
import Patients from './pages/vet/Patients';
import PatientDetail from './pages/vet/PatientDetail';
import Consultations from './pages/vet/Consultations';
import Laboratory from './pages/vet/Laboratory';
import LabOrder from './pages/vet/LabOrder';
import Prescriptions from './pages/vet/Prescriptions';
import Surgery from './pages/vet/Surgery';
import FollowUps from './pages/vet/FollowUps';

// ============================================
// LAB
// ============================================
import LabDashboard from './pages/lab/LabDashboard';
import LabRequisitions from './pages/lab/LabRequisitions';
import LabSamples from './pages/lab/LabSamples';
import LabFindings from './pages/lab/LabFindings';
import LabReports from './pages/lab/LabReports';
import LabEquipment from './pages/lab/LabEquipment';
import LabReagents from './pages/lab/LabReagents';
import LabQualityControl from './pages/lab/LabQualityControl';
import LabFindingDetail from './pages/lab/LabFindingDetail';



// ============================================
// RECEPTIONIST
// ============================================
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import ReceptionistAppointments from './pages/receptionist/Appointments';
import CheckInQueue from './pages/receptionist/CheckInQueue';
import Owners from './pages/receptionist/Owners';
import Registration from './pages/receptionist/Registration';
import Invoices from './pages/receptionist/Invoices';
import Payments from './pages/receptionist/Payments';
import Messages from './pages/receptionist/Messages';
import WalkIn from './pages/receptionist/WalkIn';

import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
// import DispensingQueue   from './pages/pharmacy/DispensingQueue';
// import DrugInventory     from './pages/pharmacy/DrugInventory';
// import Vaccines          from './pages/pharmacy/Vaccines';
// import ToolsConsumables  from './pages/pharmacy/ToolsConsumables';
// import StockAlerts       from './pages/pharmacy/StockAlerts';
// import PurchaseOrders    from './pages/pharmacy/PurchaseOrders';
// import Suppliers         from './pages/pharmacy/Suppliers';
// OTHER DASHBOARDS
// ============================================
import OwnerDashboard from './pages/owner/OwnerDashboard';

// ============================================
// USER
// ============================================
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

// ============================================
// PROTECTED ROUTE
// ============================================
import ProtectedRoute from './components/ProtectedRoute';

// ============================================
// // HOME PAGE
// // ============================================
// const Home = () => (
//   <div className="min-h-screen flex items-center justify-center bg-primary-50">
//     <div className="card text-center">
//       <h1 className="text-3xl font-bold text-primary-700">🐾 VetraCare</h1>
//       <p className="text-gray-600 mt-2">Northstar Animal Health</p>
//       <div className="flex gap-3 justify-center mt-6">
//         <a href="/login" className="btn-primary">Login</a>
//         <a href="/register" className="btn-secondary">Register</a>
//       </div>
//     </div>
//   </div>
// );

// ============================================
// APP COMPONENT
// ============================================
function App() {
  return (
    <>
      <Routes>
        {/* ============================================ */}
        {/* PUBLIC */}
        {/* ============================================ */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ============================================ */}
        {/* PROFILE & SETTINGS */}
        {/* ============================================ */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* ============================================ */}
        {/* ADMIN */}
        {/* ============================================ */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="/admin/branches" element={<ProtectedRoute roles={['admin']}><Branches /></ProtectedRoute>} />
        <Route path="/admin/services" element={<ProtectedRoute roles={['admin']}><Services /></ProtectedRoute>} />
        <Route path="/admin/security" element={<ProtectedRoute roles={['admin']}><Security /></ProtectedRoute>} />
        <Route path="/admin/backups" element={<ProtectedRoute roles={['admin']}><Backups /></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute roles={['admin']}><Logs /></ProtectedRoute>} />
        <Route path="/admin/maintenance" element={<ProtectedRoute roles={['admin']}><Maintenance /></ProtectedRoute>} />
        <Route path="/admin/send-notification" element={<ProtectedRoute roles={['admin']}><SendNotification /></ProtectedRoute>} />

        {/* ============================================ */}
        {/* VET */}
        {/* ============================================ */}
        <Route path="/vet/dashboard" element={<ProtectedRoute roles={['vet', 'admin']}><VetDashboard /></ProtectedRoute>} />
        <Route path="/vet/appointments" element={<ProtectedRoute roles={['vet', 'admin']}><Appointments /></ProtectedRoute>} />
        <Route path="/vet/patients" element={<ProtectedRoute roles={['vet', 'admin']}><Patients /></ProtectedRoute>} />
        <Route path="/vet/patients/:id" element={<ProtectedRoute roles={['vet', 'admin']}><PatientDetail /></ProtectedRoute>} />
        <Route path="/vet/consultations" element={<ProtectedRoute roles={['vet', 'admin']}><Consultations /></ProtectedRoute>} />
        <Route path="/vet/laboratory" element={<ProtectedRoute roles={['vet', 'admin']}><Laboratory /></ProtectedRoute>} />
        <Route path="/vet/lab-order" element={<ProtectedRoute roles={['vet', 'admin']}><LabOrder /></ProtectedRoute>} />
        <Route path="/vet/prescriptions" element={<ProtectedRoute roles={['vet', 'admin']}><Prescriptions /></ProtectedRoute>} />
        <Route path="/vet/surgery" element={<ProtectedRoute roles={['vet', 'admin']}><Surgery /></ProtectedRoute>} />
        <Route path="/vet/follow-ups" element={<ProtectedRoute roles={['vet', 'admin']}><FollowUps /></ProtectedRoute>} />

        {/* ============================================ */}
        {/* LAB */}
        {/* ============================================ */}
        <Route path="/lab/dashboard" element={<ProtectedRoute roles={['lab', 'admin']}><LabDashboard /></ProtectedRoute>} />
        <Route path="/lab/requisitions" element={<ProtectedRoute roles={['lab', 'admin']}><LabRequisitions /></ProtectedRoute>} />
        <Route path="/lab/samples" element={<ProtectedRoute roles={['lab', 'admin']}><LabSamples /></ProtectedRoute>} />
        <Route path="/lab/findings" element={<ProtectedRoute roles={['lab', 'admin']}><LabFindings /></ProtectedRoute>} />
        <Route path="/lab/reports" element={<ProtectedRoute roles={['lab', 'admin']}><LabReports /></ProtectedRoute>} />
        <Route path="/lab/equipment" element={<ProtectedRoute roles={['lab', 'admin']}><LabEquipment /></ProtectedRoute>} />
        <Route path="/lab/reagents" element={<ProtectedRoute roles={['lab', 'admin']}><LabReagents /></ProtectedRoute>} />
        <Route path="/lab/quality-control" element={<ProtectedRoute roles={['lab', 'admin']}><LabQualityControl /></ProtectedRoute>} />
<Route path="/lab/findings" element={<ProtectedRoute roles={['lab', 'admin']}><LabFindings /></ProtectedRoute>} />
<Route path="/lab/findings/:id" element={<ProtectedRoute roles={['lab', 'admin']}><LabFindingDetail /></ProtectedRoute>} />


        {/* ============================================ */}
        {/* RECEPTIONIST */}
        {/* ============================================ */}
       {/* ============================================ */}
{/* RECEPTIONIST */}
{/* ============================================ */}
<Route path="/receptionist/dashboard" element={<ProtectedRoute roles={['receptionist', 'admin']}><ReceptionistDashboard /></ProtectedRoute>} />
<Route path="/receptionist/appointments" element={<ProtectedRoute roles={['receptionist', 'admin']}><ReceptionistAppointments /></ProtectedRoute>} />
<Route path="/receptionist/check-in" element={<ProtectedRoute roles={['receptionist', 'admin']}><CheckInQueue /></ProtectedRoute>} />
<Route path="/receptionist/owners" element={<ProtectedRoute roles={['receptionist', 'admin']}><Owners /></ProtectedRoute>} />
<Route path="/receptionist/register" element={<ProtectedRoute roles={['receptionist', 'admin']}><Registration /></ProtectedRoute>} />
<Route path="/receptionist/invoices" element={<ProtectedRoute roles={['receptionist', 'admin']}><Invoices /></ProtectedRoute>} />
<Route path="/receptionist/payments" element={<ProtectedRoute roles={['receptionist', 'admin']}><Payments /></ProtectedRoute>} />
<Route path="/receptionist/messages" element={<ProtectedRoute roles={['receptionist', 'admin']}><Messages /></ProtectedRoute>} />
<Route path="/receptionist/walk-in" element={<ProtectedRoute roles={['receptionist', 'admin']}><WalkIn /></ProtectedRoute>} />

       {/* PHARMACY */}


       {/* PUBLIC */}
<Route path="/"          element={<Home />} />
<Route path="/about"     element={<About />} />
<Route path="/service"  element={<Service />} />
<Route path="/contact"   element={<Contact />} />
<Route path="/login"     element={<Login />} />
<Route path="/register"  element={<Register />} />
<Route path="/pharmacy/dashboard"       element={<ProtectedRoute roles={['pharmacy','admin']}><PharmacyDashboard /></ProtectedRoute>} />
{/* <Route path="/pharmacy/dispensing"      element={<ProtectedRoute roles={['pharmacy','admin']}><DispensingQueue /></ProtectedRoute>} />
<Route path="/pharmacy/inventory"       element={<ProtectedRoute roles={['pharmacy','admin']}><DrugInventory /></ProtectedRoute>} />
<Route path="/pharmacy/vaccines"        element={<ProtectedRoute roles={['pharmacy','admin']}><Vaccines /></ProtectedRoute>} />
<Route path="/pharmacy/tools"           element={<ProtectedRoute roles={['pharmacy','admin']}><ToolsConsumables /></ProtectedRoute>} />
<Route path="/pharmacy/alerts"          element={<ProtectedRoute roles={['pharmacy','admin']}><StockAlerts /></ProtectedRoute>} />
<Route path="/pharmacy/purchase-orders" element={<ProtectedRoute roles={['pharmacy','admin']}><PurchaseOrders /></ProtectedRoute>} />
<Route path="/pharmacy/suppliers"       element={<ProtectedRoute roles={['pharmacy','admin']}><Suppliers /></ProtectedRoute>} /> */}
        {/* OWNER */}
        {/* ============================================ */}
        <Route path="/owner/dashboard" element={<ProtectedRoute roles={['owner', 'admin']}><OwnerDashboard /></ProtectedRoute>} />

        {/* ============================================ */}
        {/* 404 - REDIRECT */}
        {/* ============================================ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </>
  );
}

export default App;