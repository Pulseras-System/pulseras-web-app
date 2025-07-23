import api from "./apiService";

const PRODUCT_URL = "/products";

export interface Product {
  productId: string; // ID là string
  categoryIds: string[]; // Danh sách category ID
  categoryName?: string; // Tên danh mục, có thể không có nếu không cần thiết
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

export interface TopBuyProduct {
  product: Product; // Sửa từ [Product] thành Product
  soldQuantity: number;
}

export interface TypeDistributionItem {
  label: string;
  value: number;
}

export interface CreateProductInput {
  categoryIds: string[];
  productName: string;
  productDescription: string;
  productMaterial: string;
  quantity: number;
  type: string;
  price: number;
  status: number;
  image: File; // image file (png/jpeg)
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
  create: async (input: CreateProductInput): Promise<Product> => {
    const form = new FormData();

    // image first (field name must match backend parameter)
    form.append("image", input.image);

    // append scalar fields
    form.append("productName", input.productName);
    form.append("productDescription", input.productDescription);
    form.append("productMaterial", input.productMaterial);
    form.append("quantity", String(input.quantity));
    form.append("type", input.type);
    form.append("price", String(input.price));
    form.append("status", String(input.status));

    // categoryIds (backend expects repeated param "categoryIds")
    input.categoryIds.forEach((id) => form.append("categoryIds", id));

    const { data } = await api.post<Product>(PRODUCT_URL, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },
  update: async (id: string, data: Partial<Product> & { image?: File }): Promise<Product> => {
  const form = new FormData();

  // Optional image
  if (data.image) {
    form.append("image", data.image);
  }

  // Required fields
  if (data.categoryIds) {
    data.categoryIds.forEach((id) => form.append("categoryIds", id));
  }

  form.append("productName", data.productName ?? "");
  form.append("productDescription", data.productDescription ?? "");
  form.append("productMaterial", data.productMaterial ?? "");
  form.append("quantity", String(data.quantity ?? 0));
  form.append("type", data.type ?? "");
  form.append("price", String(data.price ?? 0));
  form.append("status", String(data.status ?? 0));

  const response = await api.put<Product>(`${PRODUCT_URL}/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
},

  delete: async (id: string): Promise<void> => {
    await api.delete(`${PRODUCT_URL}/${id}`);
  },
  getTypeDistribution: async (): Promise<TypeDistributionItem[]> => {
    const response = await api.get<TypeDistributionItem[]>("/products/type-distribution");
    return response.data;
  },

  getTopBuyProducts: async (): Promise<TopBuyProduct[]> => {
    try {
      const response = await api.get("/products/top-buy-products");
      
      if (Array.isArray(response.data)) {
        const validatedData = response.data.map((item: any) => {
          // Nếu item đã có cấu trúc {product, soldQuantity}
          if (item.product && typeof item.soldQuantity === 'number') {
            return {
              product: item.product,
              soldQuantity: item.soldQuantity
            } as TopBuyProduct;
          }
          
          // Nếu item là Product trực tiếp, wrap nó trong TopBuyProduct format
          if (item.productId) {
            return {
              product: item,
              soldQuantity: item.soldQuantity || 0
            } as TopBuyProduct;
          }
          
          return null;
        }).filter((item): item is TopBuyProduct => item !== null);
        
        return validatedData;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching top products:", error);
      return [];
    }
  },

  getLatestProducts: async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/products/latest-products");
  return response.data;
},
};

export default ProductService;