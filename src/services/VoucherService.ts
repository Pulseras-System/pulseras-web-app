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
    const response = await api.get<Voucher[]>("/voucher");
    return response.data;
  },
  getById: async (id: number | string): Promise<Voucher> => {
    const response = await api.get<Voucher>(`/voucher/${id}`);
    return response.data;
  },
  create: async (data: Partial<Voucher>): Promise<Voucher> => {
    const response = await api.post<Voucher>("/voucher", data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Voucher>): Promise<Voucher> => {
    const response = await api.put<Voucher>(`/voucher/${id}`, data);
    return response.data;
  },
};

export default VoucherService;