// File: src/pages/StaffDashboard.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../api/axiosConfig.js'; // Dùng axios CÓ TOKEN
import { DollarSign, CheckCircle, Clock } from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useContext(AuthContext); // Lấy thông tin Nhân viên
  const [unpaidInvoices, setUnpaidInvoices] = useState([]); // State lưu hóa đơn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // Thông báo thành công

  useEffect(() => {
    fetchUnpaidInvoices();
  }, []);

  // 1. Hàm tải hóa đơn "UNPAID"
  const fetchUnpaidInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      // Gọi API (middleware sẽ kiểm tra token và vai trò 'STAFF'/'ADMIN')
      const response = await api.get('/staff/invoices/unpaid');
      setUnpaidInvoices(response.data);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Không thể tải danh sách hóa đơn.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm XÁC NHẬN THANH TOÁN
  const handlePayment = async (invoiceId) => {
    if (!window.confirm(`Xác nhận thanh toán cho Hóa đơn ID: ${invoiceId}?`)) {
      return;
    }

    try {
      setMessage('');
      setError('');
      // Gọi API 'PUT' (Sửa)
      const response = await api.put(`/staff/invoices/pay/${invoiceId}`);

      setMessage(response.data.message); // "Đã xác nhận thanh toán thành công!"

      // Tải lại danh sách (hóa đơn vừa thanh toán sẽ biến mất)
      fetchUnpaidInvoices(); 

    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('Lỗi khi xác nhận thanh toán.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">
        Bảng điều khiển Thanh toán
      </h1>
      <p className="text-gray-600 mb-6">
        Xin chào {user.firstName}, đây là các hóa đơn đang chờ thanh toán tại quầy.
      </p>

      {loading && <p>Đang tải danh sách hóa đơn...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg border overflow-hidden mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bệnh nhân</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày khám</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unpaidInvoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Không có hóa đơn nào chờ thanh toán.
                  </td>
                </tr>
              ) : (
                unpaidInvoices.map((invoice) => (
                  <tr key={invoice.invoice_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.patient_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(invoice.schedule_time).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                      {Number(invoice.total_amount).toLocaleString()}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handlePayment(invoice.invoice_id)}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        <DollarSign size={16} />
                        Xác nhận
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}