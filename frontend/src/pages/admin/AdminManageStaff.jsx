// File: src/pages/admin/AdminManageStaff.jsx
// (Đã thiết kế lại: Form nằm trong Modal)

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig.js'; // Chú ý đường dẫn ../../
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

export default function AdminManageStaff() {
  // State
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Nếu null = Thêm, có ID = Sửa

  const defaultFormState = {
    username: '', password: '', first_name: '', last_name: '',
    email: '', phone: '', address: ''
  };
  const [formData, setFormData] = useState(defaultFormState);
  
  const [modalMessage, setModalMessage] = useState('');
  const [modalIsError, setModalIsError] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // 1. Tải danh sách khi trang mở
  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/staff');
      setStaffList(response.data);
    } catch (err) {
      setError('Không thể tải danh sách nhân viên.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Mở Modal Thêm mới
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(defaultFormState);
    setModalMessage('');
    setIsModalOpen(true);
  };

  // 3. Mở Modal Sửa
  const handleOpenEditModal = (staff) => {
    setEditingId(staff.staff_id);
    setFormData({
      username: staff.username,
      password: '',
      first_name: staff.first_name,
      last_name: staff.last_name,
      email: staff.email || '',
      phone: staff.phone || '',
      address: staff.address || ''
    });
    setModalMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Submit Form (Thêm hoặc Sửa)
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
        response = await api.put(`/admin/staff/${editingId}`, updateData);
      } else {
        // Thêm
        response = await api.post('/admin/staff', formData);
      }

      setModalMessage(response.data.message);
      setModalIsError(false);
      
      fetchStaffList(); // Tải lại danh sách
      
      // Đóng modal sau 1s
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

  // 5. Xóa Nhân viên
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa Nhân viên "${name}"?`)) return;
    try {
      await api.delete(`/admin/staff/${id}`);
      fetchStaffList();
    } catch (error) {
      alert('Lỗi khi xóa. Nhân viên có thể đang có dữ liệu liên quan.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Quản lý Nhân viên</h1>
        
        {/* Nút Mở Modal Thêm */}
        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all"
        >
          <Plus size={20} />
          Thêm Nhân viên mới
        </button>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Bảng Danh sách */}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Nhân viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffList.map((staff) => (
                <tr key={staff.staff_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.first_name} {staff.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{staff.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{staff.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{staff.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      staff.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleOpenEditModal(staff)} className="text-blue-600 hover:text-blue-900">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(staff.staff_id, `${staff.first_name} ${staff.last_name}`)} className="text-red-600 hover:text-red-900">
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
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border overflow-hidden transform transition-all scale-100">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-blue-800">
                {editingId ? `Sửa Nhân viên (ID: ${editingId})` : 'Thêm Nhân viên Mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalMessage && (
                <div className={`p-3 rounded-md ${modalIsError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {modalMessage}
                </div>
              )}

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
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại (*)</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
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
                  {modalLoading ? 'Đang lưu...' : (editingId ? 'Lưu Cập nhật' : 'Thêm Nhân viên')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}