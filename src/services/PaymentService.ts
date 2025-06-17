import api from "./apiService";

const PAYMENT_URL = "/payment";

export interface Payment {
  payment_id: number;
  order_id: number;
  paymentMethod: string;
  status: number;
  createDate: string;
  lastEdited: string;
}

const PaymentService = {
  get: async (): Promise<Payment[]> => {
    const response = await api.get<Payment[]>(`${PAYMENT_URL}`);
    return response.data;
  },
  getById: async (id: number | string): Promise<Payment> => {
    const response = await api.get<Payment>(`${PAYMENT_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<Payment>): Promise<Payment> => {
    const response = await api.post<Payment>(`${PAYMENT_URL}`, data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Payment>): Promise<Payment> => {
    const response = await api.put<Payment>(`${PAYMENT_URL}/${id}`, data);
    return response.data;
  },
};

export default PaymentService;