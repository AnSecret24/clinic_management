// File: src/pages/StaffManagePatients.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig.js'; // Dùng axios CÓ TOKEN
import { Edit, User, X, Save } from 'lucide-react';

export default function StaffManagePatients() {
  // State
  const [patients, setPatients] = useState([]); // Danh sách bệnh nhân
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State cho Modal Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // BN đang sửa
  const [formData, setFormData] = useState({});
  const [modalMessage, setModalMessage] = useState('');
  const [modalIsError, setModalIsError] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // 1. Tải danh sách bệnh nhân khi trang mở
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/staff/patients'); // API mới
      setPatients(response.data);
    } catch (err) {
      setError('Không thể tải danh sách bệnh nhân.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm mở Modal Sửa
  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    // Điền thông tin cũ vào form
    setFormData({
      name: patient.name,
      phone: patient.phone || '',
      email: patient.email || '',
      gender: patient.gender || 'OTHER',
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '', // Format YYYY-MM-DD
      address: patient.address || ''
    });
    setIsModalOpen(true);
    setModalMessage('');
    setModalIsError(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
    setFormData({});
  };

  const handleModalChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Hàm Submit (Lưu) thông tin Sửa
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage('');
    setModalIsError(false);

    try {
      // Gọi API 'PUT' (Sửa)
      const response = await api.put(`/staff/patients/${selectedPatient.patient_id}`, formData);

      setModalLoading(false);
      setModalMessage(response.data.message); // "Cập nhật thành công!"
      setModalIsError(false);

      fetchPatients(); // Tải lại danh sách

      setTimeout(() => {
        handleModalClose();
      }, 1000); // Tự động đóng modal sau 1 giây

    } catch (error) {
      setModalLoading(false);
      if (error.response && error.response.data) {
        setModalMessage(error.response.data.message);
      } else {
        setModalMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setModalIsError(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Quản lý Bệnh nhân</h1>

      {loading && <p>Đang tải danh sách bệnh nhân...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Bảng Danh sách Bệnh nhân */}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày sinh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((p) => (
                  <tr key={p.patient_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('vi-VN') : '(Chưa có)'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-xs">{p.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEditClick(p)}
                              className="text-blue-600 hover:text-blue-900">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === MODAL SỬA BỆNH NHÂN === */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <form onSubmit={handleModalSubmit} className="bg-white w-full max-w-2xl rounded-lg shadow-xl border">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-blue-800">Chỉnh sửa Bệnh nhân</h2>
              <button type="button" onClick={handleModalClose} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>

            {/* Body Modal (Form Sửa) */}
            <div className="p-6 space-y-4">
              {modalMessage && (
                <div className={`p-3 rounded-md ${modalIsError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {modalMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ và Tên (*)</label>
                  <input type="text" name="name" value={formData.name} onChange={handleModalChange} required
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại (*)</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleModalChange} required
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleModalChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleModalChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                  <select name="gender" value={formData.gender} onChange={handleModalChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
                    <option value="OTHER">Khác</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                  <input type="text" name="address" value={formData.address} onChange={handleModalChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end items-center p-4 border-t bg-gray-50">
              <button type="button" onClick={handleModalClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Hủy
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="ml-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Save size={18} />
                {modalLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}