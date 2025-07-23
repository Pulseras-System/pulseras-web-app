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
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
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
          accountId: accountId,
          page: 0,
          size: 10
        });
        const foundItem = response.items.find(item => 
          item.productId === productId && item.accountId === accountId
        );
        setIsInWishlist(!!foundItem);
        setWishlistItemId(foundItem ? foundItem.id : null);
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

    setIsLoading(true);
    try {
      if (isInWishlist && wishlistItemId) {
        // Nếu đã thích, nhấn lại sẽ xóa khỏi wishlist
        await WishlistService.delete(wishlistItemId);
        setIsInWishlist(false);
        setWishlistItemId(null);
        showToast('Đã bỏ khỏi Wishlist', 'success');
      } else if (!isInWishlist) {
        // Nếu chưa thích, nhấn sẽ thêm vào wishlist
        const newItem = await WishlistService.create({ 
          accountId,
          productId,
          status: 1 // 1 = active wishlist item
        });
        setIsInWishlist(true);
        setWishlistItemId(newItem.id);
        showToast('Đã thêm vào Wishlist', 'success');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
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
        disabled={isLoading}
        aria-pressed={isInWishlist}
      >
        <Heart className={`h-4 w-4 transition-all duration-200 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
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
