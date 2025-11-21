// File: src/components/ExaminationModal.jsx
// (Đã cập nhật giao diện kê đơn chuẩn Y tế)

import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig.js';
// 1. Thêm các icon mới vào import
import { X, Plus, Trash2, Printer, CheckCircle, Pill, Clock, FileText, Hash } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';

export default function ExaminationModal({ appointment, onClose, onComplete }) {
  const { user } = useContext(AuthContext);
  const [viewState, setViewState] = useState('FORM'); // 'FORM' hoặc 'SUCCESS'
  const printRef = useRef(null); 
  
  const [formData, setFormData] = useState({
    symptoms: appointment.note || '',
    diagnosis: '',
    treatment: ''
  });
  const [allMedicines, setAllMedicines] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    medicine_id: '', medicine_name: '', quantity: 1,
    dosage: '', duration: '', note: '' // Để trống mặc định để placeholder hiện gợi ý
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/medicines');
        setAllMedicines(response.data);
      } catch (err) { /* ... */ }
    };
    fetchMedicines();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCurrentItemChange = (e) => {
    const { name, value } = e.target;
    let medName = currentItem.medicine_name;
    if (name === 'medicine_id') {
      const selectedMed = allMedicines.find(m => m.medicine_id == value);
      medName = selectedMed ? selectedMed.name : '';
    }
    setCurrentItem({
      ...currentItem,
      [name]: value,
      medicine_name: medName
    });
  };

  const handleAddItem = () => {
    if (!currentItem.medicine_id || !currentItem.quantity) {
      alert("Vui lòng chọn thuốc và nhập số lượng.");
      return;
    }
    // Nếu người dùng không nhập, dùng giá trị mặc định hiển thị lúc in
    const itemToAdd = {
        ...currentItem,
        dosage: currentItem.dosage || 'Theo chỉ định',
        duration: currentItem.duration || 'Hết thuốc'
    };

    setPrescriptionItems([...prescriptionItems, itemToAdd]);
    setCurrentItem({
      medicine_id: '', medicine_name: '', quantity: 1,
      dosage: '', duration: '', note: ''
    });
  };

  const handleRemoveItem = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    const payload = {
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      prescriptionItems: prescriptionItems
    };

    try {
      const response = await api.post(`/doctor/complete-exam/${appointment.appointment_id}`, payload);
      
      setLoading(false);
      setMessage(response.data.message);
      setIsError(false);
      setViewState('SUCCESS'); // Chuyển sang chế độ In

    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setIsError(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!appointment) return null;

  return (
    <div className="examination-modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-4xl max-h-[95vh] rounded-lg shadow-xl border flex flex-col">
        
        {/* === Header Modal === */}
        <div className="no-print flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="text-xl font-bold text-blue-800">Khám bệnh và Kê đơn</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        {/* === Body Modal (Scrollable) === */}
        <div className="p-6 space-y-4 overflow-y-auto grow" ref={printRef}>
          
          {/* Thông báo */}
          {message && (
            <div className={`no-print p-3 rounded-md mb-4 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
          
          {/* THÔNG TIN BỆNH NHÂN */}
          {/* <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm bg-blue-50 p-4 rounded-lg border border-blue-100 printable-section">
            <p><span className="font-semibold text-gray-600">Bệnh nhân:</span> <span className="text-lg font-bold text-blue-900">{appointment.patient_name}</span></p>
            <p><span className="font-semibold text-gray-600">Dịch vụ:</span> {appointment.service_name}</p>
            <p><span className="font-semibold text-gray-600">Ngày khám:</span> {new Date().toLocaleDateString('vi-VN')}</p>
            <p><span className="font-semibold text-gray-600">Bác sĩ:</span> {user.firstName} {user.lastName}</p>
          </div> */}

          {/* === CHẾ ĐỘ 1: FORM KHÁM === */}
          {viewState === 'FORM' && (
            <div className="space-y-6">
              {/* Phần 1: Chẩn đoán */}
              <div className="space-y-3">
                <h3 className="text-md font-bold text-gray-800 border-b pb-1 uppercase text-xs tracking-wider">1. Chẩn đoán lâm sàng</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Triệu chứng</label>
                  <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán (*)</label>
                  <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} rows="2" required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-yellow-50"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lời dặn / Hướng điều trị</label>
                  <textarea name="treatment" value={formData.treatment} onChange={handleChange} rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
              </div>

              {/* Phần 2: Kê đơn thuốc */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-800 border-b pb-1 uppercase text-xs tracking-wider">2. Kê đơn thuốc</h3>
                
                {/* Danh sách thuốc đã chọn */}
                <div className="space-y-2">
                  {prescriptionItems.map((item, index) => (
                      <div key={index} className="flex items-start justify-between gap-3 p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                        <div className="flex-1">
                          <div className="flex justify-between">
                             <p className="font-bold text-blue-800 text-lg">{index + 1}. {item.medicine_name}</p>
                             <span className="font-bold text-black">SL: {item.quantity}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium text-gray-500">Liều dùng:</span> {item.dosage} 
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="font-medium text-gray-500">Thời gian:</span> {item.duration}
                          </p>
                          {item.note && <p className="text-sm text-gray-500 italic mt-1">Lưu ý: {item.note}</p>}
                        </div>
                        <button type="button" onClick={() => handleRemoveItem(index)} 
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full no-print transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                  ))}
                  {prescriptionItems.length === 0 && <p className="text-gray-400 text-sm italic text-center py-2">Chưa có thuốc nào trong đơn.</p>}
                </div>

                {/* === FORM THÊM THUỐC (ĐÃ THIẾT KẾ LẠI) === */}
                <div className="bg-gray-50 p-5 rounded-xl border border-blue-200 shadow-inner no-print">
                   <div className="grid grid-cols-12 gap-4">
                      
                      {/* 1. Chọn thuốc (Full width) */}
                      <div className="col-span-12">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên thuốc</label>
                        <select name="medicine_id" value={currentItem.medicine_id} onChange={handleCurrentItemChange}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                          <option value="" disabled>-- Tìm chọn thuốc --</option>
                          {allMedicines.map(med => (
                            <option key={med.medicine_id} value={med.medicine_id}>{med.name} ({med.unit}) </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Số lượng (Nhỏ) */}
                      <div className="col-span-12 md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Hash size={16} className="text-gray-400" />
                          </div>
                          <input type="number" name="quantity" min="1" value={currentItem.quantity} onChange={handleCurrentItemChange}
                                 className="block w-full rounded-md border-gray-300 pl-10 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="1" />
                        </div>
                      </div>

                      {/* 3. Liều dùng (Quan trọng) */}
                      <div className="col-span-12 md:col-span-9">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Liều dùng</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Pill size={16} className="text-gray-400" />
                          </div>
                          <input type="text" name="dosage" value={currentItem.dosage} onChange={handleCurrentItemChange}
                                 className="block w-full rounded-md border-gray-300 pl-10 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                                 placeholder="VD: Sáng 1 viên, Tối 1 viên sau ăn" />
                        </div>
                      </div>

                      {/* 4. Thời gian */}
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian dùng</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Clock size={16} className="text-gray-400" />
                          </div>
                          <input type="text" name="duration" value={currentItem.duration} onChange={handleCurrentItemChange}
                                 className="block w-full rounded-md border-gray-300 pl-10 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                                 placeholder="VD: 5 ngày" />
                        </div>
                      </div>

                      {/* 5. Ghi chú */}
                      <div className="col-span-12 md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <FileText size={16} className="text-gray-400" />
                          </div>
                          <input type="text" name="note" value={currentItem.note} onChange={handleCurrentItemChange}
                                 className="block w-full rounded-md border-gray-300 pl-10 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                                 placeholder="Lưu ý khác..." />
                        </div>
                      </div>

                      {/* Nút Thêm */}
                      <div className="col-span-12 pt-2">
                        <button type="button" onClick={handleAddItem}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md">
                          <Plus size={18} /> Thêm thuốc vào đơn
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
          
          {/* === CHẾ ĐỘ 2: SUCCESS (IN ẤN) === */}
          {viewState === 'SUCCESS' && (
            <div className="space-y-6 printable-content">
              {/* <div className="text-center p-4 no-print">
                <CheckCircle size={56} className="mx-auto text-green-600 mb-2" />
                <h3 className="text-2xl font-bold text-gray-800">Đã lưu hồ sơ thành công!</h3>
                <p className="text-gray-600">Bạn có thể in đơn thuốc ngay bây giờ.</p>
              </div> */}

              {/* Form in ấn chuyên nghiệp */}
              <div className="border-2 border-gray-800 p-6 rounded-sm">
                  <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
                      <h1 className="text-2xl font-bold uppercase">Đơn Thuốc</h1>
                      <p className="text-sm">Phòng khám Tư nhân Tâm An</p>
                      <p className="text-xs italic">Địa chỉ: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM - SĐT: 0123 456 789</p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                      <p><strong>Họ tên bệnh nhân:</strong> {appointment.patient_name} <span className="float-right"><strong>Tuổi:</strong> {appointment.patient_age || '...'}</span></p>
                      <p><strong>SĐT:</strong> {appointment.patient_phone || '...'}</p>
                      <p><strong>Địa chỉ:</strong> {appointment.patient_address || '...'}</p>
                      <p><strong>Dịch vụ khám:</strong> {appointment.service_name}</p>
                      <p><strong>Chẩn đoán:</strong> {formData.diagnosis}</p>
                      <p><strong>Lời dặn:</strong> {formData.treatment}</p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
            {/* <p><span className="font-semibold text-gray-600">Bệnh nhân:</span> <span className="text-lg font-bold text-blue-900">{appointment.patient_name}</span></p> */}
            {/* <p><span className="font-semibold text-gray-600">Dịch vụ:</span> {appointment.service_name}</p> */}
            {/* <p><span className="font-semibold text-gray-600">Ngày khám:</span> {new Date().toLocaleDateString('vi-VN')}</p>
            <p><span className="font-semibold text-gray-600">Bác sĩ:</span> {user.firstName} {user.lastName}</p> */}
          </div>

                  <table className="w-full text-sm border-collapse border border-black mb-6">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-black p-2 text-center w-12">STT</th>
                        <th className="border border-black p-2 text-left">Tên thuốc / Hàm lượng</th>
                        <th className="border border-black p-2 text-center w-20">SL</th>
                        <th className="border border-black p-2 text-left">Cách dùng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptionItems.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-black p-2 text-center">{index + 1}</td>
                          <td className="border border-black p-2 font-semibold">{item.medicine_name}</td>
                          <td className="border border-black p-2 text-center font-bold">{item.quantity}</td>
                          <td className="border border-black p-2">
                              {item.dosage}
                              {item.duration && <span className="block text-xs italic">({item.duration})</span>}
                              {item.note && <span className="block text-xs text-gray-500">Lưu ý: {item.note}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end mt-8">
                      <div className="text-center">
                          <p className="italic mb-8">Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                          <p className="font-bold">Bác sĩ khám bệnh</p>
                          <p className="mt-16 font-bold">{user.firstName} {user.lastName}</p>
                      </div>
                  </div>
              </div>
            </div>
          )}
          
        </div>
        
        {/* === Footer Modal === */}
        <div className="no-print flex justify-end items-center p-4 border-t bg-gray-50 shrink-0">
          
          {viewState === 'FORM' ? (
            <>
              <button type="button" onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading || formData.diagnosis.trim() === ''}
                className="ml-3 inline-flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-colors"
              >
                {loading ? 'Đang lưu...' : 'Hoàn thành và In đơn'}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handlePrint}
                      className="ml-3 inline-flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-md transition-colors">
                <Printer size={18} />
                In Đơn thuốc
              </button>
              <button type="button" onClick={onComplete} 
                      className="ml-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
                Đóng
              </button>
            </>
          )}

        </div>
      </form>

      {/* CSS cho Print - Giữ nguyên */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .examination-modal, .examination-modal * {
              visibility: visible;
            }
            .examination-modal {
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background: white;
              z-index: 9999;
              display: block;
              overflow: visible;
            }
            .no-print {
              display: none !important;
            }
            .printable-content {
                width: 100%;
                position: absolute;
                top: 0;
                left: 0;
            }
          }
        `}
      </style>
    </div>
  );
}