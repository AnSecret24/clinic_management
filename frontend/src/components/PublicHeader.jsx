import React from 'react';
import { NavLink } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

const linkCls = "text-sm hover:text-blue-700 transition font-medium";
const activeCls = "text-blue-700 font-bold";

export default function PublicHeader({ children, navSlot }) {
  return (
    <>

      {/* 2. Main Navigation (Logo và Menu Chính) */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Stethoscope size={20} />
            </div>
            <span className="font-bold text-blue-700 text-lg">
              PHÒNG KHÁM TƯ NHÂN TÂM AN
            </span>
          </NavLink>

          {/* Menu Quảng Cáo (Dành cho Khách) */}
          {navSlot ? (
            <div className="hidden md:flex space-x-6">{navSlot}</div>
          ) : (
          <div className="hidden md:flex space-x-6">
            <NavLink to="/gioi-thieu" className={({isActive}) => `${linkCls} ${isActive ? activeCls : ""}`}>
              Giới Thiệu
            </NavLink>
            <NavLink to="/chuyen-khoa" className={({isActive}) => `${linkCls} ${isActive ? activeCls : ""}`}>
              Chuyên Khoa
            </NavLink>
            <NavLink to="/bac-si" className={({isActive}) => `${linkCls} ${isActive ? activeCls : ""}`}>
              Chuyên Gia - Bác Sĩ
            </NavLink>
            <NavLink to="/dich-vu" className={({isActive}) => `${linkCls} ${isActive ? activeCls : ""}`}>
              Dịch Vụ
            </NavLink>
            <NavLink to="/lien-he" className={({isActive}) => `${linkCls} ${isActive ? activeCls : ""}`}>
              Liên Hệ
            </NavLink>
          </div>
          )}
          {/* Action Slot (Để chèn nút Đăng ký/Đăng nhập nếu cần) */}
          {children}
          
        </div>
      </nav>
    </>
  );
}