import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { createPortal } from 'react-dom';

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
