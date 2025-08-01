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
  paymentMethod?: string;
  fullName?: string; // Thêm trường paymentMethod
}

export interface RevenueResponse {
  percentChange: number;
  lastWeekRevenue: number;
  isIncrease: boolean;
  totalRevenue: number;
  thisWeekRevenue: number;
}

export interface TotalOrdersResponse {
  percentChange: number;
  lastWeekOrders: number;
  isIncrease: boolean;
  totalOrders: number;
  thisWeekOrders: number;
}

export interface GrowthResponse {
  growthRate: number;
  customerChange: number;
  revenueChange: number;
  isIncrease: boolean;
  orderChange: number;
}

export interface WeeklyOverviewItem {
  month: any;
  day: string;
  revenue: number;
  orderCount: number;
}

export interface OverviewResponse {
  weekly: { label: string; orderCount: number; revenue: number }[];
  monthly: { label: string; orderCount: number; revenue: number }[];
  yearly: { label: string; orderCount: number; revenue: number }[];
}

export interface OrderDetailDTO {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  promotionId: number;
  status: number;
  createDate: string;    // ISO date string
  lastEdited: string;    // ISO date string
}

export interface OrderDTO {
  id: string;
  orderInfor: string;
  amount: number;
  accountId: string;
  voucherId: string;
  totalPrice: number;
  status: number;
  lastEdited: string;     // ISO date string
  createDate: string;     // ISO date string
  orderDetails: OrderDetailDTO[];
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
  },
  getRevenue: async (): Promise<RevenueResponse> => {
    const response = await api.get<RevenueResponse>(`${ORDER_URL}/revenue`);
    return response.data;
  },

  getTotalOrders: async (): Promise<TotalOrdersResponse> => {
    const response = await api.get<TotalOrdersResponse>(`${ORDER_URL}/total-orders`);
    return response.data;
  },

  getGrowth: async (): Promise<GrowthResponse> => {
    const response = await api.get<GrowthResponse>(`${ORDER_URL}/growth`);
    return response.data;
  },

  getWeeklyOverview: async (): Promise<WeeklyOverviewItem[]> => {
    const response = await api.get<WeeklyOverviewItem[]>(`${ORDER_URL}/weekly-overview`);
    return response.data;
  },

  getMonthlyOverview: async (): Promise<WeeklyOverviewItem[]> => {
    const response = await api.get<WeeklyOverviewItem[]>(`${ORDER_URL}/monthly-overview`);
    return response.data;
  },
  getYearlyOverview: async (): Promise<WeeklyOverviewItem[]> => {
    const response = await api.get<WeeklyOverviewItem[]>(`${ORDER_URL}/yearly-overview`);
    return response.data;
  },
  getOverview: async (): Promise<OverviewResponse> => {
    const response = await api.get<OverviewResponse>(`${ORDER_URL}/overview`);
    return response.data;
  },
  addToCart: async (accountId: string, productId: string): Promise<OrderDTO> => {
    const response = await api.post(`${ORDER_URL}/add-to-cart`, {
      accountId,
      productId,
    });
    return response.data;
  },
};

export default OrderService;