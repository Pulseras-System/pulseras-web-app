import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pen, Trash2, Plus, Search, Filter } from "lucide-react";
import { Package } from "lucide-react";
import Pagination from "@/components/pagination";


interface Bracelet {
  id: number;
  name: string;
  material: string;
  price: number;
  stock: number;
  image: string;
}

const mockBracelets: Bracelet[] = [
  { id: 1, name: "Giấc mơ Bohemian", material: "Đá tự nhiên", price: 299000, stock: 12, image: "https://placehold.co/100x100/cccccc/000000?text=1" },
  { id: 2, name: "Tinh thể trị liệu", material: "Pha lê nguyên chất", price: 399000, stock: 8, image: "https://placehold.co/100x100/cccccc/000000?text=2" },
  { id: 3, name: "Hoàng hôn vàng", material: "Mạ vàng", price: 499000, stock: 5, image: "https://placehold.co/100x100/cccccc/000000?text=3" },
  { id: 4, name: "Hơi thở đại dương", material: "Vỏ ốc + Ngọc trai", price: 349000, stock: 10, image: "https://placehold.co/100x100/cccccc/000000?text=4" },
  { id: 5, name: "Vòng đá phong thủy", material: "Đá tự nhiên", price: 199000, stock: 20, image: "https://placehold.co/100x100/cccccc/000000?text=5" },
  { id: 6, name: "Vòng tay tình yêu", material: "Pha lê", price: 299000, stock: 15, image: "https://placehold.co/100x100/cccccc/000000?text=6" },
  { id: 7, name: "Linh hồn biển cả", material: "Vỏ sò", price: 249000, stock: 10, image: "https://placehold.co/100x100/cccccc/000000?text=7" },
  { id: 8, name: "Ánh sáng bình minh", material: "Đá quý", price: 499000, stock: 30, image: "https://placehold.co/100x100/cccccc/000000?text=8" },
  { id: 9, name: "Vòng tay hoa cỏ", material: "Gỗ tự nhiên", price: 149000, stock: 25, image: "https://placehold.co/100x100/cccccc/000000?text=9" },
  { id: 10, name: "Vòng tay ánh trăng", material: "Ngọc trai", price: 399000, stock: 5, image: "https://placehold.co/100x100/cccccc/000000?text=10" },
];

const itemsPerPage = 5;

const BraceletManagement = () => {


  const [bracelets, setBracelets] = useState(mockBracelets);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [materialFilter, setMaterialFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredBracelets = bracelets.filter(bracelet => {
    const matchesSearch = 
      bracelet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bracelet.material.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = 
      priceFilter === "all" ||
      (priceFilter === "under300" && bracelet.price < 300000) ||
      (priceFilter === "300to400" && bracelet.price >= 300000 && bracelet.price <= 400000) ||
      (priceFilter === "over400" && bracelet.price > 400000);
    
    const matchesMaterial = 
      materialFilter === "all" || 
      bracelet.material.toLowerCase().includes(materialFilter.toLowerCase());
    
    return matchesSearch && matchesPrice && matchesMaterial;
  });

  const totalPages = Math.ceil(filteredBracelets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBracelets = filteredBracelets.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          className={`w-8 h-8 p-0 ${i === currentPage ? "bg-amber-600 text-white" : "text-amber-800"}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  const uniqueMaterials = Array.from(new Set(mockBracelets.map(b => b.material)));

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Quản lý Vòng tay</h2>
          <p className="text-sm text-amber-700">Danh sách sản phẩm trong workshop</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9 w-full sm:w-64 bg-amber-50 border-amber-200 focus-visible:ring-amber-300"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button 
            variant="outline" 
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button className="bg-amber-600 hover:bg-amber-700 text-amber-50">
            <Plus className="mr-2 h-4 w-4" />
            Thêm vòng tay
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Lọc theo giá</label>
              <select
                className="w-full p-2 border border-amber-200 rounded-md bg-white text-amber-900 focus:ring-amber-300"
                value={priceFilter}
                onChange={(e) => {
                  setPriceFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả giá</option>
                <option value="under300">Dưới 300.000₫</option>
                <option value="300to400">300.000₫ - 400.000₫</option>
                <option value="over400">Trên 400.000₫</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Lọc theo chất liệu</label>
              <select
                className="w-full p-2 border border-amber-200 rounded-md bg-white text-amber-900 focus:ring-amber-300"
                value={materialFilter}
                onChange={(e) => {
                  setMaterialFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả chất liệu</option>
                {uniqueMaterials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-white shadow-sm overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-amber-50">
            <TableRow>
              <TableHead className="text-amber-900 w-20">Hình ảnh</TableHead>
              <TableHead className="text-amber-900">Tên sản phẩm</TableHead>
              <TableHead className="text-amber-900">Chất liệu</TableHead>
              <TableHead className="text-amber-900">Giá (VND)</TableHead>
              <TableHead className="text-amber-900">Tồn kho</TableHead>
              <TableHead className="text-amber-900 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBracelets.map((bracelet) => (
              <TableRow key={bracelet.id} className="hover:bg-amber-50/50">
                <TableCell>
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-amber-200">
                    <img 
                      src={bracelet.image} 
                      alt={bracelet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-amber-900 whitespace-nowrap">
                  <div className="font-semibold">{bracelet.name}</div>
                  <div className="text-xs text-amber-500">ID: {bracelet.id}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{bracelet.material}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{bracelet.price.toLocaleString()}₫</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bracelet.stock > 10 
                      ? "bg-green-100 text-green-800" 
                      : bracelet.stock > 5 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-red-100 text-red-800"
                  }`}>
                    {bracelet.stock} {bracelet.stock > 5 ? "cái" : "sắp hết"}
                  </span>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="text-amber-700 border-amber-300 hover:bg-amber-100">
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-700 border-red-200 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredBracelets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-amber-200 rounded-lg bg-amber-50">
          <Package className="h-12 w-12 text-amber-400 mb-4" />
          <h3 className="text-lg font-medium text-amber-900">Không tìm thấy vòng tay</h3>
          <p className="text-sm text-amber-700 mt-1">
            Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredBracelets.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-amber-700">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredBracelets.length)} của {filteredBracelets.length} sản phẩm
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default BraceletManagement;