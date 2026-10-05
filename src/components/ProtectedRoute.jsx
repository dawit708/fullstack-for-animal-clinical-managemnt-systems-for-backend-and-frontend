import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return children;
}

function getDashboardRoute(role) {
  const routes = {
    admin: '/admin/dashboard',
    vet: '/vet/dashboard',
    lab: '/lab/dashboard',
    receptionist: '/receptionist/dashboard',
    pharmacy: '/pharmacy/dashboard',
    owner: '/owner/dashboard',
  };
  return routes[role] || '/';
}