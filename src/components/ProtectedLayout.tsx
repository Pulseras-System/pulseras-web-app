// src/components/ProtectedLayout.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedLayoutProps {
  allowedRoles: string[]; 
  children: React.ReactNode;
}

export default function ProtectedLayout({
  allowedRoles,
  children,
}: ProtectedLayoutProps) {
  const location = useLocation();
  const { roleName, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!roleName || !allowedRoles.includes(roleName)) {
    return (
      <Navigate
        to="/no-permission"
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}
