import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import WishlistService from '@/services/WishlistService';
import { useAuth } from '@/hooks/useAuth';

interface AddToWishlistButtonProps {
  productId: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

// Simple toast notification component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {message}
    </div>
  );
};

export const AddToWishlistButton: React.FC<AddToWishlistButtonProps> = ({
  productId,
  className = "",
  variant = "outline",
  size = "default"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { roleName } = useAuth();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check if product is already in wishlist when component mounts
  React.useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!roleName) return;
      
      // Lấy accountId từ localStorage giống như AddToCartButton
      const accountStr = localStorage.getItem('account');
      const accountId = accountStr ? JSON.parse(accountStr).id : null;
      if (!accountId) return;

      try {
        const response = await WishlistService.getAll({
          keyword: productId,
          page: 0,
          size: 1
        });
        const isInList = response.items.some(item => 
          item.productId === productId && item.accountId === accountId
        );
        setIsInWishlist(isInList);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [productId, roleName]);

  const handleAddToWishlist = async () => {
    if (!roleName) {
      showToast('Vui lòng đăng nhập để thêm vào wishlist', 'error');
      return;
    }

    // Lấy accountId từ localStorage giống như AddToCartButton
    const accountStr = localStorage.getItem('account');
    const accountId = accountStr ? JSON.parse(accountStr).id : null;
    if (!accountId) {
      showToast('Không thể xác định tài khoản người dùng', 'error');
      return;
    }

    if (isInWishlist) {
      showToast('Sản phẩm đã có trong danh sách yêu thích', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await WishlistService.create({ 
        accountId,
        productId,
        status: 1 // 1 = active wishlist item
      });
      setIsInWishlist(true);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast('Không thể thêm vào danh sách yêu thích', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleAddToWishlist}
        disabled={isLoading || isInWishlist}
      >
        <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
        {size !== "icon" && (
          <span className="ml-2">
            {isInWishlist ? 'Đã thích' : 'Yêu thích'}
          </span>
        )}
      </Button>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default AddToWishlistButton;
