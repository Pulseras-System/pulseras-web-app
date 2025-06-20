import api from "./apiService";

const ORDER_DETAIL_URL = "/order-details";

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
    const response = await api.get<OrderDetail[]>(`${ORDER_DETAIL_URL}`);
    return response.data;
  },
  getById: async (id: number | string): Promise<OrderDetail> => {
    const response = await api.get<OrderDetail>(`${ORDER_DETAIL_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<OrderDetail>): Promise<OrderDetail> => {
    const response = await api.post<OrderDetail>(`${ORDER_DETAIL_URL}`, data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<OrderDetail>): Promise<OrderDetail> => {
    const response = await api.put<OrderDetail>(`${ORDER_DETAIL_URL}/${id}`, data);
    return response.data;
  },
  getByOrderId: async (orderId: string): Promise<OrderDetail[]> => {
    const response = await api.get<OrderDetail[]>(`${ORDER_DETAIL_URL}/order/${orderId}`);
    return response.data;
  },
  countAmount: async (orderId: string): Promise<number> => {
    const response = await api.get<number>(`${ORDER_DETAIL_URL}/amount/${orderId}`);
    return response.data;
  }
};

export default OrderDetailService;