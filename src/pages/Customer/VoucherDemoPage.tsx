import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, 
  Percent, 
  DollarSign, 
  Calendar, 
  Users, 
  ShoppingCart,
  Check,
  X,
  Clock
} from "lucide-react";
import VoucherService, { AvailableVoucher } from "@/services/VoucherService";

const VoucherDemoPage = () => {
  const [vouchers, setVouchers] = useState<AvailableVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [testOrderAmount, setTestOrderAmount] = useState(100000);
  const [accountId] = useState("demo-account-123"); // Demo account ID

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      // Create some demo vouchers if the API doesn't return any
      const availableVouchers = await VoucherService.getAvailableVouchers(accountId);
      
      if (availableVouchers.length === 0) {
        // Demo vouchers for testing
        const demoVouchers: AvailableVoucher[] = [
          {
            id: "demo-1",
            voucherCode: "SAVE20",
            voucherName: "Giảm 20% cho đơn hàng từ 100k",
            description: "Voucher giảm giá 20% cho khách hàng mới, áp dụng cho đơn hàng từ 100,000₫",
            discountType: "PERCENTAGE",
            discountValue: 20,
            minOrderAmount: 100000,
            maxDiscountAmount: 50000,
            totalQuantity: 100,
            remainingQuantity: 85,
            startDate: "2025-01-01T00:00:00",
            endDate: "2025-12-31T23:59:59",
            canUse: true,
            isExpired: false,
            isOutOfStock: false,
            usageStatus: "AVAILABLE"
          },
          {
            id: "demo-2",
            voucherCode: "FIXED50K",
            voucherName: "Giảm 50,000₫ cho đơn từ 200k",
            description: "Voucher giảm cố định 50,000₫ cho đơn hàng từ 200,000₫",
            discountType: "FIXED_AMOUNT",
            discountValue: 50000,
            minOrderAmount: 200000,
            totalQuantity: 50,
            remainingQuantity: 30,
            startDate: "2025-01-01T00:00:00",
            endDate: "2025-12-31T23:59:59",
            canUse: true,
            isExpired: false,
            isOutOfStock: false,
            usageStatus: "AVAILABLE"
          },
          {
            id: "demo-3",
            voucherCode: "NEWUSER15",
            voucherName: "Voucher cho khách hàng mới",
            description: "Giảm 15% cho khách hàng mới, không giới hạn đơn tối thiểu",
            discountType: "PERCENTAGE",
            discountValue: 15,
            minOrderAmount: 0,
            maxDiscountAmount: 30000,
            totalQuantity: 200,
            remainingQuantity: 150,
            startDate: "2025-01-01T00:00:00",
            endDate: "2025-12-31T23:59:59",
            canUse: true,
            isExpired: false,
            isOutOfStock: false,
            usageStatus: "AVAILABLE"
          },
          {
            id: "demo-4",
            voucherCode: "EXPIRED10",
            voucherName: "Voucher đã hết hạn",
            description: "Voucher này đã hết hạn sử dụng",
            discountType: "PERCENTAGE",
            discountValue: 10,
            minOrderAmount: 50000,
            totalQuantity: 100,
            remainingQuantity: 90,
            startDate: "2024-01-01T00:00:00",
            endDate: "2024-12-31T23:59:59",
            canUse: false,
            isExpired: true,
            isOutOfStock: false,
            usageStatus: "EXPIRED"
          },
          {
            id: "demo-5",
            voucherCode: "SOLDOUT25",
            voucherName: "Voucher đã hết lượt",
            description: "Voucher đã được sử dụng hết",
            discountType: "PERCENTAGE",
            discountValue: 25,
            minOrderAmount: 150000,
            totalQuantity: 20,
            remainingQuantity: 0,
            startDate: "2025-01-01T00:00:00",
            endDate: "2025-12-31T23:59:59",
            canUse: false,
            isExpired: false,
            isOutOfStock: true,
            usageStatus: "OUT_OF_STOCK"
          }
        ];
        setVouchers(demoVouchers);
      } else {
        setVouchers(availableVouchers);
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      // Use demo data on error
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (voucher: AvailableVoucher, orderAmount: number) => {
    if (orderAmount < voucher.minOrderAmount) {
      return 0;
    }

    if (voucher.discountType === "PERCENTAGE") {
      const discount = (orderAmount * voucher.discountValue) / 100;
      return voucher.maxDiscountAmount ? Math.min(discount, voucher.maxDiscountAmount) : discount;
    } else {
      return voucher.discountValue;
    }
  };

  const getDiscountDisplay = (voucher: AvailableVoucher) => {
    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}%`;
    } else {
      return `${voucher.discountValue.toLocaleString()}₫`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-800 border-green-200";
      case "USED": return "bg-gray-100 text-gray-800 border-gray-200";
      case "EXPIRED": return "bg-red-100 text-red-800 border-red-200";
      case "OUT_OF_STOCK": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "Có thể sử dụng";
      case "USED": return "Đã sử dụng";
      case "EXPIRED": return "Đã hết hạn";
      case "OUT_OF_STOCK": return "Hết lượt";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AVAILABLE": return <Check className="h-3 w-3" />;
      case "USED": return <Check className="h-3 w-3" />;
      case "EXPIRED": return <Clock className="h-3 w-3" />;
      case "OUT_OF_STOCK": return <X className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Gift className="h-8 w-8 text-pink-600" />
          Demo Voucher System - Shopee Style
        </h1>
        <p className="text-gray-600">
          Hệ thống voucher giảm giá tương tự Shopee với đầy đủ các tính năng: validation, discount calculation, và status tracking.
        </p>
      </div>

      {/* Order Amount Tester */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Kiểm tra với giá trị đơn hàng
          </CardTitle>
          <CardDescription>
            Thay đổi giá trị đơn hàng để xem voucher nào áp dụng được
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={testOrderAmount}
              onChange={(e) => setTestOrderAmount(Number(e.target.value))}
              className="w-48"
              placeholder="Nhập giá trị đơn hàng"
            />
            <span className="text-sm text-gray-600">
              Giá trị đơn hàng: <span className="font-medium">{testOrderAmount.toLocaleString()}₫</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải voucher...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có voucher</h3>
            <p className="text-gray-600">Hiện tại không có voucher nào khả dụng</p>
          </div>
        ) : (
          vouchers.map((voucher) => {
            const canUseWithCurrentOrder = testOrderAmount >= voucher.minOrderAmount && voucher.canUse;
            const discount = calculateDiscount(voucher, testOrderAmount);
            const finalAmount = Math.max(0, testOrderAmount - discount);

            return (
              <Card 
                key={voucher.id} 
                className={`relative overflow-hidden transition-all duration-200 ${
                  canUseWithCurrentOrder 
                    ? "border-green-200 shadow-md hover:shadow-lg" 
                    : "border-gray-200 opacity-75"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-pink-600 font-bold text-lg">
                        {voucher.discountType === "PERCENTAGE" ? (
                          <Percent className="h-4 w-4" />
                        ) : (
                          <DollarSign className="h-4 w-4" />
                        )}
                        {getDiscountDisplay(voucher)}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(voucher.usageStatus)} text-xs`}
                    >
                      {getStatusIcon(voucher.usageStatus)}
                      {getStatusText(voucher.usageStatus)}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-medium text-gray-900 line-clamp-2">
                    {voucher.voucherName}
                  </CardTitle>
                  {voucher.description && (
                    <CardDescription className="text-sm line-clamp-2">
                      {voucher.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Mã voucher:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {voucher.voucherCode}
                      </code>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Đơn tối thiểu:</span>
                      <span className="font-medium">{voucher.minOrderAmount.toLocaleString()}₫</span>
                    </div>
                    
                    {voucher.maxDiscountAmount && (
                      <div className="flex items-center justify-between">
                        <span>Giảm tối đa:</span>
                        <span className="font-medium">{voucher.maxDiscountAmount.toLocaleString()}₫</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Còn lại:
                      </span>
                      <span className="font-medium">{voucher.remainingQuantity}/{voucher.totalQuantity}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Hết hạn:
                      </span>
                      <span className="font-medium">
                        {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  
                  {/* Test Results */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      Kết quả với đơn hàng {testOrderAmount.toLocaleString()}₫:
                    </div>
                    
                    {testOrderAmount < voucher.minOrderAmount ? (
                      <div className="text-orange-600 text-xs bg-orange-50 p-2 rounded">
                        Cần thêm {(voucher.minOrderAmount - testOrderAmount).toLocaleString()}₫ để sử dụng
                      </div>
                    ) : !voucher.canUse ? (
                      <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
                        Voucher không thể sử dụng ({getStatusText(voucher.usageStatus)})
                      </div>
                    ) : (
                      <div className="text-green-600 text-xs bg-green-50 p-2 rounded space-y-1">
                        <div>✓ Có thể sử dụng</div>
                        <div>Giảm: <span className="font-medium">{discount.toLocaleString()}₫</span></div>
                        <div>Thanh toán: <span className="font-medium">{finalAmount.toLocaleString()}₫</span></div>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                {/* Visual indicator */}
                {canUseWithCurrentOrder && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-green-500">
                    <Check className="absolute -top-4 -right-3 h-3 w-3 text-white" />
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Integration Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tích hợp vào CheckoutPage</CardTitle>
          <CardDescription>
            Voucher system đã được tích hợp vào trang checkout với các tính năng sau:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">✅ Tính năng đã triển khai:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Hiển thị danh sách voucher khả dụng</li>
                <li>• Tìm kiếm voucher theo tên và mã</li>
                <li>• Nhập mã voucher thủ công</li>
                <li>• Validation realtime theo giá trị đơn hàng</li>
                <li>• Tính toán giảm giá tự động</li>
                <li>• Áp dụng voucher khi đặt hàng</li>
                <li>• Hiển thị trạng thái voucher</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 API Endpoints sử dụng:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <code>GET /vouchers/available</code></li>
                <li>• <code>POST /vouchers/validate</code></li>
                <li>• <code>POST /vouchers/apply</code></li>
                <li>• <code>GET /vouchers/my-vouchers/{accountId}</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherDemoPage;
