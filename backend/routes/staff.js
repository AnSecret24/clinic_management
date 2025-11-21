// File: backend-moi/routes/staff.js

import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
// Import middleware (Nhân viên HOẶC Admin đều được)
import staffAuthMiddleware from '../middleware/staffAuth.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// === SAO CHÉP CẤU HÌNH VÀO ĐÂY ===
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456', // <-- KIỂM TRA LẠI MẬT KHẨU NÀY
  database: 'clinic_management'
};

// === API MỚI: NHÂN VIÊN ĐẶT LỊCH (OFFLINE) ===
// (Bảo vệ: Staff/Admin)
router.post('/appointments', [authMiddleware, staffAuthMiddleware], async (req, res) => {
  // Nhân viên sẽ gửi lên ID bệnh nhân (sau khi tìm kiếm)
  const { patient_id, doctor_id, service_id, schedule_time, type, note } = req.body;
  const staffUserId = req.user.id; // user_id của Nhân viên/Admin

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction(); 

    // === BƯỚC 1: Lấy giá dịch vụ (Tiền khám) ===
    const [services] = await connection.execute('SELECT price FROM services WHERE service_id = ?', [service_id]);
    if (services.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Dịch vụ này không tồn tại.' });
    }
    const servicePrice = Number(services[0].price || 0);

    // === BƯỚC 2: Cập nhật slot thành 'FULL' ===
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

    // === BƯỚC 3: Tạo Lịch hẹn (appointments) ===
    const [apptResult] = await connection.execute(
      `INSERT INTO appointments (patient_id, doctor_id, service_id, schedule_time, type, status, created_by, note) 
       VALUES (?, ?, ?, ?, ?, 'REQUESTED', ?, ?)`,
      // created_by = Nhân viên
      [patient_id, doctor_id, service_id, schedule_time, type, staffUserId, note]
    );
    const newAppointmentId = apptResult.insertId;

    // === BƯỚC 4 (Quan trọng): Tạo Hóa đơn (invoices) ===
    await connection.execute(
      `INSERT INTO invoices (appointment_id, patient_id, created_by, total_amount, payment_method, status)
       VALUES (?, ?, ?, ?, 'OFFLINE', 'UNPAID')`,
      [
        newAppointmentId,
        patient_id,
        staffUserId,       // Người tạo hóa đơn là Nhân viên
        servicePrice,
        // payment_method = 'OFFLINE' (Vì đây là Nhân viên đặt tại quầy)
        // status = 'UNPAID'
      ]
    );

    // === THÀNH CÔNG ===
    await connection.commit();
    res.status(201).json({ message: 'Đặt lịch (Offline) thành công! Hóa đơn đã được tạo.' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi Nhân viên đặt lịch (Offline):', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});

// === API 1: NHÂN VIÊN TÌM HÓA ĐƠN CHƯA THANH TOÁN ===
// (Bảo vệ: Staff/Admin)
router.get('/invoices/unpaid', [authMiddleware, staffAuthMiddleware], async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Lấy tất cả hóa đơn 'UNPAID' và JOIN để lấy tên Bệnh nhân
    const [invoices] = await connection.execute(
      `SELECT 
         i.invoice_id, 
         i.total_amount, 
         i.status, 
         i.created_at,
         p.name AS patient_name,
         a.schedule_time
       FROM invoices AS i
       JOIN patients AS p ON i.patient_id = p.patient_id
       JOIN appointments AS a ON i.appointment_id = a.appointment_id
       WHERE i.status = 'UNPAID'
       ORDER BY i.created_at DESC`
    );

    await connection.end();
    res.json(invoices);

  } catch (error) {
    console.error('Lỗi khi Nhân viên lấy hóa đơn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API 2: NHÂN VIÊN XÁC NHẬN THANH TOÁN (OFFLINE) ===
// (Bảo vệ: Staff/Admin)
router.put('/invoices/pay/:id', [authMiddleware, staffAuthMiddleware], async (req, res) => {
  const { id: invoiceId } = req.params;
  const staffUserId = req.user.id; // Lấy user_id của Nhân viên/Admin đã nhấn nút

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Cập nhật hóa đơn: 
    // 1. Đổi status -> 'PAID'
    // 2. Ghi nhận người xác nhận (created_by = staff_id)
    // 3. Đổi payment_method -> 'OFFLINE'
    const [result] = await connection.execute(
      "UPDATE invoices SET status = 'PAID', created_by = ?, payment_method = 'OFFLINE' WHERE invoice_id = ? AND status = 'UNPAID'",
      [staffUserId, invoiceId]
    );

    // (Chúng ta có thể tạo 1 dòng trong bảng 'payments' ở đây nếu cần)

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn chưa thanh toán này.' });
    }

    res.json({ message: 'Đã xác nhận thanh toán thành công!' });

  } catch (error) {
    console.error('Lỗi khi Nhân viên xác nhận thanh toán:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API MỚI: NHÂN VIÊN TÌM KIẾM BỆNH NHÂN ===
// (Bảo vệ: Staff/Admin)
// (Dùng query string, VD: /api/staff/patients/search?term=tranvanc)
router.get('/patients/search', [authMiddleware, staffAuthMiddleware], async (req, res) => {
  // 'term' (từ) có thể là Tên, SĐT, hoặc username
  const { term } = req.query; 

  if (!term || term.length < 2) {
    return res.status(400).json({ message: 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.' });
  }

  const searchTerm = `%${term}%`; // Thêm % để tìm kiếm (LIKE)

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Tìm kiếm trong cả 3 bảng: patients (tên), users (username), users (phone)
    const [patients] = await connection.execute(
      `SELECT 
         p.patient_id, 
         p.name, 
         u.username, 
         u.phone, 
         u.email
       FROM patients AS p
       JOIN users AS u ON p.user_id = u.user_id
       WHERE p.name LIKE ? OR u.username LIKE ? OR u.phone LIKE ?
       LIMIT 10`, // Giới hạn 10 kết quả
      [searchTerm, searchTerm, searchTerm]
    );

    await connection.end();
    res.json(patients); // Trả về mảng bệnh nhân tìm thấy

  } catch (error) {
    console.error('Lỗi khi Nhân viên tìm Bệnh nhân:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API MỚI: NHÂN VIÊN TẠO HỒ SƠ BỆNH NHÂN MỚI (CHO KHÁCH) ===
// (Bảo vệ: Staff/Admin)
router.post('/patients', [authMiddleware, staffAuthMiddleware], async (req, res) => {
  // 1. Lấy thông tin cơ bản của Bệnh nhân từ form
  const { name, phone, email, gender, date_of_birth, address } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Tên và Số điện thoại là bắt buộc.' });
  }

  // Logic: Dùng SĐT làm username, và mật khẩu mặc định là '123456'
  const username = phone; 
  const password = '123456'; 
  
  // Tách tên
  const names = name.trim().split(' ');
  const first_name = names[0] || '';
  const last_name = names.slice(1).join(' ') || '';

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // --- BƯỚC A: TẠO TÀI KHOẢN (BẢNG USERS) ---
    // A1. Kiểm tra SĐT (username) đã tồn tại chưa
    const [existingUser] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'Số điện thoại này đã được đăng ký tài khoản.' });
    }

    // A2. Băm mật khẩu ('123456')
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // A3. INSERT vào 'users' với vai trò PATIENT
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password_hash, first_name, last_name, role, phone, email) VALUES (?, ?, ?, ?, \'PATIENT\', ?, ?)',
      [username, password_hash, first_name, last_name, phone, email]
    );
    const newUserId = userResult.insertId;

    // --- BƯỚC B: TẠO HỒ SƠ BỆNH NHÂN (BẢNG PATIENTS) ---
    const [patientResult] = await connection.execute(
      'INSERT INTO patients (user_id, name, gender, date_of_birth, address) VALUES (?, ?, ?, ?, ?)',
      [newUserId, name, gender, date_of_birth, address]
    );
    const newPatientId = patientResult.insertId;

    // === THÀNH CÔNG ===
    await connection.commit();
    
    // Trả về thông tin Bệnh nhân vừa tạo (để frontend tự động chọn luôn)
    res.status(201).json({
      message: 'Tạo hồ sơ bệnh nhân mới thành công!',
      patient: {
        patient_id: newPatientId,
        user_id: newUserId,
        name: name,
        phone: phone,
        email: email,
        username: username
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    // Lỗi 1062: Trùng lặp (có thể SĐT đã tồn tại)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Số điện thoại hoặc Tên đăng nhập này đã tồn tại.' });
    }
    console.error('Lỗi khi Nhân viên tạo Bệnh nhân:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});
// === API MỚI: NHÂN VIÊN LẤY DANH SÁCH TẤT CẢ BỆNH NHÂN ===
// (Bảo vệ: Staff/Admin)
router.get('/patients', [authMiddleware, staffAuthMiddleware], async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Lấy tất cả bệnh nhân và thông tin user liên quan
    const [patients] = await connection.execute(
      `SELECT 
         p.patient_id, p.name, p.gender, p.date_of_birth, p.address,
         u.user_id, u.username, u.phone, u.email, u.status
       FROM patients AS p
       JOIN users AS u ON p.user_id = u.user_id
       ORDER BY p.name ASC`
    );

    await connection.end();
    res.json(patients);

  } catch (error) {
    console.error('Lỗi khi Nhân viên lấy danh sách Bệnh nhân:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API MỚI: NHÂN VIÊN CẬP NHẬT THÔNG TIN BỆNH NHÂN ===
// (Bảo vệ: Staff/Admin)
// (Lưu ý: :id ở đây là patient_id)
router.put('/patients/:id', [authMiddleware, staffAuthMiddleware], async (req, res) => {
  const { id: patientId } = req.params;

  // Thông tin cho phép sửa (từ bảng patients và users)
  const { name, phone, email, gender, date_of_birth, address } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Tên và Số điện thoại là bắt buộc.' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // 1. Lấy user_id từ patient_id
    const [patients] = await connection.execute('SELECT user_id FROM patients WHERE patient_id = ?', [patientId]);
    if (patients.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy bệnh nhân.' });
    }
    const userId = patients[0].user_id;

    // Tách tên (vì 'users' lưu riêng first/last)
    const names = name.trim().split(' ');
    const first_name = names[0] || '';
    const last_name = names.slice(1).join(' ') || '';

    // 2. Cập nhật bảng 'users'
    await connection.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE user_id = ?',
      [first_name, last_name, email, phone, userId]
    );

    // 3. Cập nhật bảng 'patients'
    await connection.execute(
      'UPDATE patients SET name = ?, gender = ?, date_of_birth = ?, address = ? WHERE patient_id = ?',
      [name, gender, date_of_birth, address, patientId]
    );

    await connection.commit();
    res.json({ message: 'Cập nhật thông tin Bệnh nhân thành công!' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi Nhân viên cập nhật Bệnh nhân:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});
// === API MỚI: NHÂN VIÊN LẤY TẤT CẢ LỊCH HẸN (ĐỂ QUẢN LÝ) ===
router.get('/appointments/all', [authMiddleware, staffAuthMiddleware], async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Lấy 100 lịch hẹn gần nhất (JOIN để lấy tên)
    const [appointments] = await connection.execute(
      `SELECT 
         a.appointment_id, 
         a.schedule_time, 
         a.status,
         p.name AS patient_name,
         d.name AS doctor_name,
         s.name AS service_name
       FROM appointments AS a
       LEFT JOIN patients AS p ON a.patient_id = p.patient_id
       LEFT JOIN doctors AS d ON a.doctor_id = d.doctor_id
       LEFT JOIN services AS s ON a.service_id = s.service_id
       ORDER BY a.schedule_time DESC
       LIMIT 100`
    );
    
    await connection.end();
    res.json(appointments);

  } catch (error) {
    console.error('Lỗi khi Nhân viên lấy tất cả Lịch hẹn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API MỚI: NHÂN VIÊN HỦY LỊCH HẸN ===
router.put('/appointments/cancel/:id', [authMiddleware, staffAuthMiddleware], async (req, res) => {
  const { id: appointmentId } = req.params;
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // 1. Lấy thông tin lịch hẹn (để biết slot nào cần trả lại)
    const [appts] = await connection.execute(
      "SELECT doctor_id, status, DATE(schedule_time) AS work_date, TIME(schedule_time) AS slot_start FROM appointments WHERE appointment_id = ?",
      [appointmentId]
    );
    if (appts.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn.' });
    }
    const appt = appts[0];

    // 2. Chỉ cho phép hủy lịch 'REQUESTED'
    if (appt.status !== 'REQUESTED') {
      await connection.rollback();
      return res.status(400).json({ message: `Lịch hẹn này đã ${appt.status} và không thể hủy.` });
    }

    // 3. Cập nhật lịch hẹn -> 'CANCELLED'
    await connection.execute(
      "UPDATE appointments SET status = 'CANCELLED' WHERE appointment_id = ?",
      [appointmentId]
    );

    // 4. TRẢ LẠI SLOT: Cập nhật doctor_schedules -> 'AVAILABLE'
    // (Chỉ trả lại slot nếu nó đang 'FULL')
    await connection.execute(
      `UPDATE doctor_schedules 
       SET status = 'AVAILABLE' 
       WHERE doctor_id = ? AND work_date = ? AND slot_start = ? AND status = 'FULL'`,
      [appt.doctor_id, appt.work_date, appt.slot_start]
    );

    // 5. HỦY HÓA ĐƠN: Cập nhật invoices -> 'CANCELLED' (chỉ hủy hóa đơn UNPAID)
    await connection.execute(
      "UPDATE invoices SET status = 'CANCELLED' WHERE appointment_id = ? AND status = 'UNPAID'",
      [appointmentId]
    );
    
    await connection.commit();
    res.json({ message: 'Đã hủy lịch hẹn thành công! Slot đã được trả lại.' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi Nhân viên Hủy Lịch hẹn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});
// === API MỚI: NHÂN VIÊN SỬA/ĐỔI LỊCH HẸN (RESCHEDULE) ===
router.put('/appointments/reschedule/:id', [authMiddleware, staffAuthMiddleware], async (req, res) => {
  const { id: appointmentId } = req.params; // ID của lịch hẹn CŨ

  // Thông tin lịch hẹn MỚI
  const {
    doctor_id,   // ID Bác sĩ MỚI
    schedule_time, // Giờ MỚI (YYYY-MM-DD HH:MM:SS)
    note         // Ghi chú MỚI (nếu có)
  } = req.body;

  // (Chúng ta giả định Dịch vụ (service_id) và Bệnh nhân (patient_id) không đổi)

  if (!doctor_id || !schedule_time) {
    return res.status(400).json({ message: 'Vui lòng chọn Bác sĩ và Khung giờ mới.' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // --- BƯỚC A: LẤY LỊCH HẸN CŨ (ĐỂ HỦY SLOT) ---
    const [appts] = await connection.execute(
      "SELECT doctor_id, DATE(schedule_time) AS work_date, TIME(schedule_time) AS slot_start, status FROM appointments WHERE appointment_id = ?",
      [appointmentId]
    );
    if (appts.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn.' });
    }
    const oldAppt = appts[0];

    // Chỉ cho phép sửa lịch 'REQUESTED'
    if (oldAppt.status !== 'REQUESTED') {
      await connection.rollback();
      return res.status(400).json({ message: `Lịch hẹn này đã ${oldAppt.status} và không thể sửa.` });
    }

    // --- BƯỚC B: HỦY SLOT CŨ (TRẢ LẠI 'AVAILABLE') ---
    await connection.execute(
      `UPDATE doctor_schedules 
       SET status = 'AVAILABLE' 
       WHERE doctor_id = ? AND work_date = ? AND slot_start = ? AND status = 'FULL'`,
      [oldAppt.doctor_id, oldAppt.work_date, oldAppt.slot_start]
    );

    // --- BƯỚC C: ĐẶT SLOT MỚI (CHUYỂN SANG 'FULL') ---
    const new_work_date = schedule_time.split(' ')[0];
    const new_slot_start = schedule_time.split(' ')[1];

    const [updateResult] = await connection.execute(
      `UPDATE doctor_schedules 
       SET status = 'FULL' 
       WHERE doctor_id = ? AND work_date = ? AND slot_start = ? AND status = 'AVAILABLE'`,
      [doctor_id, new_work_date, new_slot_start]
    );

    // Kiểm tra xem có update được không (nếu không = slot mới không trống)
    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'Lỗi: Khung giờ MỚI này không còn trống hoặc không tồn tại.' });
    }

    // --- BƯỚC D: CẬP NHẬT LỊCH HẸN (appointments) ---
    await connection.execute(
      "UPDATE appointments SET doctor_id = ?, schedule_time = ?, note = ? WHERE appointment_id = ?",
      [doctor_id, schedule_time, note, appointmentId]
    );

    // (Chúng ta bỏ qua Hóa đơn, vì giả định tiền khám không đổi)

    await connection.commit();
    res.json({ message: 'Đã đổi lịch hẹn thành công!' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi Nhân viên Đổi Lịch hẹn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});
export default router;