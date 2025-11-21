// File: src/pages/public/ChuyenKhoa.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Dùng axios thường (public)
import SpecialtyCard from '../../components/SpecialtyCard.jsx'; // Import Card

export default function ChuyenKhoa() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Tải danh sách chuyên khoa khi trang mở
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        setError('');
        // Gọi API (API public đã sửa ở Bước 1)
        const response = await axios.get('http://localhost:3001/api/specialties');
        setSpecialties(response.data);
      } catch (err) {
        setError('Không thể tải danh sách chuyên khoa.');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []); // Chạy 1 lần

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header nhỏ */}
      <div className="border-b bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="text-xs text-gray-500">Trang chủ / <span className="text-blue-700">Chuyên Khoa</span></nav>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mt-2">Các Chuyên khoa</h1>
          <p className="text-gray-600">Tìm hiểu về các dịch vụ và chuyên khoa tại Tâm An Clinic.</p>
        </div>
      </div>

      {/* Nội dung (Danh sách Card) */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        {loading && <p>Đang tải danh sách chuyên khoa...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 2. Lặp qua mảng specialties và render Card */}
            {specialties.map(spec => (
              <SpecialtyCard key={spec.specialty_id} specialty={spec} />
            ))}
          </div>
        )}

        {/* 3. Hiển thị nếu CSDL rỗng */}
        {!loading && specialties.length === 0 && (
           <div className="text-center p-8 bg-white rounded-lg border">
             <p className="text-gray-600">Chưa có chuyên khoa nào được Admin thêm vào hệ thống.</p>
           </div>
        )}

      </section>
    </div>
  );
}