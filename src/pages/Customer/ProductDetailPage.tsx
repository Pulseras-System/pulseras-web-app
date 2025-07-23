import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight} from "lucide-react";
import ProductService, { Product } from "@/services/ProductService";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToWishlistButton } from "@/components/AddToWishlistButton";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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