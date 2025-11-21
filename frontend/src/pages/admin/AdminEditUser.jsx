// File: src/pages/AdminEditUser.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig.js';
import { Save, User } from 'lucide-react';

export default function AdminEditUser() {
  const { id: userId } = useParams(); // Lấy ID user từ URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null); // Bắt đầu là null

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Tải dữ liệu của User này khi trang mở
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get(`/admin/users/${userId}`);
        setFormData(res.data); // Tải dữ liệu cũ vào form
      } catch (err) {
        setMessage('Không thể tải dữ liệu người dùng.');
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]); // Chạy lại nếu ID thay đổi

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 2. Hàm xử lý Cập nhật (Phân quyền/Khóa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    try {
      // Chỉ gửi 2 trường 'role' và 'status'
      const payload = {
        role: formData.role,
        status: formData.status
      };

      // Gọi API 'PUT' (Sửa)
      const response = await api.put(`/admin/users/${userId}`, payload);

      setMessage(response.data.message);
      setIsError(false);

      // Sau 1 giây, quay lại trang Quản lý User
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);

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

  if (loading && !formData) {
    return <div className="p-8">Đang tải thông tin người dùng...</div>;
  }

  if (!formData) {
    return <div className="p-8 text-red-500">{message || 'Không tìm thấy người dùng.'}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        Phân quyền và Cập nhật User
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border space-y-4">

        {message && (
          <div className={`p-3 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
          <User size={32} className="text-gray-500" />
          <div>
            <p className="text-lg font-bold text-gray-900">{formData.first_name} {formData.last_name}</p>
            <p className="text-sm text-gray-600">Username: {formData.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vai trò (Role) (*)</label>
            <select name="role" value={formData.role} onChange={handleChange} required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
              {/* (Đảm bảo các giá trị này khớp ENUM trong CSDL) */}
              <option value="PATIENT">PATIENT (Bệnh nhân)</option>
              <option value="STAFF">STAFF (Nhân viên)</option>
              <option value="DOCTOR">DOCTOR (Bác sĩ)</option>
              <option value="ADMIN">ADMIN (Quản trị)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái (*)</label>
            <select name="status" value={formData.status} onChange={handleChange} required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
              {/* (Đảm bảo các giá trị này khớp ENUM trong CSDL) */}
              <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
              <option value="INACTIVE">INACTIVE (Đã vô hiệu hóa)</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}