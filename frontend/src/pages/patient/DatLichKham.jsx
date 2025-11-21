// File: src/pages/DatLichKham.jsx
// (Giao diện của bạn + Logic Dịch vụ MỚI)

import { useEffect, useMemo, useState, useContext } from "react";
import { useSearchParams, NavLink, useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Stethoscope, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { AuthContext } from '../../context/AuthContext.jsx';
import axios from 'axios';
import api from '../../api/axiosConfig.js';

export default function Booking() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // State cho dữ liệu tải về
  const [allSpecialties, setAllSpecialties] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [availableServices, setAvailableServices] = useState([]); // Dịch vụ theo chuyên khoa
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // State cho form
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState({
    full_name: `${user.firstName} ${user.lastName}` || "",
    phone: "", 
    email: "",
    branch: "Cơ sở Quận 5",
    specialtyId: "", // Sẽ dùng ID chuyên khoa để lọc
    doctorId: "",
    serviceId: "", // THÊM LẠI DỊCH VỤ
    date: new Date().toISOString().slice(0, 10),
    slot: "",
    note: ""
  });

  // Tải Chuyên khoa và Bác sĩ
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/specialties');
        setAllSpecialties(res.data);
      } catch (err) { console.error("Lỗi tải chuyên khoa:", err); }
    };
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/doctors');
        setAllDoctors(res.data);
      } catch (err) { console.error("Lỗi tải bác sĩ:", err); }
    };
    fetchSpecialties();
    fetchDoctors();
  }, []);

  // Tải Dịch vụ KHI Chuyên khoa thay đổi
  useEffect(() => {
    if (form.specialtyId) {
      setAvailableServices([]); // Reset
      setForm(f => ({ ...f, serviceId: "" })); // Reset
      
      const fetchServices = async () => {
        try {
          // Lấy dịch vụ theo specialty_id
          const res = await axios.get(`http://localhost:3001/api/services?specialty_id=${form.specialtyId}`);
          setAvailableServices(res.data);
        } catch (err) {
          console.error("Lỗi tải dịch vụ:", err);
        }
      };
      fetchServices();
    }
  }, [form.specialtyId]); // Chạy khi specialtyId thay đổi

  // Tải Khung giờ trống (khi Bác sĩ hoặc Ngày thay đổi)
  useEffect(() => {
    if (form.doctorId && form.date) {
      setAvailableSlots([]);
      setForm(f => ({ ...f, slot: "" })); 

      const fetchSlots = async () => {
        try {
          const res = await axios.get(`http://localhost:3001/api/schedules/${form.doctorId}?date=${form.date}`);
          setAvailableSlots(res.data);
        } catch (err) { console.error("Lỗi tải lịch:", err); }
      };
      fetchSlots();
    }
  }, [form.doctorId, form.date]);

  // (useEffect nhận search params - Cập nhật)
  useEffect(() => {
    const specialtyId = sp.get("specialtyId");
    const doctorId = sp.get("doctorId");
    const serviceId = sp.get("serviceId");
    setForm(f => ({
      ...f,
      specialtyId: specialtyId || f.specialtyId,
      doctorId: doctorId || f.doctorId,
      serviceId: serviceId || f.serviceId
    }));
  }, [sp]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const pickSlot = (s) => setForm({ ...form, slot: s });

  // Lọc Bác sĩ theo ID chuyên khoa
  const doctorsBySpecialty = useMemo(() => {
    if (!form.specialtyId) return allDoctors;
    // Bác sĩ từ CSDL có specialty_id
    return allDoctors.filter(d => String(d.specialty_id) === String(form.specialtyId));
  }, [form.specialtyId, allDoctors]);

  // Lấy thông tin Dịch vụ/Bác sĩ đã chọn
  const pickedService = useMemo(
    () => availableServices.find(s => String(s.service_id) === String(form.serviceId)),
    [form.serviceId, availableServices]
  );
  const pickedDoctor = useMemo(
    () => allDoctors.find(d => String(d.doctor_id) === String(form.doctorId)),
    [form.doctorId, allDoctors]
  );

  // Hàm Submit (Cập nhật payload)
  async function submit(e) {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    
    if (!form.serviceId || !form.doctorId || !form.date || !form.slot) {
      setMessage("Vui lòng chọn đầy đủ Dịch vụ, Bác sĩ, Ngày và Khung giờ.");
      setIsError(true);
      return;
    }

    setLoading(true);

    const payload = {
      doctor_id: form.doctorId,
      service_id: form.serviceId, // THÊM DÒNG NÀY
      schedule_time: `${form.date} ${form.slot}`,
      type: 'OFFLINE',
      note: form.note,
    };

    try {
      const response = await api.post('/appointments', payload);
      setMessage(response.data.message);
      setIsError(false);
      setLoading(false);
      setOk(true);
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setIsError(true);
      setLoading(false);
    }
  }

  // === MÀN HÌNH THÀNH CÔNG (Cập nhật) ===
  if (ok) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white border rounded-2xl shadow-sm p-8 text-center">
          <CheckCircle2 className="mx-auto text-green-600" size={48}/>
          <h1 className="text-2xl font-semibold text-blue-800 mt-3">Đặt lịch thành công!</h1>
          <p className="text-gray-600 mt-1">
            Đã đặt hẹn cho dịch vụ <b>{pickedService?.name}</b> 
            {pickedDoctor && <> (BS. <b>{pickedDoctor.name}</b>)</>}
            vào <b>{form.date}</b> lúc <b>{form.slot.substring(0, 5)}</b>.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <NavLink to="/" className="rounded-xl border px-4 py-2 hover:bg-gray-50">Về trang chủ</NavLink>
            <button onClick={() => setOk(false)} className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
              Đặt lịch khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === FORM ĐẶT LỊCH (Cập nhật) ===
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header nhỏ */}
      <div className="border-b bg-white/70 backdrop-blur">
        {/* ... (Giữ nguyên) ... */}
         <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="text-xs text-gray-500">Trang chủ / <span className="text-blue-700">Đặt lịch khám bệnh</span></nav>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mt-2">Đặt lịch khám bệnh</h1>
          <p className="text-gray-600">Bạn đang đăng nhập với tư cách <b>{user.firstName} {user.lastName}</b>.</p>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        <form onSubmit={submit} className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6 space-y-5">
          
          {message && (
            <div className={`p-3 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          {/* (Thông tin bệnh nhân - Giữ nguyên) */}
          <h3 className="text-xl font-semibold text-blue-800">Thông tin bệnh nhân</h3>
            {/* ... (Họ tên, SĐT, Email, Cơ sở - Giữ nguyên code cũ) ... */}
           <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Họ và tên*</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border px-3 bg-gray-100">
                <User size={16} className="text-gray-400"/>
                <input name="full_name" required value={form.full_name} disabled className="w-full py-2 outline-none bg-transparent" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Số điện thoại*</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border px-3">
                <Phone size={16} className="text-gray-400"/>
                <input name="phone" required value={form.phone} onChange={change} className="w-full py-2 outline-none" placeholder="0123 456 789"/>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Email (tuỳ chọn)</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border px-3">
                <Mail size={16} className="text-gray-400"/>
                <input name="email" type="email" value={form.email} onChange={change} className="w-full py-2 outline-none" placeholder="you@email.com"/>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Cơ sở</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border px-3">
                <MapPin size={16} className="text-gray-400"/>
                <select name="branch" value={form.branch} onChange={change} className="w-full py-2 outline-none bg-transparent">
                  <option>Cơ sở Quận 5</option>
                  <option>Cơ sở Quận 3</option>
                  <option>Cơ sở Quận 7</option>
                  <option>Cơ sở Quận 10</option>
                </select>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-blue-800">Thông tin khám</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Chuyên khoa</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border px-3">
                <Stethoscope size={16} className="text-gray-400"/>
                <select
                  name="specialtyId"
                  value={form.specialtyId}
                  onChange={(e) => {
                    setForm(f => ({ ...f, specialtyId: e.target.value, doctorId: "", serviceId: "" }));
                  }}
                  className="w-full py-2 outline-none bg-transparent"
                >
                  <option value="">-- Chọn chuyên khoa --</option>
                  {allSpecialties.map(s => <option key={s.specialty_id} value={s.specialty_id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Bác sĩ (Tùy chọn)</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border px-3">
                <User size={16} className="text-gray-400"/>
                <select name="doctorId" value={form.doctorId} onChange={change} className="w-full py-2 outline-none bg-transparent">
                  <option value="">-- Chọn bác sĩ (nếu có) --</option>
                  {doctorsBySpecialty.map(d => (
                    <option key={d.doctor_id} value={d.doctor_id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* === TRẢ LẠI PHẦN CHỌN DỊCH VỤ === */}
          <div>
            <label className="text-sm text-gray-600">Dịch vụ*</label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border px-3">
              <Stethoscope size={16} className="text-gray-400"/>
              <select
                name="serviceId"
                value={form.serviceId}
                onChange={change}
                className="w-full py-2 outline-none bg-transparent"
                required
              >
                <option value="">-- Chọn dịch vụ --</option>
                {availableServices.length > 0 ? (
                  availableServices.map(s => (
                    <option key={s.service_id} value={s.service_id}>
                      {s.name} {s.price ? `- ${Number(s.price).toLocaleString()}đ` : ""}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Vui lòng chọn chuyên khoa trước</option>
                )}
              </select>
            </div>
            {pickedService && (
              <p className="text-sm text-blue-700 mt-2">
                Giá dự kiến: <b>{Number(pickedService.price).toLocaleString()}đ</b> {pickedService.unit || ""}
              </p>
            )}
          </div>

          {/* (Ngày khám, Khung giờ - Giữ nguyên) */}
          <div className="grid sm:grid-cols-2 gap-4">
             {/* ... (Code ngày khám) ... */}
              <div>
              <label className="text-sm text-gray-600">Ngày khám</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border px-3">
                <Calendar size={16} className="text-gray-400"/>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={change}
                  min={new Date().toISOString().slice(0,10)}
                  className="w-full py-2 outline-none bg-transparent"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Khung giờ</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {availableSlots.length > 0 ? availableSlots.map((s) => {
                const isAvailable = s.status === 'AVAILABLE';
                const isSelected = form.slot === s.slot_start;

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
          
          {/* (Ghi chú - Giữ nguyên) */}
          <div>
            <label className="text-sm text-gray-600">Lý do khám / Triệu chứng</label>
            <textarea name="note" value={form.note} onChange={change}
                      className="mt-1 w-full rounded-lg border px-3 py-2 h-24 outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* (Tóm tắt - Cập nhật) */}
          <div className="rounded-xl border bg-blue-50 text-blue-900 p-4 text-sm">
            <p><b>Bệnh nhân:</b> {form.full_name} • {form.phone || "(Chưa có SĐT)"}</p>
            <p>
              {pickedService ? `Dịch vụ: ${pickedService.name}` : "Chưa chọn dịch vụ"}
              {pickedDoctor ? ` • BS: ${pickedDoctor.name}` : ""}
            </p>
            <p>{form.date} • {form.slot ? form.slot.substring(0, 5) : "Chưa chọn giờ"}</p>
          </div>

          {/* (Nút Submit - Giữ nguyên) */}
          <button disabled={loading}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 text-white px-6 py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
          </button>
        </form>

        {/* (Aside - Giữ nguyên) */}
        <aside className="space-y-4">
         {/* ... (Code aside/map của bạn) ... */}
           <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h4 className="text-lg font-semibold text-blue-800">Hỗ trợ đặt lịch</h4>
            <p className="text-sm text-gray-600 mt-1">Hotline và email tiếp nhận 24/7.</p>
            <ul className="mt-3 text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-2"><Phone size={16}/> 0123 456 789</li>
              <li className="flex items-center gap-2"><Mail size={16}/> tamanclinic@gmail.com</li>
          	  <li className="flex items-center gap-2"><MapPin size={16}/> 123 Nguyễn Văn Cừ, Quận 5, TP.HCM</li>
          	</ul>
        	</div>

        	<div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
          	<iframe
          	  title="map"
          	  width="100%" height="260" loading="lazy" className="border-0"
          	  referrerPolicy="no-referrer-when-downgrade"
          	  src="https://www.google.com/maps?q=123%20Nguy%E1%BB%85n%20Văn%20Cừ,%20Quận%205,%20TP.HCM&output=embed">
          	</iframe>
        	</div>
        </aside>
      </section>
    </div>
  );
}