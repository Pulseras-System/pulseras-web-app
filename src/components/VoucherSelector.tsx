import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, 
  Search, 
  Percent, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Gift
} from "lucide-react";
import VoucherService, { AvailableVoucher, ValidateVoucherResponse } from "@/services/VoucherService";

interface VoucherSelectorProps {
  accountId: string;
  orderAmount: number;
  selectedVoucher?: AvailableVoucher | null;
  onVoucherSelect: (voucher: AvailableVoucher | null) => void;
  onVoucherValidation?: (validation: ValidateVoucherResponse | null) => void;
}

const VoucherSelector = ({ 
  accountId, 
  orderAmount, 
  selectedVoucher, 
  onVoucherSelect,
  onVoucherValidation 
}: VoucherSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [vouchers, setVouchers] = useState<AvailableVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidateVoucherResponse | null>(null);

  // Fetch available vouchers when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchVouchers();
    }
  }, [isOpen, accountId]);

  // Validate selected voucher when order amount changes
  useEffect(() => {
    if (selectedVoucher) {
      validateSelectedVoucher();
    }
  }, [orderAmount, selectedVoucher]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const availableVouchers = await VoucherService.getAvailableVouchers(accountId);
      setVouchers(availableVouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateSelectedVoucher = async () => {
    if (!selectedVoucher) return;
    
    try {
      const validation = await VoucherService.validateVoucher(
        selectedVoucher.voucherCode,
        accountId,
        orderAmount
      );
      setValidationResult(validation);
      onVoucherValidation?.(validation);
    } catch (error) {
      console.error("Error validating voucher:", error);
      setValidationResult(null);
      onVoucherValidation?.(null);
    }
  };

  const handleVoucherSelect = (voucher: AvailableVoucher) => {
    onVoucherSelect(voucher);
    setIsOpen(false);
  };

  const handleManualCodeApply = async () => {
    if (!manualCode.trim()) return;
    
    setValidatingCode(true);
    try {
      const validation = await VoucherService.validateVoucher(
        manualCode.trim().toUpperCase(),
        accountId,
        orderAmount
      );
      
      if (validation.valid) {
        // Create a mock voucher object for manual codes
        const mockVoucher: AvailableVoucher = {
          id: `manual_${manualCode}`,
          voucherCode: manualCode.trim().toUpperCase(),
          voucherName: "Mã giảm giá thủ công",
          discountType: "PERCENTAGE", // This will be determined by the validation
          discountValue: 0, // This will be determined by the validation
          minOrderAmount: validation.requirements.minOrderAmount,
          totalQuantity: 1,
          remainingQuantity: 1,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          canUse: true,
          isExpired: false,
          isOutOfStock: false,
          usageStatus: "AVAILABLE"
        };
        
        onVoucherSelect(mockVoucher);
        setValidationResult(validation);
        onVoucherValidation?.(validation);
        setIsOpen(false);
        setManualCode("");
      } else {
        setValidationResult(validation);
      }
    } catch (error) {
      console.error("Error validating manual code:", error);
    } finally {
      setValidatingCode(false);
    }
  };

  const filteredVouchers = vouchers.filter(voucher =>
    voucher.voucherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.voucherCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDiscountDisplay = (voucher: AvailableVoucher) => {
    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}%`;
    } else {
      return `${voucher.discountValue.toLocaleString()}₫`;
    }
  };

  const getUsageStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-800 border-green-200";
      case "USED": return "bg-gray-100 text-gray-800 border-gray-200";
      case "EXPIRED": return "bg-red-100 text-red-800 border-red-200";
      case "OUT_OF_STOCK": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUsageStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "Có thể sử dụng";
      case "USED": return "Đã sử dụng";
      case "EXPIRED": return "Đã hết hạn";
      case "OUT_OF_STOCK": return "Hết lượt";
      default: return status;
    }
  };

  return (
    <div className="border-2 border-dashed border-pink-200 rounded-lg p-4 bg-gradient-to-r from-pink-50 via-orange-50 to-yellow-50 hover:from-pink-100 hover:via-orange-100 hover:to-yellow-100 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Gift className="h-6 w-6 text-pink-600" />
            {selectedVoucher && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-900 text-base">
              {selectedVoucher ? "Voucher đã chọn" : "Chọn voucher giảm giá"}
            </span>
            {!selectedVoucher && (
              <p className="text-sm text-gray-600">Tiết kiệm thêm cho đơn hàng của bạn</p>
            )}
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="text-pink-600 border-pink-300 hover:bg-pink-100 hover:border-pink-400 font-medium shadow-sm"
            >
              <Ticket className="h-4 w-4 mr-2" />
              {selectedVoucher ? "Đổi voucher" : "Chọn voucher"}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-pink-600" />
                Chọn voucher giảm giá
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search and Manual Input */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm voucher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã voucher"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleManualCodeApply}
                    disabled={!manualCode.trim() || validatingCode}
                    size="sm"
                  >
                    {validatingCode ? "Kiểm tra..." : "Áp dụng"}
                  </Button>
                </div>
                
                {validationResult && !validationResult.valid && manualCode && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                    <XCircle className="h-4 w-4" />
                    {validationResult.message}
                  </div>
                )}
              </div>

              {/* Voucher List */}
              <div className="max-h-96 overflow-y-auto space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Đang tải voucher...</p>
                  </div>
                ) : filteredVouchers.length === 0 ? (
                  <div className="text-center py-8">
                    <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">Không có voucher phù hợp</p>
                  </div>
                ) : (
                  filteredVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        voucher.canUse && voucher.usageStatus === "AVAILABLE"
                          ? "hover:border-pink-300 hover:shadow-md border-gray-200"
                          : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                      } ${
                        selectedVoucher?.id === voucher.id ? "border-pink-500 bg-pink-50" : ""
                      }`}
                      onClick={() => {
                        if (voucher.canUse && voucher.usageStatus === "AVAILABLE") {
                          handleVoucherSelect(voucher);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1 text-pink-600 font-bold">
                              {voucher.discountType === "PERCENTAGE" ? (
                                <Percent className="h-4 w-4" />
                              ) : (
                                <DollarSign className="h-4 w-4" />
                              )}
                              {getDiscountDisplay(voucher)}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={getUsageStatusColor(voucher.usageStatus)}
                            >
                              {getUsageStatusText(voucher.usageStatus)}
                            </Badge>
                          </div>
                          
                          <h3 className="font-medium text-gray-900 mb-1">
                            {voucher.voucherName}
                          </h3>
                          
                          {voucher.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {voucher.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Mã: {voucher.voucherCode}</span>
                            <span>Đơn tối thiểu: {voucher.minOrderAmount.toLocaleString()}₫</span>
                            {voucher.maxDiscountAmount && (
                              <span>Giảm tối đa: {voucher.maxDiscountAmount.toLocaleString()}₫</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>
                              Hết hạn: {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                            </span>
                            <span>•</span>
                            <span>Còn {voucher.remainingQuantity} lượt</span>
                          </div>
                        </div>
                        
                        {selectedVoucher?.id === voucher.id && (
                          <CheckCircle className="h-5 w-5 text-pink-600" />
                        )}
                      </div>
                      
                      {/* Order amount validation */}
                      {orderAmount < voucher.minOrderAmount && (
                        <div className="mt-2 flex items-center gap-1 text-orange-600 text-xs bg-orange-50 p-2 rounded">
                          <AlertCircle className="h-3 w-3" />
                          Cần thêm {(voucher.minOrderAmount - orderAmount).toLocaleString()}₫ để sử dụng voucher này
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Selected Voucher Display - Enhanced */}
      {selectedVoucher && (
        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-green-600 font-bold text-lg bg-green-50 px-2 py-1 rounded">
                {selectedVoucher.discountType === "PERCENTAGE" ? (
                  <Percent className="h-4 w-4" />
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
                {getDiscountDisplay(selectedVoucher)}
              </div>
              <div>
                <span className="text-base font-semibold text-gray-900">{selectedVoucher.voucherName}</span>
                <div className="text-sm text-gray-600">
                  Mã: <span className="font-mono bg-gray-100 px-1 rounded">{selectedVoucher.voucherCode}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onVoucherSelect(null);
                onVoucherValidation?.(null);
              }}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2"
              title="Bỏ chọn voucher"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
          
          {validationResult && (
            <div className={`mt-3 text-sm flex items-center gap-2 p-2 rounded ${
              validationResult.valid 
                ? "text-green-700 bg-green-50 border border-green-200" 
                : "text-red-700 bg-red-50 border border-red-200"
            }`}>
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>{validationResult.message}</span>
              {validationResult.valid && (
                <span className="ml-auto font-bold text-green-600">
                  -{validationResult.discountAmount.toLocaleString()}₫
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoucherSelector;
