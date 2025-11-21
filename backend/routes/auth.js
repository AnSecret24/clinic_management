// File: backend-moi/routes/auth.js
// (PHIÊN BẢN ĐÃ SỬA LỖI: XÓA KÝ TỰ 'F' BỊ THỪA)

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

const router = express.Router();

// === CẤU HÌNH ===
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456', // <-- KIỂM TRA LẠI MẬT KHẨU NÀY
  database: 'clinic_management'
};
const JWT_SECRET = 'day_la_ma_bi_mat_cua_an_rat_an_toan_123456';

// === API ĐĂNG KÝ ===
router.post('/register', async (req, res) => {
  const { username, password, firstName, lastName, phone, email } = req.body;

  // Định nghĩa 'role' (Đang ở chế độ tạo PATIENT)
  const role = req.body.role || 'PATIENT'; 
  // (Bạn có thể đổi 'PATIENT' thành 'ADMIN', 'DOCTOR' để tạo user test)

  if (!username || !password || !firstName) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [existingUser] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      await connection.end();
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    await connection.execute(
      'INSERT INTO users (username, password_hash, first_name, last_name, role, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, password_hash, firstName, lastName, role, phone, email]
    );
    
    const [result] = await connection.execute('SELECT LAST_INSERT_ID() as user_id');
    const newUserId = result[0].user_id;
    
    if (role === 'PATIENT') {
      await connection.execute(
        'INSERT INTO patients (user_id, name) VALUES (?, ?)',
        [newUserId, `${firstName} ${lastName}`]
      );
    }
    
    await connection.end();
    res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });

  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API ĐĂNG NHẬP ===
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const cleanPassword = password.trim();
  console.log(`\n--- DEBUG: Yêu cầu đăng nhập cho: ${username} ---`);

  // (KÝ TỰ 'F' BỊ THỪA ĐÃ ĐƯỢC XÓA Ở ĐÂY)

  if (!username || !cleanPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      await connection.end();
      console.log("--- DEBUG KẾT QUẢ: Lỗi! Không tìm thấy user. ---");
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }
    const user = users[0];
    const cleanHash = user.password_hash.trim();
    const isMatch = await bcrypt.compare(cleanPassword, cleanHash);
    console.log(`Kết quả so sánh (isMatch): ${isMatch}`);
    if (!isMatch) {
      await connection.end();
      console.log("--- DEBUG KẾT QUẢ: Lỗi! Mật khẩu không khớp. ---");
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }
    const payload = { user: { id: user.user_id, username: user.username, role: user.role } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '365d' });
    await connection.end();
    console.log("--- DEBUG KẾT QUẢ: Thành công! Đã tạo token. ---");
    res.json({
      message: 'Đăng nhập thành công!',
      token: token,
      user: { id: user.user_id, firstName: user.first_name, lastName: user.last_name, role: user.role }
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập (Catch):', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

export default router;