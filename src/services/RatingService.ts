import api from "./apiService";

const RATING_URL = "/ratings";

export interface Rating {
  rating_id: number;
  account_id: number;
  product_id: number;
  comment: string;
  rating: number;
  status: number;
  createDate: string;
  lastEdited: string;
}

const RatingService = {
  get: async (): Promise<Rating[]> => {
    const response = await api.get<Rating[]>(`${RATING_URL}`);
    return response.data;
  },
  getById: async (id: number | string): Promise<Rating> => {
    const response = await api.get<Rating>(`${RATING_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<Rating>): Promise<Rating> => {
    const response = await api.post<Rating>(`${RATING_URL}`, data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Rating>): Promise<Rating> => {
    const response = await api.put<Rating>(`${RATING_URL}/${id}`, data);
    return response.data;
  },
};

export default RatingService;