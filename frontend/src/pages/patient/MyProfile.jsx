// File: src/pages/MyProfile.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../api/axiosConfig.js';
import { Save, User } from 'lucide-react';

export default function MyProfile() {
  const { user } = useContext(AuthContext); // Lấy user (để biết Tên)

  const [formData, setFormData] = useState(null); // Bắt đầu là null

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Tải dữ liệu hồ sơ khi trang mở
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/patient/my-profile`);
        // Format lại ngày sinh cho input type="date"
        if (res.data.date_of_birth) {
          res.data.date_of_birth = res.data.date_of_birth.split('T')[0];
        }
        setFormData(res.data);
      } catch (err) {
        setMessage('Không thể tải hồ sơ của bạn.');
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []); // Chạy 1 lần

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 2. Hàm xử lý Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    try {
      // Gọi API 'PUT' (Sửa)
      const response = await api.put(`/patient/my-profile`, formData);

      setMessage(response.data.message); // "Cập nhật thành công!"
      setIsError(false);

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
    return <div className="p-8">Đang tải hồ sơ của bạn...</div>;
  }

  if (!formData) {
    return <div className="p-8 text-red-500">{message || 'Không tìm thấy hồ sơ.'}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        Hồ sơ cá nhân
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border space-y-4">

        {message && (
          <div className={`p-3 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập (Username)</label>
            <input type="text" value={formData.username} disabled
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và Tên</label>
            <input type="text" value={formData.name} disabled
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại (*)</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Giới tính</label>
            <select name="gender" value={formData.gender || 'OTHER'} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
              <option value="OTHER">Khác</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
            <input type="text" name="address" value={formData.address || ''} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
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