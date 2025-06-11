import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export const CartIcon = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative" 
      onClick={() => navigate('/cart')}
      aria-label="Giỏ hàng"
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
};
