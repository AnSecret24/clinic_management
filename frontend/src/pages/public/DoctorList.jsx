// File: src/pages/public/DoctorList.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DoctorCard from '../../components/DoctorCard.jsx';
import { Search, Filter, X } from 'lucide-react';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [specialties, setSpecialties] = useState([]); // Danh sách chuyên khoa để lọc

  // 1. Tải dữ liệu (Bác sĩ + Chuyên khoa)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docRes, specRes] = await Promise.all([
          axios.get('http://localhost:3001/api/doctors'),
          axios.get('http://localhost:3001/api/specialties')
        ]);
        setDoctors(docRes.data);
        setSpecialties(specRes.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Logic Lọc (Filter)
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      // Lọc theo tên (không phân biệt hoa thường)
      const matchName = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      // Lọc theo chuyên khoa
      const matchSpec = selectedSpecialty === 'ALL' || doc.specialty_name === selectedSpecialty;
      
      return matchName && matchSpec;
    });
  }, [doctors, searchTerm, selectedSpecialty]);

  const handleClearFilter = () => {
    setSearchTerm('');
    setSelectedSpecialty('ALL');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-white border-b pb-8 pt-6 px-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Đội ngũ Bác sĩ tại Tâm An</h1>
          <p className="text-gray-600 max-w-2xl">
            Đội ngũ chuyên gia y tế hàng đầu, giàu kinh nghiệm và tận tâm. 
            Hãy chọn bác sĩ phù hợp và đặt lịch ngay hôm nay.
          </p>
          
          {/* Thanh tìm kiếm & Bộ lọc */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Tìm tên bác sĩ..." 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative min-w-[200px]">
              <select 
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option value="ALL">Tất cả chuyên khoa</option>
                {specialties.map(s => (
                  <option key={s.specialty_id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {(searchTerm || selectedSpecialty !== 'ALL') && (
              <button 
                onClick={handleClearFilter}
                className="px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium flex items-center gap-2 transition"
              >
                <X size={20} /> Xóa lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Danh sách Bác sĩ */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải danh sách...</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">Tìm thấy <strong>{filteredDoctors.length}</strong> bác sĩ phù hợp</p>
            
            {filteredDoctors.length > 0 ? (
              // Lưới hiển thị thẻ (Grid)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map(doctor => (
                  // Render DoctorCard và truyền dữ liệu vào
                  <DoctorCard key={doctor.doctor_id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                <p className="text-gray-500 text-lg">Không tìm thấy bác sĩ nào phù hợp với bộ lọc.</p>
                <button onClick={handleClearFilter} className="mt-2 text-blue-600 hover:underline">Xem tất cả bác sĩ</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}