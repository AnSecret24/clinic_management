// File: src/pages/admin/AdminManageDoctors.jsx
// (Đã thiết kế lại: Form Bác sĩ nằm trong Modal)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../api/axiosConfig.js'; // Chú ý đường dẫn ../../
import { Plus, Trash2, Edit, Save, X, Stethoscope } from 'lucide-react';

export default function AdminManageDoctors() {
  // State Dữ liệu
  const [doctorsList, setDoctorsList] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = Thêm, ID = Sửa

  const defaultFormState = {
    username: '', password: '', first_name: '', last_name: '',
    email: '', phone: '',
    specialty_id: '', degree: '', experience: '1 năm kinh nghiệm', address: ''
  };
  const [formData, setFormData] = useState(defaultFormState);

  // State Thông báo Modal
  const [modalMessage, setModalMessage] = useState('');
  const [modalIsError, setModalIsError] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // 1. Tải dữ liệu (Bác sĩ & Chuyên khoa) khi trang mở
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Gọi song song 2 API public
      const [docRes, specRes] = await Promise.all([
        axios.get('http://localhost:3001/api/doctors'),
        axios.get('http://localhost:3001/api/specialties')
      ]);
      setDoctorsList(docRes.data);
      setSpecialties(specRes.data);
    } catch (err) {
      setError('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm tải lại danh sách bác sĩ (sau khi thêm/sửa/xóa)
  const refreshDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/doctors');
      setDoctorsList(response.data);
    } catch (err) { console.error(err); }
  };

  // 2. Mở Modal Thêm
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(defaultFormState);
    setModalMessage('');
    setIsModalOpen(true);
  };

  // 3. Mở Modal Sửa
  const handleOpenEditModal = async (doctor) => {
    setEditingId(doctor.doctor_id);
    setModalMessage('');
    setIsModalOpen(true);
    
    // Lấy chi tiết Bác sĩ (bao gồm cả username, email...) từ API Admin
    try {
      setModalLoading(true);
      const res = await api.get(`/admin/doctors/${doctor.doctor_id}`);
      const data = res.data;
      
      setFormData({
        username: data.username,
        password: '', // Không hiển thị mật khẩu cũ
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || '',
        phone: data.phone || '',
        specialty_id: data.specialty_id,
        degree: data.degree,
        experience: data.experience,
        address: data.address
      });
    } catch (err) {
      setModalMessage('Lỗi khi tải thông tin chi tiết.');
      setModalIsError(true);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage('');
    setModalIsError(false);

    try {
      let response;
      if (editingId) {
        // Sửa
        const { username, password, ...updateData } = formData;
        response = await api.put(`/admin/doctors/${editingId}`, updateData);
      } else {
        // Thêm
        response = await api.post('/admin/doctors', formData);
      }

      setModalMessage(response.data.message);
      setModalIsError(false);
      
      refreshDoctors(); // Tải lại danh sách

      setTimeout(() => {
        handleCloseModal();
      }, 1000);

    } catch (error) {
      if (error.response && error.response.data) {
        setModalMessage(error.response.data.message);
      } else {
        setModalMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setModalIsError(true);
    } finally {
      setModalLoading(false);
    }
  };

  // 5. Xóa Bác sĩ
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa Bác sĩ "${name}"?`)) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      refreshDoctors();
    } catch (error) {
      alert('Lỗi khi xóa. Bác sĩ có thể đang có lịch hẹn.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Quản lý Bác sĩ</h1>
        
        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all"
        >
          <Plus size={20} />
          Thêm Bác sĩ mới
        </button>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Bảng Danh sách Bác sĩ */}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chuyên khoa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bằng cấp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kinh nghiệm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctorsList.map((doc) => (
                <tr key={doc.doctor_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Stethoscope size={20} />
                      </div>
                      <div>
                         <span className="block text-sm font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{doc.specialty_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{doc.degree}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{doc.experience}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleOpenEditModal(doc)} className="text-blue-600 hover:text-blue-900">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(doc.doctor_id, doc.name)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === MODAL (Form Thêm/Sửa) === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-blue-800">
                {editingId ? `Sửa Hồ sơ Bác sĩ` : 'Thêm Bác sĩ Mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {modalMessage && (
                <div className={`p-3 rounded-md ${modalIsError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {modalMessage}
                </div>
              )}

              {/* Thông tin Tài khoản */}
              <div>
                <h4 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-3 border-b pb-1">Thông tin Tài khoản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên đăng nhập (*)</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required
                           disabled={!!editingId}
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {editingId ? 'Mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu (*)'}
                    </label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                           required={!editingId}
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                </div>
              </div>

              {/* Thông tin Cá nhân */}
              <div>
                <h4 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-3 border-b pb-1">Thông tin Cá nhân</h4>
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
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                  </div>
                </div>
              </div>

              {/* Thông tin Chuyên môn */}
              <div>
                <h4 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-3 border-b pb-1">Hồ sơ Chuyên môn</h4>
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
                    <label className="block text-sm font-medium text-gray-700">Bằng cấp / Học hàm (*)</label>
                    <input type="text" name="degree" value={formData.degree} onChange={handleChange} required
                           placeholder="Vd: Thạc sĩ, Bác sĩ CKI"
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
              </div>

              {/* Footer Modal */}
              <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                <button type="button" onClick={handleCloseModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingId ? <Save size={18} /> : <Plus size={18} />}
                  {modalLoading ? 'Đang lưu...' : (editingId ? 'Lưu Cập nhật' : 'Thêm Bác sĩ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}