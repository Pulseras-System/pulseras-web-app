import api from "./apiService";

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
    const response = await api.get<Product[]>("/product");
    return response.data;
  },
  getById: async (id: number | string): Promise<Product> => {
    const response = await api.get<Product>(`/product/${id}`);
    return response.data;
  },
  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post<Product>("/product", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Product>): Promise<Product> => {
    const response = await api.put<Product>(`/product/${id}`, data);
    return response.data;
  },
};

export default ProductService;