// File: backend-moi/routes/appointments.js
// (ĐÃ CẬP NHẬT LOGIC MỚI: TỰ TẠO HÓA ĐƠN)

import express from 'express';
import mysql from 'mysql2/promise';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// (Sao chép dbConfig vào đây)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456', // <-- KIỂM TRA LẠI MẬT KHẨU NÀY
  database: 'clinic_management'
};

// === API: BỆNH NHÂN ĐẶT LỊCH (ONLINE) ===
router.post('/', authMiddleware, async (req, res) => {
  const { doctor_id, service_id, schedule_time, type, note } = req.body;
  const userId = req.user.id; // user_id của Bệnh nhân

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction(); // Bắt đầu Giao dịch

    // === BƯỚC 1: Lấy patient_id ===
    const [patients] = await connection.execute('SELECT patient_id FROM patients WHERE user_id = ?', [userId]);
    if (patients.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy thông tin bệnh nhân.' });
    }
    const patientId = patients[0].patient_id;

    // === BƯỚC 2 (MỚI): Lấy giá dịch vụ (Tiền khám) ===
    const [services] = await connection.execute('SELECT price FROM services WHERE service_id = ?', [service_id]);
    if (services.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Dịch vụ này không tồn tại.' });
    }
    const servicePrice = Number(services[0].price || 0); // Đây là Tiền khám

    // === BƯỚC 3: Cập nhật slot thành 'FULL' (Giống code cũ) ===
    const work_date = schedule_time.split(' ')[0];
    const slot_start = schedule_time.split(' ')[1];

    const [updateResult] = await connection.execute(
      `UPDATE doctor_schedules SET status = 'FULL' 
       WHERE doctor_id = ? AND work_date = ? AND slot_start = ? AND status = 'AVAILABLE'`,
      [doctor_id, work_date, slot_start]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'Lỗi: Khung giờ này không còn trống hoặc không tồn tại.' });
    }

    // === BƯỚC 4: Tạo Lịch hẹn (appointments) ===
    const [apptResult] = await connection.execute(
      `INSERT INTO appointments (patient_id, doctor_id, service_id, schedule_time, type, status, created_by, note) 
       VALUES (?, ?, ?, ?, ?, 'REQUESTED', ?, ?)`,
      [patientId, doctor_id, service_id, schedule_time, type, userId, note]
    );
    const newAppointmentId = apptResult.insertId; // Lấy ID lịch hẹn vừa tạo

    // === BƯỚC 5 (MỚI): Tạo Hóa đơn (invoices) ===
    await connection.execute(
      `INSERT INTO invoices (appointment_id, patient_id, created_by, total_amount, payment_method, status)
       VALUES (?, ?, ?, ?, 'ONLINE', 'UNPAID')`,
      [
        newAppointmentId, // ID Lịch hẹn
        patientId,        // ID Bệnh nhân
        userId,           // Người tạo (chính là Bệnh nhân)
        servicePrice,     // Tổng tiền (chỉ tính tiền khám)
        // payment_method = 'ONLINE' (Vì đây là Bệnh nhân tự đặt)
        // status = 'UNPAID'
      ]
    );

    // === THÀNH CÔNG ===
    await connection.commit();
    res.status(201).json({ message: 'Đặt lịch thành công! Hóa đơn đang chờ thanh toán.' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi Bệnh nhân đặt lịch (Online):', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});

export default router;