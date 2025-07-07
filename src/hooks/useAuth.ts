import { useEffect, useState } from "react";
import RoleService from "@/services/RoleService";
import { getRoleIdFromCookie } from "@/utils/auth";

export function useAuth() {
  const [roleName, setRoleName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const roleId = getRoleIdFromCookie();
      if (!roleId) {
        setRoleName(null);
        setLoading(false);
        return;
      }

      try {
        const res = await RoleService.getById(roleId);
        setRoleName(res.roleName);
      } catch (error) {
        console.error("Lỗi lấy vai trò:", error);
        setRoleName(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return { roleName, loading };
}
