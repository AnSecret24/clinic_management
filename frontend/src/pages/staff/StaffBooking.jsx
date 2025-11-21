// File: src/pages/StaffBooking.jsx
// (Đã cập nhật: Thêm Form Tạo Bệnh nhân Mới)

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import axios from 'axios';
import api from '../../api/axiosConfig.js';
import { Search, User, Calendar, Clock, Stethoscope, PlusCircle, XCircle } from 'lucide-react'; // Thêm icon

export default function StaffBooking() {
  const { user } = useContext(AuthContext); 
  
  // State cho Phần 1: Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null); 
  const [searchMessage, setSearchMessage] = useState('');
  
  // State MỚI: Ẩn/hiện form tạo BN
  const [showCreateForm, setShowCreateForm] = useState(false);

  // State cho Phần 2: Đặt lịch (Giữ nguyên)
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({ /* ... */ });
  const [bookMessage, setBookMessage] = useState('');
  const [bookIsError, setBookIsError] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);

  // (Code useEffect, handleChange, pickSlot, handleSubmitBooking... giữ nguyên)
  // ...
   // State cho Form Đặt lịch
  const [formDataBook, setFormDataBook] = useState({
    specialtyId: '', doctorId: '', serviceId: '',
    date: new Date().toISOString().slice(0, 10),
    slot: '', note: '', type: 'OFFLINE'
  });
  // Tải data chung (Bác sĩ, Chuyên khoa)
  useEffect(() => {
    const fetchCommonData = async () => {
      try {
        const [docsRes, specRes] = await Promise.all([
          axios.get('http://localhost:3001/api/doctors'),
          axios.get('http://localhost:3001/api/specialties')
        ]);
        setDoctors(docsRes.data);
        setSpecialties(specRes.data);
      } catch (err) { console.error("Lỗi tải data chung:", err); }
    };
    fetchCommonData();
  }, []);
  // Tải Dịch vụ (khi Chuyên khoa thay đổi)
  useEffect(() => {
    if (formDataBook.specialtyId) {
      const fetchServices = async () => {
        try {
          const res = await axios.get(`http://localhost:3001/api/services?specialty_id=${formDataBook.specialtyId}`);
          setServices(res.data);
        } catch (err) { console.error("Lỗi tải dịch vụ:", err); }
      };
      fetchServices();
    }
  }, [formDataBook.specialtyId]);
  // Tải Lịch trống (khi Bác sĩ/Ngày thay đổi)
  useEffect(() => {
    if (formDataBook.doctorId && formDataBook.date) {
      const fetchSchedules = async () => {
        try {
          const res = await axios.get(`http://localhost:3001/api/schedules/${formDataBook.doctorId}?date=${formDataBook.date}`);
          setSchedules(res.data);
        } catch (err) { console.error("Lỗi tải lịch:", err); }
      };
      fetchSchedules();
    }
  }, [formDataBook.doctorId, formDataBook.date]);

  // --- HÀM CHO PHẦN 1: TÌM KIẾM ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.length < 2) {
      setSearchMessage('Vui lòng nhập ít nhất 2 ký tự.');
      return;
    }
    setSearchMessage('Đang tìm...');
    try {
      const response = await api.get(`/staff/patients/search?term=${searchTerm}`);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setSearchMessage('Không tìm thấy bệnh nhân nào. Hãy tạo hồ sơ mới.');
      } else {
        setSearchMessage(''); // Xóa thông báo nếu tìm thấy
      }
    } catch (err) {
      setSearchMessage('Lỗi khi tìm kiếm.');
    }
  };
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient); 
    setSearchResults([]); 
    setSearchTerm(patient.name);
    setShowCreateForm(false); // Ẩn form tạo mới (nếu đang mở)
  };
  const resetSearch = () => {
    setSelectedPatient(null);
    setSearchTerm('');
    setSearchResults([]);
    setSearchMessage('');
    setShowCreateForm(false);
  };
  
  // --- HÀM CHO PHẦN 2: ĐẶT LỊCH ---
  const handleChangeBook = (e) => setFormDataBook({ ...formDataBook, [e.target.name]: e.target.value });
  const pickSlot = (s) => setFormDataBook({ ...formDataBook, slot: s });
  
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setBookMessage('');
    setBookIsError(false);
    if (!formDataBook.serviceId || !formDataBook.doctorId || !formDataBook.date || !formDataBook.slot) {
      setBookMessage("Vui lòng chọn đầy đủ Dịch vụ, Bác sĩ, Ngày và Khung giờ.");
      setBookIsError(true);
      return;
    }
    setBookLoading(true);

    const payload = {
      patient_id: selectedPatient.patient_id,
      doctor_id: formDataBook.doctorId,
      service_id: formDataBook.serviceId,
      schedule_time: `${formDataBook.date} ${formDataBook.slot}`,
      type: formDataBook.type,
      note: formDataBook.note,
    };

    try {
      const response = await api.post('/staff/appointments', payload);
      setBookMessage(response.data.message); 
      setBookIsError(false);
      setFormDataBook({
        ...formDataBook,
        specialtyId: '', doctorId: '', serviceId: '', slot: '', note: ''
      });
      // Sau khi đặt thành công, tự động reset về ô tìm kiếm
      setTimeout(() => {
        resetSearch();
        setBookMessage('');
      }, 2000); // 2 giây
    } catch (error) {
      if (error.response && error.response.data) {
        setBookMessage(error.response.data.message);
      } else {
        setBookMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setBookIsError(true);
    } finally {
      setBookLoading(false);
    }
  };
  // ...

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Đặt lịch tại quầy</h1>
      <p className="text-gray-600 mb-4">Nhân viên: {user.firstName} {user.lastName}</p>
      
      {/* === PHẦN 1: TÌM KIẾM BỆNH NHÂN (Cập nhật) === */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
        
        {/* Nếu ĐÃ CHỌN BN */}
        {selectedPatient ? (
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
            <div>
              <p className="font-bold text-lg text-blue-700">{selectedPatient.name}</p>
              <p className="text-sm text-gray-600">SĐT: {selectedPatient.phone} | Username: {selectedPatient.username}</p>
            </div>
            <button onClick={resetSearch} className="text-sm text-red-600 hover:underline">
              (Đổi Bệnh nhân)
            </button>
          </div>
        ) : (
          // Nếu CHƯA CHỌN BN (Đang tìm hoặc đang tạo)
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Bước 1: Tìm hoặc Tạo Hồ sơ Bệnh nhân
            </h2>
            
            {/* Thanh Tìm kiếm và Nút Tạo mới */}
            <div className="flex flex-col md:flex-row gap-2">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập Tên, SĐT..."
                  className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  disabled={showCreateForm} // Khóa ô tìm kiếm nếu đang tạo mới
                />
                <button type="submit" disabled={showCreateForm}
                        className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                  <Search size={18} /> Tìm
                </button>
              </form>
              
              {/* Nút Tạo Mới / Hủy */}
              {showCreateForm ? (
                <button onClick={() => setShowCreateForm(false)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">
                  <XCircle size={18} /> Hủy Tạo mới
                </button>
              ) : (
                <button onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">
                  <PlusCircle size={18} /> Tạo Hồ sơ Mới
                </button>
              )}
            </div>

            {/* Hiển thị kết quả tìm kiếm */}
            {!showCreateForm && (
              <>
                {searchMessage && <p className="text-sm text-gray-600 mt-2">{searchMessage}</p>}
                <div className="mt-4 space-y-2">
                  {searchResults.map(patient => (
                    <button
                      key={patient.patient_id}
                      onClick={() => handleSelectPatient(patient)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md border"
                    >
                      <p className="font-semibold">{patient.name}</p>
                      <p className="text-sm text-gray-500">SĐT: {patient.phone} | Username: {patient.username}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* === FORM TẠO BỆNH NHÂN MỚI (MỚI) === */}
            {showCreateForm && (
              <CreatePatientForm onPatientCreated={handleSelectPatient} />
            )}
          </>
        )}
      </div>

      {/* === PHẦN 2: ĐẶT LỊCH (Chỉ hiện khi đã chọn BN) === */}
      {selectedPatient && (
        <form onSubmit={handleSubmitBooking} className="bg-white p-6 rounded-lg shadow-md border space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Bước 2: Điền thông tin khám cho Bệnh nhân</h2>
          {/* (Code Form Đặt lịch giữ nguyên...) */}
          {bookMessage && (
            <div className={`p-3 rounded-md ${bookIsError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {bookMessage}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Chuyên khoa (*)</label>
              <select name="specialtyId" value={formDataBook.specialtyId} onChange={handleChangeBook} required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
                <option value="" disabled>-- Chọn chuyên khoa --</option>
                {specialties.map(s => (
                  <option key={s.specialty_id} value={s.specialty_id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bác sĩ (*)</label>
              <select name="doctorId" value={formDataBook.doctorId} onChange={handleChangeBook} required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
                <option value="" disabled>-- Chọn bác sĩ --</option>
                {doctors.map(d => (
                  <option key={d.doctor_id} value={d.doctor_id}>{d.name} ({d.specialty_name})</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dịch vụ (*)</label>
            <select name="serviceId" value={formDataBook.serviceId} onChange={handleChangeBook} required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
              <option value="" disabled>-- Chọn dịch vụ --</option>
              {services.length > 0 ? (
                services.map(s => (
                  <option key={s.service_id} value={s.service_id}>
                    {s.name} ({Number(s.price).toLocaleString()}đ)
                  </option>
                ))
              ) : (
                <option value="" disabled>Vui lòng chọn chuyên khoa trước</option>
              )}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày khám (*)</label>
              <input type="date" name="date" value={formDataBook.date} onChange={handleChangeBook} required
                     min={new Date().toISOString().slice(0, 10)}
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Khung giờ (*)</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {schedules.length > 0 ? schedules.map((s) => {
                  const isAvailable = s.status === 'AVAILABLE';
                  const isSelected = formDataBook.slot === s.slot_start;

                  return (
                    <button 
                      type="button" 
                      key={s.schedule_id}
                      onClick={() => isAvailable && pickSlot(s.slot_start)} // Chỉ click được khi Trống
                      disabled={!isAvailable} // Vô hiệu hóa nút nếu đã FULL
                      className={`
                        flex items-center justify-center gap-1 rounded-lg border py-2 text-sm
                        ${isSelected ? "bg-blue-600 text-white border-blue-600" : ""}
                        ${!isAvailable ? "bg-gray-200 text-gray-400 cursor-not-allowed line-through" : ""}
                        ${isAvailable && !isSelected ? "bg-white hover:bg-gray-50" : ""}
                      `}
                      title={!isAvailable ? "Khung giờ này đã có hẹn" : ""} // Ghi chú
                    >
                      <Clock size={16}/> {s.slot_start.substring(0, 5)}
                    </button>
                  );
                }) : (
                  <p className="text-xs text-gray-500 col-span-3">Vui lòng chọn bác sĩ và ngày.</p>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ghi chú (Triệu chứng)</label>
            <textarea name="note" value={formDataBook.note} onChange={handleChangeBook} rows="2"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={bookLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {bookLoading ? 'Đang tạo lịch...' : 'Tạo Lịch hẹn (Offline)'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


// === COMPONENT MỚI: FORM TẠO BỆNH NHÂN ===
// (Đặt ở dưới cùng trong cùng 1 file)
function CreatePatientForm({ onPatientCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'OTHER',
    date_of_birth: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    
    try {
      // Gọi API 'POST /api/staff/patients' (có token)
      const response = await api.post('/staff/patients', formData);
      
      setLoading(false);
      setMessage(response.data.message); // "Tạo hồ sơ thành công!"
      setIsError(false);
      
      // Tự động chọn Bệnh nhân này
      onPatientCreated(response.data.patient); 

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

  return (
    <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t space-y-4">
      <h3 className="text-lg font-semibold text-green-700">Tạo Hồ sơ Bệnh nhân Mới</h3>
      
      {message && (
        <div className={`p-3 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ và Tên (*)</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại (*)</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                 placeholder="Dùng làm username mặc định"
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
          <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Giới tính</label>
          <select name="gender" value={formData.gender} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
            <option value="OTHER">Khác</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
      >
        <PlusCircle size={18} />
        {loading ? 'Đang tạo...' : 'Lưu Hồ sơ Bệnh nhân'}
      </button>
    </form>
  );
}