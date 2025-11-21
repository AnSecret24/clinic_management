// File: backend-moi/routes/public.js
import express from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

// === SAO CHÉP CẤU HÌNH VÀO ĐÂY ===
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456', // <-- KIỂM TRA LẠI MẬT KHẨU NÀY
  database: 'clinic_management'
};

// === API LẤY BÁC SĨ ===
// (Đường dẫn: /doctors)
router.get('/doctors', async (req, res) => {
  // (Code API GET /api/doctors của bạn)
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM doctors');
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// === API LẤY LỊCH TRỐNG ===
// (Đường dẫn: /schedules/:doctorId)
router.get('/schedules/:doctorId', async (req, res) => {
  // (Code API GET /api/schedules/:doctorId của bạn)
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!date) { 
        return res.status(400).json({ message: 'Vui lòng cung cấp ngày.' });
     }
    const connection = await mysql.createConnection(dbConfig);
    const [schedules] = await connection.execute(
      `SELECT schedule_id, slot_start, slot_end, status -- Lấy thêm status
       FROM doctor_schedules 
       WHERE doctor_id = ? AND work_date = ?`, // Xóa "AND status = 'AVAILABLE'"
      [doctorId, date]
    );
    await connection.end();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API LẤY CHUYÊN KHOA ===
// (Đường dẫn: /specialties)
router.get('/specialties', async (req, res) => {
  // (Code API GET /api/specialties của bạn)
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [specialties] = await connection.execute('SELECT specialty_id, name, description FROM specialties');
    await connection.end();
    res.json(specialties);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API LẤY DỊCH VỤ ===
// (Đường dẫn: /services)
router.get('/services', async (req, res) => {
  // (Code API GET /api/services của bạn)
  try {
    const { specialty_id } = req.query;
    let query = 'SELECT * FROM services';
    const params = [];
    if (specialty_id) {
      query += ' WHERE specialty_id = ?';
      params.push(specialty_id);
    }
    const connection = await mysql.createConnection(dbConfig);
    const [services] = await connection.execute(query, params);
    await connection.end();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});
// === API: LẤY TẤT CẢ DANH MỤC THUỐC ===
router.get('/medicines', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [medicines] = await connection.execute(
      'SELECT * FROM medicines ORDER BY name ASC'
    );
    await connection.end();
    res.json(medicines);
  } catch (error) {
    console.error('Lỗi khi lấy danh mục thuốc:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});
export default router;