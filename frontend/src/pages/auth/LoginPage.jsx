// File: src/pages/LoginPage.jsx
// (Đã cập nhật để dùng AuthContext)

import { useState, useContext } from "react"; // 1. Thêm useContext
import { NavLink, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from 'axios';

// 2. Import AuthContext
import { AuthContext } from '../../context/AuthContext.jsx';

export default function Login() {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  // 3. Lấy hàm login từ Context
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 4. Cập nhật hàm submit
  async function submit(e) {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', formData);
      
      setMessage(response.data.message);
      setIsError(false);

      // === THAY ĐỔI QUAN TRỌNG ===
      // Thay vì lưu localStorage ở đây, chúng ta gọi hàm login từ Context
      // AuthContext sẽ tự lo việc lưu localStorage và cập nhật state
      login(response.data.user, response.data.token);

      // Chuyển hướng về trang chủ
      setTimeout(() => {
        navigate('/'); 
      }, 1000); 

    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setIsError(true);
    }
  }

  // (Phần JSX giao diện giữ nguyên y hệt)
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-6 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">Đăng nhập</h1>
          <p className="text-sm text-gray-600">Chào mừng bạn quay lại Tâm An Clinic</p>
        </div>

        {message && (
          <div className={`p-3 rounded-md text-center ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div>
          <label className="text-sm text-gray-600">Tên đăng nhập / Email</label>
          <div className="mt-1 flex items-center gap-2 rounded-lg border px-3">
            <Mail size={16} className="text-gray-400" />
            <input
              name="username"
              required
              className="w-full py-2 outline-none"
              placeholder="thaoan hoặc you@email.com"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Mật khẩu</label>
          <div className="mt-1 flex items-center gap-2 rounded-lg border px-3">
            <Lock size={16} className="text-gray-400" />
            <input
              type={show ? "text" : "password"}
              name="password"
              required
              className="w-full py-2 outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <button type="button" onClick={() => setShow(s => !s)} className="text-gray-500">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button className="w-full rounded-xl bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700">
          Đăng nhập
        </button>

        <p className="text-sm text-gray-600 text-center">
          Chưa có tài khoản?{" "}
          <NavLink to="/dang-ky" className="text-blue-700 hover:underline">Đăng ký</NavLink>
        </p>
      </form>
    </div>
  );
}