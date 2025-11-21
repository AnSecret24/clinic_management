import React from 'react';
// import heroImage from "../../images/home.jpg";

export default function HeroBanner() {
  return (
    <section className="relative bg-blue-100 py-20 lg:py-32 overflow-hidden">
      
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Khối Nội Dung Chính (Text & CTA) */}
        <div className="z-10">
          <p className="text-xl font-semibold text-red-600 mb-3">Tận Tâm Chăm Sóc - An Toàn Tuyệt Đối</p>
          <h1 className="text-5xl font-extrabold text-blue-800 leading-tight mb-6">
            Chăm Sóc Sức Khỏe Toàn Diện <br /> Cùng <span className="text-blue-600">Tâm An Clinic</span>
          </h1>
          
          <p className="text-lg text-gray-700 mb-8">
            Đặt lịch khám nhanh chóng, tư vấn miễn phí với đội ngũ bác sĩ chuyên khoa hàng đầu.
          </p>

          {/* Nút Kêu Gọi Hành Động Chính */}
          <button 
            onClick={() => window.location.href='/dat-lich-kham'} // Thay bằng router navigate nếu cần
            className="bg-red-500 text-white text-xl font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-red-600 transition duration-300 transform hover:scale-105"
          >
            ĐẶT LỊCH NGAY HÔM NAY
          </button>
        </div>

        {/* Khối Hình Ảnh */}
        <div className="relative hidden lg:block">
          
          {/* 2. CHÈN THẺ IMG THAY THẾ CHO KHỐI PLACEHOLDER CŨ */}
          <img
    // TẠM THAY heroImage bằng một ảnh placeholder công khai
    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa5TU-OMb1tXkf3tKe9QBb8jRRL40HrYIMIA&s" 
    alt="Bác sĩ hoặc phòng khám hiện đại"
    className="w-full h-80 object-cover rounded-2xl shadow-2xl" 
/>
          
        </div>

      </div>
    </section>
  );
}