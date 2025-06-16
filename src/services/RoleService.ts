import api from "./apiService";

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
    const response = await api.get<Role[]>("/api/roles");
    return response.data;
  },

  // Lấy vai trò theo ID
  getById: async (id: number | string): Promise<Role> => {
    const response = await api.get<Role>(`/api/roles/${id}`);
    return response.data;
  },

  // Lấy vai trò theo tên
  getByName: async (name: string): Promise<Role> => {
    const response = await api.get<Role>(`/api/roles/role-name/${name}`);
    return response.data;
  },

  // Tạo mới vai trò
  create: async (data: Partial<Role>): Promise<Role> => {
    const response = await api.post<Role>("/api/roles", data);
    return response.data;
  },

  // Cập nhật vai trò
  update: async (id: number | string, data: Partial<Role>): Promise<Role> => {
    const response = await api.put<Role>(`/api/roles/${id}`, data);
    return response.data;
  },

  // Xóa vai trò
  delete: async (id: number | string): Promise<void> => {
    await api.delete(`/api/roles/${id}`);
  },
};

export default RoleService;