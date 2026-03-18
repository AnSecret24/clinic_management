# 🏥 Hệ Thống Quản Lý Phòng Khám Tư Nhân Tâm An

## 📌 Giới thiệu

Hệ thống quản lý phòng khám được xây dựng nhằm số hóa quy trình quản lý tại các phòng khám quy mô vừa và nhỏ.
Ứng dụng hỗ trợ quản lý bệnh nhân, bác sĩ, lịch khám và thanh toán, giúp tối ưu hóa quy trình vận hành và nâng cao hiệu quả quản lý.

---

## 🧠 Kiến trúc hệ thống

* Mô hình: Client - Server
* Giao tiếp: RESTful API

```
Frontend (ReactJS) → Backend (Node.js/Express) → Database (MySQL)
```

---

## 🚀 Công nghệ sử dụng

### 🔹 Frontend

* ReactJS (Vite)
* TailwindCSS
* Axios
* React Router DOM
* Chart.js

### 🔹 Backend

* Node.js
* Express.js
* JWT (Authentication)
* bcrypt (mã hóa mật khẩu)

### 🔹 Database

* MySQL

---

## ✨ Tính năng chính

### 👤 1. Bệnh nhân

* Đăng ký / Đăng nhập
* Đặt lịch khám theo bác sĩ và khung giờ
* Xem lịch sử khám bệnh
* Xem đơn thuốc
* Thanh toán hóa đơn (mô phỏng VNPAY/MoMo)

---

### 👨‍⚕️ 2. Bác sĩ

* Quản lý lịch hẹn trong ngày
* Tạo hồ sơ khám bệnh
* Chẩn đoán và kê đơn thuốc
* Xem lịch làm việc cá nhân

---

### 🧑‍💼 3. Nhân viên (Lễ tân)

* Tiếp nhận bệnh nhân tại quầy
* Đặt lịch khám trực tiếp
* Quản lý thông tin bệnh nhân
* Tạo hóa đơn và xác nhận thanh toán

---

### 🛠 4. Quản trị viên (Admin)

* Quản lý người dùng (Bệnh nhân, Bác sĩ, Nhân viên)
* Quản lý thuốc và dịch vụ y tế
* Thống kê doanh thu và số lượng bệnh nhân
* Hiển thị báo cáo bằng biểu đồ

---

## 🔐 Bảo mật & Phân quyền

* Xác thực bằng JWT
* Mã hóa mật khẩu với bcrypt
* Phân quyền người dùng (RBAC)

---

## ⚙️ Hướng dẫn cài đặt

### 🔧 Yêu cầu hệ thống

* Node.js >= 14
* MySQL >= 8.0

---

### 📥 1. Clone project

```bash
git clone https://github.com/AnSecret24/clinic_management.git
cd clinic_management
```

---

### 🔙 2. Cài đặt Backend

```bash
cd backend
npm install
```

👉 Tạo file `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=phong_kham_taman
JWT_SECRET=your_secret_key
```

👉 Import database (nếu có file `.sql`)

👉 Chạy backend:

```bash
npm start
```

---

### 🔜 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
npm run dev
```

👉 Truy cập: http://localhost:5173

---

## 📊 Cơ sở dữ liệu

* Thiết kế theo chuẩn 3NF
* Tối ưu cho quản lý quan hệ giữa:

  * Bệnh nhân
  * Bác sĩ
  * Lịch khám
  * Hóa đơn

---

## 📸 Demo
<img width="986" height="957" alt="image" src="https://github.com/user-attachments/assets/fb27521c-da42-4a07-a98c-34de988b3698" />

<img width="986" height="808" alt="image" src="https://github.com/user-attachments/assets/82fa0b16-b70a-4a82-bf15-ffd063642e47" />

<img width="986" height="395" alt="image" src="https://github.com/user-attachments/assets/fc771834-9f30-495e-9a56-dafa23260836" />

<img width="936" height="1076" alt="image" src="https://github.com/user-attachments/assets/be00703b-24f9-4e7e-9438-0a8028d73fd5" />

<img width="986" height="396" alt="image" src="https://github.com/user-attachments/assets/c0abf371-51b8-4279-9613-fe09b93e73f6" />

<img width="986" height="482" alt="image" src="https://github.com/user-attachments/assets/a7775871-db05-4a2e-b951-1833e8d47f5b" />

---

## 👨‍💻 Tác giả

* Đinh Thị Thảo An

