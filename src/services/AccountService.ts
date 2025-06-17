import api from "./apiService";

const ACCOUNT_URL = "/accounts";


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

};

export default AccountService;
