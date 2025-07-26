import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ShoppingBag, CreditCard, DollarSign, QrCode, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import OrderService from "@/services/OrderService";
import OrderDetailService from "@/services/OrderDetailService";
import ProductService from "@/services/ProductService";
import PaymentService, { PayOSPaymentResponse } from "@/services/PaymentService";
import VoucherService, { AvailableVoucher, ValidateVoucherResponse } from "@/services/VoucherService";
import BankTransferQR from "@/components/BankTransferQR";
import VoucherSelector from "@/components/VoucherSelector";
import { useCartStore } from "@/utils/cartStore";

const AnimatedSection = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const CheckoutItemCard = ({ item }: { item: any }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg border border-blue-50 shadow-sm hover:shadow-md transition-shadow">
    <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
      <img src={item.productImage} alt={item.productName} className="object-cover w-full h-full" />
    </div>
    <div className="flex-grow">
      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
      <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-4">
        <span>Loại: {item.type}</span>
        <span>Chất liệu: {item.productMaterial}</span>
      </div>
    </div>
    <div className="flex items-center gap-3 mt-2 sm:mt-0">
      <span className="w-8 text-center font-medium text-gray-700">x{item.quantity}</span>
    </div>
    <div className="flex-shrink-0 font-bold text-blue-600 min-w-[100px] text-right">
      {(item.price * item.quantity).toLocaleString("vi-VN")}₫
    </div>
  </div>
);

