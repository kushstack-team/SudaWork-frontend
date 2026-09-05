import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="protected-loading-container" dir="rtl">
        <div className="protected-spinner" />
        <p className="protected-loading-text">جارٍ التحقق من بيانات الدخول...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to the user's correct home/dashboard based on their actual role
    if (role === 'client') {
      return <Navigate to="/client-dashboard" replace />;
    }
    if (role === 'freelancer') {
      return <Navigate to="/freelancer-dashboard" replace />;
    }
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
