// File: src/pages/public/DichVu.jsx
// (Đã cập nhật: Giao diện Bộ lọc theo Chuyên khoa)

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ServiceCard from '../../components/ServiceCard.jsx';
import { Filter, Stethoscope, Activity } from 'lucide-react';

export default function DichVu() {
  const [specialties, setSpecialties] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State để lưu ID chuyên khoa đang được chọn ('ALL' là chọn tất cả)
  const [activeTab, setActiveTab] = useState('ALL');

  // 1. Tải dữ liệu
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        setError('');
        const [specRes, servRes] = await Promise.all([
          axios.get('http://localhost:3001/api/specialties'),
          axios.get('http://localhost:3001/api/services')
        ]);
        setSpecialties(specRes.data);
        setServices(servRes.data);
      } catch (err) {
        setError('Không thể tải danh sách dịch vụ.');
      } finally {
        setLoading(false);
      }
    };
    fetchServiceData();
  }, []);

  // 2. Logic Lọc Dịch vụ (Dùng useMemo để tối ưu hiệu năng)
  const filteredServices = useMemo(() => {
    if (activeTab === 'ALL') {
      return services; // Trả về tất cả nếu đang chọn tab "Tất cả"
    }
    // Lọc các dịch vụ có specialty_id trùng với tab đang chọn
    return services.filter(service => service.specialty_id === activeTab);
  }, [activeTab, services]);

  // Lấy tên chuyên khoa hiện tại để hiển thị tiêu đề
  const currentCategoryName = activeTab === 'ALL' 
    ? 'Tất cả dịch vụ' 
    : specialties.find(s => s.specialty_id === activeTab)?.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header nhỏ */}
      <div className="border-b bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="text-xs text-gray-500">Trang chủ / <span className="text-blue-700">Dịch Vụ</span></nav>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mt-2">Bảng giá Dịch vụ</h1>
          <p className="text-gray-600">Chi phí minh bạch, niêm yết công khai.</p>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 py-8">
        {loading && <p className="text-center py-10">Đang tải dữ liệu...</p>}
        {error && <p className="text-center py-10 text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* === 3. THANH BỘ LỌC (FILTER BAR) === */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Filter size={20} />
                <span>Lọc theo chuyên khoa:</span>
              </div>
              
              {/* Danh sách các nút */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                {/* Nút "Tất cả" */}
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                    ${activeTab === 'ALL' 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-blue-300'}
                  `}
                >
                  Tất cả
                </button>

                {/* Các nút Chuyên khoa từ API */}
                {specialties.map(spec => (
                  <button
                    key={spec.specialty_id}
                    onClick={() => setActiveTab(spec.specialty_id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                      ${activeTab === spec.specialty_id 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-blue-300'}
                    `}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            </div>

            {/* === 4. DANH SÁCH DỊCH VỤ (ĐÃ LỌC) === */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-500 pl-3">
                {currentCategoryName}
                <span className="text-sm font-normal text-gray-500 ml-2">({filteredServices.length} dịch vụ)</span>
              </h2>
            </div>

            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {filteredServices.map(service => (
                  <ServiceCard key={service.service_id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                  <Activity size={32} />
                </div>
                <p className="text-gray-500">Chưa có dịch vụ nào cho chuyên khoa này.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}