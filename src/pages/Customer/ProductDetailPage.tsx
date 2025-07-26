import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight} from "lucide-react";
import ProductService, { Product } from "@/services/ProductService";
import FeedbackService, { Feedback } from "@/services/FeedbackService";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToWishlistButton } from "@/components/AddToWishlistButton";

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md z-50 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
      {message}
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Feedback state
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Show toast function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Lấy chi tiết sản phẩm
  useEffect(() => {
    if (id) {
      setLoading(true);
      ProductService.getById(id)
        .then((data) => setProduct(data))
        .catch((err) => console.error("Error fetching product:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // 2. Lấy sản phẩm liên quan khi đã có product
  useEffect(() => {
    if (product) {
      ProductService.get({ sort: "createDate", size: 20 })
        .then((allProducts) => {
          const related = allProducts.items.filter(
            (p) => p.productId !== product.productId && p.type === product.type
          );
          setRelatedProducts(related.slice(0, 4));
        })
        .catch((err) => console.error("Error fetching related products:", err));
    }
  }, [product]);

  // Lấy feedback cho sản phẩm
  useEffect(() => {
    if (product && product.productId) {
      const pid = String(product.productId);
      FeedbackService.getByProductId(pid)
        .then((data: any) => {
          // Nếu API trả về { items: [...] }
          if (data && Array.isArray(data.items)) {
            setFeedbacks(data.items.filter((fb: any) => (fb.product_id === pid || fb.productId === pid)));
          } else if (Array.isArray(data)) {
            setFeedbacks(data.filter((fb: any) => (fb.product_id === pid || fb.productId === pid)));
          } else {
            setFeedbacks([]);
          }
        })
        .catch(() => setFeedbacks([]));
    } else {
      setFeedbacks([]);
    }
  }, [product]);

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md border border-blue-100">
          <h2 className="text-3xl font-semibold text-blue-800 mb-4">Đang tải dữ liệu...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Toast notification: luôn hiển thị ở trên cùng góc phải trang */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-blue-100/50 -z-10" />
      <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-pink-100/30 blur-md" />
      <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-blue-100/30 blur-md" />
      <div className="absolute top-40 left-1/3 w-12 h-12 rounded-full bg-pink-100/30 blur-md" />

      <div className="max-w-6xl mx-auto relative">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
              >
                Trang chủ
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-blue-400" />
                <button
                  onClick={() => navigate('/shop')}
                  className="ml-1 text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline md:ml-2"
                >
                  Vòng tay
                </button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-blue-400" />
                <span className="ml-1 text-sm font-medium text-blue-600 md:ml-2 hover:underline">
                  {product.productName}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Product Container */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-blue-100">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-square overflow-hidden bg-blue-50">
              <img
                src={product.productImage}
                alt={product.productName}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <AddToWishlistButton
                productId={product.productId}
                variant="ghost"
                size="icon"
                className="text-pink-500 hover:text-pink-400 hover:bg-white/90"
                showToast={showToast}
              />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-blue-100/50 to-transparent"></div>
          </div>

          {/* Product Info */}
          <div className="p-8 flex flex-col">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-blue-900 mb-2">
                    {product.productName}
                  </h1>
                  <p className="text-blue-500 mb-1">
                    Loại: {product.type}
                  </p>
                </div>
                {/* Nếu API có trường đánh giá thì có thể hiển thị */}
                <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  <Star className="w-4 h-4 text-pink-400 fill-pink-400" />
                  <span className="ml-1 text-sm font-medium text-blue-700">
                    {/* Có thể thay thế bằng rating, ví dụ: 4.5 (nếu có) */}
                    4.5 (123 đánh giá)
                  </span>
                </div>
              </div>

              {/* Price and Stock */}
              <div className="my-6">
                <p className="text-3xl font-semibold text-pink-500">
                  {product.price.toLocaleString("vi-VN")}₫
                </p>
                {product.quantity > 0 ? (
                  <p className="text-sm text-green-600 mt-1">
                    Còn {product.quantity} sản phẩm
                  </p>
                ) : (
                  <p className="text-sm text-rose-600 mt-1">Tạm hết hàng</p>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Mô tả sản phẩm
                  </h3>
                  <p className="text-blue-700">
                    {product.productDescription}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Thông tin chi tiết
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-blue-500">Chất liệu</p>
                      <p className="font-medium text-blue-800">
                        {product.productMaterial}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-500">Số lượng</p>
                      <p className="font-medium text-blue-800">
                        {product.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-blue-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <AddToCartButton
                  product={{
                    id: product.productId,
                    name: product.productName,
                    image: product.productImage,
                    price: product.price,
                    type: product.type,
                    material: product.productMaterial
                  }}
                  variant="outline"
                  className="flex-1 h-12 bg-pink-400 hover:bg-pink-500 text-white shadow-md gap-2 transition-all duration-300"
                  // disabled={product.quantity <= 0}
                />
                {/* <AddToWishlistButton
                  productId={product.productId}
                  variant="outline"
                  className="h-12 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 shadow-md transition-all duration-300"
                /> */}
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-blue-300 text-blue-700 hover:bg-blue-50 gap-2"
                  onClick={() => navigate(-1)}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Quay lại
                </Button>
              </div>
              {product.quantity <= 0 && (
                <p className="text-sm text-rose-500 mt-3 text-center">
                  Sản phẩm tạm hết hàng. Vui lòng liên hệ để đặt trước.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Section - Redesigned */}
        <div className="mt-16 max-w-2xl mx-auto bg-gradient-to-br from-blue-50 via-white to-pink-50 rounded-2xl shadow-lg border border-blue-100 p-8">
          <h2 className="text-2xl font-extrabold text-pink-500 mb-6 flex items-center gap-2">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#ec4899" d="M12 2c2.21 0 4 1.79 4 4 0 1.1-.45 2.09-1.17 2.81l-.01.01-2.82 2.82-2.82-2.82-.01-.01A3.978 3.978 0 0 1 8 6c0-2.21 1.79-4 4-4Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-7 8c0-2.21 1.79-4 4-4 .88 0 1.68.29 2.33.78l.01.01 2.82 2.82-2.82 2.82-.01.01A3.978 3.978 0 0 1 9 16c-2.21 0-4-1.79-4-4Zm2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0c0-2.21 1.79-4 4-4 .88 0 1.68.29 2.33.78l.01.01 2.82 2.82-2.82 2.82-.01.01A3.978 3.978 0 0 1 17 16c-2.21 0-4-1.79-4-4Zm2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/></svg>
            Đánh giá sản phẩm
          </h2>
          {/* Danh sách feedback */}
          <div className="mb-8">
            {Array.isArray(feedbacks) && feedbacks.length === 0 ? (
              <div className="text-blue-400 text-center italic py-8">Chưa có đánh giá nào cho sản phẩm này.</div>
            ) : Array.isArray(feedbacks) ? (
              <ul className="space-y-6">
                {feedbacks.map((fb: any) => (
                  <li key={fb.feedback_id || fb.feedbackId} className="flex gap-4 items-start bg-white/80 rounded-xl shadow-sm border border-blue-100 p-4 hover:shadow-md transition-all">
                    <div className="flex-shrink-0">
                      <img
                        src={fb.avatarUrl || '/src/assets/icons/user.svg'}
                        alt="avatar"
                        className="w-10 h-10 rounded-full border border-pink-200 object-cover bg-blue-50"
                        onError={(e: any) => { e.target.src = '/src/assets/icons/user.svg'; }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${fb.fullName === 'Administrator' ? 'text-pink-500' : 'text-blue-800'}`}>
                          {fb.fullName ? fb.fullName : `Người dùng #${fb.account_id || fb.accountId}`}
                        </span>
                        {fb.fullName === 'Administrator' && (
                          <span className="ml-1 px-2 py-0.5 text-xs rounded bg-pink-100 text-pink-600 font-bold">Admin</span>
                        )}
                        <span className="text-xs text-blue-400 ml-auto">{new Date(fb.createDate).toLocaleString()}</span>
                      </div>
                      <div className="text-blue-700 text-base leading-relaxed">{fb.feedbackInfor}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {/* Form gửi feedback */}
          <form
            className="bg-white/90 rounded-xl border border-blue-100 p-6 shadow flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!feedbackText.trim()) {
                showToast("Vui lòng nhập nội dung đánh giá!", "error");
                return;
              }
              setFeedbackLoading(true);
              try {
                // Lấy account_id từ localStorage key 'account'
                const accountStr = localStorage.getItem('account');
                let accountId = "";
                if (accountStr) {
                  try {
                    const accountObj = JSON.parse(accountStr);
                    if (accountObj && accountObj.id) {
                      accountId = accountObj.id;
                    }
                  } catch {
                    accountId = "";
                  }
                }
                if (!accountId) {
                  showToast("Không tìm thấy tài khoản. Vui lòng đăng nhập lại!", "error");
                  setFeedbackLoading(false);
                  return;
                }
              await FeedbackService.create({
                accountId: accountId,
                productId: String(product.productId),
                feedbackInfor: feedbackText,
                status: 0,
              });
                setFeedbackText("");
                showToast("Gửi đánh giá thành công!", "success");
                // Reload feedbacks
                const pid = typeof product.productId === 'string' ? parseInt(product.productId, 10) : product.productId;
                FeedbackService.getByProductId(pid)
                  .then(setFeedbacks)
                  .catch(() => setFeedbacks([]));
              } catch (err) {
                showToast("Gửi đánh giá thất bại!", "error");
              } finally {
                setFeedbackLoading(false);
              }
            }}
          >
            <textarea
              className="w-full border border-pink-200 rounded-xl p-4 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[80px] text-blue-900 bg-pink-50/30 placeholder:text-blue-300 resize-none transition-all"
              placeholder="Nhập đánh giá của bạn về sản phẩm..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              disabled={feedbackLoading}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-400">Tối đa 500 ký tự</span>
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-bold px-8 py-2 rounded-lg shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={feedbackLoading}
              >
                {feedbackLoading ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-blue-900 mb-8 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-pink-400">
            Sản phẩm tương tự
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <div
                key={item.productId}
                className="group relative bg-white rounded-lg shadow-sm overflow-hidden border border-blue-100 cursor-pointer hover:shadow-lg transition-all hover:border-blue-200"
                onClick={() => navigate(`/shop/${item.productId}`)}
              >
                <div className="aspect-square overflow-hidden bg-blue-50">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-blue-800 truncate">
                    {item.productName}
                  </h3>
                  <p className="text-blue-600 font-medium mt-1">
                    {item.price.toLocaleString("vi-VN")}₫
                  </p>
                  <div className="w-0 group-hover:w-full h-1 bg-blue-300 mt-2 transition-all duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;