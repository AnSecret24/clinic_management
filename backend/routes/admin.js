// File: backend-moi/routes/admin.js
import express from 'express';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

// Import middleware (thay đổi đường dẫn)
import authMiddleware from '../middleware/auth.js';
import adminAuthMiddleware from '../middleware/adminAuth.js';

const router = express.Router();

// === SAO CHÉP CẤU HÌNH VÀO ĐÂY ===
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456', // <-- KIỂM TRA LẠI MẬT KHẨU NÀY
  database: 'clinic_management'
};

// === API LẤY USERS ===
// (Đường dẫn: /users)
router.get('/users', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  // (Code API GET /api/admin/users của bạn)
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(
      `SELECT user_id, username, first_name, last_name, role, status, created_at 
       FROM users ORDER BY created_at DESC`
    );
    await connection.end();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API THÊM BÁC SĨ ===
// (Đường dẫn: /doctors)
router.post('/doctors', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  // (Code API POST /api/admin/doctors của bạn)
  // ...
  const {
    username, password, first_name, last_name, email, phone,
    specialty_id, degree, experience, address
  } = req.body;
  if (!username || !password || !first_name || !specialty_id || !degree) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
  }
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    // ... (Toàn bộ code Transaction của bạn) ...
    const [existingUser] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) { /* ... */ }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password_hash, first_name, last_name, role, phone, email) VALUES (?, ?, ?, ?, \'DOCTOR\', ?, ?)',
      [username, password_hash, first_name, last_name, phone, email]
    );
    const newUserId = userResult.insertId;
    const [specialties] = await connection.execute('SELECT name FROM specialties WHERE specialty_id = ?', [specialty_id]);
    if (specialties.length === 0) { /* ... */ }
    const specialty_name = specialties[0].name;
    await connection.execute(
      `INSERT INTO doctors (user_id, specialty_id, name, degree, specialty_name, experience, address, phone_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newUserId, specialty_id, `${first_name} ${last_name}`, degree, specialty_name, experience, address, phone]
    );
    await connection.commit();
    res.status(201).json({ message: 'Tạo hồ sơ Bác sĩ mới thành công!' });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});

// === API XÓA BÁC SĨ ===
// (Đường dẫn: /doctors/:id)
router.delete('/doctors/:id', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  // (Code API DELETE /api/admin/doctors/:id của bạn)
  // ...
  const { id: doctorId } = req.params; 
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    const [doctors] = await connection.execute('SELECT user_id FROM doctors WHERE doctor_id = ?', [doctorId]);
    if (doctors.length === 0) { /* ... */ }
    const userIdToDelete = doctors[0].user_id;
    await connection.execute('DELETE FROM doctors WHERE doctor_id = ?', [doctorId]);
    await connection.execute('DELETE FROM users WHERE user_id = ?', [userIdToDelete]);
    await connection.commit();
    res.status(200).json({ message: 'Đã xóa Bác sĩ thành công!' });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Không thể xóa. Bác sĩ này đã có lịch hẹn.' });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});

// === API LẤY 1 BÁC SĨ (ĐỂ SỬA) ===
// (Đường dẫn: /doctors/:id)
router.get('/doctors/:id', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  // (Code API GET /api/admin/doctors/:id của bạn)
  // ...
  try {
    const { id: doctorId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    const [doctors] = await connection.execute(
      `SELECT d.*, u.user_id, u.username, u.first_name, u.last_name, u.email, u.phone
       FROM doctors AS d JOIN users AS u ON d.user_id = u.user_id
       WHERE d.doctor_id = ?`,
      [doctorId]
    );
    await connection.end();
    if (doctors.length === 0) { /* ... */ }
    res.json(doctors[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API CẬP NHẬT BÁC SĨ ===
// (Đường dẫn: /doctors/:id)
router.put('/doctors/:id', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  // (Code API PUT /api/admin/doctors/:id của bạn)
  // ...
  const { id: doctorId } = req.params;
  const {
    first_name, last_name, email, phone,
    specialty_id, degree, experience, address
  } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    const [doctors] = await connection.execute('SELECT user_id FROM doctors WHERE doctor_id = ?', [doctorId]);
    const userId = doctors[0].user_id;
    const [specialties] = await connection.execute('SELECT name FROM specialties WHERE specialty_id = ?', [specialty_id]);
    const specialty_name = specialties[0].name;
    await connection.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE user_id = ?',
      [first_name, last_name, email, phone, userId]
    );
    await connection.execute(
      'UPDATE doctors SET specialty_id = ?, specialty_name = ?, name = ?, degree = ?, experience = ?, address = ?, phone_number = ? WHERE doctor_id = ?',
      [specialty_id, specialty_name, `${first_name} ${last_name}`, degree, experience, address, phone, doctorId]
    );
    await connection.commit();
    res.json({ message: 'Cập nhật thông tin Bác sĩ thành công!' });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});
// === API: ADMIN THÊM LỊCH LÀM VIỆC (SLOT) MỚI ===
// (Bảo vệ 2 lớp)
router.post('/schedules', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  // Admin sẽ gửi lên: bác sĩ nào, ngày nào, ca nào (sáng/chiều)
  const { doctor_id, work_date, shift, slots } = req.body;

  // slots là một mảng các khung giờ, VD: ["08:00", "08:30", "09:00"]

  if (!doctor_id || !work_date || !shift || !slots || slots.length === 0) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin (Bác sĩ, Ngày, Ca, Khung giờ).' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    let slotsAdded = 0;

    // Lặp qua từng slot (khung giờ) mà Admin muốn thêm
    for (const slot_start of slots) {
      // Tính giờ kết thúc (giả định mỗi slot là 30 phút)
      const [hours, minutes] = slot_start.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(hours, minutes + 30, 0); // Cộng 30 phút
      const slot_end = endDate.toTimeString().split(' ')[0]; // Lấy HH:MM:SS

      try {
        // Chèn vào CSDL
        await connection.execute(
          `INSERT INTO doctor_schedules (doctor_id, work_date, shift, slot_start, slot_end, status)
           VALUES (?, ?, ?, ?, ?, 'AVAILABLE')`,
          [doctor_id, work_date, shift, slot_start, slot_end]
        );
        slotsAdded++;
      } catch (error) {
        // Lỗi 'uniq_doctor_slot' (lỗi 1062 - Trùng lặp)
        // Nếu slot này đã tồn tại, chúng ta bỏ qua và tiếp tục
        if (error.code !== 'ER_DUP_ENTRY') {
          throw error; // Nếu là lỗi khác, ném ra để rollback
        }
      }
    }

    await connection.commit(); // Lưu
    res.status(201).json({ message: `Đã thêm thành công ${slotsAdded} khung giờ mới.` });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi Admin thêm lịch:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});

// === API: ADMIN XÓA LỊCH LÀM VIỆC (SLOT) ===
// (Bảo vệ 2 lớp)
router.delete('/schedules/:id', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  const { id: schedule_id } = req.params; // Lấy schedule_id

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Chỉ cho phép xóa slot nào CÒN TRỐNG (AVAILABLE)
    // (Nếu slot đã có người đặt (FULL), không cho xóa)
    const [result] = await connection.execute(
      "DELETE FROM doctor_schedules WHERE schedule_id = ? AND status = 'AVAILABLE'",
      [schedule_id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khung giờ này, hoặc khung giờ đã có người đặt.' });
    }

    res.json({ message: 'Đã xóa khung giờ thành công.' });

  } catch (error) {
    console.error('Lỗi khi Admin xóa lịch:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});
// === API: ADMIN THÊM THUỐC MỚI ===
router.post('/medicines', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  // Lấy thông tin từ form
  const { name, unit, unit_price, stock_qty, usage_note } = req.body;

  if (!name || !unit || !unit_price) {
    return res.status(400).json({ message: 'Tên, Đơn vị, và Đơn giá là bắt buộc.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO medicines (name, unit, unit_price, stock_qty, usage_note) VALUES (?, ?, ?, ?, ?)',
      [name, unit, unit_price, stock_qty || 0, usage_note]
    );
    await connection.end();
    res.status(201).json({ message: 'Thêm thuốc mới thành công!' });
  } catch (error) {
    // Lỗi 1062: Trùng tên
    if (error.code === 'ER_DUP_ENTRY') {
       return res.status(409).json({ message: 'Tên thuốc này đã tồn tại.' });
    }
    console.error('Lỗi khi Admin thêm thuốc:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API: ADMIN CẬP NHẬT THUỐC ===
router.put('/medicines/:id', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  const { id: medicineId } = req.params;
  const { name, unit, unit_price, stock_qty, usage_note } = req.body;

  if (!name || !unit || !unit_price) {
    return res.status(400).json({ message: 'Tên, Đơn vị, và Đơn giá là bắt buộc.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE medicines SET name = ?, unit = ?, unit_price = ?, stock_qty = ?, usage_note = ? WHERE medicine_id = ?',
      [name, unit, unit_price, stock_qty, usage_note, medicineId]
    );
    await connection.end();
    res.json({ message: 'Cập nhật thông tin thuốc thành công!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
       return res.status(409).json({ message: 'Tên thuốc này đã tồn tại.' });
    }
    console.error('Lỗi khi Admin cập nhật thuốc:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API: ADMIN XÓA THUỐC ===
router.delete('/medicines/:id', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  const { id: medicineId } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'DELETE FROM medicines WHERE medicine_id = ?',
      [medicineId]
    );
    await connection.end();
    res.json({ message: 'Đã xóa thuốc thành công.' });
  } catch (error) {
    // Lỗi 1451: Thuốc đã được kê đơn (liên quan đến 'prescription_items')
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Không thể xóa. Thuốc này đã được kê trong đơn thuốc.' });
    }
    console.error('Lỗi khi Admin xóa thuốc:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});
// === API: ADMIN LẤY THỐNG KÊ TỔNG QUAN (CẬP NHẬT) ===
router.get('/statistics/summary', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  try {
    // 1. Lấy ngày tháng từ query (VD: ?startDate=...&endDate=...)
    const { startDate, endDate } = req.query;

    // 2. Tạo mệnh đề WHERE (Nếu có ngày)
    // (Chúng ta sẽ lọc dựa trên ngày TẠO)
    let dateFilter = "";
    let params = [];
    if (startDate && endDate) {
      dateFilter = "WHERE created_at BETWEEN ? AND ?";
      params = [startDate, endDate];
    }

    const connection = await mysql.createConnection(dbConfig);

    // 1. Thống kê Doanh thu (Lọc theo ngày hóa đơn được tạo)
    const [revenue] = await connection.execute(
      `SELECT SUM(total_amount) AS totalRevenue FROM invoices 
       WHERE status = 'PAID' ${dateFilter ? `AND created_at BETWEEN ? AND ?` : ''}`,
      (dateFilter ? params : [])
    );

    // 2. Thống kê Bệnh nhân (Lọc theo ngày Bệnh nhân được tạo)
    const [patients] = await connection.execute(
      `SELECT COUNT(patient_id) AS totalPatients FROM patients 
       ${dateFilter ? `WHERE user_id IN (SELECT user_id FROM users WHERE created_at BETWEEN ? AND ?)` : ''}`,
      (dateFilter ? params : [])
    );

    // 3. Thống kê Đơn thuốc (Lọc theo ngày Đơn thuốc được tạo)
    const [prescriptions] = await connection.execute(
      `SELECT COUNT(prescription_id) AS totalPrescriptions FROM prescriptions ${dateFilter}`,
      params
    );

    // 4. Thống kê Lịch hẹn (Lọc theo ngày Lịch hẹn được tạo)
    const [appointments] = await connection.execute(
      `SELECT COUNT(appointment_id) AS totalAppointments FROM appointments 
       WHERE status = 'COMPLETED' ${dateFilter ? `AND created_at BETWEEN ? AND ?` : ''}`,
      (dateFilter ? params : [])
    );

    await connection.end();

    res.json({
      totalRevenue: revenue[0].totalRevenue || 0,
      totalPatients: patients[0].totalPatients || 0,
      totalPrescriptions: prescriptions[0].totalPrescriptions || 0,
      totalAppointments: appointments[0].totalAppointments || 0,
    });

  } catch (error) {
    console.error('Lỗi khi Admin lấy Thống kê:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API: THỐNG KÊ CHUYÊN KHOA (CẬP NHẬT) ===
router.get('/statistics/specialty', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let params = [];
    let dateFilter = "WHERE a.status = 'COMPLETED'";

    if (startDate && endDate) {
      dateFilter += " AND a.schedule_time BETWEEN ? AND ?";
      params = [startDate, endDate];
    }

    const connection = await mysql.createConnection(dbConfig);

    const [specialtyStats] = await connection.execute(
      `SELECT 
         s.name AS specialtyName,
         COUNT(a.appointment_id) AS appointmentCount
       FROM appointments AS a
       JOIN services AS sv ON a.service_id = sv.service_id
       JOIN specialties AS s ON sv.specialty_id = s.specialty_id
       ${dateFilter}
       GROUP BY s.name
       ORDER BY appointmentCount DESC`,
       params
    );

    await connection.end();
    res.json(specialtyStats);

  } catch (error) {
    console.error('Lỗi khi Admin lấy Thống kê Chuyên khoa:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});
// === API: ADMIN LẤY TẤT CẢ NHÂN VIÊN ===
router.get('/staff', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    // JOIN với bảng users để lấy thông tin đầy đủ
    const [staffList] = await connection.execute(
      `SELECT s.staff_id, u.user_id, u.username, u.first_name, u.last_name, u.email, u.phone, u.status
       FROM staffs AS s
       JOIN users AS u ON s.user_id = u.user_id
       WHERE u.role = 'STAFF'`
    );
    await connection.end();
    res.json(staffList);
  } catch (error) {
    console.error('Lỗi khi Admin lấy danh sách Nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API: ADMIN THÊM NHÂN VIÊN MỚI ===
router.post('/staff', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  const { username, password, first_name, last_name, email, phone } = req.body;

  if (!username || !password || !first_name || !phone) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (username, password, tên, SĐT).' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // 1. Kiểm tra username
    const [existingUser] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
    }

    // 2. Băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Tạo User (vai trò 'STAFF')
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password_hash, first_name, last_name, role, phone, email) VALUES (?, ?, ?, ?, \'STAFF\', ?, ?)',
      [username, password_hash, first_name, last_name, phone, email]
    );
    const newUserId = userResult.insertId;

    // 4. Tạo Hồ sơ Staff
    await connection.execute(
      'INSERT INTO staffs (user_id, name, phone_number, address) VALUES (?, ?, ?, ?)',
      [newUserId, `${first_name} ${last_name}`, phone, req.body.address || null]
    );

    await connection.commit();
    res.status(201).json({ message: 'Tạo tài khoản Nhân viên mới thành công!' });

  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
       return res.status(409).json({ message: 'Tên đăng nhập hoặc SĐT đã tồn tại.' });
    }
    console.error('Lỗi khi Admin thêm Nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});

// === API: ADMIN CẬP NHẬT NHÂN VIÊN ===
// (Lưu ý: :id ở đây là staff_id, không phải user_id)
router.put('/staff/:id', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  const { id: staffId } = req.params;
  const { first_name, last_name, email, phone, address } = req.body;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // 1. Lấy user_id từ staff_id
    const [staff] = await connection.execute('SELECT user_id FROM staffs WHERE staff_id = ?', [staffId]);
    if (staff.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }
    const userId = staff[0].user_id;

    // 2. Cập nhật bảng 'users'
    await connection.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE user_id = ?',
      [first_name, last_name, email, phone, userId]
    );

    // 3. Cập nhật bảng 'staffs'
    await connection.execute(
      'UPDATE staffs SET name = ?, phone_number = ?, address = ? WHERE staff_id = ?',
      [`${first_name} ${last_name}`, phone, address, staffId]
    );

    await connection.commit();
    res.json({ message: 'Cập nhật thông tin Nhân viên thành công!' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi Admin cập nhật Nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});

// === API: ADMIN XÓA NHÂN VIÊN ===
// (Lưu ý: :id ở đây là staff_id)
router.delete('/staff/:id', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  const { id: staffId } = req.params;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // 1. Lấy user_id từ staff_id
    const [staff] = await connection.execute('SELECT user_id FROM staffs WHERE staff_id = ?', [staffId]);
    if (staff.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }
    const userIdToDelete = staff[0].user_id;

    // 2. Xóa hồ sơ 'staffs' (bảng con)
    await connection.execute('DELETE FROM staffs WHERE staff_id = ?', [staffId]);

    // 3. Xóa tài khoản 'users' (bảng cha)
    await connection.execute('DELETE FROM users WHERE user_id = ?', [userIdToDelete]);

    await connection.commit();
    res.json({ message: 'Đã xóa Nhân viên thành công!' });

  } catch (error) {
    if (connection) await connection.rollback();
    // Lỗi 1451: Nhân viên đã tạo hóa đơn, lịch hẹn...
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Không thể xóa. Nhân viên này đã có dữ liệu liên quan (hóa đơn, lịch hẹn).' });
    }
    console.error('Lỗi khi Admin xóa Nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});
// === API: ADMIN LẤY THÔNG TIN CỦA 1 USER (ĐỂ SỬA) ===
router.get('/users/:id', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  try {
    const { id: userId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    // Lấy thông tin user
    const [users] = await connection.execute(
      `SELECT user_id, username, first_name, last_name, role, status 
       FROM users 
       WHERE user_id = ?`,
      [userId]
    );
    
    await connection.end();
    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.json(users[0]); // Trả về 1 object user

  } catch (error) {
    console.error('Lỗi khi Admin lấy chi tiết user:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

// === API: ADMIN CẬP NHẬT ROLE/STATUS CỦA USER ===
router.put('/users/:id', [authMiddleware, adminAuthMiddleware], async (req, res) => {
  const { id: userId } = req.params;
  // Admin chỉ được sửa 2 trường này
  const { role, status } = req.body; 

  if (!role || !status) {
    return res.status(400).json({ message: 'Vui lòng cung cấp Role và Status.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(
      'UPDATE users SET role = ?, status = ? WHERE user_id = ?',
      [role, status, userId]
    );
    
    await connection.end();
    res.json({ message: 'Cập nhật thông tin User thành công!' });

  } catch (error) {
    console.error('Lỗi khi Admin cập nhật User:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});
export default router;