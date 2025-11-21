// File: src/components/AdminRoute.jsx

import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Đang tải...</div>; 
  }

  // Nếu KHÔNG có user HOẶC user KHÔNG PHẢI là Admin
  if (!user || user.role !== 'ADMIN') {
    // Chuyển về trang đăng nhập
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // Nếu là Admin, cho phép vào
  return children;
};

export default AdminRoute;