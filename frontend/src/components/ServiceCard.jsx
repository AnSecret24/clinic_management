// File: src/components/ServiceCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ArrowRight } from 'lucide-react'; // Icon cho Dịch vụ (liên quan đến tiền)

// Component này nhận prop là 'service' (chứa 1 dịch vụ)
export default function ServiceCard({ service }) {

  // Định dạng giá tiền (ví dụ: 450000 -> 450,000đ)
  const formattedPrice = Number(service.price).toLocaleString('vi-VN');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">

      {/* Header của Card */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 text-green-600 rounded-full">
          <DollarSign size={24} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          {service.name}
        </h3>
      </div>

      {/* Giá tiền */}
      <div className="mt-4">
        <span className="text-3xl font-bold text-blue-700">
          {formattedPrice}đ
        </span>
        <span className="text-gray-500 text-sm ml-1">
          {service.unit || '/lần'}
        </span>
      </div>

      {/* Mô tả (nếu có) */}
      <p className="text-gray-600 mt-2 text-sm flex-grow">
        {service.description || `Dịch vụ ${service.name} được thực hiện bởi các chuyên gia.`}
      </p>

      {/* Link (Nút) để đặt lịch */}
      <Link 
        // Link đến trang Đặt lịch, và "gửi" ID Dịch vụ lên URL
        to={`/dat-lich-kham?serviceId=${service.service_id}`} 
        className="inline-flex items-center justify-center gap-2 text-white font-medium mt-5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        Đặt lịch ngay
        <ArrowRight size={16} />
      </Link>

    </div>
  );
}