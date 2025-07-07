import api from "./apiService";

const PROMOTION_URL = "/promotions";
export interface Promotion {
  promotion_id: number;
  product_id: number;
  promotionName: string;
  promotionDescription: string;
  discountPercentage: number;
  startDay: string;
  expireDay: string;
  status: number;
  createDate: string;
  lastEdited: string;
}

const PromotionService = {
  get: async (): Promise<Promotion[]> => {
    const response = await api.get<Promotion[]>(`${PROMOTION_URL}`);
    return response.data;
  },
  getById: async (id: number | string): Promise<Promotion> => {
    const response = await api.get<Promotion>(`${PROMOTION_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<Promotion>): Promise<Promotion> => {
    const response = await api.post<Promotion>(`${PROMOTION_URL}`, data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Promotion>): Promise<Promotion> => {
    const response = await api.put<Promotion>(`${PROMOTION_URL}/${id}`, data);
    return response.data;
  },
};

export default PromotionService;