import api from "./apiService";

const CATEGORY_URL = "/categories";


export interface Category {
  categoryId: number;
  productId: number;
  categoryName: string;
  status: number;
  createDate: string;
  lastEdited: string;
}

const CategoryService = {
  get: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>(`${CATEGORY_URL}`);
    return response.data;
  },
  getById: async (id: number | string): Promise<Category> => {
    const response = await api.get<Category>(`${CATEGORY_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post<Category>(`${CATEGORY_URL}`, data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put<Category>(`${CATEGORY_URL}/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string): Promise<void> => {
    await api.delete(`${CATEGORY_URL}/${id}`);
  },
  getByName: async (name: string): Promise<Category> => {
    const response = await api.get<Category>(`${CATEGORY_URL}/name/${name}`);
    return response.data;
  }
};

export default CategoryService;