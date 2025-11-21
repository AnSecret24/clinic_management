// File: backend-moi/middleware/auth.js

import jwt from 'jsonwebtoken';

// Lấy lại mã bí mật (phải giống hệt file server.js)
const JWT_SECRET = 'day_la_ma_bi_mat_cua_an_rat_an_toan_123456'; 

export default function (req, res, next) {
  // 1. Lấy token từ header của yêu cầu (request)
  // Frontend sẽ phải gửi token trong header 'x-auth-token'
  const token = req.header('x-auth-token');

  // 2. Kiểm tra nếu không có token
  if (!token) {
    return res.status(401).json({ message: 'Không có token, không có quyền truy cập.' });
  }

  // 3. Xác thực token
  try {
    // Giải mã token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Gắn thông tin user (đã giải mã) vào đối tượng req
    // để các API (ví dụ /api/appointments) có thể sử dụng
    req.user = decoded.user; // (user này chứa id, username, role)

    // Cho phép yêu cầu đi tiếp
    next(); 

  } catch (err) {
    // Nếu token không hợp lệ (hết hạn, bị giả mạo...)
    res.status(401).json({ message: 'Token không hợp lệ.' });
  }
}