import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: string;
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { isLoggedIn, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn || !user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // User's role doesn't match, redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
