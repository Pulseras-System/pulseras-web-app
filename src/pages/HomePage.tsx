import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BraceletCardProps {
  name: string;
  description: string;
  price: string;
  imageSrc: string;
}

const BraceletCard = ({ name, description, price, imageSrc }: BraceletCardProps) => (
  <div className="group relative flex flex-col w-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-sky-100">
    <img
      loading="lazy"
      src={imageSrc}
      alt={`Vòng tay ${name}`}
      className="object-cover w-full aspect-square transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-sky-900/70 via-sky-800/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="text-sky-100 mt-1">{description}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-lg font-semibold text-sky-200">{price}</span>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            Thêm vào giỏ
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const bracelets = [
    { 
      name: "Giấc Mơ Bohemian", 
      description: "Đá tự nhiên", 
      price: "750.000₫", 
      imageSrc: "https://placehold.co/600x600/cccccc/000000?text=Bohemian" 
    },
    { 
      name: "Tinh Thể Chữa Lành", 
      description: "Tinh thể nguyên chất", 
      price: "900.000₫", 
      imageSrc: "https://placehold.co/600x600/cccccc/000000?text=Crystal" 
    },
    { 
      name: "Hoàng Hôn Vàng", 
      description: "Mạ vàng", 
      price: "1.200.000₫", 
      imageSrc: "https://placehold.co/600x600/cccccc/000000?text=Sunset" 
    },
    { 
      name: "Hơi Thở Đại Dương", 
      description: "Lấy cảm hứng từ biển cả", 
      price: "800.000₫", 
      imageSrc: "https://placehold.co/600x600/cccccc/000000?text=Ocean" 
    },
    { 
      name: "Pha Lê Núi", 
      description: "Pha lê tự nhiên", 
      price: "1.000.000₫", 
      imageSrc: "https://placehold.co/600x600/cccccc/000000?text=Crystal+Mountain" 
    },
    { 
      name: "Hồng Sa Mạc", 
      description: "Vàng hồng", 
      price: "1.300.000₫", 
      imageSrc: "https://placehold.co/600x600/cccccc/000000?text=Desert+Rose" 
    },
  ];
  
  const categories = [
    { name: "Tất cả vòng tay", href: "#all", bg: "bg-gradient-to-br from-sky-400 to-sky-600" },
    { name: "Bohemian", href: "#bohemian", bg: "bg-gradient-to-br from-teal-400 to-teal-600" },
    { name: "Tinh Thể", href: "#crystal", bg: "bg-gradient-to-br from-blue-400 to-indigo-600" },
    { name: "Vàng", href: "#gold", bg: "bg-gradient-to-br from-amber-300 to-amber-500" },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-sky-50">
      {/* Hero */}
      <div className="relative flex items-center justify-center w-full min-h-[600px] overflow-hidden">
        <img
          loading="lazy"
          src="https://placehold.co/1600x600/cccccc/000000?text=Hero+Banner"
          alt="Ảnh nền vòng tay"
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-sky-900/60" />
        <div className="relative z-10 px-6 text-center max-w-4xl">
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl drop-shadow-lg">
            Vòng tay thủ công cho mọi câu chuyện
          </h1>
          <p className="mt-6 text-xl text-sky-100 drop-shadow-md">
            Khám phá những thiết kế độc đáo thể hiện cá tính của bạn
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg">
              <Link to="/shop">Mua ngay</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-white border-white hover:bg-white/10 hover:text-white shadow-lg"
            >
              Bộ sưu tập
            </Button>
          </div>
        </div>
      </div>

      {/* Danh mục */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-sky-900 mb-8">Khám phá danh mục</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                to={category.href}
                className={`${category.bg} rounded-lg p-6 text-center text-white font-medium hover:shadow-lg transition-all hover:-translate-y-1`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="px-6 py-16 max-w-7xl mx-auto w-full bg-sky-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-sky-900">Bộ sưu tập nổi bật</h2>
          <p className="mt-2 text-sky-700">Những thiết kế được yêu thích nhất mùa này</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {bracelets.map((bracelet, index) => (
            <BraceletCard key={index} {...bracelet} />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-16 bg-sky-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-sky-100">Tinh Hoa Nghệ Thuật</h2>
          <p className="text-sky-200 text-lg leading-relaxed">
            Mỗi chiếc vòng tay Pulsera là kết tinh của đam mê và sự sáng tạo. Chúng tôi sử dụng nguyên liệu 
            cao cấp cùng kỹ thuật thủ công truyền thống để tạo nên những tác phẩm độc nhất vô nhị, 
            mang đậm dấu ấn cá nhân của người đeo.
          </p>
          <Button 
            variant="outline" 
            className="mt-8 border-sky-300 text-sky-300 hover:bg-sky-300/10 hover:text-sky-200"
          >
            Khám Phá Quy Trình
          </Button>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-sky-900 mb-4">Tham Gia Cộng Đồng</h2>
          <p className="text-sky-700 mb-6">Nhận ưu đãi đặc biệt và cập nhật bộ sưu tập mới nhất</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <input 
              type="email" 
              placeholder="Địa chỉ email của bạn" 
              className="px-4 py-3 rounded-lg border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 flex-grow max-w-md"
            />
            <Button className="bg-sky-600 hover:bg-sky-700 text-white">
              Đăng Ký
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;