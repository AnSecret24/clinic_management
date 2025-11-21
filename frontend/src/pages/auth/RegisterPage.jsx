// File: src/pages/RegisterPage.jsx (Hoặc Register.jsx)

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import axios from 'axios'; // Import axios

// (Code component <Input> của bạn)
const Input = ({ icon: Icon, ...props }) => (
  <div className="flex items-center gap-2 rounded-lg border px-3">
    <Icon size={16} className="text-gray-400" />
    <input {...props} className="w-full py-2 outline-none" />
  </div>
);

export default function Register() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  // === THÊM STATE ĐỂ QUẢN LÝ FORM ===
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // === HÀM XỬ LÝ KHI GÕ CHỮ ===
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // === HÀM SUBMIT MỚI (THAY THẾ HÀM CŨ CỦA BẠN) ===
  async function submit(e) {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    // 1. Kiểm tra mật khẩu khớp
    if (formData.password !== formData.confirm) {
      setMessage('Mật khẩu xác nhận không khớp.');
      setIsError(true);
      return;
    }
    // 2. Kiểm tra độ dài mật khẩu
    if (formData.password.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      setIsError(true);
      return;
    }

    // 3. Xử lý Họ và Tên (Tách 'full_name' -> 'firstName', 'lastName')
    const names = formData.full_name.trim().split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    // 4. Chuẩn bị dữ liệu gửi đi (Đúng theo API backend)
    const payload = {
      username: formData.username,
      password: formData.password,
      firstName: firstName,
      lastName: lastName,
      phone: formData.phone,
      email: formData.email,
    };

    // 5. Gọi API
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', payload);

      // Thành công
      setMessage(response.data.message);
      setIsError(false);
      // Xóa form (trừ full_name, username... vì ta đã gán value)
      setFormData({ full_name: '', username: '', phone: '', email: '', password: '', confirm: '' });
      
    } catch (error) {
      // Thất bại
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setIsError(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-lg bg-white rounded-2xl border shadow-sm p-6 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">Đăng ký tài khoản</h1>
          <p className="text-sm text-gray-600">Tạo tài khoản để đặt lịch nhanh hơn</p>
        </div>

        {/* Hiển thị thông báo (nếu có) */}
        {message && (
          <div className={`p-3 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Họ tên*</label>
            <Input icon={User} name="full_name" required placeholder="Nguyễn Văn An" 
                   value={formData.full_name} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Tên đăng nhập*</label>
            <Input icon={User} name="username" required placeholder="nguyenvanan" 
                   value={formData.username} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Số điện thoại</label>
            <Input icon={Phone} name="phone" placeholder="0123 456 789" 
                   value={formData.phone} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <Input icon={Mail} type="email" name="email" placeholder="you@email.com" 
                   value={formData.email} onChange={handleChange} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Mật khẩu*</label>
            <div className="flex items-center gap-2 rounded-lg border px-3">
              <Lock size={16} className="text-gray-400" />
              <input type={show1 ? "text" : "password"} name="password" required placeholder="••••••••" 
                     className="w-full py-2 outline-none"
                     value={formData.password} onChange={handleChange} />
              <button type="button" onClick={() => setShow1(s => !s)} className="text-gray-500">
                {show1 ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự.</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Xác nhận mật khẩu*</label>
            <div className="flex items-center gap-2 rounded-lg border px-3">
              <Lock size={16} className="text-gray-400" />
              <input type={show2 ? "text" : "password"} name="confirm" required placeholder="••••••••" 
                     className="w-full py-2 outline-none"
                     value={formData.confirm} onChange={handleChange} />
              <button type="button" onClick={() => setShow2(s => !s)} className="text-gray-500">
                {show2 ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <button className="w-full rounded-xl bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700">
          Tạo tài khoản
        </button>

        <p className="text-sm text-gray-600 text-center">
          Đã có tài khoản?{" "}
          <NavLink to="/dang-nhap" className="text-blue-700 hover:underline">Đăng nhập</NavLink>
        </p>
      </form>
    </div>
  );
}