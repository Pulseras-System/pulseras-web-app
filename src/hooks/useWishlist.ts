import { useState, useEffect } from 'react';
import WishlistService, { WishlistItem } from '@/services/WishlistService';
import { useAuth } from '@/hooks/useAuth';

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { roleName } = useAuth();

  const fetchWishlist = async () => {
    if (!roleName) return;
    
    try {
      setLoading(true);
      const response = await WishlistService.getAll({
        keyword: '',
        page: 0,
        size: 100, // Get all items
        sort: 'createdAt'
      });
      setWishlistItems(response.items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!roleName) return false;
    
    // Lấy accountId từ localStorage giống như AddToCartButton
    const accountStr = localStorage.getItem('account');
    const accountId = accountStr ? JSON.parse(accountStr).id : null;
    if (!accountId) return false;
    
    try {
      const newItem = await WishlistService.create({ 
        accountId,
        productId,
        status: 1
      });
      setWishlistItems(prev => [...prev, newItem]);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (wishlistItemId: string): Promise<boolean> => {
    try {
      await WishlistService.delete(wishlistItemId);
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const getWishlistItemByProductId = (productId: string): WishlistItem | undefined => {
    return wishlistItems.find(item => item.productId === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, [roleName]);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistItemByProductId,
    refetch: fetchWishlist,
    wishlistCount: wishlistItems.length
  };
};

export default useWishlist;
