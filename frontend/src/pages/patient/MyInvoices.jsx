// File: src/pages/MyInvoices.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../api/axiosConfig.js';
import { CreditCard, CheckCircle, Clock, Loader, X, AlertCircle } from 'lucide-react';

// === COMPONENT MỚI: MODAL CHỌN THANH TOÁN (ĐÃ SỬA LOGIC RADIO BUTTON) ===
function PaymentChoiceModal({ invoice, onClose, onPaymentStart }) {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('VNPAY'); // Mặc định chọn VNPAY

  // Hàm này xử lý khi ấn nút "Xác nhận thanh toán"
  const handleConfirmPayment = async () => {
    setLoading(true);
    // Gọi hàm onPaymentStart (từ trang cha) với phương thức đã chọn
    await onPaymentStart(invoice.invoice_id, selectedMethod);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl border animate-in fade-in zoom-in duration-200">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
             <CreditCard size={20} /> Thanh toán hóa đơn
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Body Modal */}
        <div className="p-6">
          {/* Thông tin hóa đơn tóm tắt */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <p className="text-sm text-gray-600 mb-1">Dịch vụ:</p>
            <p className="font-semibold text-blue-900 text-lg leading-tight">{invoice.service_name}</p>
            <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng tiền cần trả:</span>
                <span className="text-2xl font-bold text-red-600">{Number(invoice.total_amount).toLocaleString()}đ</span>
            </div>
          </div>

          <p className="font-medium text-gray-700 mb-3">Chọn phương thức thanh toán:</p>

          {/* --- KHU VỰC CHỌN PHƯƠNG THỨC (RADIO BUTTONS) --- */}
          <div className="space-y-3 mb-6">
            {/* Lựa chọn VNPAY */}
            <label 
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all relative overflow-hidden ${
                selectedMethod === 'VNPAY' 
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <input 
                type="radio" 
                name="paymentMethod" 
                value="VNPAY" 
                checked={selectedMethod === 'VNPAY'} 
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-4 flex items-center justify-between w-full">
                 <div className="flex items-center gap-3">
                    {/* Icon VNPAY giả lập */}
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">VNPAY</div>
                    <span className="font-semibold text-gray-800">Ví VNPAY</span>
                 </div>
                 {selectedMethod === 'VNPAY' && <CheckCircle size={20} className="text-blue-600" />}
              </div>
            </label>

            {/* Lựa chọn MOMO */}
            <label 
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all relative overflow-hidden ${
                selectedMethod === 'MOMO' 
                  ? 'border-pink-600 bg-pink-50 ring-1 ring-pink-600 shadow-sm' 
                  : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
              }`}
            >
              <input 
                type="radio" 
                name="paymentMethod" 
                value="MOMO" 
                checked={selectedMethod === 'MOMO'} 
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-5 h-5 text-pink-600 border-gray-300 focus:ring-pink-500"
              />
              <div className="ml-4 flex items-center justify-between w-full">
                 <div className="flex items-center gap-3">
                    {/* Icon MOMO */}
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="Momo" className="w-10 h-10 rounded-lg shadow-sm" />
                    <span className="font-semibold text-gray-800">Ví MoMo</span>
                 </div>
                 {selectedMethod === 'MOMO' && <CheckCircle size={20} className="text-pink-600" />}
              </div>
            </label>
          </div>

          {/* --- NÚT XÁC NHẬN CHUNG --- */}
          <button
            onClick={handleConfirmPayment}
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 text-base font-bold text-white rounded-lg shadow-md transition-all transform active:scale-[0.98] ${
              selectedMethod === 'VNPAY' 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                : 'bg-pink-600 hover:bg-pink-700 shadow-pink-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? <Loader size={22} className="animate-spin" /> : <CreditCard size={22} />}
            Thanh toán qua {selectedMethod}
          </button>
          
          <p className="text-xs text-center text-gray-400 mt-4 italic flex items-center justify-center gap-1">
             <AlertCircle size={12} /> Môi trường giả lập: Giao dịch thành công ngay lập tức.
          </p>
        </div>
      </div>
    </div>
  );
}
// === KẾT THÚC MODAL ===


// === TRANG MyInvoices (MAIN) ===
export default function MyInvoices() {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/patient/my-invoices');
      setInvoices(response.data);
    } catch (err) {
      setError('Không thể tải danh sách hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý thanh toán (được gọi khi bấm nút Xác nhận trong Modal)
  const handlePayOnline = async (invoiceId, method) => {
    setMessage('');
    setError('');

    // Giả lập thời gian chờ (UX)
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    try {
      // Gọi API giả lập (Backend cần hỗ trợ endpoint này)
      const response = await api.put(`/patient/invoices/${invoiceId}/simulate-payment`);
      
      setMessage(`Thanh toán thành công: ${response.data.message} (Cổng ${method})`);
      fetchInvoices(); // Tải lại danh sách để cập nhật trạng thái
      setIsModalOpen(false); // Đóng Modal sau khi xong

    } catch (error) {
      console.error("Payment Error:", error);
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('Lỗi kết nối hoặc lỗi server khi thanh toán.');
      }
      // Lưu ý: Không đóng modal nếu lỗi để user biết
    }
  };

  // Hàm render nút trạng thái
  const renderStatusAction = (invoice) => {
    if (invoice.status === 'PAID') {
      return (
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <CheckCircle size={16} />
          <span className="font-medium text-sm">Đã thanh toán ({invoice.payment_method})</span>
        </div>
      );
    }
    if (invoice.status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Đã hủy
        </span>
      );
    }
    if (invoice.status === 'UNPAID' && invoice.payment_method === 'OFFLINE') {
       return (
        <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
          <Clock size={16} />
          <span className="font-medium text-sm">Chờ thanh toán tại quầy</span>
        </div>
      );
    }
    
    // Nút "Thanh toán Online" -> Mở Modal
    if (invoice.status === 'UNPAID' && invoice.payment_method === 'ONLINE') {
      return (
        <button 
          onClick={() => {
            setSelectedInvoice(invoice); // Lưu hóa đơn đang chọn
            setIsModalOpen(true);        // Mở Modal
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md transition-all hover:shadow-lg"
        >
          <CreditCard size={16} />
          Thanh toán ngay
        </button>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Quản lý Hóa đơn</h1>
          <p className="text-gray-600">
              Xin chào <span className="font-semibold text-blue-700">{user?.firstName || 'bạn'}</span>, 
              dưới đây là lịch sử giao dịch khám bệnh của bạn tại Tâm An.
          </p>
      </div>

      {/* Thông báo lỗi / thành công */}
      {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle size={20} /> {message}
          </div>
      )}
      {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} /> {error}
          </div>
      )}

      {/* Nội dung chính */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader size={40} className="animate-spin text-blue-500 mb-4" />
            <p>Đang tải dữ liệu hóa đơn...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {invoices.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">Bạn chưa có hóa đơn nào.</p>
            </div>
          ) : (
            invoices.map(invoice => (
              <div key={invoice.invoice_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  {/* Cột thông tin trái */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-bold text-gray-800">{invoice.service_name}</h2>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md border">
                            #{invoice.invoice_id}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock size={14} /> 
                        Ngày tạo: {new Date(invoice.created_at).toLocaleDateString('vi-VN')}
                    </p>
                    <div className="mt-3">
                         <span className="text-sm text-gray-500 mr-2">Tổng tiền:</span>
                         <span className="text-2xl font-bold text-red-600 tracking-tight">
                            {Number(invoice.total_amount).toLocaleString('vi-VN')}đ
                         </span>
                    </div>
                  </div>

                  {/* Cột hành động phải */}
                  <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                    {renderStatusAction(invoice)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* === RENDER MODAL === */}
      {isModalOpen && selectedInvoice && (
        <PaymentChoiceModal
          invoice={selectedInvoice}
          onClose={() => setIsModalOpen(false)}
          onPaymentStart={handlePayOnline}
        />
      )}
    </div>
  );
}