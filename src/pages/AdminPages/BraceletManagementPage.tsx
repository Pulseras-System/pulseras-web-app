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
import { Pen, Trash2, Plus, Search, Filter, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ProductService, { Product } from "@/services/ProductService";
import CategoryService from "@/services/CategoryService";
import Pagination from "@/components/pagination";

const itemsPerPage = 8;

const BraceletManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Thêm state này
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [materialFilter, setMaterialFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
    productId: "",
    categoryIds: [],
    productName: "",
    productDescription: "",
    productMaterial: "",
    productImage: "",
    quantity: 0,
    type: "bracelet",
    price: 0,
    createDate: "",
    lastEdited: null,
    status: 1,
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  // state cho modal confirm delete
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // state cho thông báo
  const [notification, setNotification] = useState<string | null>(null);
  // mapping category id -> categoryName
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});
  const [newProductCategoryInput, setNewProductCategoryInput] = useState(""); // dùng cho danh mục (tên danh mục)

  // Load products từ API, không lọc trên client nữa
  useEffect(() => {
    ProductService.get({
      keyword: searchTerm,
      page: currentPage - 1,
      size: itemsPerPage,
      // Có thể truyền thêm filter nếu backend hỗ trợ
    })
      .then((res) => {
        setProducts(res.items.filter((p) => p.type.toLowerCase().includes("bracelet")));
        setTotalPages(res.totalPages);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
      });
  }, [searchTerm, currentPage, priceFilter, materialFilter]);

  // Load categories and build mapping
  useEffect(() => {
    CategoryService.get()
      .then((cats) => {
        const map: Record<string, string> = {};
        cats.forEach((cat) => {
          map[String(cat.categoryId)] = cat.categoryName;
        });
        setCategoriesMap(map);
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
  }, []);

  // const filteredProducts = products.filter((product) => {
  //   const matchesSearch =
  //     product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     product.productMaterial.toLowerCase().includes(searchTerm.toLowerCase());

  //   const matchesPrice =
  //     priceFilter === "all" ||
  //     (priceFilter === "under300" && product.price < 300000) ||
  //     (priceFilter === "300to400" &&
  //       product.price >= 300000 &&
  //       product.price <= 400000) ||
  //     (priceFilter === "over400" && product.price > 400000);

  //   const matchesMaterial =
  //     materialFilter === "all" ||
  //     product.productMaterial.toLowerCase().includes(materialFilter.toLowerCase());

  //   return matchesSearch && matchesPrice && matchesMaterial;
  // });

  // const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // const handlePageChange = (page: number) => {
  //   if (page >= 1 && page <= totalPages) {
  //     setCurrentPage(page);
  //   }
  // };

  const uniqueMaterials = Array.from(new Set(products.map((p) => p.productMaterial)));

  const handleEditSave = () => {
    if (editingProduct) {
      const updatedData = {
        categoryIds: editingProduct.categoryIds,
        productName: editingProduct.productName,
        productMaterial: editingProduct.productMaterial,
        productDescription: editingProduct.productDescription,
        productImage: editingProduct.productImage,
        price: editingProduct.price,
        quantity: editingProduct.quantity,
        type: editingProduct.type,
        status: editingProduct.status,
      };
      ProductService.update(editingProduct.productId, updatedData)
        .then((updated: Product) => {
          setProducts((prev) =>
            prev.map((p) =>
              p.productId === updated.productId ? updated : p
            )
          );
          setIsEditOpen(false);
        })
        .catch((error) => {
          console.error("Update failed:", error);
        });
    }
  };

  const handleAddProduct = () => {
    if (newProduct.productName.trim() && newProduct.productMaterial.trim()) {
      // Tách chuỗi tên danh mục đã nhập
      const categoryNames = newProductCategoryInput
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name !== "");

      // Chuyển từ tên danh mục sang cate id dựa trên mapping (không phân biệt hoa thường)
      const categoryIds = categoryNames.map((name) => {
        const found = Object.entries(categoriesMap).find(
          ([, catName]) => catName.toLowerCase() === name.toLowerCase()
        );
        return found ? found[0] : name;
      });

      const newData = {
        categoryIds,
        productName: newProduct.productName,
        productDescription: newProduct.productDescription,
        productMaterial: newProduct.productMaterial,
        productImage: newProduct.productImage,
        price: newProduct.price,
        quantity: newProduct.quantity,
        type: newProduct.type,
        status: newProduct.status,
      };
      ProductService.create(newData)
        .then((created: Product) => {
          setProducts((prev) => [...prev, created]);
          setNewProduct({
            productId: "",
            categoryIds: [],
            productName: "",
            productDescription: "",
            productMaterial: "",
            productImage: "",
            quantity: 0,
            type: "bracelet",
            price: 0,
            createDate: "",
            lastEdited: null,
            status: 1,
          });
          setNewProductCategoryInput("");
          setIsAddOpen(false);
        })
        .catch((error) => {
          console.error("Create failed:", error);
        });
    }
  };

  const getCategoryName = (id: number | string) => {
    return categoriesMap[String(id)] || id;
  };

  // Xử lý delete: mở confirm modal
  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingProduct) {
      // Giả sử ProductService có hàm delete, căn cứ API của bạn
      ProductService.delete(deletingProduct.productId)
        .then(() => {
          setProducts((prev) =>
            prev.filter((p) => p.productId !== deletingProduct.productId)
          );
          setDeletingProduct(null);
          setIsDeleteOpen(false);
          setNotification("Xoá sản phẩm thành công!");
          setTimeout(() => setNotification(null), 3000);
        })
        .catch((error) => {
          console.error("Delete failed:", error);
        });
    }
  };

  // Khi đổi filter hoặc search thì reset về trang 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriceFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleMaterialFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaterialFilter(e.target.value);
    setCurrentPage(1);
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-800" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9 w-full sm:w-64 bg-pink-100 border-pink-100 focus-visible:ring-pink-100 text-black placeholder-black"
              value={searchTerm}
              onChange={handleSearchChange}
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
                onChange={handlePriceFilterChange}
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
                onChange={handleMaterialFilterChange}
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
              <TableHead className="text-black">Loại</TableHead>
              <TableHead className="text-black">Chất liệu</TableHead>
              <TableHead className="text-black">Giá (VND)</TableHead>
              <TableHead className="text-black">Tồn kho</TableHead>
              <TableHead className="text-black text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productId} className="hover:bg-pink-100 border-pink-100">
                <TableCell>
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-pink-100 bg-pink-100">
                    <img
                      src={product.productImage}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-black whitespace-nowrap">
                  <div className="font-semibold">{product.productName}</div>
                  <div className="text-xs text-gray-600">
                    {product.categoryIds.length > 0
                      ? product.categoryIds.map((id) => getCategoryName(id)).join(", ")
                      : "Không có danh mục"}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-black">
                  {product.type}
                </TableCell>
                <TableCell className="whitespace-nowrap text-black">
                  {product.productMaterial}
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap text-black">
                  {(product as any).price?.toLocaleString() || "0"}₫
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      product.quantity > 10
                        ? "bg-green-100 text-green-800"
                        : product.quantity > 5
                        ? "bg-pink-100 text-pink-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.quantity} {product.quantity > 5 ? "cái" : "sắp hết"}
                  </span>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-black border-pink-100 hover:bg-pink-100 hover:text-black"
                    onClick={() => {
                      setEditingProduct(product);
                      setIsEditOpen(true);
                    }}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-black">
            Trang {currentPage} / {totalPages}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {products.length === 0 && (
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

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">Chỉnh sửa vòng tay</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label className="text-black">Tên</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingProduct.productName}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, productName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Chất liệu</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingProduct.productMaterial}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, productMaterial: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Mô tả</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingProduct.productDescription}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, productDescription: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Loại</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingProduct.type}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, type: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Danh mục (Tên danh mục)</Label>
                <Input
                  list="categoriesList"
                  placeholder="Nhập tên danh mục, cách nhau dấu phẩy"
                  value={
                    editingProduct.categoryIds
                      .map((id) => getCategoryName(id))
                      .join(", ")
                  }
                  onChange={(e) => {
                    const names = e.target.value
                      .split(",")
                      .map((name) => name.trim())
                      .filter((name) => name !== "");
                    const ids = names.map((name) => {
                      const found = Object.entries(categoriesMap).find(
                        ([, catName]) =>
                          catName.toLowerCase() === name.toLowerCase()
                      );
                      return found ? found[0] : name;
                    });
                    setEditingProduct({ ...editingProduct, categoryIds: ids });
                  }}
                />
                <datalist id="categoriesList">
                  {Object.values(categoriesMap).map((name, index) => (
                    <option key={index} value={name} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label className="text-black">Hình ảnh</Label>
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer bg-pink-100 hover:bg-pink-200 text-black border border-pink-100 py-2 px-4 rounded-md">
                    Chọn Ảnh
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (file) {
                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = () => {
                            setEditingProduct({
                              ...editingProduct,
                              productImage: reader.result as string,
                            });
                          };
                        }
                      }}
                    />
                  </label>
                  {editingProduct?.productImage && (
                    <img
                      src={editingProduct.productImage}
                      alt="preview"
                      className="w-16 h-16 object-cover rounded-md border border-pink-100"
                    />
                  )}
                </div>
              </div>
              <div>
                <Label className="text-black">Giá</Label>
                <Input
                  type="number"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: +e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Tồn kho</Label>
                <Input
                  type="number"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingProduct.quantity}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, quantity: +e.target.value })
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
                value={newProduct.productName}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, productName: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Chất liệu</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newProduct.productMaterial}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, productMaterial: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Mô tả</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newProduct.productDescription}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, productDescription: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Loại</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newProduct.type}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, type: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Danh mục (Tên danh mục)</Label>
              <Input
                list="categoriesList"
                placeholder="Nhập tên danh mục, cách nhau dấu phẩy"
                value={newProductCategoryInput}
                onChange={(e) => setNewProductCategoryInput(e.target.value)}
              />
              <datalist id="categoriesList">
                {Object.values(categoriesMap).map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
            </div>
            <div>
              <Label className="text-black">Hình ảnh</Label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-pink-100 hover:bg-pink-200 text-black border border-pink-100 py-2 px-4 rounded-md">
                  Chọn Ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files ? e.target.files[0] : null;
                      if (file) {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => {
                          setNewProduct({ ...newProduct, productImage: reader.result as string });
                        };
                      }
                    }}
                  />
                </label>
                {newProduct.productImage && (
                  <img
                    src={newProduct.productImage}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded-md border border-pink-100"
                  />
                )}
              </div>
            </div>
            <div>
              <Label className="text-black">Giá</Label>
              <Input
                type="number"
                className="border-pink-100 focus:ring-pink-100"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Tồn kho</Label>
              <Input
                type="number"
                className="border-pink-100 focus:ring-pink-100"
                value={newProduct.quantity}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, quantity: +e.target.value })
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
                onClick={handleAddProduct}
              >
                Thêm
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">Xác nhận xoá</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            {deletingProduct && (
              <p>
                Bạn có chắc muốn xoá sản phẩm <strong>{deletingProduct.productName}</strong>?
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="text-black border-pink-100 hover:bg-pink-100"
              onClick={() => setIsDeleteOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-red-100 hover:bg-red-100 text-black"
              onClick={handleDeleteConfirm}
            >
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 p-4 rounded shadow-lg">
          {notification}
        </div>
      )}
    </div>
  );
};

export default BraceletManagement;