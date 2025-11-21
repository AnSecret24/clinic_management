// File: backend-moi/server.js (PHIÊN BẢN MỚI SIÊU GỌN)

import express from 'express';
import cors from 'cors';

// === 1. IMPORT CÁC ROUTER CỦA BẠN ===
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import appointmentRoutes from './routes/appointments.js';
import doctorRoutes from './routes/doctor.js';
import patientRoutes from './routes/patient.js';
import staffRoutes from './routes/staff.js';
// (Không cần import mysql, bcrypt, jwt, hay middleware ở đây nữa)

const app = express();
const port = 3001; 

// --- Middleware chung ---
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json()); 

// --- 2. SỬ DỤNG ROUTER (NHƯ MỤC LỤC) ---

// Nếu URL là '/api/auth/...' -> Dùng file auth.js
app.use('/api/auth', authRoutes);

// Nếu URL là '/api/admin/...' -> Dùng file admin.js
app.use('/api/admin', adminRoutes);

// Nếu URL là '/api/appointments/...' -> Dùng file appointments.js
app.use('/api/appointments', appointmentRoutes);

app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/staff', staffRoutes);

// Nếu URL là '/api/...' (công khai) -> Dùng file public.js
app.use('/api', publicRoutes);

// (Tất cả code API cũ đã bị xóa khỏi đây!)

// --- Chạy server ---
app.listen(port, () => {
  console.log(`✅ Backend server (đã tái cấu trúc) đang chạy tại http://localhost:${port}`);
});