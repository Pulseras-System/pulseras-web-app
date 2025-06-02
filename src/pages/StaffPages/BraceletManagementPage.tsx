import { useState, useEffect } from "react";
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
import ProductService, { Product } from "@/services/ProductService";

export interface Bracelet {
  id: number;
  name: string;
  material: string;
  price: number;
  stock: number;
  image: string;
}

const itemsPerPage = 5;

const BraceletManagement = () => {
  const [bracelets, setBracelets] = useState<Bracelet[]>([]);
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

  // Gọi API từ ProductService và mapping sang kiểu Bracelet
  useEffect(() => {
    ProductService.get()
      .then((products: Product[]) => {
        const braceletsFromProducts: Bracelet[] = products.map((product) => ({
          id: product.product_id,
          name: product.productName,
          material: product.productMaterial,
          price: 0, // nếu có field price
          stock: product.quantity,
          image: product.productImage,
        }));
        setBracelets(braceletsFromProducts);
      })
      .catch((error) => {
        console.error("Failed to fetch bracelets:", error);
      });
  }, []);

  const filteredBracelets = bracelets.filter((bracelet) => {
    const matchesSearch =
      (bracelet.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bracelet.material || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "under300" && bracelet.price < 300000) ||
      (priceFilter === "300to400" &&
        bracelet.price >= 300000 &&
        bracelet.price <= 400000) ||
      (priceFilter === "over400" && bracelet.price > 400000);

    const matchesMaterial =
      materialFilter === "all" ||
      (bracelet.material || "").toLowerCase().includes(materialFilter.toLowerCase());

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

  const uniqueMaterials = Array.from(new Set(bracelets.map((b) => b.material)));

  // Update: gọi API update thông qua ProductService
  const handleEditSave = () => {
    if (editingBracelet) {
      // Map từ Bracelet sang Product
      const updatedProduct = {
        product_id: editingBracelet.id,
        productName: editingBracelet.name,
        productMaterial: editingBracelet.material,
        price: editingBracelet.price,
        quantity: editingBracelet.stock,
        productImage: editingBracelet.image,
      };
      ProductService.update(editingBracelet.id, updatedProduct)
        .then((updated: Product) => {
          // Map ngược lại từ Product sang Bracelet
          const updatedBracelet: Bracelet = {
            id: updated.product_id,
            name: updated.productName,
            material: updated.productMaterial,
            price: 0,
            stock: updated.quantity,
            image: updated.productImage,
          };
          setBracelets((prev) =>
            prev.map((b) => (b.id === updatedBracelet.id ? updatedBracelet : b))
          );
          setIsEditOpen(false);
        })
        .catch((error) => {
          console.error("Update failed:", error);
        });
    }
  };

  // Create: gọi API create thông qua ProductService
  const handleAddBracelet = () => {
    if (newBracelet.name.trim() && newBracelet.material.trim()) {
      const newProduct = {
        categoryId: 0, // Giả sử categoryId là 1, có thể thay đổi tùy theo yêu cầu
        productName: newBracelet.name,
        productDescription: "abc", // Nếu cần mô tả, có thể thêm vào đây
        productMaterial: newBracelet.material,
        productImage: newBracelet.image,
        price: newBracelet.price,
        quantity: newBracelet.stock,
        type: "bracelet", // Giả sử type là "bracelet"
        status: 1, // Giả sử status là 1 (có thể thay đổi tùy theo yêu cầu)
      };
      ProductService.create(newProduct)
        .then((created: Product) => {
          // Map từ Product trả về sang kiểu Bracelet
          const createdBracelet: Bracelet = {
            id: created.product_id,
            name: created.productName,
            material: created.productMaterial,
            price: 0,
            stock: created.quantity,
            image: created.productImage,
          };
          setBracelets((prev) => [...prev, createdBracelet]);
          setNewBracelet({
            id: 0,
            name: "",
            material: "",
            price: 0,
            stock: 0,
            image: "",
          });
          setIsAddOpen(false);
        })
        .catch((error) => {
          console.error("Create failed:", error);
        });
    }
  };

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Quản lý Vòng tay</h2>
          <p className="text-sm text-black">Danh sách sản phẩm trong workshop</p>
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
            Thêm vòng tay
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-pink-100 p-4 rounded-lg border border-pink-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-black mb-1">
                Lọc theo giá
              </Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
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
              <Label className="block text-sm font-medium text-black mb-1">
                Lọc theo chất liệu
              </Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
                value={materialFilter}
                onChange={(e) => {
                  setMaterialFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả chất liệu</option>
                {uniqueMaterials.map((material) => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-pink-100 bg-white shadow-sm overflow-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-pink-100">
            <TableRow>
              <TableHead className="text-black w-20">Hình ảnh</TableHead>
              <TableHead className="text-black">Tên sản phẩm</TableHead>
              <TableHead className="text-black">Chất liệu</TableHead>
              <TableHead className="text-black">Giá (VND)</TableHead>
              <TableHead className="text-black">Tồn kho</TableHead>
              <TableHead className="text-black text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBracelets.map((bracelet) => (
              <TableRow key={bracelet.id} className="hover:bg-pink-100 border-pink-100">
                <TableCell>
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-pink-100 bg-pink-100">
                    <img
                      src={bracelet.image}
                      alt={bracelet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-black whitespace-nowrap">
                  <div className="font-semibold">{bracelet.name}</div>
                  <div className="text-xs text-black">ID: {bracelet.id}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-black">
                  {bracelet.material}
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap text-black">
                  {bracelet.price.toLocaleString()}₫
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      bracelet.stock > 10
                        ? "bg-green-100 text-green-800"
                        : bracelet.stock > 5
                        ? "bg-pink-100 text-pink-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {bracelet.stock} {bracelet.stock > 5 ? "cái" : "sắp hết"}
                  </span>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-black border-pink-100 hover:bg-pink-100 hover:text-black"
                    onClick={() => {
                      setEditingBracelet(bracelet);
                      setIsEditOpen(true);
                    }}
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
        <div className="flex flex-col items-center justify-center py-12 text-center border border-pink-100 rounded-lg bg-pink-100">
          <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <Package className="h-12 w-12 text-blue-100" />
          </div>
          <h3 className="text-xl font-medium text-black mb-2">
            Không tìm thấy vòng tay
          </h3>
          <p className="text-sm text-black mt-1">
            Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredBracelets.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-black">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredBracelets.length)} của{" "}
            {filteredBracelets.length} sản phẩm
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
            <DialogTitle className="text-black">Chỉnh sửa vòng tay</DialogTitle>
          </DialogHeader>
          {editingBracelet && (
            <div className="space-y-4">
              <div>
                <Label className="text-black">Tên</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingBracelet.name}
                  onChange={(e) =>
                    setEditingBracelet({ ...editingBracelet, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Chất liệu</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingBracelet.material}
                  onChange={(e) =>
                    setEditingBracelet({ ...editingBracelet, material: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Giá</Label>
                <Input
                  type="number"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingBracelet.price}
                  onChange={(e) =>
                    setEditingBracelet({ ...editingBracelet, price: +e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Tồn kho</Label>
                <Input
                  type="number"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingBracelet.stock}
                  onChange={(e) =>
                    setEditingBracelet({ ...editingBracelet, stock: +e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Hình ảnh</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingBracelet.image}
                  onChange={(e) =>
                    setEditingBracelet({ ...editingBracelet, image: e.target.value })
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
            <DialogTitle className="text-black">Thêm vòng tay mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Tên</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newBracelet.name}
                onChange={(e) =>
                  setNewBracelet({ ...newBracelet, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Chất liệu</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newBracelet.material}
                onChange={(e) =>
                  setNewBracelet({ ...newBracelet, material: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Giá</Label>
              <Input
                type="number"
                className="border-pink-100 focus:ring-pink-100"
                value={newBracelet.price}
                onChange={(e) =>
                  setNewBracelet({ ...newBracelet, price: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Tồn kho</Label>
              <Input
                type="number"
                className="border-pink-100 focus:ring-pink-100"
                value={newBracelet.stock}
                onChange={(e) =>
                  setNewBracelet({ ...newBracelet, stock: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Hình ảnh</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newBracelet.image}
                onChange={(e) =>
                  setNewBracelet({ ...newBracelet, image: e.target.value })
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