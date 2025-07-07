import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Logo from '@/assets/images/logo.png';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Package, Heart, Settings, ShoppingCart } from 'lucide-react';

const BlankLayout: React.FC = () => {
    const [account, setAccount] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get account information from localStorage if available
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
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-800 antialiased">
            {/* Header with Navigation */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md h-20">
                <div className="container flex items-center justify-between h-full px-4 mx-auto">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src={Logo} alt="Pulsera logo" className="w-28 h-auto" />
                    </Link>

                    {/* Navigation Links */}
                    <nav className="flex items-center gap-6">
                        <Link to="/" className="hover:text-blue-600 transition-colors font-medium">
                            Trang chủ
                        </Link>
                        <Link to="/shop" className="hover:text-blue-600 transition-colors font-medium">
                            Cửa hàng
                        </Link>
                        <Link to="/design" className="hover:text-blue-600 transition-colors font-medium">
                            Thiết kế
                        </Link>
                        <Link to="/about" className="hover:text-blue-600 transition-colors font-medium">
                            Về chúng tôi
                        </Link>
                        <Link to="/contact" className="hover:text-blue-600 transition-colors font-medium">
                            Liên hệ
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        
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

                        {/* User Authentication */}
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
                            <>
                                <Button variant="outline" asChild className="border-gray-200 text-gray-600 hover:bg-gray-100">
                                    <Link to="/login">Đăng nhập</Link>
                                </Button>
                                <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                                    <Link to="/register">Đăng ký</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 bg-white">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-2 bg-white text-gray-700">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="font-medium text-gray-800">
                            © {new Date().getFullYear()} Pulsera. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            Designed with ❤️ for bracelet lovers
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="text-sm text-gray-600 hover:text-blue-500 transition-colors">
                            Chính sách bảo mật
                        </Link>
                        <Link to="/terms" className="text-sm text-gray-600 hover:text-blue-500 transition-colors">
                            Điều khoản sử dụng
                        </Link>
                        <Link to="/faq" className="text-sm text-gray-600 hover:text-blue-500 transition-colors">
                            FAQ
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BlankLayout;