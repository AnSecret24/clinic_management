import { useState, useContext, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { ChevronDown } from 'lucide-react';

const linkCls = "text-sm px-0 hover:text-blue-700 transition";
const activeCls = "text-blue-700 font-semibold";
const dropdownLinkCls = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";
// === COMPONENT DROPDOWN (Copy từ bước trước) ===
function AdminManagementDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút bấm "Quản lý" */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${linkCls} flex items-center gap-1`}
      >
        Quản lý
        <ChevronDown size={16} />
      </button>

      {/* Menu thả xuống */}
      {isOpen && (
        <div 
          className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          onClick={() => setIsOpen(false)} // Tự động đóng khi nhấn vào 1 link
        >
          <div className="py-1">
            <NavLink to="/admin/dashboard" className={({isActive}) => `${dropdownLinkCls} ${isActive?activeCls:""}`}>
              Quản lý User
            </NavLink>
            <NavLink to="/admin/staff" className={({isActive}) => `${dropdownLinkCls} ${isActive?activeCls:""}`}>
              Quản lý Nhân viên
            </NavLink>
            <NavLink to="/admin/doctors" className={({isActive}) => `${dropdownLinkCls} ${isActive?activeCls:""}`}>
              Quản lý Bác sĩ
            </NavLink>
            <NavLink to="/staff/patients" className={({isActive}) => `${dropdownLinkCls} ${isActive?activeCls:""}`}>
              Quản lý Bệnh nhân
            </NavLink>
            <NavLink to="/admin/schedules" className={({isActive}) => `${dropdownLinkCls} ${isActive?activeCls:""}`}>
              Quản lý Lịch
            </NavLink>
            <NavLink to="/admin/medicines" className={({isActive}) => `${dropdownLinkCls} ${isActive?activeCls:""}`}>
              Quản lý Thuốc
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InternalHeader() {
  const { user } = useContext(AuthContext); // Chỉ cần user để hiển thị menu

  // Dựa vào vai trò của user để hiển thị menu quản lý phù hợp
  const getNavLinks = () => {
    if (!user) return []; // Không có user thì không hiển thị menu này
    
    switch (user.role) {
      case 'ADMIN':
        return [         
          { component: AdminManagementDropdown }, // <-- Đây là Dropdown
          { to: "/admin/analytics", label: "Thống kê"},
        ];
      case 'DOCTOR':
        return [
          { to: "/bac-si/bang-dieu-khien", label: "Bảng điều khiển" },
        ];
      case 'STAFF':
        return [
          { to: "/staff/booking", label: "Đặt lịch tại quầy" },
          { to: "/staff/appointments", label: "Quản lý Lịch hẹn" },
          { to: "/staff/patients", label: "Quản lý Bệnh nhân" },
          { to: "/staff/dashboard", label: "Thanh toán Hóa đơn" },
        ];
      case 'PATIENT':
        return [
          { to: "/ho-so-cua-toi", label: "Hồ sơ của tôi" },
          { to: "/dat-lich-kham", label: "Đặt Lịch Khám Bệnh" },
          { to: "/lich-su-kham", label: "Lịch sử khám" },
          { to: "/hoa-don-cua-toi", label: "Hóa đơn của tôi" },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="hidden md:flex items-center gap-6">
      {/* 4. CẬP NHẬT LOGIC RENDER */}
      {navLinks.map((link, index) => {
        // Nếu link là một component (như Dropdown)
        if (link.component) {
          const Component = link.component;
          return <Component key={index} />;
        }
        // Nếu link là NavLink (như bình thường)
        return (
          <NavLink 
            key={link.to} 
            to={link.to} 
            className={({isActive}) => `${linkCls} ${isActive ? activeCls : ""}`}
          >
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  );
}