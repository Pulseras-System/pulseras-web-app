import api from "./apiService";

const PRODUCT_URL = "/products";

export interface Product {
  productId: string; // ID là string
  categoryIds: string[]; // Danh sách category ID
  productName: string;
  productDescription: string;
  productMaterial: string;
  productImage: string;
  quantity: number;
  type: string;
  price: number; // Thêm trường price
  createDate: string;
  lastEdited: string | null;
  status: number;
}

const ProductService = {
  get: async (params?: {
    keyword?: string;
    categoryId?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<{ items: Product[]; totalPages: number; totalItems: number }> => {
    const response = await api.get(PRODUCT_URL, { params });
    return {
      items: response.data.items || [],
      totalPages: response.data.totalPages || 1,
      totalItems: response.data.totalItems || 0,
    };
  },
  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`${PRODUCT_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<Product>): Promise<Product> => {
    const payload = {
      categoryIds: data.categoryIds || [],
      productName: data.productName || "",
      productDescription: data.productDescription || "",
      productMaterial: data.productMaterial || "",
      productImage: data.productImage || "",
      quantity: data.quantity || 0,
      type: data.type || "",
      price: data.price || 0,
      status: data.status || 0,
    };

    const response = await api.post<Product>(PRODUCT_URL, payload);
    return response.data;
  },
  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const payload = {
      categoryIds: data.categoryIds || [],
      productName: data.productName || "",
      productDescription: data.productDescription || "",
      productMaterial: data.productMaterial || "",
      productImage: data.productImage || "",
      quantity: data.quantity || 0,
      type: data.type || "",
      price: data.price || 0,
      status: data.status || 0,
    };

    const response = await api.put<Product>(`${PRODUCT_URL}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${PRODUCT_URL}/${id}`);
  },
};

export default ProductService;