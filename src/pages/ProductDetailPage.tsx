import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, ShoppingCart, Heart } from "lucide-react";

interface Bracelet {
  name: string;
  description: string;
  price: string;
  imageSrc: string;
  category: string;
  material: string;
  size: string;
  rating: number;
  reviews: number;
  stock: number;
  colors: string[];
}

const mockBracelets: Bracelet[] = Array.from({ length: 20 }, (_, i) => ({
  name: `Vòng tay ${i + 1}`,
  description: "Vòng tay thủ công từ " + ["đá tự nhiên", "vàng mạ cao cấp", "tinh thể pha lê", "chất liệu bohemian"][i % 4] + 
              ", thiết kế tinh tế phù hợp với mọi dịp.",
  price: `${(700 + i * 50).toLocaleString("vi-VN")}₫`,
  imageSrc: `https://placehold.co/800x800/cccccc/000000?text=Vong+${i + 1}`,
  category: ["Tất cả", "Bohemian", "Tinh Thể", "Vàng"][i % 4],
  material: ["Đá quý tự nhiên", "Vàng 18K mạ", "Pha lê Swarovski", "Da tổng hợp"][i % 4],
  size: "17cm - 19cm (có thể điều chỉnh)",
  rating: 4.5 + (i % 5 * 0.1),
  reviews: 12 + i,
  stock: 50 - i,
  colors: ["#F59E0B", "#10B981", "#3B82F6", "#EF4444"][i % 4] === "#F59E0B" 
          ? ["#F59E0B", "#B45309", "#FCD34D"] 
          : ["#10B981", "#3B82F6", "#EF4444"].slice(0, 3)
}));

const BraceletDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const braceletIndex = Number(id) - 1;
  const bracelet = mockBracelets[braceletIndex];

  if (!bracelet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md border border-violet-100">
          <h2 className="text-3xl font-semibold text-violet-800 mb-4">Không tìm thấy sản phẩm</h2>
          <p className="text-violet-600 mb-6">Vòng tay bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button 
            onClick={() => navigate(-1)}
            className="gap-2 bg-violet-500 hover:bg-violet-600 text-white"
          >
            <ChevronLeft size={18} />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* violet Theme Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-violet-100/50 -z-10" />
      <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-white/30 blur-md" />
      <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-white/30 blur-md" />
      <div className="absolute top-40 left-1/3 w-12 h-12 rounded-full bg-white/30 blur-md" />

      <div className="max-w-6xl mx-auto relative">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li>
              <button 
                onClick={() => navigate('/')}
                className="inline-flex items-center text-sm font-medium text-violet-700 hover:text-violet-800 hover:underline"
              >
                Trang chủ
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-violet-400" />
                <button 
                  onClick={() => navigate('/shop')}
                  className="ml-1 text-sm font-medium text-violet-700 hover:text-violet-800 hover:underline md:ml-2"
                >
                  Vòng tay
                </button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-violet-400" />
                <span className="ml-1 text-sm font-medium text-violet-600 md:ml-2 hover:underline">
                  {bracelet.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Product Container */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-violet-100">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-square overflow-hidden bg-violet-50">
              <img
                src={bracelet.imageSrc}
                alt={bracelet.name}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md">
              <button className="p-2 text-violet-700 hover:text-violet-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            
            {/* violet-themed decorative element */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-violet-100/50 to-transparent"></div>
          </div>

          {/* Product Info */}
          <div className="p-8 flex flex-col">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-violet-900 mb-2">{bracelet.name}</h1>
                  <p className="text-violet-500 mb-1">Danh mục: {bracelet.category}</p>
                </div>
                <div className="flex items-center bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
                  <Star className="w-4 h-4 text-violet-400 fill-violet-400" />
                  <span className="ml-1 text-sm font-medium text-violet-700">
                    {bracelet.rating.toFixed(1)} ({bracelet.reviews} đánh giá)
                  </span>
                </div>
              </div>

              <div className="my-6">
                <p className="text-3xl font-semibold text-violet-600">{bracelet.price}</p>
                {bracelet.stock > 0 ? (
                  <p className="text-sm text-green-600 mt-1">Còn {bracelet.stock} sản phẩm</p>
                ) : (
                  <p className="text-sm text-rose-600 mt-1">Tạm hết hàng</p>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-medium text-violet-900 mb-2">Mô tả sản phẩm</h3>
                  <p className="text-violet-700">{bracelet.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-violet-900 mb-2">Thông tin chi tiết</h3>
                  <div className="grid grid-cols-2 gap-4 bg-violet-50/50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-violet-500">Chất liệu</p>
                      <p className="font-medium text-violet-800">{bracelet.material}</p>
                    </div>
                    <div>
                      <p className="text-sm text-violet-500">Kích thước</p>
                      <p className="font-medium text-violet-800">{bracelet.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-violet-500">Màu sắc</p>
                      <div className="flex gap-2 mt-1">
                        {bracelet.colors.map((color, i) => (
                          <button 
                            key={i}
                            className="w-6 h-6 rounded-full border border-violet-200 shadow-sm"
                            style={{ backgroundColor: color }}
                            aria-label={`Màu ${i+1}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-violet-500">Bảo hành</p>
                      <p className="font-medium text-violet-800">6 tháng</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-violet-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 h-12 bg-violet-500 hover:bg-violet-600 text-white shadow-md gap-2 transition-all duration-300"
                  disabled={bracelet.stock <= 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 border-violet-300 text-violet-700 hover:bg-violet-50 gap-2"
                  onClick={() => navigate(-1)}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Quay lại
                </Button>
              </div>
              {bracelet.stock <= 0 && (
                <p className="text-sm text-rose-500 mt-3 text-center">
                  Sản phẩm tạm hết hàng. Vui lòng liên hệ để đặt trước.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-violet-900 mb-8 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-violet-400">
            Sản phẩm tương tự
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockBracelets
              .filter(b => b.category === bracelet.category && b.name !== bracelet.name)
              .slice(0, 4)
              .map((item, i) => (
                <div 
                  key={i} 
                  className="group relative bg-white rounded-lg shadow-sm overflow-hidden border border-violet-100 cursor-pointer hover:shadow-lg transition-all hover:border-violet-200"
                  onClick={() => navigate(`/shop/${mockBracelets.indexOf(item) + 1}`)}
                >
                  <div className="aspect-square overflow-hidden bg-violet-50">
                    <img
                      src={item.imageSrc}
                      alt={item.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-violet-800 truncate">{item.name}</h3>
                    <p className="text-violet-600 font-medium mt-1">{item.price}</p>
                    <div className="w-0 group-hover:w-full h-1 bg-violet-300 mt-2 transition-all duration-300"></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BraceletDetailPage;