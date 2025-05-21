// src/routes/ProtectedRoute.jsx
import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Auth } from "../services/api";
import AccessDenied from "../pages/AccessDenied";

const ProtectedRoute = ({ children, redirectPath = "/login" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = Auth.isAuthenticated();
  const isAdmin = Auth.isAdmin();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(redirectPath, { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, navigate, location, redirectPath]);

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
