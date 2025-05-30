import api from "./apiService";

export interface Category {
  category_id: number;
  product_id: number;
  categoryName: string;
  status: number;
  createDate: string;
  lastEdited: string;
}

const CategoryService = {
  get: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/category");
    return response.data;
  },
  getById: async (id: number | string): Promise<Category> => {
    const response = await api.get<Category>(`/category/${id}`);
    return response.data;
  },
  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post<Category>("/category", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put<Category>(`/category/${id}`, data);
    return response.data;
  },
};

export default CategoryService;