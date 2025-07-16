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

export interface PayOSPaymentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    orderCode: number;
    amount: number;
    description: string;
    checkoutUrl: string;
    qrCode: string;
    status: string;
    paymentLinkId: string;
    currency: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface PayOSPaymentStatus {
  success: boolean;
  data: {
    id: string;
    orderCode: number;
    amount: number;
    description: string;
    status: string;
    checkoutUrl: string;
    qrCode: string;
  };
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
  update: async (
    id: number | string,
    data: Partial<Payment>
  ): Promise<Payment> => {
    const response = await api.put<Payment>(`${PAYMENT_URL}/${id}`, data);
    return response.data;
  },

  // PayOS Integration
  createPayOSPayment: async (
    orderId: string
  ): Promise<PayOSPaymentResponse> => {
    const response = await api.post<PayOSPaymentResponse>(
      `/payments/create/${orderId}`
    );
    return response.data;
  },

  getPaymentByOrderCode: async (
    orderCode: number
  ): Promise<PayOSPaymentStatus> => {
    const response = await api.get<PayOSPaymentStatus>(
      `/payments/order-code/${orderCode}`
    );
    return response.data;
  },
};

export default PaymentService;
