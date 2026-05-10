import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingScreen from "./LoadingScreen";

export const ProtectedRoute = ({ children, requiredAdmin = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredAdmin && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (user?.isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};