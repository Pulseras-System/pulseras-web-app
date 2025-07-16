// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ProductService, { Product } from "@/services/ProductService"; // 1. Import ProductService and Product type
import { AddToCartButton } from "@/components/AddToCartButton"; // Add this import

// Import ảnh banner từ thư mục assets
import Banner1 from "../../assets/images/banner1.jpg";
import Banner2 from "../../assets/images/banner2.jpg";
import Banner3 from "../../assets/images/banner3.jpg";
import Banner4 from "../../assets/images/banner4.jpg";

// Danh sách banner cho ô vuông bên phải dùng ảnh từ assets
const heroBanners = [
  { src: Banner1, alt: "Banner 1" },
  { src: Banner2, alt: "Banner 2" },
  { src: Banner3, alt: "Banner 3" },
  { src: Banner4, alt: "Banner 4" },
];

interface BraceletCardProps {
  name: string;
  description: string;
  price: string;
  imageSrc: string;
  // Add these optional fields for AddToCartButton
  id?: string | number;
  type?: string;
  material?: string;
  productRaw?: any; // for fallback
}

const BraceletCard = ({
  name,
  description,
  price,
  imageSrc,
  id,
  type,
  material,
  productRaw,
}: BraceletCardProps) => (
  <div className="group relative flex flex-col w-full overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
    <div className="relative w-full h-64">
      <img
        loading="lazy"
        src={imageSrc}
        alt={`Vòng tay ${name}`}
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
      />
      {/* Subtle overlay/hover effect without a heavy gradient */}
      <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 transition-colors duration-300"></div>
    </div>
    
    <div className="p-4 flex flex-col justify-between flex-grow">
      <h3 className="text-lg font-semibold text-gray-800 truncate" title={name}>{name}</h3>
      <p className="text-sm text-gray-600 mt-1 flex-grow truncate" title={description}>{description}</p>
      <div className="flex justify-between items-center mt-4">
        <span className="text-md font-bold text-blue-600">{price}</span>
        <div className="flex space-x-2">
          <AddToCartButton
            product={{
              id: id ?? productRaw?.productId ?? "",
              name,
              image: imageSrc,
              price: productRaw?.price ?? price,
              type: type ?? productRaw?.type,
              material: material ?? productRaw?.productMaterial,
            }}
            variant="outline"
            className="border-blue-400 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
            // disabled={productRaw?.quantity <= 0}
          />
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Mua ngay
          </Button>
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

const HomePage = () => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [topProducts, setTopProducts] = useState<Product[]>([]); // 2. State for top products
  const [loadingTop, setLoadingTop] = useState(true);

  // 1. State for latest products
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 5000); // đổi banner mỗi 5 giây
    return () => clearInterval(timer);
  }, []);

  // 3. Fetch top products on mount
  useEffect(() => {
    setLoadingTop(true);
    ProductService.getTopBuyProducts()
      .then((topBuyProducts) => {
        console.log("Top buy products received:", topBuyProducts);
        // Extract products from TopBuyProduct[] structure
        const products = topBuyProducts.map(item => item.product);
        setTopProducts(products);
      })
      .catch((error) => {
        console.error("Error fetching top products:", error);
        setTopProducts([]);
      })
      .finally(() => setLoadingTop(false));
  }, []);

  // 2. Fetch latest products on mount
  useEffect(() => {
    setLoadingLatest(true);
    // You may need to add this method to ProductService if not present:
    // getLatestProducts: async (): Promise<Product[]> => { ... }
    ProductService.getLatestProducts?.()
      .then((products) => {
        console.log("Latest products received:", products);
        setLatestProducts(products);
      })
      .catch((error) => {
        console.error("Error fetching latest products:", error);
        setLatestProducts([]);
      })
      .finally(() => setLoadingLatest(false));
  }, []);

  const bracelets = [
    { 
      name: "Giấc Mơ Bohemian", 
      description: "Đá tự nhiên, phong cách phóng khoáng. Hoàn hảo cho những tâm hồn tự do.", 
      price: "750.000₫", 
      imageSrc: "https://placehold.co/600x600/e0e0e0/333333?text=Bohemian+Bracelet" // Adjusted placeholder for better fit
    },
    { 
      name: "Tinh Thể Chữa Lành", 
      description: "Tinh thể nguyên chất, mang năng lượng tích cực và bình an. Chọn màu sắc theo ý bạn.", 
      price: "900.000₫", 
      imageSrc: "https://placehold.co/600x600/d9d9d9/333333?text=Healing+Crystal" 
    },
    { 
      name: "Hoàng Hôn Vàng", 
      description: "Mạ vàng sang trọng, thiết kế thanh lịch. Nổi bật trong mọi sự kiện.", 
      price: "1.200.000₫", 
      imageSrc: "https://placehold.co/600x600/c2c2c2/333333?text=Golden+Sunset" 
    },
    { 
      name: "Hơi Thở Đại Dương", 
      description: "Lấy cảm hứng từ biển cả, đá xanh biếc và vỏ sò tự nhiên. Mang lại cảm giác tươi mát.", 
      price: "800.000₫", 
      imageSrc: "https://placehold.co/600x600/b0b0b0/333333?text=Ocean+Breeze" 
    },
    { 
      name: "Pha Lê Núi", 
      description: "Pha lê tự nhiên, chế tác tỉ mỉ. Lấp lánh và thu hút mọi ánh nhìn.", 
      price: "1.000.000₫", 
      imageSrc: "https://placehold.co/600x600/a3a3a3/333333?text=Mountain+Crystal" 
    },
    { 
      name: "Hồng Sa Mạc", 
      description: "Vàng hồng quyến rũ, thiết kế độc đáo. Một lựa chọn hoàn hảo cho phong cách cá nhân.", 
      price: "1.300.000₫", 
      imageSrc: "https://placehold.co/600x600/969696/333333?text=Desert+Rose" 
    },
  ];
  
  const categories = [
    { name: "Tất cả vòng tay", href: "/shop", bg: "bg-gradient-to-br from-blue-300 to-blue-400", icon: "✨" },
    { name: "Bohemian", href: "/categories/bohemian", bg: "bg-gradient-to-br from-green-200 to-green-300", icon: "🌿" },
    { name: "Tinh Thể", href: "/categories/crystal", bg: "bg-gradient-to-br from-pink-200 to-pink-300", icon: "🔮" },
    { name: "Vàng", href: "/categories/gold", bg:"bg-gradient-to-br from-yellow-200 to-yellow-300", icon: "🌟" },
  ];

  // 4. Map API data to BraceletCardProps
  const topBracelets = topProducts.length > 0
    ? topProducts.map((p) => ({
        name: p.productName,
        description: p.productDescription,
        price: p.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0đ",
        imageSrc: p.productImage || "https://placehold.co/600x600?text=No+Image",
        id: p.productId,
        type: p.type,
        material: p.productMaterial,
        productRaw: p,
      }))
    : bracelets.map((b) => ({ ...b, productRaw: b })); // fallback to static if API empty

  // 4. Map API data to BraceletCardProps for latest products
  const latestBracelets = latestProducts.length > 0
    ? latestProducts.map((p) => ({
        name: p.productName,
        description: p.productDescription,
        price: p.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0đ",
        imageSrc: p.productImage || "https://placehold.co/600x600?text=No+Image",
        id: p.productId,
        type: p.type,
        material: p.productMaterial,
        productRaw: p,
      }))
    : bracelets.map((b) => ({ ...b, productRaw: b })); // fallback to static if API empty

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 text-gray-800">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col md:flex-row items-center justify-between w-full min-h-[600px] p-6 md:p-16 "
      >
        {/* Bên trái: Text của bạn */}
        <div className="w-full md:w-3/5">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight md:text-5xl text-gray-900">
            Sáng tạo phong cách của bạn với vòng tay thủ công độc đáo.
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Khám phá những thiết kế độc đáo hoặc tùy chỉnh chiếc vòng tay của riêng bạn.
          </p>
          <div className="flex gap-4 mt-8">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Link to="/shop">Mua ngay</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-blue-600 border-blue-600 hover:bg-blue-100 shadow-lg"
            >
              <Link to="/design">Thiết kế của riêng bạn</Link>
              
            </Button>
          </div>
        </div>

        {/* Bên phải: Banner */}
        <div className="w-full md:w-2/5 flex flex-col items-center mt-8 md:mt-0">
          {/* Container hình với aspect ratio vuông */}
          <div className="w-full relative pb-[100%]">
            <AnimatePresence>
              <motion.img
                key={bannerIndex}
                src={heroBanners[bannerIndex].src}
                alt={heroBanners[bannerIndex].alt}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 object-cover rounded-lg shadow-lg"
              />
            </AnimatePresence>
          </div>
          {/* Dot Navigation */}
          <div className="flex space-x-2 mt-4">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full ${idx === bannerIndex ? "bg-blue-600" : "bg-gray-300"}`}
                onClick={() => setBannerIndex(idx)}
                aria-label={`Chuyển đến banner ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Danh mục */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Khám phá danh mục
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <AnimatedSection 
                key={index}
                className={`rounded-lg p-6 text-center text-gray-800 font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${category.bg}`}
              >
                <Link 
                  to={category.href}
                  className="block"
                >
                  {category.name}
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="px-6 py-16 max-w-7xl mx-auto w-full ">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Bộ sưu tập nổi bật</h2>
          <p className="mt-2 text-gray-700">Những thiết kế được yêu thích nhất mùa này</p>
        </AnimatedSection>
        {loadingTop ? (
          <div className="text-center text-blue-600">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topBracelets.map((bracelet, index) => (
              <AnimatedSection key={index}>
                <BraceletCard {...bracelet} />
              </AnimatedSection>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/shop">Xem thêm</Link>
          </Button>
        </div>
      </section>

      {/* Sản phẩm mới */}
      <section className="px-6 py-16 max-w-7xl mx-auto w-full ">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Sản phẩm mới</h2>
          <p className="mt-2 text-gray-700">Khám phá sản phẩm mới nhất của chúng tôi</p>
        </AnimatedSection>
        {loadingLatest ? (
          <div className="text-center text-blue-600">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBracelets.map((bracelet, index) => (
              <AnimatedSection key={index}>
                <BraceletCard {...bracelet} />
              </AnimatedSection>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/shop">Xem thêm</Link>
            </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-16 bg-pink-200 text-gray-800">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Nghệ thuật tùy chỉnh vòng tay</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Tại Pulsera, chúng tôi tin rằng mỗi chiếc vòng tay phải kể một câu chuyện. 
            Bạn có thể chọn từ bộ sưu tập của chúng tôi hoặc thiết kế vòng tay của riêng mình 
            với các loại đá quý, hạt và charm độc đáo. Mỗi sản phẩm được làm thủ công tỉ mỉ, 
            đảm bảo chất lượng và sự độc đáo.
          </p>
          <Button 
            variant="outline" 
            className="mt-8 border-blue-400 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
          >
            <Link to="/design">Bắt đầu thiết kế</Link>
          </Button>
        </AnimatedSection>
      </section>

      {/* Newsletter */}
      <section className="px-6 py-16 bg-gray-100">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Đăng ký nhận ưu đãi</h2>
          <p className="text-gray-700 mb-6">Nhận thông tin về các bộ sưu tập mới, ưu đãi độc quyền và tin tức từ Pulsera.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <input 
              type="email" 
              placeholder="Địa chỉ email của bạn" 
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 flex-grow max-w-md text-gray-800"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Đăng Ký
            </Button>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
};

export default HomePage;