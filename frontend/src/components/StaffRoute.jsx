// File: src/components/StaffRoute.jsx

import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StaffRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Đang tải...</div>; 
  }

  // Nếu KHÔNG có user HOẶC user KHÔNG PHẢI là Staff/Admin
  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // Nếu là Staff hoặc Admin, cho phép vào
  return children;
};

export default StaffRoute;