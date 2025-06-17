import api from "./apiService";

const ORDER_DETAIL_URL = "/order-details";

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
};

export default OrderDetailService;