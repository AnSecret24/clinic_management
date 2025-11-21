// File: src/pages/StaffManageAppointments.jsx
// (Đã cập nhật: Thêm Modal Sửa Lịch)

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig.js';
import { XCircle, RefreshCw, Edit } from 'lucide-react'; // 1. Thêm Edit

// 2. Import Modal mới
import RescheduleModal from '../../components/RescheduleModal.jsx';

export default function StaffManageAppointments() {
  // State
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 3. State MỚI để quản lý Modal Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  // (Hàm fetchAppointments giữ nguyên)
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const response = await api.get('/staff/appointments/all');
      setAppointments(response.data);
    } catch (err) {
      setError('Không thể tải danh sách lịch hẹn.');
    } finally {
      setLoading(false);
    }
  };

  // (Hàm handleCancel giữ nguyên)
  const handleCancel = async (id) => {
    if (!window.confirm(`Bạn có chắc chắn muốn HỦY lịch hẹn (ID: ${id})?`)) return;
    try {
      setMessage('');
      setError('');
      const response = await api.put(`/staff/appointments/cancel/${id}`);
      setMessage(response.data.message);
      fetchAppointments();
    } catch (error) { /* ... */ }
  };

  // 4. Hàm MỚI: Mở Modal Sửa
  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // 5. Hàm MỚI: Đóng Modal Sửa
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  // 6. Hàm MỚI: Khi Sửa xong
  const handleRescheduleComplete = () => {
    handleModalClose();
    fetchAppointments(); // Tải lại danh sách
  };

  // (Hàm getStatusColor giữ nguyên)
  const getStatusColor = (status) => { /* ... */ };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* (Code Tiêu đề, Nút Tải lại, Thông báo - giữ nguyên) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Quản lý Lịch hẹn (Toàn hệ thống)</h1>
        {/* ... */}
      </div>
      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500 ...">{error}</p>}
      {message && <p className="text-green-600 ...">{message}</p>}

      {/* Bảng Danh sách Lịch hẹn (CẬP NHẬT) */}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* (<thead> giữ nguyên) */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 ...">Bệnh nhân</th>
                  <th className="px-6 py-3 ...">Bác sĩ</th>
                  <th className="px-6 py-3 ...">Dịch vụ</th>
                  <th className="px-6 py-3 ...">Thời gian</th>
                  <th className="px-6 py-3 ...">Trạng thái</th>
                  <th className="px-6 py-3 ...">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((app) => (
                  <tr key={app.appointment_id}>
                    {/* (Các <td> cũ giữ nguyên) */}
                    <td className="px-6 py-4 ...">{app.patient_name}</td>
                    <td className="px-6 py-4 ...">{app.doctor_name}</td>
                    <td className="px-6 py-4 ...">{app.service_name}</td>
                    <td className="px-6 py-4 ...">{new Date(app.schedule_time).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 ..."><span className={`... ${getStatusColor(app.status)}`}>{app.status}</span></td>

                    {/* 7. CẬP NHẬT <td> Hành động */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      {/* Chỉ cho phép Sửa/Hủy khi lịch hẹn đang 'REQUESTED' */}
                      {app.status === 'REQUESTED' && (
                        <>
                          <button 
                            onClick={() => handleEditClick(app)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                            title="Sửa/Đổi lịch hẹn này"
                          >
                            <Edit size={18} />
                            Sửa
                          </button>

                          <button 
                            onClick={() => handleCancel(app.appointment_id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-900"
                            title="Hủy lịch hẹn này"
                          >
                            <XCircle size={18} />
                            Hủy
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. RENDER MODAL (Nó bị ẩn) */}
      {isModalOpen && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={handleModalClose}
          onComplete={handleRescheduleComplete}
        />
      )}
    </div>
  );
}