import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import StaffLayout from '@/layouts/StaffLayout';
import BlankLayout from '@/layouts/BlankLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedLayout from "@/components/ProtectedLayout";


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
import MyOrderPage from '@/pages/Customer/MyOrderPage';
import WishlistPage from '@/pages/Customer/WishlistPage';
import CheckoutPage from '@/pages/Customer/CheckoutPage';
import CheckoutSuccessPage from '@/pages/Customer/CheckoutSuccessPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ResetPasswordConfirmPage from '@/pages/ResetPasswordConfirmPage';

//Staff Pages
import BraceletManagement from '@/pages/StaffPages/BraceletManagementPage';
import MaterialManagement from '@/pages/StaffPages/MaterialManagementPage';
import OrderManagement from '@/pages/StaffPages/OrderManagementPage';
import CustomerManagement from '@/pages/StaffPages/CustomerManagementPage';
import VoucherManagement from '@/pages/StaffPages/VoucherManagementPage';
import CategoryManagementPageStaff from '@/pages/StaffPages/CategoryManagementPage';
import StaffProfilePage from '@/pages/StaffPages/StaffProfilePage';

//Admin Pages
import Dashboard from '@/pages/AdminPages/DashboardPage';
import BraceletManagementAdmin from '@/pages/AdminPages/BraceletManagementPage';
import MaterialManagementAdmin from '@/pages/AdminPages/MaterialManagementPage';
import OrderManagementAdmin from '@/pages/AdminPages/OrderManagementPage';
import UserManagementAdmin from '@/pages/AdminPages/UserManagementPage';
import VoucherManagementAdmin from '@/pages/AdminPages/VoucherManagementPage';
import CategoryManagementPageAdmin from '@/pages/AdminPages/CategoryManagementPage';
import AdminProfilePage from '@/pages/AdminPages/AdminProfilePage';
import BlogsManagementPage from '@/pages/AdminPages/BlogsManagementPage';
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
        path: '/forgot-password',
        element: <ResetPasswordPage />,
      },
      { path: '/reset-password', element: <ResetPasswordConfirmPage /> },
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
        path: '/checkout/:id',
        element: <CheckoutPage />,
      },
      {
        path: '/checkout/success',
        element: <CheckoutSuccessPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/orders',
        element: <MyOrderPage />,
      },
      {
        path: '/wishlist',
        element: <WishlistPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/staff',
    element: (
      <ProtectedLayout allowedRoles={['Staff', 'Admin']}>
        <StaffLayout />
      </ProtectedLayout>
    ),
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
        element: <CategoryManagementPageStaff />,
      },
      {
        path: 'profile',
        element: <StaffProfilePage />,
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
    element: (
      <ProtectedLayout allowedRoles={['Admin']}>
        <AdminLayout />
      </ProtectedLayout>
    ),
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
        element: <CategoryManagementPageAdmin />,
      },
      {
        path: 'profile',
        element: <AdminProfilePage />,
      },
      {
        path: 'blogs',
        element: <BlogsManagementPage />,
      }
    ],
  },

];

// Create router
const router = createBrowserRouter(routes);

export default router;
