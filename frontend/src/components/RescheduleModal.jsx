// File: src/components/RescheduleModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Dùng axios thường để LẤY data
import api from '../api/axiosConfig.js'; // Dùng axios CÓ TOKEN để GỬI data
import { X, Save, Clock } from 'lucide-react';

export default function RescheduleModal({ appointment, onClose, onComplete }) {
  // Data
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Form state (Tải dữ liệu cũ vào)
  const [formData, setFormData] = useState({
    doctor_id: appointment.doctor_id,
    date: appointment.schedule_time.split('T')[0], // Lấy YYYY-MM-DD
    slot: '', // Slot mới (bắt buộc chọn)
    note: appointment.note || ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 1. Tải danh sách bác sĩ khi modal mở
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/doctors');
        setDoctors(response.data);
      } catch (err) { console.error("Lỗi tải bác sĩ:", err); }
    };
    fetchDoctors();
  }, []);

  // 2. Tải lịch trống khi Bác sĩ HOẶC Ngày thay đổi
  useEffect(() => {
    if (formData.doctor_id && formData.date) {
      setSchedules([]); // Reset
      const fetchSchedules = async () => {
        try {
          const res = await axios.get(`http://localhost:3001/api/schedules/${formData.doctor_id}?date=${formData.date}`);
          // Chỉ hiển thị slot 'AVAILABLE'
          setSchedules(res.data.filter(s => s.status === 'AVAILABLE'));
        } catch (err) { console.error("Lỗi tải lịch:", err); }
      };
      fetchSchedules();
    }
  }, [formData.doctor_id, formData.date]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value, slot: '' }); // Reset slot
  };
  const pickSlot = (s) => setFormData({ ...formData, slot: s });

  // 3. Hàm Submit (Gửi Lịch đã sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.slot) {
      setModalMessage('Vui lòng chọn một khung giờ mới.');
      setModalIsError(true);
      return;
    }

    setLoading(true);
    setModalMessage('');
    setModalIsError(false);

    const payload = {
      doctor_id: formData.doctor_id,
      schedule_time: `${formData.date} ${formData.slot}`, // Giờ mới
      note: formData.note,
    };

    try {
      // Gọi API 'PUT' (Reschedule)
      const response = await api.put(`/staff/appointments/reschedule/${appointment.appointment_id}`, payload);

      setLoading(false);
      setModalMessage(response.data.message); // "Đã đổi lịch hẹn thành công!"
      setModalIsError(false);

      setTimeout(() => {
        onComplete(); // Báo cho trang cha biết là đã xong
      }, 1000);

    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data) {
        setModalMessage(error.response.data.message);
      } else {
        setModalMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setModalIsError(true);
    }
  };

  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-lg shadow-xl border">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-blue-800">Đổi Lịch hẹn (ID: {appointment.appointment_id})</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        {/* Body Modal (Form Sửa) */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {message && (
            <div className={`p-3 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <p className="text-sm">Bệnh nhân: <span className="font-semibold">{appointment.patient_name}</span></p>

          {/* Chọn Bác sĩ (Mới) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">1. Chọn Bác sĩ (Mới)</label>
            <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
              {doctors.map(doc => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  {doc.name} ({doc.specialty_name})
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Ngày (Mới) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">2. Chọn Ngày (Mới)</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required
                   min={new Date().toISOString().slice(0, 10)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>

          {/* Chọn Khung Giờ (Mới) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">3. Chọn Khung giờ TRỐNG (Mới)</label>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {schedules.length > 0 ? schedules.map((s) => (
                <button type="button" key={s.schedule_id}
                        onClick={() => pickSlot(s.slot_start)}
                        className={`flex items-center justify-center gap-1 rounded-lg border py-2 ${formData.slot === s.slot_start ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}>
                  <Clock size={16}/> {s.slot_start.substring(0, 5)}
                </button>
              )) : (
                <p className="text-xs text-gray-500 col-span-4">Không có lịch trống. Vui lòng chọn bác sĩ/ngày khác.</p>
              )}
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Ghi chú (Cập nhật)</label>
            <textarea name="note" value={formData.note} onChange={handleChange} rows="2"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="flex justify-end items-center p-4 border-t bg-gray-50">
          <button type="button" onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || !formData.slot} // Phải chọn slot mới
            className="ml-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Đang lưu...' : 'Lưu thay đổi Lịch'}
          </button>
        </div>
      </form>
    </div>
  );
}