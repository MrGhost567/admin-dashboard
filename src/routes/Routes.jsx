import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Posts from "../pages/Posts";
import Reports from "../pages/Reports";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = ({ setUser }) => {
  return (
    <Routes>
      {/* Default redirect always to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login setUser={setUser} />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* Admin-Only Routes */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin/users" element={<Users adminView />} />
        <Route path="/admin/posts" element={<Posts adminView />} />
        <Route path="/admin/reports" element={<Reports adminView />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
