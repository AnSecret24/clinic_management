// File: backend-moi/middleware/adminAuth.js

// Middleware này kiểm tra vai trò (role)
export default function (req, res, next) {
  // req.user được gán từ middleware auth.js
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Truy cập bị cấm. Chỉ Admin mới có quyền.' });
  }

  // Nếu đúng là Admin, cho đi tiếp
  next();
}