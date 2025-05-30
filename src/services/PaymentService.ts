import api from "./apiService";

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
    const response = await api.get<Payment[]>("/payment");
    return response.data;
  },
  getById: async (id: number | string): Promise<Payment> => {
    const response = await api.get<Payment>(`/payment/${id}`);
    return response.data;
  },
  create: async (data: Partial<Payment>): Promise<Payment> => {
    const response = await api.post<Payment>("/payment", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Payment>): Promise<Payment> => {
    const response = await api.put<Payment>(`/payment/${id}`, data);
    return response.data;
  },
};

export default PaymentService;