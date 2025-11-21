import React from 'react';

const services = [
  {
    icon: '🦷',
    title: 'Nha Khoa Thẩm Mỹ',
    description: 'Bảo vệ và làm đẹp nụ cười của bạn với các dịch vụ Implant, niềng răng, và bọc sứ.',
  },
  {
    icon: '🔬',
    title: 'Khám Tổng Quát',
    description: 'Các gói khám sức khỏe định kỳ tiêu chuẩn và nâng cao, giúp phát hiện bệnh lý sớm.',
  },
  {
    icon: '❤️',
    title: 'Nội Khoa Chuyên Sâu',
    description: 'Chẩn đoán và điều trị các bệnh về tim mạch, tiêu hóa và hô hấp, đảm bảo sức khỏe nội tạng.',
  },
  {
    icon: '👶',
    title: 'Chăm Sóc Phụ Nữ và Trẻ Em',
    description: 'Tư vấn và khám sức khỏe định kỳ, tiêm chủng cho mẹ và bé.',
  },
];

export default function ServiceSection() {
  return (
    <section className="py-16 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-blue-700 mb-3">
          Dịch Vụ Chuyên Khoa Cốt Lõi
        </h2>
        <p className="text-lg text-gray-600">
          Tâm An tập trung vào chất lượng dịch vụ và trải nghiệm chăm sóc khách hàng.
        </p>
      </div>

      {/* Khối chứa các Thẻ Dịch Vụ */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="bg-gray-50 p-6 rounded-xl shadow-md border-t-4 border-blue-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
          >
            <div className="text-4xl mb-4 text-blue-600">{service.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{service.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{service.description}</p>
            {/* <a 
              href="/dich-vu-chi-tiet" 
              className="text-blue-600 font-medium hover:text-blue-800 text-sm"
            >
              Tìm hiểu thêm →
            </a> */}
          </div>
        ))}
      </div>
    </section>
  );
}