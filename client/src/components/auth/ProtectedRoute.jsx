import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If customer tries to access admin CRM pages, redirect to customer portal
    if (role === 'customer') {
      return <Navigate to="/portal" replace />;
    }
    // If admin tries to access customer portal, redirect to admin CRM home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
