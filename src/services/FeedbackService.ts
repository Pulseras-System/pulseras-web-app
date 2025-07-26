import api from "./apiService";

const FEEDBACK_URL = "/feedbacks";

export interface Feedback {
  feedback_id: number;
  account_id: number;
  product_id: number;
  feedbackInfor: string;
  status: number;
  createDate: string;
  lastEdited: string;
}

const FeedbackService = {
  get: async (): Promise<Feedback[]> => {
    const response = await api.get<Feedback[]>(`${FEEDBACK_URL}`);
    return response.data;
  },
  getById: async (id: number | string): Promise<Feedback> => {
    const response = await api.get<Feedback>(`${FEEDBACK_URL}/${id}`);
    return response.data;
  },
  create: async (data: {
    accountId: string;
    productId: string;
    feedbackInfor: string;
    status: number;
  }): Promise<Feedback> => {
    const response = await api.post<Feedback>(`${FEEDBACK_URL}`, data);
    return response.data;
  },

  // Lấy feedback theo productId
  getByProductId: async (productId: number | string): Promise<Feedback[]> => {
    const response = await api.get<Feedback[]>(`${FEEDBACK_URL}?productId=${productId}`);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Feedback>): Promise<Feedback> => {
    const response = await api.put<Feedback>(`${FEEDBACK_URL}/${id}`, data);
    return response.data;
  },
};

export default FeedbackService;