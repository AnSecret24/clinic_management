// File: backend-moi/middleware/staffAuth.js

// Middleware này kiểm tra vai trò (cho phép Staff hoặc Admin)
export default function (req, res, next) {
  // req.user được gán từ middleware auth.js
  if (req.user.role === 'STAFF' || req.user.role === 'ADMIN') {
    // Nếu là Staff HOẶC Admin, cho đi tiếp
    next(); 
  } else {
    return res.status(403).json({ message: 'Truy cập bị cấm. Chỉ Nhân viên hoặc Admin mới có quyền.' });
  }
}