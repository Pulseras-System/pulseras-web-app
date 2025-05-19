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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  { id: 1, name: "Giấc mơ Bohemian", material: "Đá tự nhiên", price: 299000, stock: 12, image: "https://placehold.co/100x100/FFD6E7/000000?text=1" },
  { id: 2, name: "Tinh thể trị liệu", material: "Pha lê nguyên chất", price: 399000, stock: 8, image: "https://placehold.co/100x100/FFD6E7/000000?text=2" },
  { id: 3, name: "Hoàng hôn vàng", material: "Mạ vàng", price: 499000, stock: 5, image: "https://placehold.co/100x100/FFD6E7/000000?text=3" },
  { id: 4, name: "Hơi thở đại dương", material: "Vỏ ốc + Ngọc trai", price: 349000, stock: 10, image: "https://placehold.co/100x100/FFD6E7/000000?text=4" },
  { id: 5, name: "Vòng đá phong thủy", material: "Đá tự nhiên", price: 199000, stock: 20, image: "https://placehold.co/100x100/FFD6E7/000000?text=5" },
  { id: 6, name: "Vòng tay tình yêu", material: "Pha lê", price: 299000, stock: 15, image: "https://placehold.co/100x100/FFD6E7/000000?text=6" },
  { id: 7, name: "Linh hồn biển cả", material: "Vỏ sò", price: 249000, stock: 10, image: "https://placehold.co/100x100/FFD6E7/000000?text=7" },
  { id: 8, name: "Ánh sáng bình minh", material: "Đá quý", price: 499000, stock: 30, image: "https://placehold.co/100x100/FFD6E7/000000?text=8" },
  { id: 9, name: "Vòng tay hoa cỏ", material: "Gỗ tự nhiên", price: 149000, stock: 25, image: "https://placehold.co/100x100/FFD6E7/000000?text=9" },
  { id: 10, name: "Vòng tay ánh trăng", material: "Ngọc trai", price: 399000, stock: 5, image: "https://placehold.co/100x100/FFD6E7/000000?text=10" },
];

const itemsPerPage = 5;

