import api from "./apiService";
import Cookies from "js-cookie";

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

const AccountService = {
  // Lấy danh sách tài khoản
  get: async (): Promise<Account[]> => {
    const response = await api.get<Account[]>("/account");
    return response.data;
  },

  // Lấy thông tin 1 tài khoản theo id
  getById: async (id: number | string): Promise<Account> => {
    const response = await api.get<Account>(`/account/${id}`);
    return response.data;
  },

  // Tạo tài khoản mới
  create: async (data: Partial<Account>): Promise<Account> => {
    const response = await api.post<Account>("/account", data);
    return response.data;
  },

  // Cập nhật thông tin tài khoản
  update: async (id: number | string, data: Partial<Account>): Promise<Account> => {
    const response = await api.put<Account>(`/account/${id}`, data);
    return response.data;
  },

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
    const response = await api.post("/accounts/signup", data);
    return response.data;
  },

  // Đăng nhập tài khoản và xử lý lưu token, account
  login: async (data: { username: string; password: string }) => {
    const response = await api.post("/accounts/login", data);
    const { token, account } = response.data;
    // 1. Lưu JWT vào cookie (7 ngày)
    Cookies.set("token", token, { expires: 7 });
    // 2. Lưu object account nhận từ API vào localStorage
    localStorage.setItem("account", JSON.stringify(account));
    // 3. Cập nhật header Authorization cho axios instance
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return response.data;
  },
};

export default AccountService;
