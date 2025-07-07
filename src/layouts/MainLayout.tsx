import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import Logo from "../assets/images/logo.png";
import {
  Home, ShoppingBag, Sparkles, Info, Phone,
  ShoppingCart, User, Menu, Search, LogOut, Settings, Heart, Package,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MainLayout = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [account, setAccount] = useState<any>(null);
  const navigate = useNavigate();

  const navLinks = {
    "/": { label: "Trang chủ", icon: Home },
    "/shop": { label: "Cửa hàng", icon: ShoppingBag },
    // "/categories": { label: "Danh mục", icon: LayoutGrid },
    "/design": { label: "Thiết kế", icon: Sparkles },
    "/about": { label: "Về chúng tôi", icon: Info },
    "/contact": { label: "Liên hệ", icon: Phone },
  };

  useEffect(() => {
    // Lấy thông tin account từ localStorage nếu có
    const accountStr = localStorage.getItem("account");
    if (accountStr) {
      setAccount(JSON.parse(accountStr));
    }
  }, []);

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear();

    // Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });

    // Update state
    setAccount(null);

    // Navigate to home page
    navigate("/");
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?query=${searchValue}`);
      setShowSearch(false);
      setSearchValue("");
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 font-sans text-gray-800 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="container flex items-center justify-between h-20 px-4 mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group relative">
            <img
              src={Logo}
              alt="Pulsera logo"
              className="h-12 w-auto transition-all duration-300 group-hover:scale-105 group-hover:rotate-2"
            />
          </Link>

          {/* Navigation Menu (Desktop) */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="flex gap-1">
              {Object.entries(navLinks).map(([to, { label }]) => (
                <NavigationMenuItem key={to}>
                  <Link
                    to={to}
                    className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 font-medium relative group"
                  >
                    {label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-2 relative">
            <ThemeToggle />

            {/* Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Search Box */}
            {showSearch && (
              <form
                onSubmit={handleSearchSubmit}
                className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-2 w-64 z-50 animate-fade-in"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Cart Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-gray-100 rounded-full relative transition-all hover:scale-110"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {localStorage.getItem("amount") || "0"}

              </span>
            </Button>

            {/* User Button: nếu có account thì hiện dropdown menu, ngược lại hiện nút đăng nhập */}
            {account ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:bg-gray-100 rounded-full transition-all hover:scale-110 gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {account.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{account.fullName.split(' ')[0]}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-lg border-0 bg-white/95">
                  <div className="px-3 py-2 mb-2">
                    <div className="font-medium">{account.fullName}</div>
                    <div className="text-xs text-gray-500">{account.email}</div>
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="py-2 px-3 cursor-pointer flex gap-2 rounded-md hover:bg-blue-50 focus:bg-blue-50 mb-1">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>Trang cá nhân</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")} className="py-2 px-3 cursor-pointer flex gap-2 rounded-md hover:bg-blue-50 focus:bg-blue-50 mb-1">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span>Đơn hàng của tôi</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")} className="py-2 px-3 cursor-pointer flex gap-2 rounded-md hover:bg-blue-50 focus:bg-blue-50 mb-1">
                    <Heart className="h-4 w-4 text-blue-500" />
                    <span>Danh sách yêu thích</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="py-2 px-3 cursor-pointer flex gap-2 rounded-md hover:bg-blue-50 focus:bg-blue-50">
                    <Settings className="h-4 w-4 text-blue-500" />
                    <span>Cài đặt tài khoản</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="py-2 px-3 cursor-pointer flex gap-2 rounded-md hover:bg-red-50 focus:bg-red-50 text-red-500">
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
                onClick={() => navigate("/login")}
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-gray-100 rounded-full relative transition-all"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {localStorage.getItem("amount") || "0"}
              </span>
            </Button>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px] bg-white/95 backdrop-blur-sm">
                <SheetHeader className="flex flex-row justify-between items-center mb-6">
                  <SheetTitle>
                    <Link
                      to="/"
                      className="flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <img
                        src={Logo}
                        alt="Pulsera logo"
                        className="h-10 w-auto transition-transform hover:scale-105"
                      />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                  {/* Search Bar in Mobile Menu */}
                  <form onSubmit={handleSearchSubmit} className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </form>

                  {/* Main Navigation Links for Mobile */}
                  {Object.entries(navLinks).map(([to, { label, icon: Icon }]) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 px-4 py-3 text-lg rounded-lg transition-all hover:bg-blue-50 hover:text-blue-600 font-medium hover:pl-6"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5 text-blue-500" />
                      {label}
                    </Link>
                  ))}

                  {/* Utility Actions in Mobile Menu */}
                  <hr className="my-2 border-gray-200" />
                  {account ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-2 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-medium shadow-md">
                          {account.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{account.fullName}</div>
                          <div className="text-xs text-gray-500">{account.email}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-blue-100 hover:border-blue-200 shadow-sm py-2"
                          onClick={() => {
                            navigate("/profile");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Hồ sơ</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 text-red-500 shadow-sm py-2"
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="font-medium">Đăng xuất</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-3 px-4 py-3 text-base rounded-lg transition-all hover:bg-blue-500 hover:text-white font-medium w-full border border-gray-200 shadow-sm"
                      onClick={() => {
                        navigate("/login");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User className="h-5 w-5" />
                      Đăng nhập
                    </Button>
                  )}

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100 shadow-sm">
                    <span className="flex items-center gap-3 font-medium">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Giao diện
                    </span>
                    <ThemeToggle />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-10 px-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white text-gray-700">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo & Slogan */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={Logo}
                alt="Pulsera logo"
                className="h-14 w-auto opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Nơi tình yêu biến thành những chiếc vòng tay thủ công.
            </p>
            <div className="flex gap-2">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-blue-500 transition-all duration-300 hover:scale-110"
                >
                  <div className="h-5 w-5 flex items-center justify-center">
                    {social === 'facebook' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.877V14.89h-2.54V12h2.54V9.795c0-2.502 1.492-3.87 3.766-3.87 1.096 0 2.24.195 2.24.195V8.16h-1.29c-1.24 0-1.62.772-1.62 1.567V12h2.89l-.468 2.89h-2.422v6.987C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    )}
                    {social === 'twitter' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.85.38-1.77.63-2.73.74.98-.59 1.75-1.54 2.1-2.67-.91.54-1.92.93-2.99 1.14C18.36 3.96 17.06 3 15.6 3c-2.67 0-4.85 2.18-4.85 4.85 0 .38.04.75.12 1.1C7.6 9.27 4.14 7.31 1.8 4.23c-.4.69-.63 1.49-.63 2.34 0 1.68.85 3.16 2.15 4.02-.79-.02-1.53-.24-2.17-.6v.06c0 2.36 1.68 4.33 3.92 4.77-.41.11-.85.17-1.3.17-.32 0-.63-.03-.93-.09.62 1.95 2.42 3.37 4.56 3.41-1.67 1.31-3.79 2.09-6.09 2.09-.4 0-.79-.02-1.18-.07C2.26 20.35 4.8 21 7.42 21c8.95 0 13.84-7.41 13.84-13.84 0-.21-.01-.43-.02-.64.95-.69 1.77-1.56 2.42-2.54z" />
                      </svg>
                    )}
                    {social === 'instagram' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    )}
                    {social === 'youtube' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                      </svg>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 relative inline-block">
              Thông tin
            </h4>
            <ul className="space-y-3">
              {['/about', '/contact', '/faq', '/blog'].map((link) => (
                <li key={link}>
                  <Link
                    to={link}
                    className="text-sm text-gray-600 hover:text-blue-500 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover:bg-blue-500 transition-all"></span>
                    {link === '/about' && 'Về chúng tôi'}
                    {link === '/contact' && 'Liên hệ'}
                    {link === '/faq' && 'FAQ'}
                    {link === '/blog' && 'Blog'}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 relative inline-block">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3">
              {['/shipping', '/returns', '/terms', '/privacy'].map((link) => (
                <li key={link}>
                  <Link
                    to={link}
                    className="text-sm text-gray-600 hover:text-blue-500 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover:bg-blue-500 transition-all"></span>
                    {link === '/shipping' && 'Vận chuyển & Giao hàng'}
                    {link === '/returns' && 'Chính sách đổi trả'}
                    {link === '/terms' && 'Điều khoản dịch vụ'}
                    {link === '/privacy' && 'Chính sách bảo mật'}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 relative inline-block">
              Liên hệ chúng tôi
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-blue-50 rounded-full text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  123 Đường Vòng Tay, Quận 1, TP.HCM, Việt Nam
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-50 rounded-full text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  (028) 1234 5678
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-50 rounded-full text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  info@pulsera.vn
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 text-center mt-12 pt-6 border-t border-gray-100 max-w-7xl">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Pulsera. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;