const BraceletManagement = () => {
  const [bracelets, setBracelets] = useState(mockBracelets);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [materialFilter, setMaterialFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [editingBracelet, setEditingBracelet] = useState<Bracelet | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newBracelet, setNewBracelet] = useState<Bracelet>({
    id: 0,
    name: "",
    material: "",
    price: 0,
    stock: 0,
    image: "",
  });
  const [isAddOpen, setIsAddOpen] = useState(false);

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

  const uniqueMaterials = Array.from(new Set(mockBracelets.map(b => b.material)));

  const handleEditClick = (bracelet: Bracelet) => {
    setEditingBracelet(bracelet);
    setIsEditOpen(true);
  };

  const handleEditSave = () => {
    if (editingBracelet) {
      setBracelets((prev) =>
        prev.map((b) => (b.id === editingBracelet.id ? editingBracelet : b))
      );
      setIsEditOpen(false);
    }
  };

  const handleAddBracelet = () => {
    if (newBracelet.name.trim() && newBracelet.material.trim()) {
      setBracelets((prev) => [...prev, { ...newBracelet, id: Date.now() }]);
      setNewBracelet({
        id: 0,
        name: "",
        material: "",
        price: 0,
        stock: 0,
        image: "",
      });
      setIsAddOpen(false);
    }
  };

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-pink-800">Quản lý Vòng tay</h2>
          <p className="text-sm text-pink-600">Danh sách sản phẩm trong workshop</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9 w-full sm:w-64 bg-pink-100 border-pink-200 focus-visible:ring-pink-300 text-pink-900 placeholder-pink-400"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button 
            variant="outline" 
            className="text-pink-700 border-pink-300 hover:bg-pink-100 hover:text-pink-800"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button 
            className="bg-pink-500 hover:bg-pink-600 text-white shadow-sm hover:shadow-md transition-all"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm vòng tay
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-pink-100 p-4 rounded-lg border border-pink-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Lọc theo giá</label>
              <select
                className="w-full p-2 border border-pink-200 rounded-md bg-white text-pink-900 focus:ring-pink-300 focus:border-pink-300"
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
              <label className="block text-sm font-medium text-pink-700 mb-1">Lọc theo chất liệu</label>
              <select
                className="w-full p-2 border border-pink-200 rounded-md bg-white text-pink-900 focus:ring-pink-300 focus:border-pink-300"
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

      <div className="rounded-lg border border-pink-200 bg-white shadow-sm overflow-hidden">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-pink-100">
            <TableRow>
              <TableHead className="text-pink-800 w-20">Hình ảnh</TableHead>
              <TableHead className="text-pink-800">Tên sản phẩm</TableHead>
              <TableHead className="text-pink-800">Chất liệu</TableHead>
              <TableHead className="text-pink-800">Giá (VND)</TableHead>
              <TableHead className="text-pink-800">Tồn kho</TableHead>
              <TableHead className="text-pink-800 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBracelets.map((bracelet) => (
              <TableRow key={bracelet.id} className="hover:bg-pink-50/50 border-pink-100">
                <TableCell>
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-pink-200 bg-pink-50">
                    <img 
                      src={bracelet.image} 
                      alt={bracelet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-pink-900 whitespace-nowrap">
                  <div className="font-semibold">{bracelet.name}</div>
                  <div className="text-xs text-pink-500">ID: {bracelet.id}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-pink-800">{bracelet.material}</TableCell>
                <TableCell className="font-medium whitespace-nowrap text-pink-700">{bracelet.price.toLocaleString()}₫</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bracelet.stock > 10 
                      ? "bg-green-100 text-green-800" 
                      : bracelet.stock > 5 
                        ? "bg-pink-100 text-pink-800" 
                        : "bg-red-100 text-red-800"
                  }`}>
                    {bracelet.stock} {bracelet.stock > 5 ? "cái" : "sắp hết"}
                  </span>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-pink-700 border-pink-300 hover:bg-pink-100 hover:text-pink-800"
                    onClick={() => handleEditClick(bracelet)}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredBracelets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-pink-200 rounded-lg bg-pink-50">
          <Package className="h-12 w-12 text-pink-400 mb-4" />
          <h3 className="text-lg font-medium text-pink-800">Không tìm thấy vòng tay</h3>
          <p className="text-sm text-pink-600 mt-1">
            Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredBracelets.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-pink-700">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredBracelets.length)} của {filteredBracelets.length} sản phẩm
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-white text-gray-900 rounded-2xl shadow-xl border border-pink-200">
          <DialogHeader>
            <DialogTitle className="text-pink-800">Chỉnh sửa vòng tay</DialogTitle>
          </DialogHeader>
          {editingBracelet && (
            <div className="space-y-4">
              <div>
                <Label className="text-pink-700">Tên</Label>
                <Input
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingBracelet.name}
                  onChange={(e) =>
                    setEditingBracelet({ ...editingBracelet, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Chất liệu</Label>
                <Input
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingBracelet.material}
                  onChange={(e) =>
                    setEditingBracelet({ ...editingBracelet, material: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Giá</Label>
                <Input
                  type="number"
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingBracelet.price}
                  onChange={(e) =>
                    setEditingBracelet({ ...editingBracelet, price: +e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Tồn kho</Label>
                <Input
                  type="number"
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingBracelet.stock}
                  onChange={(e) =>
                    setEditingBracelet({ ...editingBracelet, stock: +e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Hình ảnh</Label>
                <Input
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingBracelet.image}
                  onChange={(e) =>
                    setEditingBracelet({ ...editingBracelet, image: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  className="text-pink-700 border-pink-300 hover:bg-pink-100"
                  onClick={() => setIsEditOpen(false)}
                >
                  Hủy
                </Button>
                <Button 
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={handleEditSave}
                >
                  Lưu
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md bg-white text-gray-900 rounded-2xl shadow-xl border border-pink-200">
          <DialogHeader>
            <DialogTitle className="text-pink-800">Thêm vòng tay mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-pink-700">Tên</Label>
              <Input
                className="border-pink-200 focus:ring-pink-300"
                value={newBracelet.name}
                onChange={(e) =>
                  setNewBracelet({ ...newBracelet, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Chất liệu</Label>
              <Input
                className="border-pink-200 focus:ring-pink-300"
                value={newBracelet.material}
                onChange={(e) =>
                  setNewBracelet({ ...newBracelet, material: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Giá</Label>
              <Input
                type="number"
                className="border-pink-200 focus:ring-pink-300"
                value={newBracelet.price}
                onChange={(e) =>
                  setNewBracelet({ ...newBracelet, price: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Tồn kho</Label>
              <Input
                type="number"
                className="border-pink-200 focus:ring-pink-300"
                value={newBracelet.stock}
                onChange={(e) =>
                  setNewBracelet({ ...newBracelet, stock: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Hình ảnh</Label>
              <Input
                className="border-pink-200 focus:ring-pink-300"
                value={newBracelet.image}
                onChange={(e) =>
                  setNewBracelet({ ...newBracelet, image: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                className="text-pink-700 border-pink-300 hover:bg-pink-100"
                onClick={() => setIsAddOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={handleAddBracelet}
              >
                Thêm
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BraceletManagement;