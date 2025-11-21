// File: src/components/SpecialtyCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Heart, Smile, Baby, Eye, Ear, ArrowRight } from 'lucide-react';

export default function SpecialtyCard({ specialty }) {
  
  // Hàm chọn icon dựa trên tên chuyên khoa
  const getIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('tim')) return <Heart size={24} />;
    if (lowerName.includes('răng')) return <Smile size={24} />; // Tạm dùng Smile thay răng
    if (lowerName.includes('nhi')) return <Baby size={24} />;
    if (lowerName.includes('mắt') || lowerName.includes('nhãn')) return <Eye size={24} />;
    if (lowerName.includes('tai') || lowerName.includes('họng')) return <Ear size={24} />;
    // Mặc định
    return <Stethoscope size={24} />;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
          {/* Gọi hàm lấy icon */}
          {getIcon(specialty.name)}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          {specialty.name}
        </h3>
      </div>
      
      <p className="text-gray-600 mt-3 text-sm h-16 line-clamp-3">
        {specialty.description || `Các dịch vụ y tế chuyên sâu liên quan đến ${specialty.name}.`}
      </p>
      
      <Link 
        to={`/dat-lich-kham?specialtyId=${specialty.specialty_id}`} 
        className="inline-flex items-center gap-2 text-blue-600 font-medium mt-4 hover:gap-3 transition-all"
      >
        Tìm Bác sĩ
        <ArrowRight size={16} />
      </Link>
      
    </div>
  );
}