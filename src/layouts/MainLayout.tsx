import { Outlet, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import Logo from "../assets/images/logo-nobg.png";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-blue-200 shadow-sm bg-blue-400/90 text-white">
        <div className="container flex items-center justify-between h-20 px-4 mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Pulsera logo" className="h-16 w-auto" />
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList className="gap-6 text-base">
              {Object.entries({
                "/": "Trang chủ",
                "/shop": "Cửa hàng",
                "/categories": "Danh mục",
                "/design": "Thiết kế",
                "/about": "Về chúng tôi",
                "/contact": "Liên hệ",
              }).map(([to, label]) => (
                <NavigationMenuItem key={to}>
                  <Link
                    to={to}
                    className="px-4 py-2 rounded-lg transition duration-300 hover:bg-blue-500/50 hover:scale-105 font-medium"
                  >
                    {label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button 
              variant="outline" 
              asChild 
              className="border-white text-white hover:bg-blue-500 hover:text-white hover:border-blue-500"
            >
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button 
              asChild 
              className="bg-pink-400 text-white hover:bg-pink-500"
            >
              <Link to="/register">Đăng ký</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-10 px-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-200 py-6 backdrop-blur-sm bg-blue-400/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Pulsera. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link 
              to="/privacy" 
              className="text-sm hover:text-pink-100 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-sm hover:text-pink-100 transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              to="/faq" 
              className="text-sm hover:text-pink-100 transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;