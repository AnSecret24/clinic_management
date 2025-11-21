// File: src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// 1. Tạo Context
// Đây là "nguồn" thông tin
export const AuthContext = createContext(null);

// 2. Tạo "Nhà cung cấp" (Provider)
// Đây là component sẽ bọc toàn bộ ứng dụng của bạn
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu thông tin user (VD: {firstName: 'Trần', ...})
  const [token, setToken] = useState(null); // Lưu token
  const [loading, setLoading] = useState(true); // Trạng thái kiểm tra (load)

  // 3. Hiệu ứng (useEffect) này sẽ chạy MỘT LẦN khi app tải
  // Nó sẽ kiểm tra localStorage xem người dùng đã đăng nhập từ lần trước chưa
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser)); // Chuyển chuỗi JSON thành object
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin đăng nhập từ localStorage:", error);
      // Nếu lỗi (vd: JSON hỏng), xóa hết
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false); // Dừng loading
    }
  }, []); // [] = Chạy 1 lần duy nhất

  // 4. Hàm Đăng nhập (login)
  // Trang LoginPage sẽ gọi hàm này
  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  // 5. Hàm Đăng xuất (logout)
  // Nút "Đăng xuất" sẽ gọi hàm này
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // 6. Cung cấp các giá trị này cho toàn bộ ứng dụng
  // (user, token, loading, login, logout)
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {/* !loading && children: 
        Chỉ hiển thị ứng dụng (children) sau khi đã kiểm tra xong localStorage.
        Điều này ngăn trang bị "giật" (từ "Đăng nhập" sang "Xin chào...")
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
};