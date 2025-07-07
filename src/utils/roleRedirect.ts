import RoleService from "@/services/RoleService";
import { getRoleIdFromCookie } from "@/utils/auth";

/** Trả về đường dẫn tương ứng với roleName */
export async function getLandingPathByRole(): Promise<string> {
  const roleId = getRoleIdFromCookie();
  if (!roleId) return "/";          

  try {
    const { roleName } = await RoleService.getById(roleId);
    switch (roleName) {
      case "Admin":  return "/admin";
      case "Staff":  return "/staff";
      default:       return "/";
    }
  } catch {
    return "/";                      
  }
}
