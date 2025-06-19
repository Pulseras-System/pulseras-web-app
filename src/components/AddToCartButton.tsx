import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import OrderService from '@/services/OrderService';
import OrderDetailService from '@/services/OrderDetailService';

interface AddToCartProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    type: string;
    material: string;
  };
  quantity?: number;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export const AddToCartButton = ({ product, quantity = 1, className = '', variant = 'default' }: AddToCartProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Lấy accountId từ localStorage mỗi lần click để đảm bảo luôn lấy giá trị mới nhất
  const handleAddToCart = async () => {
    const accountStr = localStorage.getItem('account');
    const accountId = accountStr ? JSON.parse(accountStr).id : null;
    if (!accountId) {
      alert('Bạn cần đăng nhập để thêm vào giỏ hàng!');
      return;
    }
    setIsAdding(true);
    try {
      // 1. Lấy danh sách order của account (status = 0 là giỏ hàng)
      const orders = await OrderService.get();
      let cartOrder = Array.isArray(orders) ? orders.find((o: any) => o.accountId === accountId && o.status === 1) : null;
      // 2. Nếu chưa có order, tạo mới
      if (!cartOrder) {
        const now = new Date().toISOString();
        const newOrder = await OrderService.create({
          orderInfor: 'Giỏ hàng',
          amount: 0,
          accountId: accountId,
          voucherId: "0", // truyền string "0" thay vì null
          totalPrice: 0,
          status: 1,
          lastEdited: now,
          createDate: now
        });
        cartOrder = newOrder;
      }
      // 3. Thêm sản phẩm vào order-detail
      await OrderDetailService.create({
        orderId: String(cartOrder.id),
        productId: String(product.id),
        quantity: quantity,
        price: product.price,
        promotionId: "0", // truyền string nếu interface mới yêu cầu string
        status: 1,
        lastEdited: new Date().toISOString(),
        createDate: new Date().toISOString()
      });
      setShowNotification(true);
    } catch (error) {
      alert('Có lỗi khi thêm vào giỏ hàng!');
    } finally {
      setIsAdding(false);
      setTimeout(() => setShowNotification(false), 1500);
    }
  };

  // Notification component using portal to render at the top of the page
  const Notification = () => {
    if (!showNotification) return null;
    
    return createPortal(
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-md">
        <div className="bg-green-100 border border-green-200 text-green-800 rounded-lg shadow-lg px-4 py-3 animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-full p-1">
              <Check className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="font-medium">Đã thêm vào giỏ hàng</p>
              {/* <p className="text-sm">{quantity} x {product.name}</p> */}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <Button 
        variant={variant} 
        className={`transition-all ${className}`}
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {isAdding ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Đã thêm
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Thêm vào giỏ
          </>
        )}
      </Button>
      
      <Notification />
    </>
  );
};
