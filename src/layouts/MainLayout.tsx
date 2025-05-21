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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-violet-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-violet-200 shadow-sm bg-violet-500/90 text-white">
        <div className="container flex items-center justify-between h-20 px-4 mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Pulsera logo" className="h-16 w-auto" />
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList className="gap-6 text-base">
              {[
                { label: "Trang chủ", to: "/" },
                { label: "Cửa hàng", to: "/shop" },
                { label: "Danh mục", to: "/categories" },
                { label: "Thiết kế", to: "/design" },
                { label: "Về chúng tôi", to: "/about" },
                { label: "Liên hệ", to: "/contact" },
              ].map((item) => (
                <NavigationMenuItem key={item.to}>
                  <Link
                    to={item.to}
                    className="px-4 py-2 rounded-lg transition duration-300 hover:bg-violet-500/50 hover:scale-105 font-medium"
                  >
                    {item.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" asChild className="border-white text-white hover:bg-violet-500 hover:text-white hover:border-violet-500">
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button asChild className="bg-white text-violet-600 hover:bg-violet-100 hover:text-violet-700">
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
      <footer className="border-t border-violet-200 py-6 backdrop-blur-sm bg-violet-600/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Pulsera. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacy" className="text-sm hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="text-sm hover:underline">Terms of Service</Link>
            <Link to="/faq" className="text-sm hover:underline">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;