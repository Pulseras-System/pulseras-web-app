import api from "./apiService";

// Định nghĩa interface Account dựa trên bảng dữ liệu
export interface Account {
  account_id: number;
  fullName: string;
  password?: string; // Có thể không cần gửi password khi lấy danh sách
  username: string;
  phone: string;
  email: string;
  role_id: number;
  createDate: string; // ISO format datetime
  lastEdited: string; // ISO format datetime
  status: number; // Có thể là 0 (inactive) hoặc 1 (active)
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
};

export default AccountService;
