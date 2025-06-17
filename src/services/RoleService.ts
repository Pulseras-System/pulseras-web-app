import api from "./apiService";

const ROLE_URL = "/roles";

export interface Role {
  role_id: number;
  roleName: string;
  createDate: string;
  lastEdited: string;
  status: number;
}

const RoleService = {
  // Lấy tất cả các vai trò
  get: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>(`${ROLE_URL}`);
    return response.data;
  },

  // Lấy vai trò theo ID
  getById: async (id: number | string): Promise<Role> => {
    const response = await api.get<Role>(`${ROLE_URL}/${id}`);
    return response.data;
  },

  // Lấy vai trò theo tên
  getByName: async (name: string): Promise<Role> => {
    const response = await api.get<Role>(`${ROLE_URL}/role-name/${name}`);
    return response.data;
  },

  // Tạo mới vai trò
  create: async (data: Partial<Role>): Promise<Role> => {
    const response = await api.post<Role>(`${ROLE_URL}`, data);
    return response.data;
  },

  // Cập nhật vai trò
  update: async (id: number | string, data: Partial<Role>): Promise<Role> => {
    const response = await api.put<Role>(`${ROLE_URL}/${id}`, data);
    return response.data;
  },

  // Xóa vai trò
  delete: async (id: number | string): Promise<void> => {
    await api.delete(`${ROLE_URL}/${id}`);
  },
};

export default RoleService;