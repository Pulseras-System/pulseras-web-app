import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BraceletCardProps {
  name: string;
  description: string;
  price: string;
  imageSrc: string;
}

const BraceletCard = ({ name, description, price, imageSrc }: BraceletCardProps) => (
  <div className="group relative flex flex-col w-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
    <img
      loading="lazy"
      src={imageSrc}
      alt={`Vòng tay ${name}`}
      className="object-cover w-full aspect-square transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="text-zinc-200 mt-1">{description}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-lg font-semibold text-amber-300">{price}</span>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-amber-500 hover:bg-amber-600 text-white"
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
    { name: "Tất cả vòng tay", href: "#all", bg: "bg-gradient-to-br from-amber-400 to-amber-600" },
    { name: "Bohemian", href: "#bohemian", bg: "bg-gradient-to-br from-emerald-400 to-emerald-600" },
    { name: "Tinh Thể", href: "#crystal", bg: "bg-gradient-to-br from-blue-400 to-blue-600" },
    { name: "Vàng", href: "#gold", bg: "bg-gradient-to-br from-yellow-400 to-yellow-600" },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="relative flex items-center justify-center w-full min-h-[600px] overflow-hidden">
        <img
          loading="lazy"
          src="https://placehold.co/1600x600/cccccc/000000?text=Hero+Banner"
          alt="Ảnh nền vòng tay"
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-6 text-center max-w-4xl">
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl drop-shadow-lg">
            Vòng tay thủ công cho mọi câu chuyện
          </h1>
          <p className="mt-6 text-xl text-amber-100 drop-shadow-md">
            Khám phá những thiết kế độc đáo thể hiện cá tính của bạn
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg">
              <Link to="/product-list">Mua ngay</Link>
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
          <h2 className="text-2xl font-bold text-center text-zinc-800 mb-8">Khám phá danh mục</h2>
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
      <section className="px-6 py-16 max-w-7xl mx-auto w-full bg-stone-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-800">Bộ sưu tập nổi bật</h2>
          <p className="mt-2 text-zinc-600">Những thiết kế được yêu thích nhất mùa này</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {bracelets.map((bracelet, index) => (
            <BraceletCard key={index} {...bracelet} />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-16 bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-amber-100">Tinh Hoa Nghệ Thuật</h2>
          <p className="text-zinc-300 text-lg leading-relaxed">
            Mỗi chiếc vòng tay Pulsera là kết tinh của đam mê và sự sáng tạo. Chúng tôi sử dụng nguyên liệu 
            cao cấp cùng kỹ thuật thủ công truyền thống để tạo nên những tác phẩm độc nhất vô nhị, 
            mang đậm dấu ấn cá nhân của người đeo.
          </p>
          <Button 
            variant="outline" 
            className="mt-8 border-amber-400 text-amber-400 hover:bg-amber-400/10 hover:text-amber-300"
          >
            Khám Phá Quy Trình
          </Button>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-6 py-16 bg-amber-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-zinc-800 mb-4">Tham Gia Cộng Đồng</h2>
          <p className="text-zinc-600 mb-6">Nhận ưu đãi đặc biệt và cập nhật bộ sưu tập mới nhất</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <input 
              type="email" 
              placeholder="Địa chỉ email của bạn" 
              className="px-4 py-3 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 flex-grow max-w-md"
            />
            <Button className="bg-zinc-800 hover:bg-zinc-700 text-white">
              Đăng Ký
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
