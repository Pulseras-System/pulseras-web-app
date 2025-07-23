import api from './apiService';

export interface WishlistItem {
  id: string;
  wishlistId?: string;
  accountId: string;
  productId: string;
  status: number;
  createdAt: string;
  // Thêm các trường khác nếu backend trả về
}

export interface CreateWishlistInput {
  accountId: string;
  productId: string;
  status: number;
}

const WISHLIST_URL = '/wishlists';

const WishlistService = {
  getAll: async (params?: { 
    keyword?: string; 
    page?: number; 
    size?: number;
    sort?: string;
    accountId?: string;
    }): Promise<{ items: WishlistItem[]; totalPages: number; totalItems: number }> => {
    const response = await api.get(WISHLIST_URL, { params });
    return {
      items: response.data.items || [],
      totalPages: response.data.totalPages || 1,
      totalItems: response.data.totalItems || 0,
    };
  },
  getByAccountId: async (accountId: string): Promise<WishlistItem[]> => {
    const response = await api.get<WishlistItem[]>(`${WISHLIST_URL}/account/${accountId}`);
    return response.data;
  },
  getById: async (id: string): Promise<WishlistItem> => {
    const response = await api.get<WishlistItem>(`${WISHLIST_URL}/${id}`);
    return response.data;
  },
  create: async (input: CreateWishlistInput): Promise<WishlistItem> => {
    const response = await api.post<WishlistItem>(WISHLIST_URL, input);
    return response.data;
  },
  update: async (id: string, data: Partial<WishlistItem>): Promise<WishlistItem> => {
    const response = await api.put<WishlistItem>(`${WISHLIST_URL}/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${WISHLIST_URL}/${id}`);
  },
};

export default WishlistService;
