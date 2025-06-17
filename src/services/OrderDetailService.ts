import api from "./apiService";

export interface OrderDetail {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  promotionId: string;
  status: number;
  createDate: string;
  lastEdited: string;
}

const OrderDetailService = {
  get: async (): Promise<OrderDetail[]> => {
    const response = await api.get<OrderDetail[]>("/order-details");
    return response.data;
  },
  getById: async (id: number | string): Promise<OrderDetail> => {
    const response = await api.get<OrderDetail>(`/order-details/${id}`);
    return response.data;
  },
  create: async (data: Partial<OrderDetail>): Promise<OrderDetail> => {
    const response = await api.post<OrderDetail>("/order-details", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<OrderDetail>): Promise<OrderDetail> => {
    const response = await api.put<OrderDetail>(`/order-details/${id}`, data);
    return response.data;
  },
};

export default OrderDetailService;