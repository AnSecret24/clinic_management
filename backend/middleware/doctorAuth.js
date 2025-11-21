// File: backend-moi/middleware/doctorAuth.js

// Middleware này sẽ chạy SAU khi middleware 'auth.js' chạy
// Nó kiểm tra vai trò (role) của user đã được giải mã

export default function (req, res, next) {
  // req.user được gán từ middleware auth.js
  if (req.user.role !== 'DOCTOR') {
    return res.status(403).json({ message: 'Truy cập bị cấm. Chỉ Bác sĩ mới có quyền.' });
  }

  // Nếu đúng là Bác sĩ, cho đi tiếp
  next();
}