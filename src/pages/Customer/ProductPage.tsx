import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, ChevronLeft, ChevronFirst, ChevronLast } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ProductService, { Product } from "@/services/ProductService";
import { AddToCartButton } from "@/components/AddToCartButton";

const categories = [
  { name: "Tất cả vòng tay", value: "Tất cả", bg: "bg-gradient-to-br from-blue-300 to-blue-400", icon: "✨" },
  { name: "Bohemian", value: "Bohemian", bg: "bg-gradient-to-br from-green-200 to-green-300", icon: "🌿" },
  { name: "Tinh Thể", value: "Tinh Thể", bg: "bg-gradient-to-br from-pink-200 to-pink-300", icon: "🔮" },
  { name: "Vàng", value: "Vàng", bg: "bg-gradient-to-br from-yellow-200 to-yellow-300", icon: "🌟" },
];

const BraceletsPerPage = 12;

const BraceletCard = ({ product }: { product: Product }) => (
    <div className="group relative flex flex-col w-full overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg h-full">
    <div className="flex flex-col h-full">
      <div className="relative overflow-hidden aspect-square">
        <img
          loading="lazy"
          src={product.productImage}
          alt={`Vòng tay ${product.productName}`}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/80 via-pink-400/50 to-blue-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 p-4">
          <Button
            variant="default"
            size="lg"
            className="bg-white/95 hover:bg-white text-pink-600 hover:text-pink-700 shadow-md hover:shadow-lg transition-all w-full"
            onClick={() => window.location.href = `/shop/${product.productId}`}
          >
            Xem chi tiết
          </Button>
          <div className="flex gap-2 w-full">
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
              className="text-sm border-white bg-white/80 text-pink-500 hover:bg-white hover:text-pink-600 flex-1 shadow-md"
            />
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600/90 hover:bg-blue-700 text-white flex-1 shadow-md"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/shop/${product.productId}`;
              }}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.productName}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{product.productMaterial}</p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{product.type}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className="text-md font-bold text-blue-600">
              {product.price.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
);

const AnimatedSection = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { ref, isInView } = useScrollAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Lấy dữ liệu sản phẩm từ API khi trang load
  useEffect(() => {
    ProductService.get()
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const filteredBracelets = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "Tất cả" || p.type === selectedCategory;
    const matchesSearch =
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productDescription.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="px-4 sm:px-6 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <AnimatedSection>
          <nav className="flex mb-6 text-sm sm:text-base" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 sm:space-x-2">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center font-medium text-blue-700 hover:text-blue-600 hover:underline transition-colors"
                >
                  Trang chủ
                </button>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                  <span className="ml-1 font-medium text-blue-600 sm:ml-2 hover:underline">
                    Vòng tay
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </AnimatedSection>

        {/* Hero Section */}
        <AnimatedSection className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4"
          >
            Bộ Sưu Tập Vòng Tay
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg text-blue-700 max-w-2xl mx-auto"
          >
            Khám phá bộ sưu tập vòng tay độc đáo, kết hợp tinh tế giữa truyền thống và hiện
            đại
          </motion.p>
        </AnimatedSection>

        {/* Search and Filter */}
        <AnimatedSection className="mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
            <AnimatedSection className="max-w-md mx-auto mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm vòng tay..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-10 pr-3 py-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </AnimatedSection>

            <AnimatedSection>
              <h2 className="text-lg sm:text-xl font-bold text-center text-blue-900 mb-6 relative inline-block">
                <span className="relative z-10 px-4 bg-white">Danh mục vòng tay</span>
                <span className="absolute bottom-3 left-0 right-0 h-1 bg-blue-100 z-0"></span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {categories.map((cat, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setCurrentPage(1);
                    }}
                    className={`${cat.bg} rounded-xl p-4 text-center text-white font-medium hover:shadow-lg transition-all hover:scale-[1.03] relative overflow-hidden group ${
                      selectedCategory === cat.value ? "ring-2 ring-white ring-opacity-70" : ""
                    }`}
                  >
                    <span className="absolute opacity-20 group-hover:opacity-30 transition-opacity text-5xl right-2 top-2">
                      {cat.icon}
                    </span>
                    <span className="relative z-10 drop-shadow-md">{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </AnimatedSection>

        {/* Products */}
        <section className="px-6 py-16 max-w-7xl mx-auto w-full ">

          
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 relative inline-block">
              <span className="relative z-10 px-4">
                {selectedCategory === "Tất cả" ? "Tất cả sản phẩm" : `Vòng tay ${selectedCategory}`}
              </span>
              <span className="absolute bottom-4 left-0 right-0 h-1 bg-blue-100 z-0"></span>
            </h2>
          </AnimatedSection>

          {paginated.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginated.map((bracelet) => (
                <motion.div
                  key={bracelet.productId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <BraceletCard product={bracelet} />
                </motion.div>
              ))}
            </div>
          ) : (
            <AnimatedSection>
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-medium text-blue-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-blue-600 mb-6">Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn</p>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => {
                    setSelectedCategory("Tất cả");
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                >
                  Xem tất cả sản phẩm
                </Button>
              </div>
            </AnimatedSection>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <AnimatedSection className="mt-16 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changePage(1)}
                  disabled={currentPage === 1}
                  className="border-blue-300 hover:bg-blue-50"
                >
                  <ChevronFirst className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-blue-300 hover:bg-blue-50"
                >
                  <ChevronLeft className="h-4 w-4 text-blue-600" />
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
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "border-blue-300 hover:bg-blue-50 text-blue-600"
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
                  className="border-blue-300 hover:bg-blue-50"
                >
                  <ChevronRight className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changePage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="border-blue-300 hover:bg-blue-50"
                >
                  <ChevronLast className="h-4 w-4 text-blue-600" />
                </Button>
              </div>
              <p className="text-sm text-blue-600">
                Hiển thị {(currentPage - 1) * BraceletsPerPage + 1} -{" "}
                {Math.min(currentPage * BraceletsPerPage, filteredBracelets.length)} trong số{" "}
                {filteredBracelets.length} sản phẩm
              </p>
            </AnimatedSection>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductPage;