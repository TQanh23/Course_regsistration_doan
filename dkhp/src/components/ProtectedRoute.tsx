import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../api/auth';

type ProtectedRouteProps = {
  redirectPath?: string;
  requiredRole?: string;
};

const ProtectedRoute = ({ 
  redirectPath = '/login', 
  requiredRole
}: ProtectedRouteProps) => {
  const { isLoggedIn, user, isLoading } = useAuth();

  if (isLoading) {
    // You can replace this with a loading spinner component
    return <div>Loading...</div>;
  }

  // Check if user is logged in
  if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check for required role if specified
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render child routes if authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;