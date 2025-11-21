// File: src/pages/AdminDashboard.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import api from '../../api/axiosConfig.js'; // Dùng axios có token
import { Users, UserCheck, Shield, Edit } from 'lucide-react';


export default function AdminDashboard() {
  const { user } = useContext(AuthContext); // Lấy thông tin Admin
  const [userList, setUserList] = useState([]); // State để lưu danh sách user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        // Gọi API (middleware sẽ kiểm tra token và vai trò 'ADMIN')
        const response = await api.get('/admin/users');
        setUserList(response.data);
      } catch (err) {
        if (err.response && err.response.data) {
          setError(err.response.data.message);
        } else {
          setError('Không thể tải danh sách người dùng.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Chạy 1 lần

  // Hàm lấy icon theo vai trò
  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield size={16} className="text-red-500" />;
      case 'DOCTOR':
        return <UserCheck size={16} className="text-blue-500" />;
      case 'PATIENT':
        return <Users size={16} className="text-green-500" />;
      default:
        return null;
    }
  };

  const handleEdit = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">
        Chào mừng Quản trị viên, {user.firstName}!
      </h1>
      <p className="text-gray-600 mb-6">Quản lý người dùng hệ thống.</p>

      {loading && <p>Đang tải danh sách người dùng...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên đăng nhập</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userList.map((u) => (
                <tr key={u.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.first_name} {u.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(u.role)}
                      <span>{u.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(u.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(u.user_id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Sửa Vai trò / Trạng thái"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}