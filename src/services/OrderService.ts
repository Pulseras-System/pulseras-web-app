import api from "./apiService";

export interface Order {
  order_id: number;
  orderInfor: string;
  amount: number;
  account_id: number;
  voucher_id: number;
  totalPrice: number;
  status: number;
  createDate: string;
  lastEdited: string;
}

const OrderService = {
  get: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>("/order");
    return response.data;
  },
  getById: async (id: number | string): Promise<Order> => {
    const response = await api.get<Order>(`/order/${id}`);
    return response.data;
  },
  create: async (data: Partial<Order>): Promise<Order> => {
    const response = await api.post<Order>("/order", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Order>): Promise<Order> => {
    const response = await api.put<Order>(`/order/${id}`, data);
    return response.data;
  },
};

export default OrderService;