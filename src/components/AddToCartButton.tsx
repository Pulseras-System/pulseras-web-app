import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';

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
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Create cart item from product
    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity: quantity,
      type: product.type,
      productMaterial: product.material
    };

    // Add to cart
    addToCart(cartItem);
    
    // Show success message
    setShowNotification(true);

    // Reset button state after animation
    setTimeout(() => {
      setIsAdding(false);
      setTimeout(() => {
        setShowNotification(false);
      }, 500);
    }, 1500);
  };

  return (
    <div className="relative">
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
      
      {showNotification && (
        <div className="absolute top-full mt-2 right-0 bg-green-100 text-green-800 text-sm p-2 rounded shadow-md z-50 min-w-[200px]">
          <div className="flex items-center">
            <Check className="h-4 w-4 mr-1" />
            <span>Đã thêm {quantity} sản phẩm vào giỏ hàng</span>
          </div>
        </div>
      )}
    </div>
  );
};
