// File: src/pages/admin/AdminManageMedicines.jsx
// (Đã thiết kế lại: Form Thuốc nằm trong Modal)

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../../api/axiosConfig.js'; // Chú ý đường dẫn ../../
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

export default function AdminManageMedicines() {
  // State
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = Thêm, có ID = Sửa

  const defaultFormState = {
    name: '',
    unit: 'Viên',
    unit_price: '',
    stock_qty: 0,
    usage_note: ''
  };
  const [formData, setFormData] = useState(defaultFormState);
  
  const [modalMessage, setModalMessage] = useState('');
  const [modalIsError, setModalIsError] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // 1. Tải danh sách thuốc
  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/medicines');
      setMedicines(response.data);
    } catch (err) {
      setError('Không thể tải danh mục thuốc.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Các hàm điều khiển Modal
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(defaultFormState);
    setModalMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingId(med.medicine_id);
    setFormData({
      name: med.name,
      unit: med.unit,
      unit_price: med.unit_price,
      stock_qty: med.stock_qty,
      usage_note: med.usage_note
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

  // 3. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage('');
    setModalIsError(false);

    try {
      let response;
      if (editingId) {
        // Sửa
        response = await api.put(`/admin/medicines/${editingId}`, formData);
      } else {
        // Thêm
        response = await api.post('/admin/medicines', formData);
      }

      setModalMessage(response.data.message);
      setModalIsError(false);
      
      fetchMedicines(); // Tải lại danh sách

      // Tự động đóng modal sau 1s
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

  // 4. Xóa Thuốc
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thuốc "${name}"?`)) return;
    try {
      await api.delete(`/admin/medicines/${id}`);
      fetchMedicines();
    } catch (error) {
      alert('Lỗi khi xóa. Thuốc có thể đã được sử dụng trong đơn thuốc.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Quản lý Thuốc</h1>
        
        {/* Nút Mở Modal Thêm */}
        <button 
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all"
        >
          <Plus size={20} />
          Thêm Thuốc mới
        </button>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Bảng Danh sách Thuốc */}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên thuốc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn vị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines.map((med) => (
                <tr key={med.medicine_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{med.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{Number(med.unit_price).toLocaleString()}đ</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{med.stock_qty}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-xs">{med.usage_note}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleOpenEditModal(med)} className="text-blue-600 hover:text-blue-900">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(med.medicine_id, med.name)} className="text-red-600 hover:text-red-900">
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
                {editingId ? `Sửa Thuốc (ID: ${editingId})` : 'Thêm Thuốc Mới'}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên thuốc (*)</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Đơn vị (*)</label>
                  <input type="text" name="unit" value={formData.unit} onChange={handleChange} required
                         placeholder="Vd: Viên"
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Đơn giá (VNĐ) (*)</label>
                  <input type="number" name="unit_price" value={formData.unit_price} onChange={handleChange} required
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tồn kho (SL)</label>
                  <input type="number" name="stock_qty" value={formData.stock_qty} onChange={handleChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Hướng dẫn sử dụng</label>
                  <input type="text" name="usage_note" value={formData.usage_note} onChange={handleChange}
                         placeholder="Vd: Uống sau ăn"
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
                  {modalLoading ? 'Đang lưu...' : (editingId ? 'Lưu Cập nhật' : 'Thêm Thuốc')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}