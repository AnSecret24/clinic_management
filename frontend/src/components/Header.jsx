import { useContext } from "react";
import { Stethoscope } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import PublicHeader from "./PublicHeader"; // Import header quảng cáo
import InternalHeader from "./InternalHeader"; // Import header quản lý

const linkCls = "text-sm hover:text-blue-700 transition font-medium"; // Lấy lại class từ PublicHeader
const activeCls = "text-blue-700 font-bold";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // User đã đăng nhập và không phải là Khách/Bệnh nhân => Hiển thị header quản lý (Nội bộ)
  const isInternalUser = user && (user.role === 'ADMIN' || user.role === 'DOCTOR' || user.role === 'STAFF');
  const isPatientUser = user && user.role === 'PATIENT';
  // Nếu là user nội bộ, hiển thị header đơn giản và menu quản lý
  if (isInternalUser) {
    return (
      <header className="sticky top-0 z-50 bg-white backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo (Quản lý) */}
          <NavLink to={user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/dashboard'} className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Stethoscope size={20} />
            </div>
            <span className="font-bold text-blue-700">
              HỆ THỐNG QUẢN LÝ TÂM AN
            </span>
          </NavLink>
          
          {/* Menu Quản Lý */}
          <InternalHeader /> 

          {/* Actions */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Xin chào, {user.role}!
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Nếu là Khách, Bệnh nhân, hoặc chưa đăng nhập => Hiển thị header Quảng Cáo
  return (
    <header className="sticky top-0 z-50">
      <PublicHeader
        navSlot={isPatientUser ? (
          <>
            {/* Menu dành riêng cho BỆNH NHÂN */}
            <NavLink to="/ho-so-cua-toi" className={({isActive}) => `${linkCls} ${isActive?activeCls:""}`}>
                Hồ sơ của tôi
            </NavLink>
            <NavLink to="/dat-lich-kham" className={({isActive}) => `${linkCls} ${isActive?activeCls:""}`}>
                Đặt Lịch Khám
            </NavLink>
            <NavLink to="/lich-su-kham" className={({isActive}) => `${linkCls} ${isActive?activeCls:""}`}>
                Lịch sử khám
            </NavLink>
            <NavLink to="/hoa-don-cua-toi" className={({isActive}) => `${linkCls} ${isActive?activeCls:""}`}>
                Hóa đơn
            </NavLink>
          </>
        ) : null} // Nếu là khách vãng lai (null) thì PublicHeader sẽ tự động hiển thị Menu Quảng Cáo chung
      >
        {user ? (
          // Bệnh nhân đã đăng nhập
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Xin chào, {user.firstName || 'Bệnh nhân'}!
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          // Khách chưa đăng nhập
          <div className="flex items-center gap-2">
            <NavLink to="/dang-nhap"
              className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50">
              Đăng nhập
            </NavLink>
            <NavLink to="/dang-ky"
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Đăng ký
            </NavLink>
          </div>
        )}
      </PublicHeader>
    </header>
  );
}