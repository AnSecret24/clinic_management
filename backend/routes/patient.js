// File: backend-moi/routes/patient.js
// (Đã cập nhật: Thêm API Lấy Đơn thuốc)

import express from 'express';
import mysql from 'mysql2/promise';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// (dbConfig của bạn)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456', // <-- KIỂM TRA LẠI MẬT KHẨU NÀY
  database: 'clinic_management'
};

// === API: BỆNH NHÂN LẤY LỊCH SỬ KHÁM (CẬP NHẬT) ===
router.get('/my-history', [authMiddleware], async (req, res) => {
  try {
    const patientUserId = req.user.id;
    const connection = await mysql.createConnection(dbConfig);
    const [patients] = await connection.execute('SELECT patient_id FROM patients WHERE user_id = ?', [patientUserId]);
    if (patients.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Không tìm thấy thông tin bệnh nhân.' });
    }
    const patientId = patients[0].patient_id;

    // 3. Lấy Hồ sơ khám (SỬA LẠI CÂU SELECT)
    const [records] = await connection.execute(
      `SELECT 
         mr.record_id, 
         mr.symptoms, 
         mr.diagnosis, 
         mr.treatment, 
         mr.created_at,
         mr.appointment_id, -- <-- THÊM DÒNG NÀY (Rất quan trọng)
         d.name AS doctor_name,
         s.name AS service_name
       FROM medical_records AS mr
       JOIN doctors AS d ON mr.doctor_id = d.doctor_id
       JOIN appointments AS a ON mr.appointment_id = a.appointment_id
       JOIN services AS s ON a.service_id = s.service_id
       WHERE mr.patient_id = ?
       ORDER BY mr.created_at DESC`,
      [patientId]
    );

    await connection.end();
    res.json(records);

  } catch (error) {
    console.error('Lỗi khi Bệnh nhân lấy lịch sử khám:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API: BỆNH NHÂN LẤY HÓA ĐƠN (Giữ nguyên) ===
router.get('/my-invoices', [authMiddleware], async (req, res) => {
  // ... (Code cũ của bạn) ...
    try {
    const patientUserId = req.user.id;
    const connection = await mysql.createConnection(dbConfig);

    // (Lấy patient_id - Giữ nguyên)
    const [patients] = await connection.execute(
      'SELECT patient_id FROM patients WHERE user_id = ?',
      [patientUserId]
    );
    if (patients.length === 0) { /* ... */ }
    const patientId = patients[0].patient_id;

    // === BẮT ĐẦU SỬA CÂU SQL ===
    const [invoices] = await connection.execute(
      `SELECT 
         i.invoice_id, 
         i.total_amount, 
         i.payment_method, 
         i.status, 
         i.created_at,

         -- Dùng IFNULL: Nếu Hóa đơn có Dịch vụ (s.name) thì lấy tên Dịch vụ,
         -- nếu không (như Hóa đơn thuốc) thì ghi là 'Tiền thuốc'
         IFNULL(s.name, 'Tiền thuốc') AS service_name

       FROM invoices AS i

       -- JOIN Lịch hẹn (bắt buộc)
       JOIN appointments AS a ON i.appointment_id = a.appointment_id

       -- Dùng LEFT JOIN Dịch vụ (cho phép Dịch vụ bị trống)
       LEFT JOIN services AS s ON a.service_id = s.service_id

       WHERE i.patient_id = ?
       ORDER BY i.created_at DESC`,
      [patientId]
    );
    await connection.end();
    res.json(invoices);
  } catch (error) { /* ... */ }
});

// === API: BỆNH NHÂN THANH TOÁN GIẢ LẬP (Giữ nguyên) ===
router.put('/invoices/:id/simulate-payment', [authMiddleware], async (req, res) => {
  // ... (Code cũ của bạn) ...
    try {
    const { id: invoiceId } = req.params;
    const patientUserId = req.user.id;
    let connection;
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    const [patients] = await connection.execute('SELECT patient_id FROM patients WHERE user_id = ?', [patientUserId]);
    if (patients.length === 0) { /* ... */ }
    const patientId = patients[0].patient_id;
    const [invoices] = await connection.execute(
      "SELECT total_amount FROM invoices WHERE invoice_id = ? AND patient_id = ? AND status = 'UNPAID' AND payment_method = 'ONLINE'",
      [invoiceId, patientId]
    );
    if (invoices.length === 0) { /* ... */ }
    const totalAmount = invoices[0].total_amount;
    await connection.execute("UPDATE invoices SET status = 'PAID' WHERE invoice_id = ?", [invoiceId]);
    await connection.execute(
      "INSERT INTO payments (invoice_id, amount, method, channel, status, paid_at) VALUES (?, ?, 'VNPAY', 'ONLINE', 'SUCCESS', NOW())",
      [invoiceId, totalAmount]
    );
    await connection.commit();
    res.json({ message: 'Thanh toán Online (Giả lập) thành công!' });
  } catch (error) { /* ... */ } 
  finally { /* ... */ }
});

// === API MỚI: BỆNH NHÂN LẤY CHI TIẾT ĐƠN THUỐC ===
router.get('/prescriptions/:appointmentId', [authMiddleware], async (req, res) => {
  const { appointmentId } = req.params;
  const patientUserId = req.user.id;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 1. Lấy patient_id (để bảo mật)
    const [patients] = await connection.execute('SELECT patient_id FROM patients WHERE user_id = ?', [patientUserId]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bệnh nhân.' });
    }
    const patientId = patients[0].patient_id;

    // 2. Kiểm tra xem Lịch hẹn này có đúng là của Bệnh nhân này không
    const [appts] = await connection.execute(
        'SELECT appointment_id FROM appointments WHERE appointment_id = ? AND patient_id = ?',
        [appointmentId, patientId]
    );

    if (appts.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền xem đơn thuốc này.' });
    }

    // 3. Lấy thông tin đơn thuốc
    const [prescriptionItems] = await connection.execute(
        `SELECT 
           m.name AS medicine_name,
           m.unit,
           pi.quantity,
           pi.dosage,
           pi.duration,
           pi.note
         FROM prescriptions AS p
         JOIN prescription_items AS pi ON p.prescription_id = pi.prescription_id
         JOIN medicines AS m ON pi.medicine_id = m.medicine_id
         WHERE p.appointment_id = ?`,
        [appointmentId]
    );

    await connection.end();
    res.json(prescriptionItems); // Trả về mảng các thuốc đã kê

  } catch (error) {
    if (connection) await connection.end();
    console.error('Lỗi khi Bệnh nhân lấy chi tiết đơn thuốc:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});
// === API MỚI: BỆNH NHÂN LẤY HỒ SƠ CÁ NHÂN (MY PROFILE) ===
router.get('/my-profile', [authMiddleware], async (req, res) => {
  try {
    const patientUserId = req.user.id;
    const connection = await mysql.createConnection(dbConfig);
    
    // JOIN 2 bảng để lấy tất cả thông tin
    const [profile] = await connection.execute(
      `SELECT 
         p.patient_id, p.name, p.gender, p.date_of_birth, p.address,
         u.user_id, u.username, u.phone, u.email
       FROM patients AS p
       JOIN users AS u ON p.user_id = u.user_id
       WHERE p.user_id = ?`,
      [patientUserId]
    );
    
    await connection.end();
    if (profile.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ bệnh nhân.' });
    }
    res.json(profile[0]); // Trả về 1 object

  } catch (error) {
    console.error('Lỗi khi Bệnh nhân lấy Hồ sơ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API MỚI: BỆNH NHÂN CẬP NHẬT HỒ SƠ CÁ NHÂN ===
router.put('/my-profile', [authMiddleware], async (req, res) => {
  const patientUserId = req.user.id;
  
  // Lấy thông tin Bệnh nhân được phép sửa
  const { phone, email, gender, date_of_birth, address } = req.body;
  // (Chúng ta không cho phép họ tự sửa Tên (name) qua đây)
  
  if (!phone) {
    return res.status(400).json({ message: 'Số điện thoại là bắt buộc.' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // 1. Lấy patient_id từ user_id
    const [patients] = await connection.execute('SELECT patient_id FROM patients WHERE user_id = ?', [patientUserId]);
    if (patients.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy bệnh nhân.' });
    }
    const patientId = patients[0].patient_id;

    // 2. Cập nhật bảng 'users' (SĐT, Email)
    await connection.execute(
      'UPDATE users SET email = ?, phone = ? WHERE user_id = ?',
      [email, phone, patientUserId]
    );

    // 3. Cập nhật bảng 'patients' (Thông tin cá nhân khác)
    await connection.execute(
      'UPDATE patients SET gender = ?, date_of_birth = ?, address = ? WHERE patient_id = ?',
      [gender, date_of_birth, address, patientId]
    );

    await connection.commit();
    res.json({ message: 'Cập nhật hồ sơ thành công!' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi Bệnh nhân cập nhật Hồ sơ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});
export default router;