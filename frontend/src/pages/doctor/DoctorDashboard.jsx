// File: src/pages/DoctorDashboard.jsx
// (Đã cập nhật: Thêm Modal Khám bệnh)

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../api/axiosConfig.js'; 
import { Calendar, Clock, User, CheckSquare } from 'lucide-react'; // Thêm icon CheckSquare

// 1. Import Modal
import ExaminationModal from '../../components/ExaminationModal.jsx';

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext); 
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. State MỚI để quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Lịch hẹn đang khám

  // 3. Tải lịch hẹn
  useEffect(() => {
    fetchAppointments(); // Tách ra thành hàm riêng
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      // Dùng API 'doctor' (API này đã được đổi tên)
      const response = await api.get('/doctor/appointments/me'); 

      setAppointments(response.data);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Không thể tải lịch hẹn.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Hàm MỚI: Mở Modal
  const handleOpenModal = (appointment) => {
    setSelectedAppointment(appointment); // Lưu lịch hẹn được chọn
    setIsModalOpen(true);
  };

  // 5. Hàm MỚI: Đóng Modal
  const handleCloseModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(false);
  };

  // 6. Hàm MỚI: Xử lý khi khám xong
  const handleExamComplete = () => {
    handleCloseModal(); // Đóng modal
    fetchAppointments(); // Tải lại danh sách (lịch hẹn vừa xong sẽ biến mất)
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">
        Chào mừng Bác sĩ {user.lastName}
      </h1>
      <p className="text-gray-600 mb-6">Đây là các lịch hẹn sắp tới (chưa khám) của bạn.</p>

      {loading && <p>Đang tải lịch hẹn...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p>Bạn không có lịch hẹn nào sắp tới.</p>
          ) : (
            appointments.map(app => (
              // 7. CẬP NHẬT GIAO DIỆN LỊCH HẸN
              <div key={app.appointment_id} className="bg-white p-4 rounded-lg shadow-md border">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-lg font-semibold text-blue-700">
                    {app.service_name}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>Bệnh nhân: <strong>{app.patient_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Ngày: <strong>{new Date(app.schedule_time).toLocaleDateString('vi-VN')}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Giờ: <strong>{new Date(app.schedule_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  </div>
                </div>
                {app.note && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Ghi chú (Triệu chứng):</strong> {app.note}
                  </p>
                )}

                {/* 8. THÊM NÚT KHÁM BỆNH */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleOpenModal(app)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    <CheckSquare size={16} />
                    Khám bệnh và Kê đơn
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 9. RENDER MODAL (Nó bị ẩn) */}
      {isModalOpen && (
        <ExaminationModal
          appointment={selectedAppointment}
          onClose={handleCloseModal}
          onComplete={handleExamComplete}
        />
      )}
    </div>
  );
}