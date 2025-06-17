import api from "./apiService";

const VOUCHER_URL = "/vouchers";

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
    const response = await api.get<Voucher[]>(`${VOUCHER_URL}`);
    return response.data;
  },
  getById: async (id: number | string): Promise<Voucher> => {
    const response = await api.get<Voucher>(`${VOUCHER_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<Voucher>): Promise<Voucher> => {
    const response = await api.post<Voucher>(`${VOUCHER_URL}`, data);
    return response.data;
  },
  update: async (id: number | string, data: Partial<Voucher>): Promise<Voucher> => {
    const response = await api.put<Voucher>(`${VOUCHER_URL}/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string): Promise<void> => {
    await api.delete(`${VOUCHER_URL}/${id}`);
  },
};

export default VoucherService;