import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye } from 'lucide-react';
import WishlistService, { WishlistItem } from '@/services/WishlistService';
import ProductService, { Product } from '@/services/ProductService';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';

// Simple toast notification component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
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

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // Không cần phân trang khi chỉ lấy wishlist theo account
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { roleName } = useAuth();
  const { addToCart } = useCart();

  // Show toast function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Lấy accountId từ localStorage key 'account' (object, trường id)
    let accountId = '';
    try {
      const accStr = localStorage.getItem('account');
      if (accStr) {
        const accObj = JSON.parse(accStr);
        accountId = accObj.id;
      }
    } catch {}
    if (roleName && accountId) {
      fetchWishlistItemsByAccount(accountId);
    }
  }, [roleName]);

  const fetchWishlistItemsByAccount = async (accountId: string) => {
    try {
      setLoading(true);
      const items = await WishlistService.getByAccountId(accountId);
      setWishlistItems(items.map(item => ({ ...item, id: item.wishlistId || item.id })));

      // Fetch product details for each wishlist item
      if (items.length > 0) {
        const productPromises = items.map(item => 
          ProductService.getById(item.productId)
        );
        const productData = await Promise.all(productPromises);
        setProducts(productData);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      showToast('Không thể tải danh sách yêu thích', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistItemId: string) => {
    try {
      await WishlistService.delete(wishlistItemId);
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
      setProducts(prev => prev.filter(product => {
        // Tìm xem product này có còn trong wishlistItems sau khi xóa không
        return wishlistItems.some(item => item.id !== wishlistItemId && item.productId === product.productId);
      }));
      showToast('Đã xóa khỏi danh sách yêu thích', 'success');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('Không thể xóa khỏi danh sách yêu thích', 'error');
    }
  };

  const handleAddToCart = (product: Product) => {
    try {
      addToCart({
        productId: product.productId,
        productName: product.productName,
        productImage: product.productImage,
        price: product.price,
        quantity: 1,
        type: product.type,
        productMaterial: product.productMaterial
      });
      showToast('Đã thêm vào giỏ hàng', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Không thể thêm vào giỏ hàng', 'error');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="default" className="bg-green-500">Có sẵn</Badge>;
      case 0:
        return <Badge variant="secondary">Hết hàng</Badge>;
      default:
        return <Badge variant="destructive">Không xác định</Badge>;
    }
  };

  if (!roleName) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-4">Bạn cần đăng nhập để xem danh sách yêu thích</p>
          <Link to="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast notification: luôn hiển thị ở trên cùng trang */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Danh sách yêu thích</h1>
        <p className="text-gray-600">
          {wishlistItems.length} sản phẩm trong danh sách yêu thích của bạn
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Danh sách yêu thích trống</h2>
          <p className="text-gray-600 mb-4">
            Bạn chưa có sản phẩm nào trong danh sách yêu thích
          </p>
          <Link to="/products">
            <Button>Khám phá sản phẩm</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((wishlistItem) => {
            const product = products.find(p => p.productId === wishlistItem.productId);
            if (!product) return null;
            return (
              <Card key={wishlistItem.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={product.productImage || '/placeholder-image.png'}
                      alt={product.productName}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png';
                      }}
                    />
                    <div className="absolute top-2 right-2 opacity-100 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/80 hover:bg-white"
                        onClick={() => handleRemoveFromWishlist(wishlistItem.id)}
                        aria-label="Bỏ khỏi wishlist"
                      >
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {product.productName}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.productDescription}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {getStatusBadge(product.status)}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/products/${product.productId}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1"
                      disabled={product.status === 0}
                    >
                      Thêm vào giỏ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
