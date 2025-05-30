import api from "./apiService";

export interface OrderDetail {
  orderDetail_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  promotion_id: number;
  status: number;
  createDate: string;
  lastEdited: string;
}

const OrderDetailService = {
  get: async (): Promise<OrderDetail[]> => {
    const response = await api.get<OrderDetail[]>("/order-detail");
    return response.data;
  },
  getById: async (id: number | string): Promise<OrderDetail> => {
    const response = await api.get<OrderDetail>(`/order-detail/${id}`);
    return response.data;
  },
  create: async (data: Partial<OrderDetail>): Promise<OrderDetail> => {
    const response = await api.post<OrderDetail>("/order-detail", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<OrderDetail>): Promise<OrderDetail> => {
    const response = await api.put<OrderDetail>(`/order-detail/${id}`, data);
    return response.data;
  },
};

export default OrderDetailService;