const PaymentMethodCard = ({
  value,
  label,
  icon,
  selected,
  onChange,
  description,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onChange: (v: string) => void;
  description?: string;
}) => (
  <div
    className={`p-4 border rounded-lg cursor-pointer transition-all ${selected
      ? "border-blue-500 bg-blue-50 shadow-sm"
      : "border-gray-200 hover:border-blue-300 bg-white"
      }`}
    onClick={() => onChange(value)}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-md border ${selected ? "bg-blue-100 border-blue-200" : "bg-white border-gray-200"
        }`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{label}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div
        className={`w-5 h-5 rounded-full border flex items-center justify-center ${selected ? "border-blue-500 bg-blue-500" : "border-gray-300"
          }`}
      >
        {selected && (
          <div className="w-2 h-2 rounded-full bg-white"></div>
        )}
      </div>
    </div>
  </div>
);

const OrderSummary = ({
  subtotal,
  shipping,
  total,
  itemCount,
  paymentMethod,
  setPaymentMethod,
  shippingInfo,
  setShippingInfo,
  phoneError,
  setPhoneError,
  validatePhone,
  payosLoading,
  accountId,
  selectedVoucher,
  setSelectedVoucher,
  setVoucherValidation,
  voucherDiscount,
  totalBeforeVoucher,
}: {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  shippingInfo: any;
  setShippingInfo: (info: any) => void;
  phoneError: string;
  setPhoneError: (error: string) => void;
  validatePhone: (phone: string) => string;
  payosLoading?: boolean;
  accountId: string;
  selectedVoucher: AvailableVoucher | null;
  setSelectedVoucher: (voucher: AvailableVoucher | null) => void;
  setVoucherValidation: (validation: ValidateVoucherResponse | null) => void;
  voucherDiscount: number;
  totalBeforeVoucher: number;
}) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-24">
    {/* Shipping Information */}
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-800 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
          </svg>
        </span>
        Thông tin nhận hàng
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={shippingInfo.fullName}
              onChange={(e) =>
                setShippingInfo({ ...shippingInfo, fullName: e.target.value })
              }
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <Input
              required
              type="tel"
              value={shippingInfo.phone}
              onChange={(e) => {
                const value = e.target.value;
                setShippingInfo({ ...shippingInfo, phone: value });
                if (value) {
                  setPhoneError(validatePhone(value));
                } else {
                  setPhoneError("");
                }
              }}
              onBlur={() => {
                if (shippingInfo.phone) {
                  setPhoneError(validatePhone(shippingInfo.phone));
                }
              }}
              className={`focus:ring-blue-500 focus:border-blue-500 ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Ví dụ: 0912345678"
            />
            {phoneError && (
              <p className="mt-1 text-sm text-red-600">{phoneError}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ nhận hàng <span className="text-red-500">*</span>
          </label>
          <Input
            required
            value={shippingInfo.address}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, address: e.target.value })
            }
            className="focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú (tuỳ chọn)
          </label>
          <Input
            value={shippingInfo.note}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, note: e.target.value })
            }
            className="focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ví dụ: Giao giờ hành chính..."
          />
        </div>
      </div>
    </div>

    {/* Order Summary */}
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-800 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        </span>
        Tóm tắt đơn hàng
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Số lượng sản phẩm:</span>
          <span className="font-medium">{itemCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tổng tiền hàng:</span>
          <span className="font-medium">{subtotal.toLocaleString("vi-VN")}₫</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phí vận chuyển:</span>
          <span className="font-medium">{shipping.toLocaleString("vi-VN")}₫</span>
        </div>
        {voucherDiscount > 0 ? (
          <div className="flex justify-between text-green-600 bg-green-50 -mx-2 px-2 py-1 rounded">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Giảm giá voucher:
            </span>
            <span className="font-bold">-{voucherDiscount.toLocaleString("vi-VN")}₫</span>
          </div>
        ) : (
          <div className="flex justify-between text-orange-600 bg-orange-50 -mx-2 px-2 py-1 rounded">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Bạn chưa áp dụng voucher
            </span>
            <span className="text-sm">💰</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-lg">
          <span className="text-gray-900">Tổng thanh toán:</span>
          <span className="text-red-600">{total.toLocaleString("vi-VN")}₫</span>
        </div>
      </div>
    </div>

    {/* Voucher Section - Enhanced */}
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
        </span>
        Voucher giảm giá
        {selectedVoucher && voucherDiscount > 0 && (
          <Badge className="bg-green-100 text-green-800 border-green-200 ml-2">
            Tiết kiệm {voucherDiscount.toLocaleString("vi-VN")}₫
          </Badge>
        )}
        {/* Debug info - remove in production */}
        <span className="text-xs text-gray-500 ml-2">
          (accountId: {accountId || "not set"})
        </span>
      </h2>
      
      {accountId ? (
        <VoucherSelector
          accountId={accountId}
          orderAmount={totalBeforeVoucher}
          selectedVoucher={selectedVoucher}
          onVoucherSelect={setSelectedVoucher}
          onVoucherValidation={setVoucherValidation}
        />
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50 text-center">
          <div className="flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Đăng nhập để sử dụng voucher</h3>
          <p className="text-sm text-gray-600 mb-4">
            Bạn cần đăng nhập để xem và áp dụng các voucher giảm giá có sẵn
          </p>
          <Button
            variant="outline"
            className="text-pink-600 border-pink-300 hover:bg-pink-50"
            onClick={() => window.location.href = '/login'}
          >
            Đăng nhập ngay
          </Button>
        </div>
      )}
    </div>    {/* Payment Methods */}
    <div className="mb-6">
      <label className="font-medium mb-3 text-gray-900 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-800 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        </span>
        Phương thức thanh toán
      </label>
      <div className="space-y-3">
        <PaymentMethodCard
          value="COD"
          label="Thanh toán khi nhận hàng (COD)"
          icon={<DollarSign className="h-5 w-5 text-gray-700" />}
          selected={paymentMethod === "COD"}
          onChange={setPaymentMethod}
          description="Thanh toán bằng tiền mặt khi nhận hàng"
        />
        <PaymentMethodCard
          value="QR"
          label="QR Pay"
          icon={<QrCode className="h-5 w-5 text-blue-600" />}
          selected={paymentMethod === "QR"}
          onChange={setPaymentMethod}
          description="Quét mã QR để thanh toán"
        />
        <PaymentMethodCard
          value="PayOS"
          label="PayOS"
          icon={<CreditCard className="h-5 w-5 text-purple-600" />}
          selected={paymentMethod === "PayOS"}
          onChange={setPaymentMethod}
          description="Thanh toán qua PayOS - Hỗ trợ nhiều ngân hàng"
        />
      </div>
    </div>

    <Button 
      type="submit" 
      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white mb-3 py-6 text-base font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={payosLoading}
    >
      {payosLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Đang tạo liên kết thanh toán...
        </div>
      ) : (
        "Đặt hàng"
      )}
    </Button>
    <div className="text-center">
      <a
        href="/shop"
        className="text-blue-600 hover:text-blue-700 text-sm hover:underline inline-flex items-center transition-colors"
      >
        Tiếp tục mua sắm
        <ChevronRight className="h-4 w-4" />
      </a>
    </div>
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [order, setOrder] = useState<any>({});
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [payosPayment, setPayosPayment] = useState<PayOSPaymentResponse | null>(null);
  const [payosLoading, setPayosLoading] = useState(false);
  const [pollIntervalId, setPollIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<AvailableVoucher | null>(null);
  const [voucherValidation, setVoucherValidation] = useState<ValidateVoucherResponse | null>(null);
  const [accountId, setAccountId] = useState<string>("");
  const { setQuantity } = useCartStore();

  // Phone validation function
  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    const vietnamPhoneRegex = /^(0[3-9])[0-9]{8}$/;

    if (!phone) {
      return "Số điện thoại không được để trống";
    }

    if (!phoneRegex.test(phone)) {
      return "Số điện thoại phải có 10-11 chữ số";
    }

    if (!vietnamPhoneRegex.test(phone)) {
      return "Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx)";
    }

    return "";
  };

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const order = await OrderService.getById(orderId);
        setOrder(order);
        const allOrderDetails = await OrderDetailService.getByOrderId(String(orderId));
        const items = allOrderDetails ? allOrderDetails.filter((od: any) => od.status === 1) : [];
        const productPromises = items.map((item: any) => ProductService.getById(item.productId));
        const products = await Promise.all(productPromises);
        const cartWithProduct = items.map((item: any) => {
          const product = products.find((p: any) => p.productId === String(item.productId));
          return {
            ...item,
            productName: product?.productName || '',
            productImage: product?.productImage || '',
            type: product?.type || '',
            productMaterial: product?.productMaterial || '',
          };
        });
        const mergedMap = new Map<string, any>();
        cartWithProduct.forEach((item: any) => {
          const key = item.productId;
          if (mergedMap.has(key)) {
            const exist = mergedMap.get(key);
            mergedMap.set(key, {
              ...exist,
              quantity: exist.quantity + item.quantity,
            });
          } else {
            mergedMap.set(key, { ...item });
          }
        });
        const mergedCart = Array.from(mergedMap.values());
        setCartItems(mergedCart);
        let sub = 0, count = 0;
        mergedCart.forEach((item: any) => {
          sub += item.price * item.quantity;
          count += item.quantity;
        });
        setSubtotal(sub);
        setItemCount(count);
      } catch (e) {
        setCartItems([]);
        setSubtotal(0);
        setItemCount(0);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    // Try multiple possible keys for account info
    const possibleKeys = ["account", "user", "customer", "userInfo"];
    let foundAccount = null;
    
    for (const key of possibleKeys) {
      const accountStr = localStorage.getItem(key);
      if (accountStr) {
        try {
          const account = JSON.parse(accountStr);
          console.log(`Found account in localStorage key "${key}":`, account);
          foundAccount = account;
          break;
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    }
    
    if (foundAccount) {
      // Try different possible field names for account ID
      const accountId = foundAccount.accountId || foundAccount.id || foundAccount.userId || foundAccount.customerId || "";
      console.log("Setting accountId:", accountId);
      setAccountId(accountId);
      
      setShippingInfo((prev) => ({
        ...prev,
        fullName: foundAccount.fullName || foundAccount.name || "",
        phone: foundAccount.phone || foundAccount.phoneNumber || "",
        address: foundAccount.address || "",
      }));
    } else {
      console.log("No account found in localStorage with any of the keys:", possibleKeys);
      // For testing purposes, you can temporarily set a test accountId:
      // setAccountId("test-account-id");
    }
  }, []);

  const shipping = subtotal > 0 ? 30000 : 0;
  
  // Calculate voucher discount
  const voucherDiscount = voucherValidation?.valid ? voucherValidation.discountAmount : 0;
  const totalBeforeVoucher = subtotal + shipping;
  const total = Math.max(0, totalBeforeVoucher - voucherDiscount);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneValidationError = validatePhone(shippingInfo.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }
    
    if (paymentMethod === "QR") {
      setShowQRPopup(true);
    } else if (paymentMethod === "PayOS") {
      await handlePayOSPayment();
    } else {
      await submitOrder();
      setShowConfirmPopup(true);
    }
  };

  const handlePayOSPayment = async () => {
    if (!orderId) return;
    
    // Validate required shipping information
    if (!shippingInfo.fullName.trim() || !shippingInfo.phone.trim() || !shippingInfo.address.trim()) {
      alert('Vui lòng điền đầy đủ thông tin nhận hàng (Họ tên, Số điện thoại, Địa chỉ).');
      return;
    }
    
    try {
      setPayosLoading(true);
      
      // Apply voucher if selected and valid
      if (selectedVoucher && voucherValidation?.valid && accountId) {
        try {
          await VoucherService.applyVoucher({
            voucherCode: selectedVoucher.voucherCode,
            accountId: accountId,
            orderAmount: totalBeforeVoucher,
            orderId: String(orderId)
          });
        } catch (voucherError) {
          console.error('Error applying voucher:', voucherError);
          // Continue with order even if voucher application fails
        }
      }
      
      // First update the order with shipping info
      await OrderService.update(String(orderId), {
        orderInfor: `Tên: ${shippingInfo.fullName} | SĐT: ${shippingInfo.phone} | Địa chỉ: ${shippingInfo.address} | PTTT: ${paymentMethod} | Ghi chú: ${shippingInfo.note}${selectedVoucher ? ` | Voucher: ${selectedVoucher.voucherCode}` : ''}`,
        amount: itemCount,
        accountId: order.accountId,
        voucherId: selectedVoucher ? selectedVoucher.id : order.voucherId,
        totalPrice: total,
        status: 2,
        lastEdited: new Date().toISOString(),
      });
      
      // Create PayOS payment
      const paymentResponse = await PaymentService.createPayOSPayment(String(orderId));
      setPayosPayment(paymentResponse);
      
      // Open PayOS checkout URL in new tab
      // Note: PayOS will redirect to your configured return/cancel URLs with payment status
      if (paymentResponse.data.checkoutUrl) {
        window.open(paymentResponse.data.checkoutUrl, '_blank');
      }
      
      // Start polling for payment status
      pollPaymentStatus(paymentResponse.data.orderCode);

      setQuantity(0);
      
    } catch (error: any) {
      console.error('PayOS payment error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo thanh toán PayOS. Vui lòng thử lại.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 404) {
          errorMessage = 'Dịch vụ thanh toán PayOS hiện không khả dụng. Vui lòng chọn phương thức thanh toán khác.';
        } else if (error.response.status === 500) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau ít phút.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      }
      
      alert(errorMessage);
    } finally {
      setPayosLoading(false);
    }
  };

  const pollPaymentStatus = async (orderCode: number) => {
    // Clear any existing interval
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
    }

    const interval = setInterval(async () => {
      try {
        const paymentStatus = await PaymentService.getPaymentByOrderCode(orderCode);
        console.log('Payment status response:', paymentStatus);
        console.log('Payment status value:', paymentStatus.data.status);
        
        // Check for successful payment status - expanded to cover more possible success values
        const isSuccessful = paymentStatus.data.status === "PAID" || 
                           paymentStatus.data.status === "00" || 
                           paymentStatus.data.status === "SUCCESS" ||
                           paymentStatus.data.status === "COMPLETED" ||
                           paymentStatus.data.status === "successful" ||
                           paymentStatus.data.status === "paid" ||
                           paymentStatus.data.status === "completed";
        
        const isCancelled = paymentStatus.data.status === "CANCELLED" || 
                          paymentStatus.data.status === "FAILED";
        
        console.log('Is successful:', isSuccessful);
        console.log('Is cancelled:', isCancelled);
        
        if (isSuccessful) {
          console.log('Payment successful, updating order status to 3');
          clearInterval(interval);
          setPollIntervalId(null);
          setPayosPayment(null);
          
          // Update order status to 3 (paid/successful)
          try {
            console.log('Calling OrderService.update with orderId:', orderId);
            const updateResult = await OrderService.update(String(orderId), {
              orderInfor: `Tên: ${shippingInfo.fullName} | SĐT: ${shippingInfo.phone} | Địa chỉ: ${shippingInfo.address} | PTTT: ${paymentMethod} | Ghi chú: ${shippingInfo.note}`,
              amount: itemCount,
              accountId: order.accountId,
              voucherId: order.voucherId,
              totalPrice: total,
              status: 3,
              lastEdited: new Date().toISOString(),
            });
            console.log('Order update result:', updateResult);
            console.log('Successfully updated order status to 3');
          } catch (error) {
            console.error('Error updating order status:', error);
            alert('Thanh toán thành công nhưng có lỗi khi cập nhật trạng thái đơn hàng. Vui lòng liên hệ hỗ trợ.');
          }
          
          localStorage.setItem('amount', '0');
          setQuantity(0);
          setShowConfirmPopup(true);
        } else if (isCancelled) {
          console.log('Payment cancelled or failed');
          clearInterval(interval);
          setPollIntervalId(null);
          setPayosPayment(null);
          alert('Thanh toán đã bị hủy hoặc thất bại.');
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        // Continue polling even if there's an error
      }
    }, 5000); // Poll every 5 seconds (increased from 3 seconds)

    setPollIntervalId(interval);

    // Stop polling after 15 minutes (increased from 10 minutes)
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPollIntervalId(null);
        // Show a message to user that they can manually check their order status
        alert('Thời gian chờ thanh toán đã hết. Vui lòng kiểm tra trạng thái đơn hàng trong "Đơn hàng của tôi".');
      }
    }, 900000);
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    };
  }, [pollIntervalId]);

  const submitOrder = async () => {
    try {
      // Apply voucher if selected and valid
      if (selectedVoucher && voucherValidation?.valid && accountId) {
        try {
          await VoucherService.applyVoucher({
            voucherCode: selectedVoucher.voucherCode,
            accountId: accountId,
            orderAmount: totalBeforeVoucher,
            orderId: String(orderId)
          });
        } catch (voucherError) {
          console.error('Error applying voucher:', voucherError);
          // Continue with order even if voucher application fails
        }
      }

      await OrderService.update(String(orderId), {
        orderInfor: `Tên: ${shippingInfo.fullName} | SĐT: ${shippingInfo.phone} | Địa chỉ: ${shippingInfo.address} | PTTT: ${paymentMethod} | Ghi chú: ${shippingInfo.note}${selectedVoucher ? ` | Voucher: ${selectedVoucher.voucherCode}` : ''}`,
        amount: itemCount,
        accountId: order.accountId,
        voucherId: selectedVoucher ? selectedVoucher.id : order.voucherId,
        totalPrice: total,
        status: 2,
        lastEdited: new Date().toISOString(),
        paymentMethod: paymentMethod, // Thêm trường paymentMethod riêng
      });

      // navigate('/');
      localStorage.setItem('amount', '0');
      setQuantity(0);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="px-4 sm:px-6 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <AnimatedSection>
          <nav className="flex mb-6 text-sm sm:text-base" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 sm:space-x-2">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center font-medium text-blue-700 hover:text-blue-600 hover:underline transition-colors"
                >
                  Trang chủ
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                  <button
                    onClick={() => navigate('/shop')}
                    className="ml-1 font-medium text-blue-700 hover:text-blue-600 hover:underline transition-colors sm:ml-2"
                  >
                    Vòng tay
                  </button>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                  <span className="ml-1 font-medium text-blue-600 sm:ml-2">
                    Thanh toán
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </AnimatedSection>

        {/* Page Title */}
        <AnimatedSection className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-3">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            Thanh toán
          </h1>
        </AnimatedSection>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-blue-600 font-medium">Đang tải đơn hàng...</p>
          </div>
        ) : cartItems.length > 0 ? (
          <form onSubmit={handleOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <AnimatedSection>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm trong đơn hàng</h2>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <CheckoutItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                </AnimatedSection>

                {/* Voucher Promotion Banner */}
                {accountId && !selectedVoucher && (
                  <AnimatedSection>
                    <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold mb-1">🎉 Có voucher giảm giá!</h3>
                            <p className="text-white/90">Tiết kiệm thêm cho đơn hàng của bạn</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">💰</div>
                          <div className="text-sm text-white/80 mt-1">Lên đến 50%</div>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                )}
              </div>

              <div>
                <AnimatedSection>
                  <OrderSummary
                    subtotal={subtotal}
                    shipping={shipping}
                    total={total}
                    itemCount={itemCount}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    shippingInfo={shippingInfo}
                    setShippingInfo={setShippingInfo}
                    phoneError={phoneError}
                    setPhoneError={setPhoneError}
                    validatePhone={validatePhone}
                    payosLoading={payosLoading}
                    accountId={accountId}
                    selectedVoucher={selectedVoucher}
                    setSelectedVoucher={setSelectedVoucher}
                    setVoucherValidation={setVoucherValidation}
                    voucherDiscount={voucherDiscount}
                    totalBeforeVoucher={totalBeforeVoucher}
                  />
                </AnimatedSection>
              </div>
            </div>
          </form>
        ) : (
          <AnimatedSection>
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-medium text-gray-900 mb-2">Không có sản phẩm để thanh toán</h2>
              <p className="text-gray-600 mb-8 text-center max-w-md">
                Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.
              </p>
              <Button
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
                onClick={() => navigate('/shop')}
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </AnimatedSection>
        )}

        {showQRPopup && (
          <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setShowQRPopup(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="p-4 bg-gray-50 rounded-lg mb-4 border border-gray-200">
                <BankTransferQR orderId={orderId as string} amount={total} />

              </div>

              <div className="mt-4 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowQRPopup(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Huỷ
                </Button>
                <Button
                  className="bg-green-600 text-white hover:bg-green-700 shadow-md"
                  onClick={async () => {
                    setShowQRPopup(false);
                    await submitOrder();
                    setShowConfirmPopup(true);
                  }}
                >
                  Xác nhận đã chuyển khoản
                </Button>

              </div>
            </div>
          </div>
        )}

        {showConfirmPopup && (
          <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full relative animate-in fade-in-95 zoom-in-95">
              <button
                onClick={() => {
                  setShowConfirmPopup(false);
                  navigate('/');
                }}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
                <p className="text-gray-600">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ gửi xác nhận qua email trong ít phút.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  Thông tin đơn hàng
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex">
                    <span className="w-24 text-gray-500">Tên:</span>
                    <span className="font-medium">{shippingInfo.fullName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500">SĐT:</span>
                    <span className="font-medium">{shippingInfo.phone}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500">Địa chỉ:</span>
                    <span className="font-medium">{shippingInfo.address}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500">PTTT:</span>
                    <span className="font-medium">
                      {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' :
                        paymentMethod === 'QR' ? 'Chuyển khoản QR' : 
                        paymentMethod === 'PayOS' ? 'PayOS' : 'Thẻ ngân hàng'}
                    </span>
                  </div>
                  {shippingInfo.note && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">Ghi chú:</span>
                      <span className="font-medium">{shippingInfo.note}</span>
                    </div>
                  )}
                  <div className="flex pt-2 border-t border-gray-200 mt-2">
                    <span className="w-24 text-gray-500">Tổng tiền:</span>
                    <span className="font-bold text-blue-600">{total.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => {
                    setShowConfirmPopup(false);
                    navigate('/orders');
                  }}
                >
                  Xem đơn hàng
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm"
                  onClick={() => {
                    setShowConfirmPopup(false);
                    navigate('/');
                  }}
                >
                  Về trang chủ
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PayOS Status Modal */}
        {payosPayment && (
          <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setPayosPayment(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-3">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Thanh toán PayOS</h2>
                <p className="text-gray-600">Đang chờ thanh toán từ PayOS...</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-medium">{payosPayment.data.orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-bold text-purple-600">{payosPayment.data.amount.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      {payosPayment.data.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                  onClick={() => {
                    if (payosPayment.data.checkoutUrl) {
                      window.open(payosPayment.data.checkoutUrl, '_blank');
                    }
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Mở trang thanh toán PayOS
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => {
                    if (payosPayment) {
                      pollPaymentStatus(payosPayment.data.orderCode);
                    }
                  }}
                >
                  🔄 Kiểm tra lại trạng thái thanh toán
                </Button>
                
                <p className="text-sm text-gray-500 text-center">
                  <strong>Lưu ý:</strong> Sau khi thanh toán thành công trên PayOS, 
                  bạn sẽ được chuyển hướng về trang xác nhận hoặc có thể đóng cửa sổ 
                  thanh toán và quay lại trang này. Hệ thống sẽ tự động cập nhật trạng thái.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 text-center">
                    💡 <strong>Mẹo:</strong> Nếu không được chuyển hướng tự động, 
                    hãy quay lại trang này để kiểm tra trạng thái đơn hàng
                  </p>
                </div>
                
                {/* Debug tools for testing */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 font-medium mb-2">🔧 Debug Tools:</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={async () => {
                        try {
                          console.log('Manual status update triggered');
                          const updateResult = await OrderService.update(String(orderId), {
                            orderInfor: `Tên: ${shippingInfo.fullName} | SĐT: ${shippingInfo.phone} | Địa chỉ: ${shippingInfo.address} | PTTT: ${paymentMethod} | Ghi chú: ${shippingInfo.note}`,
                            amount: itemCount,
                            accountId: order.accountId,
                            voucherId: order.voucherId,
                            totalPrice: total,
                            status: 3,
                            lastEdited: new Date().toISOString(),
                          });
                          console.log('Manual update result:', updateResult);
                          alert('Order status manually updated to 3');
                        } catch (error) {
                          console.error('Manual update error:', error);
                          alert('Error updating order status manually');
                        }
                      }}
                    >
                      Update Status to 3
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={async () => {
                        try {
                          const paymentStatus = await PaymentService.getPaymentByOrderCode(payosPayment.data.orderCode);
                          console.log('Manual payment status check:', paymentStatus);
                          alert(`Payment Status: ${paymentStatus.data.status}`);
                        } catch (error) {
                          console.error('Manual payment check error:', error);
                          alert('Error checking payment status manually');
                        }
                      }}
                    >
                      Check Status
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutPage;