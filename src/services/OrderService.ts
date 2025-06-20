import api from "./apiService";

const ORDER_URL = "/orders";

export interface Order {
  id: string;
  orderInfor: string;
  amount: number;
  accountId: string;
  voucherId: string;
  totalPrice: number;
  status: number;
  createDate: string;
  lastEdited: string;
}

const OrderService = {
  get: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>(`${ORDER_URL}`);
    return response.data;
  },
  getById: async (id: number | string): Promise<Order> => {
    const response = await api.get<Order>(`${ORDER_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<Order>): Promise<Order> => {
    const response = await api.post<Order>(`${ORDER_URL}`, data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Order>): Promise<Order> => {
    const response = await api.put<Order>(`${ORDER_URL}/${id}`, data);
    return response.data;
  },
  getByAccountId: async (accountId: string): Promise<Order[]> => {
    const response = await api.get<Order[]>(`${ORDER_URL}/account/${accountId}`);
    return response.data;
  }
};

export default OrderService;