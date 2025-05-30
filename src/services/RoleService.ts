import api from "./apiService";

export interface Role {
  role_id: number;
  roleName: string;
  createDate: string;
  lastEdited: string;
  status: number;
}

const RoleService = {
  get: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>("/role");
    return response.data;
  },
  getById: async (id: number | string): Promise<Role> => {
    const response = await api.get<Role>(`/role/${id}`);
    return response.data;
  },
  create: async (data: Partial<Role>): Promise<Role> => {
    const response = await api.post<Role>("/role", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Role>): Promise<Role> => {
    const response = await api.put<Role>(`/role/${id}`, data);
    return response.data;
  },
};

export default RoleService;