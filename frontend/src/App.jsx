// File: src/App.jsx

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // Import Outlet và useLocation
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const location = useLocation(); // Lấy thông tin đường dẫn hiện tại
  const path = location.pathname;

  // 1. Định nghĩa các đường dẫn KHÔNG hiển thị Header/Footer
  const noLayoutPaths = ['/dang-nhap', '/dang-ky'];
  
  // 2. Kiểm tra xem có cần ẩn Header/Footer không
  const hideLayout = noLayoutPaths.includes(path);

  return (
    <div className='flex flex-col min-h-screen'>
      
      {/* 3. Render Header có điều kiện */}
      {!hideLayout && <Header />}
      
      <main className="flex-grow">
        {/* <Outlet /> hiển thị nội dung trang con */}
        <Outlet /> 
      </main>

      {/* 4. Render Footer có điều kiện */}
      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;