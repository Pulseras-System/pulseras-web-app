// src/utils/auth.ts
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  roleId: string;
  exp: number;
}

export function getRoleIdFromCookie(): string | null {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.roleId;
  } catch {
    return null;
  }
}
