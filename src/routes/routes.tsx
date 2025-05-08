import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import StaffLayout from '@/layouts/StaffLayout';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';
import NoPermission from '@/pages/NoPermissionPage';
import ProductPage from '@/pages/ProductPage';
import ProductDetailPage from '@/pages/ProductDetailPage';

//Staff Pages
import BraceletManagement from '@/pages/StaffPages/BraceletManagementPage';
import MaterialManagement from '@/pages/StaffPages/MaterialManagementPage';
import OrderManagement from '@/pages/StaffPages/OrderManagementPage';
import CustomerManagement from '@/pages/StaffPages/CustomerManagementPage';
import VoucherManagement from '@/pages/StaffPages/VoucherManagementPage';

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
        path: '/no-permission',
        element: <NoPermission />,
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
    ],
  },  
  
];

// Create router
const router = createBrowserRouter(routes);

export default router;
