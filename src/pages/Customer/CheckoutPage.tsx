import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingBag, CreditCard, DollarSign, QrCode } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import OrderService from "@/services/OrderService";
import OrderDetailService from "@/services/OrderDetailService";
import ProductService from "@/services/ProductService";
import { set } from "lodash";

// AnimatedSection và CheckoutItemCard giữ nguyên
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
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
    <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
      <img src={item.productImage} alt={item.productName} className="object-cover w-full h-full" />
    </div>
    <div className="flex-grow">
      <h3 className="font-semibold text-blue-900">{item.productName}</h3>
      <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-4">
        <span>Loại: {item.type}</span>
        <span>Chất liệu: {item.productMaterial}</span>
      </div>
    </div>
    <div className="flex items-center gap-3 mt-2 sm:mt-0">
      <span className="w-8 text-center font-medium">{item.quantity}</span>
    </div>
    <div className="flex-shrink-0 font-bold text-blue-600 min-w-[100px] text-right">
      {(item.price * item.quantity).toLocaleString("vi-VN")}₫
    </div>
  </div>
);

// PaymentMethodCard component
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
        ? "border-blue-500 bg-blue-50"
        : "border-gray-200 hover:border-blue-300"
      }`}
    onClick={() => onChange(value)}
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-md border border-gray-200">
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

// OrderSummary component mới với thông tin nhận hàng ở trên
const OrderSummary = ({
  subtotal,
  shipping,
  total,
  itemCount,
  paymentMethod,
  setPaymentMethod,
  shippingInfo,
  setShippingInfo,
}: {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  shippingInfo: any;
  setShippingInfo: (info: any) => void;
}) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-24">
    {/* Thông tin nhận hàng */}
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin nhận hàng</h2>
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
              value={shippingInfo.phone}
              onChange={(e) =>
                setShippingInfo({ ...shippingInfo, phone: e.target.value })
              }
              className="focus:ring-blue-500 focus:border-blue-500"
            />
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

    {/* Tóm tắt đơn hàng */}
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
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
        <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold">
          <span className="text-gray-900">Tổng thanh toán:</span>
          <span className="text-red-600">{total.toLocaleString("vi-VN")}₫</span>
        </div>
      </div>
    </div>

    {/* Phương thức thanh toán */}
    <div className="mb-6">
      <label className="block font-medium mb-3 text-gray-900">
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
          description="Thanh toán qua thẻ ngân hàng"
        />
      </div>
    </div>

    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3 py-6 text-base font-medium">
      Đặt hàng
    </Button>
    <div className="text-center">
      <a
        href="/shop"
        className="text-blue-600 hover:text-blue-700 text-sm hover:underline inline-flex items-center"
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

  const [accountId, setAccountId] = useState<string | null>(null);
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

  useEffect(() => {
    const accountStr = localStorage.getItem('account');
    if (accountStr) {
      try {
        const account = JSON.parse(accountStr);
        setAccountId(account.id || null);
        setShippingInfo((prev) => ({
          ...prev,
          fullName: account.fullName || "",
          phone: account.phone || "",
        }));
      } catch {
        setAccountId(null);
      }
    } else {
      setAccountId(null);
    }
  }, []);

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

  const shipping = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shipping;

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();

    OrderService.update(String(orderId), {
      orderInfor: `Tên: ${shippingInfo.fullName} | SĐT: ${shippingInfo.phone} | Địa chỉ: ${shippingInfo.address} | PTTT: ${paymentMethod} | Ghi chú: ${shippingInfo.note}`,
      amount: order.amount,
      accountId: order.accountId,
      voucherId: order.voucherId,
      totalPrice: order.totalPrice,
      status: 2,
      lastEdited: new Date().toISOString(),
    })
    alert(
      `Đặt hàng thành công!\nTên: ${shippingInfo.fullName}\nSĐT: ${shippingInfo.phone}\nĐịa chỉ: ${shippingInfo.address}\nPTTT: ${paymentMethod}\nGhi chú: ${shippingInfo.note}\nTổng tiền: ${total.toLocaleString('vi-VN')}₫`
    );
    navigate('/');
    localStorage.setItem('amount', (Number(0).toString()));
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
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 flex items-center justify-center sm:justify-start gap-3">
            <ShoppingBag className="h-8 w-8" />
            Thanh toán
          </h1>
        </AnimatedSection>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-blue-600 font-medium">Đang tải đơn hàng...</p>
          </div>
        ) : cartItems.length > 0 ? (
          <form onSubmit={handleOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <AnimatedSection>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <CheckoutItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </AnimatedSection>
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
              <h2 className="text-2xl font-medium text-blue-900 mb-2">Không có sản phẩm để thanh toán</h2>
              <p className="text-blue-600 mb-8 text-center max-w-md">
                Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.
              </p>
              <Button
                variant="default"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/shop')}
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;