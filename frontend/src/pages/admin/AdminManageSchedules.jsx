// File: src/pages/AdminManageSchedules.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Dùng axios thường để LẤY data
import api from '../../api/axiosConfig.js'; // Dùng axios CÓ TOKEN để GỬI/XÓA data
import { PlusCircle, Trash2, Clock } from 'lucide-react';

// Định nghĩa các khung giờ chuẩn
const MORNING_SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00"];
const AFTERNOON_SLOTS = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

export default function AdminManageSchedules() {
  // Data
  const [doctors, setDoctors] = useState([]);
  const [existingSchedules, setExistingSchedules] = useState([]); // Lịch đã có

  // Form state
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedShift, setSelectedShift] = useState('MORNING');
  const [selectedSlots, setSelectedSlots] = useState([]); // Các slot được tích (checkbox)

  // Thông báo
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Tải danh sách bác sĩ khi trang mở
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/doctors');
        setDoctors(response.data);
      } catch (err) {
        console.error("Lỗi tải bác sĩ:", err);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Tải lịch HIỆN CÓ khi Bác sĩ HOẶC Ngày thay đổi
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchExistingSchedules();
    }
  }, [selectedDoctor, selectedDate]);

  // Hàm tải lịch hiện có
  const fetchExistingSchedules = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/schedules/${selectedDoctor}?date=${selectedDate}`);
      setExistingSchedules(response.data); // (Lưu ý: API này chỉ trả về slot 'AVAILABLE')
    } catch (err) {
      console.error("Lỗi tải lịch hiện có:", err);
    }
  };

  // 3. Hàm xử lý khi nhấn "Thêm Lịch"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    const payload = {
      doctor_id: selectedDoctor,
      work_date: selectedDate,
      shift: selectedShift,
      slots: selectedSlots, // Mảng các giờ được chọn (VD: ["08:00", "08:30"])
    };

    try {
      // Dùng 'api' (bản có Token) để gọi
      const response = await api.post('/admin/schedules', payload);

      setMessage(response.data.message);
      setIsError(false);
      setSelectedSlots([]); // Reset checkbox
      fetchExistingSchedules(); // Tải lại danh sách lịch

    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // 4. Hàm xử lý Xóa 1 slot
  const handleDeleteSlot = async (schedule_id) => {
    setMessage('');
    setIsError(false);

    if (!window.confirm("Bạn có chắc muốn xóa khung giờ này?")) return;

    try {
      const response = await api.delete(`/admin/schedules/${schedule_id}`);
      setMessage(response.data.message);
      setIsError(false);
      fetchExistingSchedules(); // Tải lại danh sách
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Lỗi khi xóa. Khung giờ có thể đã có người đặt.');
      }
      setIsError(true);
    }
  };

  // Hàm xử lý chọn/bỏ chọn 1 slot
  const handleSlotChange = (slot) => {
    setSelectedSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot) // Bỏ chọn
        : [...prev, slot] // Thêm vào
    );
  };

  const slotsToShow = selectedShift === 'MORNING' ? MORNING_SLOTS : AFTERNOON_SLOTS;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Quản lý Lịch làm việc</h1>

      {/* Thông báo (nếu có) */}
      {message && (
        <div className={`p-3 rounded-md mb-4 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* CỘT BÊN TRÁI: THÊM LỊCH */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Thêm Khung giờ trống</h2>

          {/* Chọn Bác sĩ */}
          <div>
            <label className="block text-sm font-medium text-gray-700">1. Chọn Bác sĩ</label>
            <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
              <option value="" disabled>-- Chọn một bác sĩ --</option>
              {doctors.map(doc => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  {doc.name} ({doc.specialty_name})
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Ngày */}
          <div>
            <label className="block text-sm font-medium text-gray-700">2. Chọn Ngày</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required
                   min={new Date().toISOString().slice(0, 10)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>

          {/* Chọn Ca */}
          <div>
            <label className="block text-sm font-medium text-gray-700">3. Chọn Ca làm việc</label>
            <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
              <option value="MORNING">Ca Sáng (8:00 - 11:30)</option>
              <option value="AFTERNOON">Ca Chiều (14:00 - 17:00)</option>
            </select>
          </div>

          {/* Chọn Khung giờ */}
          <div>
            <label className="block text-sm font-medium text-gray-700">4. Chọn Khung giờ (Slot)</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {slotsToShow.map(slot => (
                <label key={slot} className={`flex items-center gap-2 p-2 rounded-md border text-sm cursor-pointer
                  ${selectedSlots.includes(slot) ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}>
                  <input 
                    type="checkbox"
                    checked={selectedSlots.includes(slot)}
                    onChange={() => handleSlotChange(slot)}
                    className="rounded text-blue-600"
                  />
                  {slot}
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || selectedSlots.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <PlusCircle size={18} />
              {loading ? 'Đang thêm...' : `Thêm ${selectedSlots.length} slot`}
            </button>
          </div>
        </form>

        {/* CỘT BÊN PHẢI: XEM LỊCH ĐÃ CÓ */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-800">Lịch làm việc trong ngày</h2>
          <p className="text-sm text-gray-600 mb-4">
            {selectedDoctor ? `Bác sĩ: ${doctors.find(d => d.doctor_id == selectedDoctor)?.name}` : 'Chưa chọn bác sĩ'}
            <br/>
            Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN')}
          </p>

          {existingSchedules.length === 0 ? (
    <p className="text-sm text-gray-500">Không có lịch nào cho ngày này.</p>
  ) : (
    <div className="space-y-2">
      {existingSchedules.map(slot => {
        // Kiểm tra xem slot đã bị đặt chưa
        const isBooked = slot.status === 'FULL';

        return (
          <div 
            key={slot.schedule_id} 
            className={`flex justify-between items-center p-2 rounded-md
              ${isBooked ? 'bg-red-50 border-red-200' : 'bg-gray-50'}
            `}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock size={16} className={isBooked ? 'text-red-600' : 'text-green-600'} />
              <span className={isBooked ? 'text-red-700' : 'text-gray-800'}>
                {slot.slot_start.substring(0, 5)}
              </span>
              {isBooked && (
                <span className="text-xs font-semibold text-red-700">(Đã có hẹn)</span>
              )}
            </div>
            <button 
              onClick={() => handleDeleteSlot(slot.schedule_id)}
              className={`
                ${isBooked 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-500 hover:text-red-700'}
              `}
              title={isBooked ? 'Không thể xóa slot đã có hẹn' : 'Xóa khung giờ này'}
              disabled={isBooked} // KHÓA NÚT XÓA
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  )}
        </div>

      </div>
    </div>
  );
}