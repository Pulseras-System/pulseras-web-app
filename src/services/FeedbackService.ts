import api from "./apiService";

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
    const response = await api.get<Feedback[]>("/feedback");
    return response.data;
  },
  getById: async (id: number | string): Promise<Feedback> => {
    const response = await api.get<Feedback>(`/feedback/${id}`);
    return response.data;
  },
  create: async (data: Partial<Feedback>): Promise<Feedback> => {
    const response = await api.post<Feedback>("/feedback", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Feedback>): Promise<Feedback> => {
    const response = await api.put<Feedback>(`/feedback/${id}`, data);
    return response.data;
  },
};

export default FeedbackService;