// File: src/components/DoctorCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Stethoscope, GraduationCap, Star } from 'lucide-react';

export default function DoctorCard({ doctor }) {
  // 1. Logic Ảnh đại diện:
  // Nếu CSDL có link ảnh -> dùng link đó.
  // Nếu không -> Dùng dịch vụ ui-avatars để tạo ảnh theo tên (nhìn rất chuyên nghiệp).
  const avatarUrl = doctor.avatar 
    ? doctor.avatar 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random&size=256`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      
      {/* Phần trên: Thông tin & Ảnh */}
      <div className="p-5 flex gap-4 items-start">
        {/* Ảnh đại diện */}
        <img 
          src={avatarUrl} 
          alt={doctor.name} 
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-100 shadow-sm"
        />
        
        {/* Thông tin */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-blue-900 line-clamp-1" title={doctor.name}>
            {doctor.name}
          </h3>
          <p className="text-sm text-blue-600 font-medium mb-1">
            {doctor.degree}
          </p>
          
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Stethoscope size={16} className="text-blue-500" />
              <span>{doctor.specialty_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <GraduationCap size={16} className="text-blue-500" />
              <span className="line-clamp-1">{doctor.experience}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} className="text-blue-500" />
              <span className="line-clamp-1">{doctor.address || "Tâm An Clinic"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phần dưới: Nút bấm */}
      <div className="mt-auto p-4 bg-gray-50 border-t flex gap-3">
        <Link 
          to={`/dat-lich-kham?doctorId=${doctor.doctor_id}`}
          className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Đặt lịch ngay
        </Link>

      </div>
    </div>
  );
}