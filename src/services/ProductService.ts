import api from "./apiService";

const PRODUCT_URL = "/products";

export interface Product {
  product_id: number;
  category_id: number;
  productName: string;
  productDescription: string;
  productMaterial: string;
  productImage: string;
  quantity: number;
  type: string;
  createDate: string;
  lastEdited: string;
  status: number;
}

const ProductService = {
  get: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>(PRODUCT_URL);
    return response.data;
  },
  getById: async (id: number | string): Promise<Product> => {
    const response = await api.get<Product>(`/${PRODUCT_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post<Product>(PRODUCT_URL, data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Product>): Promise<Product> => {
    const response = await api.put<Product>(`/${PRODUCT_URL}/${id}`, data);
    return response.data;
  },
};

export default ProductService;