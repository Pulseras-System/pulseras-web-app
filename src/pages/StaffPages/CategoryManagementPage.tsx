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
import { Pen, Trash2, Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/pagination";
import CategoryService, { Category } from "@/services/CategoryService";

const itemsPerPage = 5;

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Category>({
    categoryId: 0,
    productId: 0,
    categoryName: "",
    status: 1,
    createDate: "",
    lastEdited: "",
  });
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    CategoryService.get()
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleEditSave = () => {
    if (editingCategory) {
      const updatedData = {
        categoryName: editingCategory.categoryName,
        status: editingCategory.status,
      };
      CategoryService.update(editingCategory.categoryId, updatedData)
        .then((updated) => {
          setCategories((prev) =>
            prev.map((c) =>
              c.categoryId === updated.categoryId ? updated : c
            )
          );
          setIsEditOpen(false);
        })
        .catch((err) => {
          console.error("Update failed:", err);
        });
    }
  };

  const handleAddCategory = () => {
    if (newCategory.categoryName.trim()) {
      const newData = {
        categoryName: newCategory.categoryName,
        status: newCategory.status,
      };
      CategoryService.create(newData)
        .then((created) => {
          setCategories((prev) => [...prev, created]);
          setNewCategory({
            categoryId: 0,
            productId: 0,
            categoryName: "",
            status: 1,
            createDate: "",
            lastEdited: "",
          });
          setIsAddOpen(false);
        })
        .catch((err) => {
          console.error("Create failed:", err);
        });
    }
  };

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Quản lý Danh mục</h2>
          <p className="text-sm text-black">Danh sách các loại vòng tay</p>
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
            className="bg-blue-100 hover:bg-blue-100 text-black shadow-sm hover:shadow-md transition-all"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-pink-100 bg-white shadow-sm overflow-auto">
        <Table className="min-w-[500px]">
          <TableHeader className="bg-pink-100">
            <TableRow>
              <TableHead className="text-black w-16">STT</TableHead>
              <TableHead className="text-black">Tên danh mục</TableHead>
              <TableHead className="text-black">Trạng thái</TableHead>
              <TableHead className="text-black text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCategories.map((cat, index) => (
              <TableRow key={cat.categoryId} className="hover:bg-pink-100 border-pink-100">
                <TableCell className="whitespace-nowrap text-black">
                  {startIndex + index + 1}
                </TableCell>
                <TableCell className="font-medium text-black whitespace-nowrap">
                  {cat.categoryName}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      cat.status === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cat.status === 1 ? "Hoạt động" : "Ẩn"}
                  </span>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-black border-pink-100 hover:bg-pink-100 hover:text-black"
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsEditOpen(true);
                    }}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    // onClick={...} // Xử lý xóa nếu muốn
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-pink-100 rounded-lg bg-pink-100">
          <h3 className="text-xl font-medium text-black mb-2">
            Không tìm thấy danh mục
          </h3>
          <p className="text-sm text-black mt-1">
            Không có danh mục nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredCategories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-black">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredCategories.length)} của{" "}
            {filteredCategories.length} danh mục
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
            <DialogTitle className="text-black">Chỉnh sửa danh mục</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label className="text-black">Tên danh mục</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingCategory.categoryName}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, categoryName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Trạng thái</Label>
                <select
                  className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
                  value={editingCategory.status}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      status: +e.target.value,
                    })
                  }
                >
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Ẩn</option>
                </select>
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
            <DialogTitle className="text-black">Thêm danh mục mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Tên danh mục</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newCategory.categoryName}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, categoryName: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Trạng thái</Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
                value={newCategory.status}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, status: +e.target.value })
                }
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Ẩn</option>
              </select>
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
                onClick={handleAddCategory}
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

export default CategoryManagementPage;