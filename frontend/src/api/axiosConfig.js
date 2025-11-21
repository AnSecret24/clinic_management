// File: src/api/axiosConfig.js

import axios from 'axios';

// Tạo một "instance" (phiên bản) axios mới
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api', // Địa chỉ API gốc
});

// Thêm một "bộ chặn" (interceptor)
// Bộ chặn này sẽ chạy TRƯỚC KHI request được gửi đi
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    // Nếu có token, gắn nó vào header 'x-auth-token'
    // (Đây là header mà 'auth.js' ở backend đang kiểm tra)
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;