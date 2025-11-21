// File: backend-moi/routes/doctor.js
// (ĐÃ SỬA LẠI THEO ĐÚNG LOGIC MỚI: HÓA ĐƠN TIỀN THUỐC RIÊNG BIỆT)

import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs'; // Thêm import này (API Thêm Bác sĩ cần)

// Import middleware
import authMiddleware from '../middleware/auth.js';
import doctorAuthMiddleware from '../middleware/doctorAuth.js';

const router = express.Router();

// === SAO CHÉP CẤU HÌNH VÀO ĐÂY ===
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456', // <-- KIỂM TRA LẠI MẬT KHẨU NÀY
  database: 'clinic_management'
};

// === API: BÁC SĨ LẤY LỊCH HẸN CỦA MÌNH ===
// (Phần này giữ nguyên, không sai)
router.get('/appointments/me', [authMiddleware, doctorAuthMiddleware], async (req, res) => {
  try {
    const doctorUserId = req.user.id;
    const connection = await mysql.createConnection(dbConfig);

    const [doctors] = await connection.execute('SELECT doctor_id FROM doctors WHERE user_id = ?', [doctorUserId]);
    if (doctors.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Không tìm thấy thông tin bác sĩ.' });
    }
    const doctorId = doctors[0].doctor_id;

    const [appointments] = await connection.execute(
      "SELECT a.*, p.name AS patient_name, s.name AS service_name FROM appointments AS a JOIN patients AS p ON a.patient_id = p.patient_id JOIN services AS s ON a.service_id = s.service_id WHERE a.doctor_id = ? AND a.status = 'REQUESTED' ORDER BY a.schedule_time ASC",
      [doctorId]
    );
    await connection.end();
    res.json(appointments);
  } catch (error) {
    console.error('Lỗi khi lấy lịch hẹn của bác sĩ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});


// === API: BÁC SĨ HOÀN THÀNH KHÁM (ĐÃ SỬA LOGIC HÓA ĐƠN) ===
router.post('/complete-exam/:appointmentId', [authMiddleware, doctorAuthMiddleware], async (req, res) => {
  const { appointmentId } = req.params;
  const {
    symptoms, diagnosis, treatment, prescriptionItems 
  } = req.body;
  const doctorUserId = req.user.id;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // --- BƯỚC A: Lấy thông tin cần thiết --- (Giữ nguyên)
    const [doctors] = await connection.execute('SELECT doctor_id FROM doctors WHERE user_id = ?', [doctorUserId]);
    const doctorId = doctors[0].doctor_id;

    const [appts] = await connection.execute('SELECT patient_id FROM appointments WHERE appointment_id = ?', [appointmentId]);
    const patientId = appts[0].patient_id;

    // --- BƯỚC B: TẠO HỒ SƠ BỆNH ÁN (medical_records) --- (Giữ nguyên)
    await connection.execute(
  "INSERT INTO medical_records (appointment_id, patient_id, doctor_id, symptoms, diagnosis, treatment) VALUES (?, ?, ?, ?, ?, ?)",
  [appointmentId, patientId, doctorId, symptoms, diagnosis, treatment]
);

    // --- BƯỚC C: TÍNH TIỀN THUỐC VÀ TẠO ĐƠN THUỐC --- (Giữ nguyên)
    let total_medicine_cost = 0; 
    if (prescriptionItems && prescriptionItems.length > 0) {
      const [prescriptionResult] = await connection.execute(
        `INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, note) VALUES (?, ?, ?, ?)`,
        [appointmentId, patientId, doctorId, 'Đơn thuốc theo chỉ định Bác sĩ']
      );
      const newPrescriptionId = prescriptionResult.insertId;

      for (const item of prescriptionItems) {
        await connection.execute(
          "INSERT INTO prescription_items (prescription_id, medicine_id, quantity, dosage, duration, note) VALUES (?, ?, ?, ?, ?, ?)", // <== ĐÃ SỬA
          [newPrescriptionId, item.medicine_id, item.quantity, item.dosage, item.duration, item.note]
        );
        const [meds] = await connection.execute('SELECT unit_price FROM medicines WHERE medicine_id = ?', [item.medicine_id]);
        const med_price = Number(meds[0].unit_price || 0);
        total_medicine_cost += (med_price * Number(item.quantity));
      }
    }

    // --- BƯỚC D (ĐÃ SỬA): TẠO HÓA ĐƠN TIỀN THUỐC MỚI (NẾU CÓ) ---
    // (Thay vì CẬP NHẬT, chúng ta TẠO MỚI hóa đơn tiền thuốc)
    if (total_medicine_cost > 0) {
      await connection.execute(
        "INSERT INTO invoices (appointment_id, patient_id, created_by, total_amount, payment_method, status) VALUES (?, ?, ?, ?, 'OFFLINE', 'UNPAID')", // <== ĐÃ SỬA
        [
          appointmentId,
          patientId, 
          doctorUserId, 
          total_medicine_cost, // Chỉ tiền thuốc
          // 'OFFLINE' & 'UNPAID' (Vì tiền thuốc trả tại quầy)
        ]
      );
    }

    // --- BƯỚC E: CẬP NHẬT LỊCH HẸN THÀNH 'COMPLETED' --- (Giữ nguyên)
    await connection.execute(
      "UPDATE appointments SET status = 'COMPLETED' WHERE appointment_id = ?",
      [appointmentId]
    );

    // === THÀNH CÔNG ===
    await connection.commit();
    res.json({ message: 'Hoàn thành khám và đã tạo hóa đơn tiền thuốc (nếu có)!' }); // Sửa lại thông báo

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Lỗi khi hoàn thành khám:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  } finally {
    if (connection) await connection.end();
  }
});

export default router;