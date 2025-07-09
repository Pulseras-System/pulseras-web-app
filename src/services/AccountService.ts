import api from "./apiService";

const ACCOUNT_URL = "/accounts";


// Định nghĩa interface Account dựa trên bảng dữ liệu
export interface Account {
  [x: string]: any;
  id: string;
  fullName: string;
  username: string;
  phone: string;
  email: string;
  roleId: string; // Changed from number to string to match API response
  roleName?: string; // Added optional roleName field
  createDate: string; // ISO format datetime
  lastEdited: string; // ISO format datetime
  status: number; // 0 (inactive) hoặc 1 (active)
}

export interface TotalCustomersResponse {
  percentChange: number;
  lastWeekCustomers: number;
  isIncrease: boolean;
  totalCustomers: number;
  thisWeekCustomers: number;
}

// Interface cho role response
export interface Role {
  id: number;
  name: string;
  description?: string;
}

const AccountService = {
  // Lấy danh sách tài khoản
  get: async (): Promise<Account[]> => {
    const response = await api.get<Account[]>(`${ACCOUNT_URL}`);
    return response.data;
  },

  // Lấy thông tin 1 tài khoản theo id
  getById: async (id: number | string): Promise<Account> => {
    const response = await api.get<Account>(`${ACCOUNT_URL}/${id}`);
    return response.data;
  },

  // Tạo tài khoản mới
  create: async (data: Partial<Account>): Promise<Account> => {
    const response = await api.post<Account>(`${ACCOUNT_URL}`, data);
    return response.data;
  },

  // Cập nhật thông tin tài khoản
  update: async (id: number | string, data: Partial<Account>): Promise<Account> => {
    // Only send fields that have values (not undefined)
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const response = await api.put<Account>(`${ACCOUNT_URL}/${id}`, filteredData);

    // Update the localStorage account data if it exists
    const storedAccount = localStorage.getItem('account');
    if (storedAccount) {
      const currentAccount = JSON.parse(storedAccount);
      // Only update if the ID matches the current user
      if (currentAccount.id === id) {
        const updatedAccount = { ...currentAccount, ...response.data };
        localStorage.setItem('account', JSON.stringify(updatedAccount));
      }
    }

    return response.data;
  },

  getTotalSpentByCustomer: async (id: string): Promise<number> => {
    const response = await api.get<number>(`/accounts/count/total-spent`, { params: { id } });
    return response.data;
  },

  // Xóa tài khoản
  delete: async (id: number | string): Promise<void> => {
    await api.delete(`${ACCOUNT_URL}/${id}`);
  },

  // Cập nhật một phần thông tin tài khoản (PATCH)
  patch: async (id: number | string, data: Partial<Account>): Promise<Account> => {
    // Only send fields that have values (not undefined)
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const response = await api.patch<Account>(`${ACCOUNT_URL}/${id}`, filteredData);

    // Update the localStorage account data if it exists
    const storedAccount = localStorage.getItem('account');
    if (storedAccount) {
      const currentAccount = JSON.parse(storedAccount);
      // Only update if the ID matches the current user
      if (currentAccount.id === id) {
        const updatedAccount = { ...currentAccount, ...response.data };
        localStorage.setItem('account', JSON.stringify(updatedAccount));
      }
    }

    return response.data;
  },

  // Lấy danh sách tài khoản theo role
  getByRole: async (role: string): Promise<Account[]> => {
    const response = await api.get<Account[]>(`${ACCOUNT_URL}/roles`, { 
      params: { role } 
    });
    return response.data;
  },

  // Lấy tất cả roles - sử dụng RoleService thay thế
  getAllRoles: async (): Promise<Role[]> => {
    // Vì API /accounts/roles cần parameter role, ta không thể dùng để lấy tất cả roles
    // Tạm thời return default roles, nên tạo RoleService riêng cho việc này
    return [
      { id: 1, name: "Admin", description: "Administrator role" },
      { id: 2, name: "Customer", description: "Customer role" },
      { id: 3, name: "Staff", description: "Staff role" }
    ];
  },

  // Lấy role của một tài khoản theo id
  getAccountRole: async (id: number | string): Promise<Role> => {
    const response = await api.get<Role>(`${ACCOUNT_URL}/${id}/role`);
    return response.data;
  },

  getTotalCustomers: async (): Promise<TotalCustomersResponse> => {
    const response = await api.get<TotalCustomersResponse>("/accounts/total-customers");
    return response.data;
  },
  
  getCustomers: async (): Promise<Account[]> => {
    const response = await api.get<Account[]>("/accounts/roles?role=Customer");
    return response.data;
  },

  getTotalOrdersByCustomer: async (id: string): Promise<number> => {
    const response = await api.get<number>(`/accounts/count/orders`, { params: { id } });
    return response.data;
  },
};

export default AccountService;
