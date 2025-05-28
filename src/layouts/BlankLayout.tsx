import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '@/assets/images/logo.png';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

const BlankLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 to-blue-50">
            {/* Header with Navigation */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b border-sky-200 shadow-sm bg-sky-600/90 text-white h-[75px]">
                <div className="container flex items-center justify-between h-full px-4 mx-auto">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src={Logo} alt="Pulsera logo" className="w-28 h-auto" />
                    </Link>

                    {/* Navigation Links */}
                    <nav className="flex items-center gap-6">
                        <Link to="/" className="hover:text-sky-100 transition-colors">
                            Trang chủ
                        </Link>
                        <Link to="/shop" className="hover:text-sky-100 transition-colors">
                            Cửa hàng
                        </Link>
                        <Link to="/design" className="hover:text-sky-100 transition-colors">
                            Thiết kế
                        </Link>
                        <Link to="/about" className="hover:text-sky-100 transition-colors">
                            Về chúng tôi
                        </Link>
                        <Link to="/contact" className="hover:text-sky-100 transition-colors">
                            Liên hệ
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button variant="outline" asChild className="bg-transparent text-white hover:text-sky-600">
                            <Link to="/login">Đăng nhập</Link>
                        </Button>
                        <Button asChild className="bg-white text-sky-600 hover:bg-sky-50">
                            <Link to="/register">Đăng ký</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-sky-200 h-[75px] backdrop-blur-sm bg-sky-600/80 text-white">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <p className="text-sm">
                        © {new Date().getFullYear()} Pulsera. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="text-sm hover:text-sky-100 transition-colors">
                            Chính sách bảo mật
                        </Link>
                        <Link to="/terms" className="text-sm hover:text-sky-100 transition-colors">
                            Điều khoản sử dụng
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BlankLayout;