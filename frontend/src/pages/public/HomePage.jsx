// src/pages/public/HomePage.jsx

import React from 'react';

// Import các Sections đã có
import HeroBanner from '../../components/HeroBanner';
import ServiceSection from '../../components/ServiceSection';
 
// Dùng lại Footer và Header từ App.jsx

export default function HomePage() {
  return (
    <div className="bg-gray-50"> 
      
      <main>
        
        {/* 1. BANNER CHÍNH (HERO SECTION) */}
        {/* Đây là phần quảng cáo lớn, thu hút người dùng */}
        <HeroBanner />
        
        {/* 2. DỊCH VỤ CỐT LÕI (CORE SERVICES) */}
        {/* Hiển thị 3-4 thẻ dịch vụ nổi bật ngay dưới banner */}
        <div className="max-w-6xl mx-auto px-4 py-16">
            <ServiceSection />
        </div>
        
        {/* 3. CTA ĐƠN GIẢN (Tạo một khối kêu gọi hành động) */}
        <section className="bg-blue-600 text-white py-12 mb-16">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">
                    Đặt Lịch Khám Ngay Để Nhận Ưu Đãi!
                </h2>
                <button className="bg-red-500 text-white text-xl font-bold px-8 py-3 rounded-lg shadow-md hover:bg-red-600 transition">
                    ĐẶT LỊCH HẸN TRỰC TUYẾN
                </button>
            </div>
        </section>

      </main>
      
    </div>
  );
}