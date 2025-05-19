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
import { Pen, Trash2, Plus, Search, Filter, Package } from "lucide-react";
import Pagination from "@/components/pagination";


interface Material {
  id: number;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  image: string;
}

const mockMaterials: Material[] = [
  { id: 1, name: "Hạt gỗ tròn", type: "Gỗ", quantity: 500, unit: "viên", image: "https://placehold.co/100x100/cccccc/000000?text=1" },
  { id: 2, name: "Sợi dây co giãn", type: "Dây", quantity: 200, unit: "m", image: "https://placehold.co/100x100/cccccc/000000?text=2" },
  { id: 3, name: "Khoá vòng", type: "Phụ kiện", quantity: 300, unit: "cái", image: "https://placehold.co/100x100/cccccc/000000?text=3" },
  { id: 4, name: "Đá tự nhiên", type: "Đá", quantity: 450, unit: "viên", image: "https://placehold.co/100x100/cccccc/000000?text=4" },
  { id: 5, name: "Đá thạch anh", type: "Đá", quantity: 180, unit: "viên", image: "https://placehold.co/100x100/cccccc/000000?text=5" },
  { id: 6, name: "Hạt gỗ vuông", type: "Gỗ", quantity: 320, unit: "viên", image: "https://placehold.co/100x100/cccccc/000000?text=6" },
  { id: 7, name: "Charm bạc", type: "Phụ kiện", quantity: 100, unit: "cái", image: "https://placehold.co/100x100/cccccc/000000?text=7" },
  { id: 8, name: "Dây da", type: "Dây", quantity: 150, unit: "m", image: "https://placehold.co/100x100/cccccc/000000?text=8" },
  { id: 9, name: "Hạt ngọc trai", type: "Đá", quantity: 250, unit: "viên", image: "https://placehold.co/100x100/cccccc/000000?text=9" },
  { id: 10, name: "Charm vàng", type: "Phụ kiện", quantity: 80, unit: "cái", image: "https://placehold.co/100x100/cccccc/000000?text=10" },
  { id: 11, name: "Dây bạc", type: "Dây", quantity: 90, unit: "m", image: "https://placehold.co/100x100/cccccc/000000?text=11" },
  { id: 12, name: "Đá mã não", type: "Đá", quantity: 120, unit: "viên", image: "https://placehold.co/100x100/cccccc/000000?text=12" },
];

const itemsPerPage = 5;

const MaterialManagementPage = () => {
  const [materials, setMaterials] = useState(mockMaterials);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [quantityFilter, setQuantityFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      typeFilter === "all" || 
      material.type.toLowerCase() === typeFilter.toLowerCase();
    
    const matchesQuantity =
      quantityFilter === "all" ||
      (quantityFilter === "under100" && material.quantity < 100) ||
      (quantityFilter === "100to300" && material.quantity >= 100 && material.quantity <= 300) ||
      (quantityFilter === "over300" && material.quantity > 300);
    
    return matchesSearch && matchesType && matchesQuantity;
  });

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = filteredMaterials.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  const uniqueTypes = Array.from(new Set(mockMaterials.map(m => m.type)));

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-900">Quản lý Nguyên liệu</h2>
          <p className="text-sm text-sky-700">Danh sách nguyên liệu trong workshop</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9 w-full sm:w-64 bg-sky-50 border-sky-200 focus-visible:ring-sky-300"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button 
            variant="outline" 
            className="text-sky-700 border-sky-300 hover:bg-sky-100"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-700 text-sky-50">
            <Plus className="mr-2 h-4 w-4" />
            Thêm nguyên liệu
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-sky-50 p-4 rounded-lg border border-sky-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sky-800 mb-1">Lọc theo loại</label>
              <select
                className="w-full p-2 border border-sky-200 rounded-md bg-white text-sky-900 focus:ring-sky-300"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả loại</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sky-800 mb-1">Lọc theo số lượng</label>
              <select
                className="w-full p-2 border border-sky-200 rounded-md bg-white text-sky-900 focus:ring-sky-300"
                value={quantityFilter}
                onChange={(e) => {
                  setQuantityFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả số lượng</option>
                <option value="under100">Dưới 100</option>
                <option value="100to300">100 - 300</option>
                <option value="over300">Trên 300</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-sky-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-sky-50">
            <TableRow>
              <TableHead className="text-sky-900 w-20">Hình ảnh</TableHead>
              <TableHead className="text-sky-900">Tên nguyên liệu</TableHead>
              <TableHead className="text-sky-900">Loại</TableHead>
              <TableHead className="text-sky-900">Số lượng</TableHead>
              <TableHead className="text-sky-900">Đơn vị</TableHead>
              <TableHead className="text-sky-900 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMaterials.map((material) => (
              <TableRow key={material.id} className="hover:bg-sky-50/50">
                <TableCell>
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-sky-200">
                    <img 
                      src={material.image} 
                      alt={material.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-sky-900">
                  <div className="font-semibold">{material.name}</div>
                  <div className="text-xs text-sky-500">ID: {material.id}</div>
                </TableCell>
                <TableCell>{material.type}</TableCell>
                <TableCell className="font-medium">{material.quantity}</TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="text-sky-700 border-sky-300 hover:bg-sky-100">
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

      {filteredMaterials.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-sky-200 rounded-lg bg-sky-50">
          <Package className="h-12 w-12 text-sky-400 mb-4" />
          <h3 className="text-lg font-medium text-sky-900">Không tìm thấy nguyên liệu</h3>
          <p className="text-sm text-sky-700 mt-1">
            Không có nguyên liệu nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredMaterials.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-sky-700">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredMaterials.length)} của {filteredMaterials.length} nguyên liệu
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

export default MaterialManagementPage;