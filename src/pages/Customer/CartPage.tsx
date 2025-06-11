import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCart, CartItem } from "@/context/CartContext";

// AnimatedSection component remains the same
const AnimatedSection = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { ref, isInView } = useScrollAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const CartItemCard = ({ 
  item, 
  updateQuantity, 
  removeItem 
}: { 
  item: CartItem; 
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all">
      <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={item.productImage}
          alt={item.productName}
          className="object-cover w-full h-full"
        />
      </div>
      
      <div className="flex-grow">
        <h3 className="font-semibold text-blue-900">{item.productName}</h3>
        <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-4">
          <span>Loại: {item.type}</span>
          <span>Chất liệu: {item.productMaterial}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-2 sm:mt-0">
        <div className="flex items-center border border-blue-200 rounded-md">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-700"
            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-700"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-shrink-0 font-bold text-blue-600 min-w-[100px] text-right">
        {(item.price * item.quantity).toLocaleString("vi-VN")}₫
      </div>
      
      <Button 
        variant="ghost" 
        size="icon"
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => removeItem(item.productId)}
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
};

const OrderSummary = ({ 
  subtotal,
  shipping,
  total,
  itemCount
}: { 
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-blue-100 shadow-sm sticky top-24">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Tóm tắt đơn hàng</h2>
      
      <div className="space-y-3 mb-4">
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
        <div className="border-t border-blue-100 pt-3 mt-3 flex justify-between font-bold text-blue-900">
          <span>Tổng thanh toán:</span>
          <span>{total.toLocaleString("vi-VN")}₫</span>
        </div>
      </div>
      
      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3 py-6">
        Tiến hành thanh toán
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      
      <div className="text-center">
        <Link 
          to="/shop" 
          className="text-blue-600 hover:text-blue-700 text-sm hover:underline inline-flex items-center"
        >
          Tiếp tục mua sắm
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, subtotal, itemCount } = useCart();
  const [loading, setLoading] = useState(true);

  // Simulating loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Calculate shipping cost
  const shipping = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shipping;

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
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                  <span className="ml-1 font-medium text-blue-600 sm:ml-2">
                    Giỏ hàng
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
            Giỏ Hàng
          </h1>
        </AnimatedSection>

        {loading ? (
          // Loading state
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-blue-600 font-medium">Đang tải giỏ hàng...</p>
          </div>
        ) : cartItems.length > 0 ? (
          // Cart with items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimatedSection className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemCard 
                    key={item.productId} 
                    item={item} 
                    updateQuantity={updateQuantity}
                    removeItem={removeFromCart}
                  />
                ))}
              </AnimatedSection>
            </div>
            
            <div>
              <AnimatedSection>
                <OrderSummary 
                  subtotal={subtotal}
                  shipping={shipping}
                  total={total}
                  itemCount={itemCount}
                />
              </AnimatedSection>
            </div>
          </div>
        ) : (
          // Empty cart
          <AnimatedSection>
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-medium text-blue-900 mb-2">Giỏ hàng trống</h2>
              <p className="text-blue-600 mb-8 text-center max-w-md">
                Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy tiếp tục mua sắm để tìm các sản phẩm yêu thích.
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

export default CartPage;
