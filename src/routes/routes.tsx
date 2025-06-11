import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import StaffLayout from '@/layouts/StaffLayout';
import BlankLayout from '@/layouts/BlankLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Pages
import HomePage from '@/pages/Customer/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AboutPage from '@/pages/Customer/AboutPage';
import ContactPage from '@/pages/Customer/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';
import NoPermission from '@/pages/NoPermissionPage';
import ProductPage from '@/pages/Customer/ProductPage';
import ProductDetailPage from '@/pages/Customer/ProductDetailPage';
import DesignBraceletPage from '@/pages/Customer/DesignBraceletPage';
import CartPage from '@/pages/Customer/CartPage';
import ProfilePage from '@/pages/Customer/ProfilePage';

//Staff Pages
import BraceletManagement from '@/pages/StaffPages/BraceletManagementPage';
import MaterialManagement from '@/pages/StaffPages/MaterialManagementPage';
import OrderManagement from '@/pages/StaffPages/OrderManagementPage';
import CustomerManagement from '@/pages/StaffPages/CustomerManagementPage';
import VoucherManagement from '@/pages/StaffPages/VoucherManagementPage';
import CategoryManagementPage from '@/pages/StaffPages/CategoryManagementPage';

//Admin Pages
import Dashboard from '@/pages/AdminPages/DashboardPage';
import BraceletManagementAdmin from '@/pages/AdminPages/BraceletManagementPage';
import MaterialManagementAdmin from '@/pages/AdminPages/MaterialManagementPage';
import OrderManagementAdmin from '@/pages/AdminPages/OrderManagementPage';
import UserManagementAdmin from '@/pages/AdminPages/UserManagementPage';
import VoucherManagementAdmin from '@/pages/AdminPages/VoucherManagementPage';
import CategoryManagementPageAdmin from '@/pages/AdminPages/CategoryManagementPage';
// Define routes
const routes = [
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/shop',
        element: <ProductPage />,
      },
      {
        path: '/shop/:id',
        element: <ProductDetailPage />,
      },
      {
        path: '/about',
        element: <AboutPage />,
      },
      {
        path: '/contact',
        element: <ContactPage />,
      },
      {
        path: '/design',
        element: <DesignBraceletPage />,
      },
      {
        path: '/no-permission',
        element: <NoPermission />,
      },
      {
        path: '/cart',
        element: <CartPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      {
        path: '',
        element: <BraceletManagement />,
      },
      {
        path: 'bracelets',
        element: <BraceletManagement />,
      },
      {
        path: 'materials',
        element: <MaterialManagement />,
      },
      {
        path: 'orders',
        element: <OrderManagement />,
      },
      {
        path: 'customers',
        element: <CustomerManagement />,
      },
      {
        path: 'vouchers',
        element: <VoucherManagement />,
      },
      {
        path: 'categories',
        element: <CategoryManagementPageAdmin />,
      },
    ],
  },
  {
    path: '/design',
    element: <BlankLayout />, // Sử dụng layout không có header/footer
    children: [
      {
        path: '',
        element: <DesignBraceletPage />,
      },
    ],
  },  
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '',
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'bracelets',
        element: <BraceletManagementAdmin />,
      },
      {
        path: 'materials',
        element: <MaterialManagementAdmin />,
      },
      {
        path: 'orders',
        element: <OrderManagementAdmin />,
      },
      {
        path: 'users',
        element: <UserManagementAdmin />,
      },
      {
        path: 'vouchers',
        element: <VoucherManagementAdmin />,
      },
      {
        path: 'categories',
        element: <CategoryManagementPage />,
      }
    ],
  },  
  
];

// Create router
const router = createBrowserRouter(routes);

export default router;
