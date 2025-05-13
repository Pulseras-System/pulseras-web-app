import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from '@/layouts/MainLayout';

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
import DesignBraceletPage from '@/pages/DesignBraceletPage';

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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

// Create router
const router = createBrowserRouter(routes);

export default router;
