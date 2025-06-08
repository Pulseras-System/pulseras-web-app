import api from "./apiService";

export interface Voucher {
  voucher_id: number;
  voucherName: string;
  voucherQuantity: number;
  minPrice: number;
  maxDiscount: number;
  discountPercentage: number;
  startDay: string;
  expireDay: string;
  status: number;
  createDate: string;
}

const VoucherService = {
  get: async (): Promise<Voucher[]> => {
    const response = await api.get<Voucher[]>("/vouchers");
    return response.data;
  },
  getById: async (id: number | string): Promise<Voucher> => {
    const response = await api.get<Voucher>(`/vouchers/${id}`);
    return response.data;
  },
  create: async (data: Partial<Voucher>): Promise<Voucher> => {
    const response = await api.post<Voucher>("/vouchers", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Voucher>): Promise<Voucher> => {
    const response = await api.put<Voucher>(`/vouchers/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string): Promise<void> => {
    await api.delete(`/vouchers/${id}`);
  },
};

export default VoucherService;