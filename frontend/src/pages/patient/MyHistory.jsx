// File: src/pages/MyHistory.jsx
// (Đã cập nhật: Hiển thị đầy đủ 5 cột trong Modal Đơn thuốc)

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../api/axiosConfig.js';
import { BookMarked, Stethoscope, Calendar, ClipboardList, X } from 'lucide-react';

// === COMPONENT MỚI: MODAL XEM ĐƠN THUỐC (CẬP NHẬT) ===
function PrescriptionModal({ appointmentId, serviceName, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/patient/prescriptions/${appointmentId}`);
        setItems(response.data);
      } catch (err) {
        console.error("Lỗi tải đơn thuốc:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [appointmentId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl border"> {/* Mở rộng Modal */}
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-blue-800">Chi tiết Đơn thuốc</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        {/* Body Modal */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4">Dịch vụ khám: {serviceName}</p>
          {loading && <p>Đang tải đơn thuốc...</p>}
          {!loading && (
            <div className="overflow-x-auto">
              {items.length === 0 ? (
                <p>Lần khám này không có kê đơn thuốc.</p>
              ) : (
                // === BẮT ĐẦU SỬA BẢNG (TABLE) ===
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên thuốc</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SL</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Liều dùng</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicine_name} ({item.unit})</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.dosage}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.duration}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                // === KẾT THÚC SỬA BẢNG ===
              )}
            </div>
          )}
        </div>
        {/* Footer Modal */}
        <div className="flex justify-end p-4 border-t bg-gray-50">
          <button type="button" onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
// === KẾT THÚC MODAL ===


// === TRANG MyHistory (Giữ nguyên) ===
export default function MyHistory() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/patient/my-history');
        setRecords(response.data);
      } catch (err) { /* ... */ } 
      finally { setLoading(false); }
    };
    fetchHistory();
  }, []);

  const handleOpenModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* (Tiêu đề, Loading, Error - giữ nguyên) */}
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Lịch sử Khám bệnh</h1>
      <p className="text-gray-600 mb-6">
        Xin chào {user.firstName}, đây là tất cả các lần khám đã hoàn thành của bạn.
      </p>

      {!loading && !error && (
        <div className="space-y-4">
          {records.length === 0 ? (
            <p>Bạn chưa có lịch sử khám bệnh nào đã hoàn thành.</p>
          ) : (
            records.map(record => (
              <div key={record.record_id} className="bg-white p-5 rounded-lg shadow-md border">
                {/* (Phần thông tin khám - giữ nguyên) */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-blue-700">{record.service_name}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar size={16} />
                      Ngày khám: {new Date(record.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-700">Đã hoàn thành</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Stethoscope size={16} className="text-gray-600"/>
                    Bác sĩ khám: <strong>{record.doctor_name}</strong>
                  </p>
                  <p><strong>Triệu chứng:</strong> {record.symptoms || '(Không có)'}</p>
                  <p className="text-blue-900 bg-blue-50 p-2 rounded-md">
                    <strong>Chẩn đoán của Bác sĩ:</strong> {record.diagnosis}
                  </p>
                  <p><strong>Hướng điều trị:</strong> {record.treatment || '(Không có)'}</p>
                  
                  {/* (Nút Xem đơn thuốc - giữ nguyên) */}
                  <div className="pt-3 border-t mt-3">
                    <button
                      onClick={() => handleOpenModal(record)}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <ClipboardList size={16} />
                      Xem chi tiết đơn thuốc
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* (Render Modal - giữ nguyên) */}
      {isModalOpen && (
        <PrescriptionModal
          appointmentId={selectedRecord.appointment_id}
          serviceName={selectedRecord.service_name}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}