import { Link, Outlet, useLocation } from "react-router-dom";
// import { 
//   NavigationMenu, 
//   NavigationMenuContent, 
//   NavigationMenuItem, 
//   NavigationMenuLink, 
//   NavigationMenuList, 
//   NavigationMenuTrigger,
//   navigationMenuTriggerStyle 
// } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Package, Users, Ticket, Box, Gem, Menu} from "lucide-react";
import Logo from "../assets/images/logo.png";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-gradient-to-b from-blue-100 to-pink-100 font-sans  antialiased  flex flex-col p-6 space-y-6 fixed h-full border-r border-slate-900/10 shadow-xl">
        <Link to="/staff" className="flex items-center gap-3 mb-10 group">
          <img 
            src={Logo} 
            alt="Workshop logo" 
            className="h-12 w-auto group-hover:rotate-6 transition-transform" 
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
                  ? "bg-pink-200 shadow-inner font-semibold"
                  : "hover:bg-pink-200"
              )}
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{label}</span>
              {location.pathname.startsWith(path) && (
                <div className="ml-auto w-2 h-2 rounded-full bg-slate-100 animate-ping" />
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600/40 cursor-pointer transition">
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

      {/* Mobile Responsive Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <div className="bg-white/80 backdrop-blur-md  shadow-sm flex items-center justify-between p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-gradient-to-b from-blue-100 to-pink-100">
              <div className="flex flex-col h-full">
                <Link to="/staff" className="flex items-center gap-3 mb-6 group">
                  <img 
                    src={Logo} 
                    alt="Workshop logo" 
                    className="h-10 w-auto group-hover:rotate-4 transition-transform" 
                  />
                </Link>

                <nav className="flex flex-col gap-2 flex-grow">
                  {navItems.map(({ label, path, icon: Icon }) => (
                    <SheetClose asChild key={path}>
                      <Link
                        to={path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                          location.pathname.startsWith(path)
                            ? "bg-pink-200 shadow-inner font-semibold "
                            : "hover:bg-pink-200 "
                        )}
                      >
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>{label}</span>
                        {location.pathname.startsWith(path) && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-slate-100 animate-ping" />
                        )}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600/40 cursor-pointer transition">
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
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/staff" className="flex items-center gap-3 group">
            <img 
              src={Logo} 
              alt="Workshop logo" 
              className="w-20 h-auto group-hover:rotate-6 transition-transform" 
            />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://i.pravatar.cc/40?img=12" alt="Staff avatar" />
                  <AvatarFallback>NV</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
              <DropdownMenuItem>Cài đặt</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content layout */}
      <div className="flex-1 flex flex-col lg:ml-64 mt-16 lg:mt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 px-8 items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bảng Quản lý</h1>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 border border-slate-200 shadow-inner cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://i.pravatar.cc/40?img=12" alt="Staff avatar" />
                    <AvatarFallback>NV</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-slate-900 font-medium">Nhân viên</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-slate-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
                <DropdownMenuItem>Cài đặt</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 bg-[#fffaf3] p-8 overflow-y-auto">
          <div className="max-w mx-auto bg-white rounded-xl shadow-md p-6 border border-slate-100">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;