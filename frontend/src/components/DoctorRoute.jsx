// File: src/components/DoctorRoute.jsx

import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DoctorRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Nếu đang kiểm tra (loading), chưa vội làm gì
  if (loading) {
    return <div>Đang tải...</div>; 
  }

  // Nếu KHÔNG có user HOẶC user KHÔNG PHẢI là Bác sĩ
  if (!user || user.role !== 'DOCTOR') {
    // Chuyển về trang đăng nhập
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // Nếu là Bác sĩ, cho phép vào
  return children;
};

export default DoctorRoute;