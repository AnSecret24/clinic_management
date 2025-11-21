// File: src/main.jsx (PHIÊN BẢN GỌN GÀNG VÀ DỄ BẢO TRÌ)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import { AuthProvider } from './context/AuthContext.jsx';

// === 1. IMPORTS CỦA CÁC TRANG (CLEANUP) ===
// Layout
import App from './App.jsx';
// Auth
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
// Public
import DoctorList from './pages/public/DoctorList.jsx';
import GioiThieu from './pages/public/GioiThieu.jsx';
import ChuyenKhoa from './pages/public/ChuyenKhoa.jsx';
import DichVu from './pages/public/DichVu.jsx';
import LienHe from './pages/public/LienHe.jsx';
// Patient (Protected)
import DatLichKham from './pages/patient/DatLichKham.jsx';
import MyHistory from './pages/patient/MyHistory.jsx';
import MyInvoices from './pages/patient/MyInvoices.jsx';
import MyProfile from './pages/patient/MyProfile.jsx';
// Admin
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminEditDoctor from './pages/admin/AdminEditDoctor.jsx';
import AdminEditUser from './pages/admin/AdminEditUser.jsx';
import AdminManageDoctors from './pages/admin/AdminManageDoctors.jsx';
import AdminManageMedicines from './pages/admin/AdminManageMedicines.jsx';
import AdminManageSchedules from './pages/admin/AdminManageSchedules.jsx';
import AdminManageStaff from './pages/admin/AdminManageStaff.jsx';
// Doctor
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx';
// Staff
import StaffDashboard from './pages/staff/StaffDashboard.jsx';
import StaffBooking from './pages/staff/StaffBooking.jsx';
import StaffManagePatients from './pages/staff/StaffManagePatients.jsx';
import StaffManageAppointments from './pages/staff/StaffManageAppointments.jsx';

// Components Guard (Giữ nguyên)
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DoctorRoute from './components/DoctorRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import StaffRoute from './components/StaffRoute.jsx';
import HomePage from './pages/public/HomePage.jsx';


// === 2. ĐỊNH NGHĨA CÁC MẢNG ROUTE (ROUTE ARRAYS) ===

const publicRoutes = [
    // Trang chủ
    { path: "/", element: <HomePage /> }, 
    // Auth
    { path: "/dang-ky", element: <RegisterPage /> },
    { path: "/dang-nhap", element: <LoginPage /> },
    // Công khai
    { path: "/gioi-thieu", element: <GioiThieu /> },
    { path: "/chuyen-khoa", element: <ChuyenKhoa /> },
    { path: "/bac-si", element: <DoctorList /> },
    { path: "/dich-vu", element: <DichVu /> },
    { path: "/lien-he", element: <LienHe /> },
];

const patientRoutes = [
    // Bệnh nhân (Được bảo vệ)
    { path: "/dat-lich-kham", element: <DatLichKham /> },
    { path: "/lich-su-kham", element: <MyHistory /> },
    { path: "/hoa-don-cua-toi", element: <MyInvoices /> },
    { path: "/ho-so-cua-toi", element: <MyProfile /> },
];

const doctorRoutes = [
    // Bác sĩ (Được bảo vệ bởi DoctorRoute)
    { path: "/bac-si/bang-dieu-khien", element: <DoctorDashboard /> },
];

const staffRoutes = [
    // Nhân viên (Được bảo vệ bởi StaffRoute)
    { path: "/staff/dashboard", element: <StaffDashboard /> },
    { path: "/staff/booking", element: <StaffBooking /> },
    { path: "/staff/patients", element: <StaffManagePatients /> },
    { path: "/staff/appointments", element: <StaffManageAppointments /> },
];

const adminRoutes = [
    // Admin (Được bảo vệ bởi AdminRoute)
    { path: "/admin/dashboard", element: <AdminDashboard /> },
    { path: "/admin/analytics", element: <AdminAnalytics /> },
    { path: "/admin/doctors", element: <AdminManageDoctors /> },
    { path: "/admin/doctors/edit/:id", element: <AdminEditDoctor /> },
    { path: "/admin/schedules", element: <AdminManageSchedules /> },
    { path: "/admin/medicines", element: <AdminManageMedicines /> },
    { path: "/admin/staff", element: <AdminManageStaff /> },
    { path: "/admin/users/edit/:id", element: <AdminEditUser /> },
];


// === 3. TẠO ROUTER CUỐI CÙNG VỚI BẢO VỆ ===

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />, 
        children: [
            // Spread các mảng Public/Auth
            ...publicRoutes,
            
            // Bảo vệ các trang Patient
            ...patientRoutes.map(route => ({
                ...route,
                element: <ProtectedRoute>{route.element}</ProtectedRoute>
            })),
            
            // Bảo vệ các trang Doctor
            ...doctorRoutes.map(route => ({
                ...route,
                element: <DoctorRoute>{route.element}</DoctorRoute>
            })),
            
            // Bảo vệ các trang Staff
            ...staffRoutes.map(route => ({
                ...route,
                element: <StaffRoute>{route.element}</StaffRoute>
            })),
            
            // Bảo vệ các trang Admin
            ...adminRoutes.map(route => ({
                ...route,
                element: <AdminRoute>{route.element}</AdminRoute>
            })),
        ]
    }
]);


// === 4. PHẦN RENDER ===
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);