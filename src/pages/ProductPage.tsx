import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, ChevronLeft, ChevronFirst, ChevronLast } from "lucide-react";

interface Bracelet {
  name: string;
  description: string;
  price: string;
  imageSrc: string;
  category: string;
}

const mockBracelets: Bracelet[] = Array.from({ length: 20 }, (_, i) => ({
  name: `Vòng tay ${i + 1}`,
  description: ["Đá tự nhiên", "Mạ vàng", "Tinh thể", "Bohemian"][i % 4],
  price: `${(700 + i * 50).toLocaleString("vi-VN")}₫`,
  imageSrc: `https://placehold.co/600x600/cccccc/000000?text=Vong+${i + 1}`,
  category: ["Tất cả", "Bohemian", "Tinh Thể", "Vàng"][i % 4],
}));

const categories = [
  { name: "Tất cả vòng tay", value: "Tất cả", bg: "bg-gradient-to-br from-pink-400 to-pink-600", icon: "✨" },
  { name: "Bohemian", value: "Bohemian", bg: "bg-gradient-to-br from-teal-400 to-teal-600", icon: "🌿" },
  { name: "Tinh Thể", value: "Tinh Thể", bg: "bg-gradient-to-br from-blue-400 to-indigo-600", icon: "🔮" },
  { name: "Vàng", value: "Vàng", bg: "bg-gradient-to-br from-amber-300 to-amber-500", icon: "🌟" },
];

const BraceletsPerPage = 12;

const BraceletCard = ({
  name,
  description,
  price,
  imageSrc,
  id,
}: Bracelet & { id: number }) => (
  <Link to={`/shop/${id}`} className="group block transition-transform hover:-translate-y-1">
    <div className="relative flex flex-col w-full overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 bg-white">
      <div className="relative overflow-hidden aspect-square">
        <img
          loading="lazy"
          src={imageSrc}
          alt={`Vòng tay ${name}`}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/70 via-pink-800/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
          <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-xl font-bold text-white drop-shadow-md">{name}</h3>
            <p className="text-pink-100 mt-1 text-sm">{description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg font-semibold text-pink-200">{price}</span>
              <Button
                variant="default"
                size="sm"
                className="bg-pink-500 hover:bg-pink-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                Xem chi tiết
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-pink-900 truncate">{name}</h3>
        <p className="text-pink-600 text-sm mt-1">{description}</p>
        <p className="text-pink-500 font-medium mt-2">{price}</p>
      </div>
    </div>
  </Link>
);

const ProductPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredBracelets = mockBracelets.filter((b) => {
    const matchesCategory = selectedCategory === "Tất cả" || b.category === selectedCategory;
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredBracelets.length / BraceletsPerPage);
  const paginated = filteredBracelets.slice(
    (currentPage - 1) * BraceletsPerPage,
    currentPage * BraceletsPerPage
  );

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="px-4 sm:px-6 py-8 bg-gradient-to-b from-pink-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li>
              <button 
                onClick={() => navigate('/')}
                className="inline-flex items-center text-sm font-medium text-pink-700 hover:text-pink-600 hover:underline transition-colors"
              >
                Trang chủ
              </button>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-pink-400" />
                <span className="ml-1 text-sm font-medium text-pink-600 md:ml-2 hover:underline">
                  Vòng tay
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-pink-900 mb-4">
            Bộ Sưu Tập Vòng Tay
          </h1>
          <p className="text-lg text-pink-700 max-w-2xl mx-auto">
            Khám phá bộ sưu tập vòng tay độc đáo, kết hợp tinh tế giữa truyền thống và hiện đại
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12 bg-white p-6 rounded-xl shadow-sm border border-pink-100">
          <div className="max-w-md mx-auto mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-pink-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm vòng tay..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-3 border border-pink-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
            />
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-2xl font-bold text-center text-pink-900 mb-6 relative inline-block">
              <span className="relative z-10 px-4 bg-white">Danh mục vòng tay</span>
              <span className="absolute bottom-3 left-0 right-0 h-1 bg-pink-100 z-0"></span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {categories.map((cat, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setCurrentPage(1);
                  }}
                  className={`${cat.bg} rounded-xl p-4 text-center text-white font-medium hover:shadow-lg transition-all hover:scale-[1.03] relative overflow-hidden group ${
                    selectedCategory === cat.value
                      ? "ring-2 ring-white ring-opacity-70"
                      : ""
                  }`}
                >
                  <span className="absolute opacity-20 group-hover:opacity-30 transition-opacity text-5xl right-2 top-2">
                    {cat.icon}
                  </span>
                  <span className="relative z-10 drop-shadow-md">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-pink-900 mb-12 relative inline-block">
            <span className="relative z-10 px-4 bg-gradient-to-b from-pink-50 to-white">
              {selectedCategory === "Tất cả" ? "Tất cả sản phẩm" : `Vòng tay ${selectedCategory}`}
            </span>
            <span className="absolute bottom-4 left-0 right-0 h-1 bg-pink-100 z-0"></span>
          </h2>
          
          {paginated.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginated.map((bracelet, index) => (
                <BraceletCard key={index} id={mockBracelets.indexOf(bracelet) + 1} {...bracelet} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-pink-100">
              <div className="mx-auto w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <Search className="h-12 w-12 text-pink-600" />
              </div>
              <h3 className="text-xl font-medium text-pink-900 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-pink-600 mb-6">Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn</p>
              <Button
                variant="outline"
                className="border-pink-500 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
                onClick={() => {
                  setSelectedCategory("Tất cả");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                Xem tất cả sản phẩm
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changePage(1)}
                  disabled={currentPage === 1}
                  className="border-pink-300 hover:bg-pink-50"
                >
                  <ChevronFirst className="h-4 w-4 text-pink-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-pink-300 hover:bg-pink-50"
                >
                  <ChevronLeft className="h-4 w-4 text-pink-600" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      onClick={() => changePage(pageNum)}
                      className={`min-w-[40px] ${
                        pageNum === currentPage
                          ? "bg-pink-500 hover:bg-pink-600"
                          : "border-pink-300 hover:bg-pink-50 text-pink-600"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-pink-300 hover:bg-pink-50"
                >
                  <ChevronRight className="h-4 w-4 text-pink-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changePage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="border-pink-300 hover:bg-pink-50"
                >
                  <ChevronLast className="h-4 w-4 text-pink-600" />
                </Button>
              </div>
              <p className="text-sm text-pink-600">
                Hiển thị {(currentPage - 1) * BraceletsPerPage + 1} -{" "}
                {Math.min(currentPage * BraceletsPerPage, filteredBracelets.length)} trong số{" "}
                {filteredBracelets.length} sản phẩm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;