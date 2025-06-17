import api from "./apiService";
import Cookies from "js-cookie";

const AUTH_URL = "/auth";

// Định nghĩa interface Account dựa trên bảng dữ liệu
export interface Account {
  id: string;
  fullName: string;
  username: string;
  phone: string;
  email: string;
  roleId: number;
  createDate: string; // ISO format datetime
  lastEdited: string; // ISO format datetime
  status: number; // 0 (inactive) hoặc 1 (active)
}

const AuthService = {

  // Đăng ký tài khoản mới
  signup: async (data: {
    fullName: string;
    password: string;
    username: string;
    phone: string;
    email: string;
    roleId: number;
    status: number;
  }) => {
    const response = await api.post(`${AUTH_URL}/signup`, data);
    return response.data;
  },

  // Đăng nhập tài khoản và xử lý lưu token, account
  login: async (data: { username: string; password: string }) => {
    const response = await api.post(`${AUTH_URL}/login`, data);
    const { token, account } = response.data;
    // 1. Lưu JWT vào cookie (7 ngày)
    Cookies.set("token", token, { expires: 7 });
    // 2. Lưu object account nhận từ API vào localStorage
    localStorage.setItem("account", JSON.stringify(account));
    // 3. Cập nhật header Authorization cho axios instance
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return response.data;
  },
  
  // Đăng nhập bằng Google
  googleLogin: async (idToken: string) => {
    const response = await api.post(`${AUTH_URL}/google`, { idToken });
    const { token, account } = response.data;
    // 1. Lưu JWT vào cookie (7 ngày)
    Cookies.set("token", token, { expires: 7 });
    // 2. Lưu object account nhận từ API vào localStorage
    localStorage.setItem("account", JSON.stringify(account));
    // 3. Cập nhật header Authorization cho axios instance
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return response.data;
  },

  // Đăng xuất
  logout: () => {
    Cookies.remove("token");
    localStorage.removeItem("account");
    delete api.defaults.headers.common["Authorization"];
  },
};

export default AuthService;
