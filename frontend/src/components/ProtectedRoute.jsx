// File: src/components/ProtectedRoute.jsx

import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Component này nhận vào "children" (là trang DatLichKham)
const ProtectedRoute = ({ children }) => {
  // Lấy thông tin user từ Context
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Nếu KHÔNG có user (chưa đăng nhập)
  if (!user) {
    // Chuyển hướng (redirect) về trang /dang-nhap
    // 'replace'
    // 'state={{ from: location }}' để sau khi đăng nhập, 
    // nó biết quay lại đúng trang Đặt lịch
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // Nếu CÓ user (đã đăng nhập)
  // Hiển thị trang (chính là {children})
  return children;
};

export default ProtectedRoute;