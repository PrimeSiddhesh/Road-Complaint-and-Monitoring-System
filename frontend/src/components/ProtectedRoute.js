import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    // if trying to access admin area, send to admin login
    return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />;
  }

  // if a logged-in admin tries to access non-admin protected routes, redirect to admin profile
  if (!adminOnly && user && user.role && ['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/admin/profile" replace />;
  }

  if (adminOnly) {
    if (!user || !['admin','superadmin'].includes(user.role)) {
      // redirect to home if not admin
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
