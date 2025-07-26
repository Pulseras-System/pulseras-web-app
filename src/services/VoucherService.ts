import apiService from "./apiService";

// Legacy interface for existing code compatibility
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

// New interfaces based on the API documentation
export interface VoucherNew {
  id: string;
  voucherCode: string;
  voucherName: string;
  description?: string;
  totalQuantity: number;
  usedQuantity: number;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  maxUsagePerUser: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createDate: string;
  lastEdited: string;
  banReason?: string;
}

export interface AvailableVoucher {
  id: string;
  voucherCode: string;
  voucherName: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  totalQuantity: number;
  remainingQuantity: number;
  startDate: string;
  endDate: string;
  canUse: boolean;
  isExpired: boolean;
  isOutOfStock: boolean;
  usageStatus: "AVAILABLE" | "USED" | "EXPIRED" | "OUT_OF_STOCK";
}

export interface ApplyVoucherRequest {
  voucherCode: string;
  accountId: string;
  orderAmount: number;
  orderId: string;
}

export interface ApplyVoucherResponse {
  success: boolean;
  message: string;
  voucherCode: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue?: number;
}

export interface ValidateVoucherResponse {
  valid: boolean;
  message: string;
  discountAmount: number;
  finalAmount: number;
  requirements: {
    minOrderAmount: number;
    currentOrderAmount: number;
    meetRequirement: boolean;
  };
}

export interface VoucherUsageHistory {
  voucherCode: string;
  voucherName: string;
  usedAt: string;
  orderId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

const VOUCHER_URL = "/vouchers/admin";

const VoucherService = {
  // Legacy methods for existing code compatibility
  get: async (): Promise<Voucher[]> => {
    const response = await apiService.get<Voucher[]>(`${VOUCHER_URL}`);
    return response.data;
  },
  getById: async (id: number | string): Promise<Voucher> => {
    const response = await apiService.get<Voucher>(`${VOUCHER_URL}/${id}`);
    return response.data;
  },
  create: async (data: Partial<Voucher>): Promise<Voucher> => {
    const response = await apiService.post<Voucher>(`${VOUCHER_URL}`, data);
    return response.data;
  },
  update: async (
    id: number | string,
    data: Partial<Voucher>
  ): Promise<Voucher> => {
    const response = await apiService.put<Voucher>(
      `${VOUCHER_URL}/${id}`,
      data
    );
    return response.data;
  },
  delete: async (id: number | string): Promise<void> => {
    await apiService.delete(`${VOUCHER_URL}/${id}`);
  },

  // New methods based on Shopee-like API documentation
  getAvailableVouchers: async (
    accountId?: string
  ): Promise<AvailableVoucher[]> => {
    const params = accountId ? { accountId } : {};
    const response = await apiService.get("/vouchers/available", { params });
    return response.data;
  },

  validateVoucher: async (
    voucherCode: string,
    accountId: string,
    orderAmount: number
  ): Promise<ValidateVoucherResponse> => {
    const response = await apiService.post("/vouchers/validate", null, {
      params: {
        voucherCode,
        accountId,
        orderAmount,
      },
    });
    return response.data;
  },

  applyVoucher: async (
    request: ApplyVoucherRequest
  ): Promise<ApplyVoucherResponse> => {
    const response = await apiService.post("/vouchers/apply", request);
    return response.data;
  },

  getUserVouchers: async (accountId: string): Promise<AvailableVoucher[]> => {
    const response = await apiService.get(`/vouchers/my-vouchers/${accountId}`);
    return response.data;
  },

  getUsageHistory: async (
    accountId: string
  ): Promise<VoucherUsageHistory[]> => {
    const response = await apiService.get(
      `/vouchers/usage-history/${accountId}`
    );
    return response.data;
  },

  checkVoucherUsability: async (
    voucherId: string,
    accountId: string
  ): Promise<boolean> => {
    const response = await apiService.get(
      `/vouchers/${voucherId}/usable/${accountId}`
    );
    return response.data;
  },

  // Admin endpoints
  createVoucherNew: async (
    voucher: Partial<VoucherNew>
  ): Promise<VoucherNew> => {
    const response = await apiService.post("/vouchers/admin", voucher);
    return response.data;
  },

  getAllVouchersNew: async (): Promise<VoucherNew[]> => {
    const response = await apiService.get("/vouchers/admin");
    return response.data;
  },

  updateVoucherNew: async (
    id: string,
    voucher: Partial<VoucherNew>
  ): Promise<VoucherNew> => {
    const response = await apiService.put(`/vouchers/admin/${id}`, voucher);
    return response.data;
  },

  deleteVoucherNew: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiService.delete(`/vouchers/admin/${id}`);
    return response.data;
  },
};

export default VoucherService;
