// import { useState } from 'react';
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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-black text-white border-b">
        <div className="container flex items-center justify-between h-20 px-4 mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Pulsera logo" className="w-25 h-auto" />
          </Link>
          
          <NavigationMenu>
            <NavigationMenuList className="gap-6 text-base">
              {[
                { label: "Home", to: "/" },
                { label: "Shop", to: "/shop" },
                { label: "Categories", to: "/categories" },
                { label: "Design", to: "/design" },
                { label: "About", to: "/about" },
                { label: "Contact", to: "/contact" },
              ].map((item) => (
                <NavigationMenuItem key={item.to}>
                  <Link
                    to={item.to}
                    className="px-3 py-2 text-white rounded-md hover:font-semibold hover:bg-gray-700 hover:text-white hover:scale-105 transition-transform duration-300"
                  >
                    {item.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link to="/login" className="text-white">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register" className="text-white">Register</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pulsera. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;