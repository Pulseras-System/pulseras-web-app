import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Package, Users, Ticket, Box, Gem } from "lucide-react";
import Logo from "../assets/images/logo-nobg.png";

const navItems = [
  { label: "Vòng tay", path: "/staff/bracelets", icon: Gem },
  { label: "Nguyên liệu", path: "/staff/materials", icon: Package },
  { label: "Đơn hàng", path: "/staff/orders", icon: Box },
  { label: "Khách hàng", path: "/staff/customers", icon: Users },
  { label: "Ưu đãi", path: "/staff/vouchers", icon: Ticket },
];

const StaffLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#fff8f0]">
      {/* Sidebar - Cozy, wooden theme */}
      <aside className="w-64 bg-gradient-to-b from-amber-800 to-amber-700 text-amber-50 flex flex-col p-6 space-y-6 fixed h-full border-r border-amber-900/10 shadow-xl">
        <Link to="/staff" className="flex items-center gap-3 mb-10 group">
          <img 
            src={Logo} 
            alt="Workshop logo" 
            className="w-28 h-auto group-hover:rotate-6 transition-transform" 
          />
        </Link>

        <nav className="flex flex-col gap-2">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                location.pathname.startsWith(path)
                  ? "bg-amber-600 shadow-inner font-semibold text-white"
                  : "hover:bg-amber-600/40 text-amber-100"
              )}
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{label}</span>
              {location.pathname.startsWith(path) && (
                <div className="ml-auto w-2 h-2 rounded-full bg-amber-100 animate-ping" />
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-amber-700/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-amber-600/40 cursor-pointer transition">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Đăng xuất</span>
          </div>
        </div>
      </aside>

      {/* Content layout */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-amber-200 shadow-sm z-10">
          <h1 className="text-xl font-bold text-amber-900 tracking-tight">Bảng Quản lý</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-100 rounded-full px-3 py-1 border border-amber-200 shadow-inner">
              <img
                src="https://i.pravatar.cc/40?img=12"
                alt="Staff avatar"
                className="w-8 h-8 rounded-full border-2 border-amber-300 shadow-sm"
              />
              <span className="text-sm text-amber-900 font-medium">Nhân viên</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-amber-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 bg-[#fffaf3] p-8 overflow-y-auto">
          <div className="max-w mx-auto bg-white rounded-xl shadow-md p-6 border border-amber-100">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
