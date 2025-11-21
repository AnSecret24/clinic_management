// File: src/pages/AdminEditDoctor.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Dùng axios thường để lấy data public
import api from '../../api/axiosConfig.js'; // Dùng axios CÓ TOKEN
import { Save } from 'lucide-react';

export default function AdminEditDoctor() {
  const { id: doctorId } = useParams(); // Lấy ID bác sĩ từ URL
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState(null); // Bắt đầu là null

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true); // Bắt đầu là true

  // 1. Tải cả Chuyên khoa và Thông tin Bác sĩ
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/specialties');
        setSpecialties(res.data);
      } catch (err) {
        console.error("Lỗi tải chuyên khoa:", err);
      }
    };

    const fetchDoctorData = async () => {
      try {
        // Dùng 'api' có token để gọi
        const res = await api.get(`/admin/doctors/${doctorId}`);
        setFormData(res.data); // Tải dữ liệu cũ vào form
      } catch (err) {
        setMessage('Không thể tải dữ liệu bác sĩ.');
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
    fetchDoctorData();
  }, [doctorId]); // Chạy lại nếu ID thay đổi

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
      const response = await api.put(`/admin/doctors/${doctorId}`, formData);

      setMessage(response.data.message);
      setIsError(false);

      // Sau 1 giây, quay lại trang Quản lý
      setTimeout(() => {
        navigate('/admin/doctors');
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
    return <div className="p-8">Đang tải thông tin bác sĩ...</div>;
  }

  if (!formData) {
    return <div className="p-8 text-red-500">{message || 'Không tìm thấy bác sĩ.'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        Chỉnh sửa Bác sĩ: {formData.first_name} {formData.last_name}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border space-y-4">

        {message && (
          <div className={`p-3 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <h3 className="text-lg font-medium text-blue-700">Thông tin Tài khoản (Không thể sửa)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input type="text" value={formData.username} disabled
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"/>
          </div>
        </div>

        <h3 className="text-lg font-medium text-blue-700">Thông tin Cá nhân</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ (*)</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
        </div>

        <h3 className="text-lg font-medium text-blue-700">Thông tin Chuyên môn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Chuyên khoa (*)</label>
            <select name="specialty_id" value={formData.specialty_id} onChange={handleChange} required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
              <option value="" disabled>-- Chọn chuyên khoa --</option>
              {specialties.map(s => (
                <option key={s.specialty_id} value={s.specialty_id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bằng cấp (*)</label>
            <input type="text" name="degree" value={formData.degree} onChange={handleChange} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kinh nghiệm</label>
            <input type="text" name="experience" value={formData.experience} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Địa chỉ làm việc</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange}
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