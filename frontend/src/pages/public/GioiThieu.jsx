// src/pages/GioiThieu.jsx

import React from 'react';
import clinicImage from "../../assets/taman.jpg";

// Dữ liệu giả định cho Giá trị cốt lõi
const coreValues = [
  { 
    title: 'Tận Tâm', 
    description: 'Đặt sự an toàn và sức khỏe của bệnh nhân lên hàng đầu, phục vụ bằng cả trái tim.',
    icon: '❤️' 
  },
  { 
    title: 'Chuyên Nghiệp', 
    description: 'Đội ngũ bác sĩ giàu kinh nghiệm, áp dụng quy trình khám chữa bệnh chuẩn mực quốc tế.',
    icon: '👨‍⚕️' 
  },
  { 
    title: 'Hiện Đại', 
    description: 'Luôn cập nhật công nghệ và trang thiết bị y tế tiên tiến nhất.',
    icon: '🔬' 
  },
  { 
    title: 'Bảo Mật', 
    description: 'Tuyệt đối bảo mật thông tin hồ sơ bệnh án và dữ liệu cá nhân của khách hàng.',
    icon: '🔒' 
  },
];

export default function GioiThieu() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Giả định Header và Footer được render ở App.jsx hoặc Layout Component */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Phần 1: Tầm Nhìn & Sứ Mệnh */}
        <section className="bg-white p-10 rounded-xl shadow-xl text-center mb-16 border-t-4 border-blue-600">
          <h1 className="text-5xl font-extrabold text-blue-800 mb-4">
            Về Phòng Khám Tâm An
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Tâm An Clinic được xây dựng với Sứ mệnh mang lại dịch vụ chăm sóc sức khỏe "An toàn - Tận tâm - Chất lượng cao", giúp mọi bệnh nhân sống An vui và khỏe mạnh.
          </p>
        </section>

        {/* --- */}
        
        {/* Phần 2: Câu Chuyện & Lịch Sử */}
        <section className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="lg:order-2">
            <h2 className="text-4xl font-bold text-blue-700 mb-4">
              Câu Chuyện Về Tâm An
            </h2>
            <p className="text-gray-600 mb-4">
              Khởi nguồn từ trăn trở về một môi trường y tế thân thiện, nơi bệnh nhân không chỉ được chữa lành thể chất mà còn được chăm sóc tinh thần, Tâm An Clinic được thành lập vào năm 2015. Từ một phòng khám nhỏ chuyên khoa Nội, chúng tôi đã không ngừng phát triển, mở rộng quy mô và hợp tác với các chuyên gia y tế hàng đầu.
            </p>
            <p className="text-gray-600 border-l-4 border-blue-400 pl-3 italic">
              "Chúng tôi tin rằng tâm lý an lành là yếu tố then chốt cho một sức khỏe toàn diện."
            </p>
          </div>
          {/* Khối Hình Ảnh */}
            <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
              <img 
                src={clinicImage} // <-- Sử dụng biến đã import
                alt="Hình ảnh Phòng khám Tâm An" 
                className="w-full h-full object-cover" 
              />
              {/* Nếu muốn overlay màu xanh như hình placeholder */}
              <div className="absolute inset-0 bg-blue-500 opacity-20"></div> 
            </div>
        </section>

        {/* --- */}

        {/* Phần 3: Giá Trị Cốt Lõi */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-700 mb-10">
            Giá Trị Cốt Lõi
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition duration-300">
                <div className="text-4xl mb-3 text-blue-500">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- */}

        {/* Phần 4: Cơ Sở Vật Chất & Kêu Gọi */}
        <section className="bg-blue-600 text-white p-10 rounded-xl shadow-xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Trang Thiết Bị Hiện Đại, Đạt Chuẩn Quốc Tế
          </h2>
          <p className="text-lg mb-6 max-w-4xl mx-auto">
            Chúng tôi đầu tư vào các thiết bị chẩn đoán hình ảnh và xét nghiệm tiên tiến, nhằm đảm bảo kết quả chính xác và nhanh chóng nhất cho mọi quy trình khám chữa bệnh.
          </p>
          
        </section>

      </main>
    </div>
  );
}