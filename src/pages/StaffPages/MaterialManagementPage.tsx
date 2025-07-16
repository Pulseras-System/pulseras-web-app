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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Material>({
    id: 0,
    name: "",
    type: "",
    quantity: 0,
    unit: "",
    image: "",
  });
  const [isAddOpen, setIsAddOpen] = useState(false);

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

  const handleEditClick = (material: Material) => {
    setEditingMaterial(material);
    setIsEditOpen(true);
  };

  const handleEditSave = () => {
    if (editingMaterial) {
      setMaterials((prev) =>
        prev.map((m) => (m.id === editingMaterial.id ? editingMaterial : m))
      );
      setIsEditOpen(false);
    }
  };

  const handleAddMaterial = () => {
    if (newMaterial.name.trim() && newMaterial.type.trim()) {
      setMaterials((prev) => [...prev, { ...newMaterial, id: Date.now() }]);
      setNewMaterial({
        id: 0,
        name: "",
        type: "",
        quantity: 0,
        unit: "",
        image: "",
      });
      setIsAddOpen(false);
    }
  };
  
  const uniqueTypes = Array.from(new Set(mockMaterials.map(m => m.type)));

  return (
    <div className="p-6 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Quản lý Nguyên liệu</h2>
          <p className="text-sm text-black">Danh sách nguyên liệu trong workshop</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/1 h-4 w-4 text-blue-800" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9 w-full sm:w-64 bg-pink-100 border-pink-100 focus-visible:ring-pink-100 text-black placeholder-black"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button 
            variant="outline" 
            className="text-black border-pink-100 hover:bg-pink-100 hover:text-black"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button 
            className="bg-blue-100 hover:bg-blue-100 text-black shadow-sm hover:shadow-md transition-all"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm nguyên liệu
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-pink-100 p-4 rounded-lg border border-pink-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-black mb-1">Lọc theo loại</Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
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
              <Label className="block text-sm font-medium text-black mb-1">Lọc theo số lượng</Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
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

      {/* Table */}
      <div className="rounded-lg border border-pink-100 bg-white shadow-sm overflow-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-pink-100">
            <TableRow>
              <TableHead className="text-black w-20">Hình ảnh</TableHead>
              <TableHead className="text-black">Tên nguyên liệu</TableHead>
              <TableHead className="text-black">Loại</TableHead>
              <TableHead className="text-black">Số lượng</TableHead>
              <TableHead className="text-black">Đơn vị</TableHead>
              <TableHead className="text-black text-center w-32">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMaterials.map((material) => (
              <TableRow key={material.id} className="hover:bg-pink-100 border-pink-100">
                <TableCell>
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-pink-100 bg-pink-100">
                    <img 
                      src={material.image} 
                      alt={material.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-black whitespace-nowrap">
                  <div className="font-semibold">{material.name}</div>
                  <div className="text-xs text-black">ID: {material.id}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-black">{material.type}</TableCell>
                <TableCell className="font-medium whitespace-nowrap text-black">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    material.quantity > 300 
                      ? "bg-green-100 text-green-800" 
                      : material.quantity > 100 
                        ? "bg-pink-100 text-pink-800" 
                        : "bg-red-100 text-red-800"
                  }`}>
                    {material.quantity}
                  </span>
                </TableCell>
                <TableCell className="text-black">{material.unit}</TableCell>
                <TableCell className="w-32">
                  <div className="flex justify-center items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-black border-gray-300 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md p-1"
                      onClick={() => handleEditClick(material)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredMaterials.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-pink-100 rounded-lg bg-pink-100">
          <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <Package className="h-12 w-12 text-blue-100" />
          </div>
          <h3 className="text-xl font-medium text-black mb-2">
            Không tìm thấy nguyên liệu
          </h3>
          <p className="text-sm text-black mt-1">
            Không có nguyên liệu nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredMaterials.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-black">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredMaterials.length)} của {filteredMaterials.length} nguyên liệu
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
        <DialogContent className="sm:max-w-md bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">Chỉnh sửa nguyên liệu</DialogTitle>
          </DialogHeader>
          {editingMaterial && (
            <div className="space-y-4">
              <div>
                <Label className="text-black">Tên</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingMaterial.name}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Loại</Label>
                <select
                  className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
                  value={editingMaterial.type}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, type: e.target.value })
                  }
                >
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <Label className="text-black">Số lượng</Label>
                <Input
                  type="number"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingMaterial.quantity}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, quantity: +e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Đơn vị</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingMaterial.unit}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, unit: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Hình ảnh</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingMaterial.image}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, image: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  className="text-black border-pink-100 hover:bg-pink-100"
                  onClick={() => setIsEditOpen(false)}
                >
                  Hủy
                </Button>
                <Button 
                  className="bg-blue-100 hover:bg-blue-100 text-black"
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
        <DialogContent className="sm:max-w-md bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">Thêm nguyên liệu mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Tên</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newMaterial.name}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Loại</Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
                value={newMaterial.type}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, type: e.target.value })
                }
              >
                <option value="">-- Chọn loại --</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <Label className="text-black">Số lượng</Label>
              <Input
                type="number"
                className="border-pink-100 focus:ring-pink-100"
                value={newMaterial.quantity}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, quantity: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Đơn vị</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newMaterial.unit}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, unit: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Hình ảnh</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newMaterial.image}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, image: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                className="text-black border-pink-100 hover:bg-pink-100"
                onClick={() => setIsAddOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                className="bg-blue-100 hover:bg-blue-100 text-black"
                onClick={handleAddMaterial}
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

export default MaterialManagementPage;