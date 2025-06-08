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
import { 
  Pen, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Tag,
  Calendar,
  Percent,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/pagination";
import VoucherService from "@/services/VoucherService";

// Voucher Management Types
interface Voucher {
  id: number;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  status: "active" | "expired" | "used";
}

// Adapters to convert between API types and UI types
const mapApiToVoucher = (apiVoucher: any): Voucher => {
  // Map API status (number) to our status values
  let status: "active" | "expired" | "used" = "active";
  if (apiVoucher.status === 0) {
    status = "expired";
  } else if (apiVoucher.status === 2) {
    status = "used";
  }

  return {
    id: apiVoucher.voucher_id,
    code: apiVoucher.voucherName,
    description: apiVoucher.voucherName, // API doesn't have description, using name as fallback
    discountType: "percentage", // Assuming API only has percentage discounts
    discountValue: apiVoucher.discountPercentage,
    minPurchase: apiVoucher.minPrice,
    maxDiscount: apiVoucher.maxDiscount,
    startDate: apiVoucher.startDay,
    endDate: apiVoucher.expireDay,
    usageLimit: apiVoucher.voucherQuantity || 0,
    usageCount: 0, // API doesn't provide usage count, assuming 0
    status: status
  };
};

const mapVoucherToApi = (voucher: Voucher): any => {
  // Map our status values to API status (number)
  let status = 1; // active
  if (voucher.status === "expired") {
    status = 0;
  } else if (voucher.status === "used") {
    status = 2;
  }

  return {
    voucherName: voucher.code,
    voucherQuantity: voucher.usageLimit,
    minPrice: voucher.minPurchase,
    maxDiscount: voucher.maxDiscount || 0,
    discountPercentage: voucher.discountValue,
    startDay: voucher.startDate,
    expireDay: voucher.endDate,
    status: status,
    // voucher_id is not included in create requests
  };
};

const itemsPerPage = 5;

// Simple toast notification component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg flex items-center space-x-2 z-50 ${
      type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <span>{message}</span>
    </div>
  );
};

const VoucherManagementPage = () => {
  // Toast state instead of using the useToast hook
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show toast function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };
  
  // Voucher States
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newVoucher, setNewVoucher] = useState<Voucher>({
    id: 0,
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchase: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    usageLimit: 0,
    usageCount: 0,
    status: "active"
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch vouchers
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await VoucherService.get();
      const mappedVouchers = data.map(mapApiToVoucher);
      setVouchers(mappedVouchers);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch vouchers:', err);
      setError('Failed to load vouchers. Please try again later.');
      showToast("Failed to load vouchers", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Vouchers
  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = 
      voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      voucher.status === statusFilter;
    
    const matchesType =
      typeFilter === "all" ||
      voucher.discountType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVouchers = filteredVouchers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN').format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-200">
            Đang hoạt động
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-200">
            Đã hết hạn
          </Badge>
        );
      case "used":
        return (
          <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200 border border-pink-200">
            Đã dùng hết
          </Badge>
        );
      default:
        return null;
    }
  };

  // Progress bar component
  const UsageProgressBar = ({ current, total }: { current: number, total: number }) => {
    const percentage = Math.min(Math.round((current / total) * 100), 100);
    const getColorClass = () => {
      if (percentage >= 90) return "bg-red-500";
      if (percentage >= 70) return "bg-pink-500";
      return "bg-green-500";
    };

    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1">
          <span>{current}/{total}</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${getColorClass()} h-2 rounded-full`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const handleEditClick = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (editingVoucher) {
      try {
        const apiData = mapVoucherToApi(editingVoucher);
        await VoucherService.update(editingVoucher.id, apiData);
        
        // Update local state
        setVouchers((prev) => prev.map((v) => (v.id === editingVoucher.id ? editingVoucher : v)));
        setIsEditOpen(false);
        showToast("Voucher updated successfully", "success");
      } catch (err) {
        console.error('Failed to update voucher:', err);
        showToast("Failed to update voucher", "error");
      }
    }
  };

  const handleAddVoucher = async () => {
    try {
      if (newVoucher.code.trim() && newVoucher.discountValue > 0) {
        const apiData = mapVoucherToApi(newVoucher);
        const createdVoucher = await VoucherService.create(apiData);
        
        // Map the response back to our format and add to state
        const uiVoucher = mapApiToVoucher(createdVoucher);
        setVouchers((prev) => [...prev, uiVoucher]);
        
        // Reset form
        setNewVoucher({
          id: 0,
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: 0,
          minPurchase: 0,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          usageLimit: 0,
          usageCount: 0,
          status: "active"
        });
        
        setIsAddOpen(false);
        showToast("Voucher added successfully", "success");
      }
    } catch (err) {
      console.error('Failed to add voucher:', err);
      showToast("Failed to add voucher", "error");
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId !== null) {
      try {
        await VoucherService.delete(deleteId);
        
        // Update local state
        setVouchers((prev) => prev.filter((v) => v.id !== deleteId));
        setIsDeleteDialogOpen(false);
        showToast("Voucher deleted successfully", "success");
      } catch (err) {
        console.error('Failed to delete voucher:', err);
        showToast("Failed to delete voucher", "error");
      } finally {
        setDeleteId(null);
      }
    }
  };

  return (
    <div className="p-6 w-full space-y-6">
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Quản lý Voucher</h2>
          <p className="text-sm text-black">Danh sách voucher khuyến mãi</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/1 h-4 w-4 text-blue-800" />
            <Input
              placeholder="Tìm kiếm mã voucher..."
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
            className="text-black border-pink-100 hover:bg-pink-100"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button className="bg-blue-100 hover:bg-blue-100 text-black shadow-sm hover:shadow-md transition-all" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm voucher
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-pink-100 p-4 rounded-lg border border-pink-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-black mb-1">Trạng thái</Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="expired">Đã hết hạn</option>
                <option value="used">Đã dùng hết</option>
              </select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-black mb-1">Loại giảm giá</Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả loại</option>
                <option value="percentage">Theo phần trăm</option>
                <option value="fixed">Theo số tiền cố định</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-pink-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-100" />
            <span className="ml-2 text-black">Đang tải vouchers...</span>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            <p>{error}</p>
            <Button className="mt-4" onClick={fetchVouchers}>Thử lại</Button>
          </div>
        ) : (
          <Table className="min-w-[700px]">
            <TableHeader className="bg-pink-100">
              <TableRow>
                <TableHead className="text-black">Mã voucher</TableHead>
                <TableHead className="text-black">Mô tả</TableHead>
                <TableHead className="text-black">Giảm giá</TableHead>
                <TableHead className="text-black">Thời gian</TableHead>
                <TableHead className="text-black">Sử dụng</TableHead>
                <TableHead className="text-black">Trạng thái</TableHead>
                <TableHead className="text-black text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentVouchers.map((voucher) => (
                <TableRow key={voucher.id} className="hover:bg-pink-100 border-pink-100">
                  <TableCell className="font-bold text-black">
                    {voucher.code}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-black">{voucher.description}</div>
                    <div className="text-xs text-black mt-1">
                      Đơn tối thiểu: {formatCurrency(voucher.minPurchase)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {voucher.discountType === "percentage" ? (
                        <div className="bg-blue-100 text-black rounded-full px-2 py-1 text-sm flex items-center">
                          <Percent className="h-3 w-3 mr-1" />
                          {voucher.discountValue}%
                        </div>
                      ) : (
                        <div className="bg-green-100 text-black rounded-full px-2 py-1 text-sm">
                          {formatCurrency(voucher.discountValue)}
                        </div>
                      )}
                    </div>
                    {voucher.maxDiscount && (
                      <div className="text-xs text-black mt-1">
                        Tối đa: {formatCurrency(voucher.maxDiscount)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center text-black">
                        <Calendar className="h-3 w-3 mr-1 text-black" />
                        Bắt đầu: {formatDate(voucher.startDate)}
                      </div>
                      <div className="flex items-center text-black">
                        <Calendar className="h-3 w-3 mr-1 text-black" />
                        Kết thúc: {formatDate(voucher.endDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UsageProgressBar 
                      current={voucher.usageCount} 
                      total={voucher.usageLimit} 
                    />
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(voucher.status)}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="text-black border-pink-100 hover:bg-pink-100" onClick={() => handleEditClick(voucher)}>
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(voucher.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {!loading && filteredVouchers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-pink-100 rounded-lg bg-pink-100">
          <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <Tag className="h-12 w-12 text-blue-100" />
          </div>
          <h3 className="text-xl font-medium text-black mb-2">Không tìm thấy voucher</h3>
          <p className="text-sm text-black mt-1">
            Không có voucher nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {!loading && filteredVouchers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-black">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredVouchers.length)} của {filteredVouchers.length} voucher
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
            <DialogTitle className="text-black">Chỉnh sửa Ưu đãi</DialogTitle>
          </DialogHeader>
          {editingVoucher && (
            <div className="space-y-4">
              <div>
                <Label className="text-black">Mã ưu đãi</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingVoucher.code}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, code: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-black">Mô tả</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingVoucher.description}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, description: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-black">Loại giảm giá</Label>
                <select
                  className="w-full border border-pink-100 rounded-lg p-2 focus:ring-pink-100"
                  value={editingVoucher.discountType}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, discountType: e.target.value as "fixed" | "percentage" })
                  }
                >
                  <option value="fixed">Giảm số tiền cố định</option>
                  <option value="percentage">Giảm theo phần trăm</option>
                </select>
              </div>
              <div>
                <Label className="text-black">
                  {editingVoucher.discountType === "percentage" ? "Phần trăm giảm (%)" : "Giá trị giảm (VNĐ)"}
                </Label>
                <Input
                  type="number"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingVoucher.discountValue}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, discountValue: +e.target.value })}
                />
              </div>
              <div>
                <Label className="text-black">Đơn hàng tối thiểu (VNĐ)</Label>
                <Input
                  type="number"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingVoucher.minPurchase}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, minPurchase: +e.target.value })}
                />
              </div>
              <div>
                <Label className="text-black">Ngày bắt đầu</Label>
                <Input
                  type="date"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingVoucher.startDate}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-black">Ngày kết thúc</Label>
                <Input
                  type="date"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingVoucher.endDate}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, endDate: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-black">Giới hạn lượt dùng</Label>
                <Input
                  type="number"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingVoucher.usageLimit}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, usageLimit: +e.target.value })}
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
            <DialogTitle className="text-black">Thêm ưu đãi mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Mã ưu đãi</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newVoucher.code}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, code: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Mô tả</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newVoucher.description}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Loại giảm giá</Label>
              <select
                className="w-full border border-pink-100 rounded-lg p-2 focus:ring-pink-100"
                value={newVoucher.discountType}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, discountType: e.target.value as "fixed" | "percentage" })
                }
              >
                <option value="fixed">Giảm số tiền cố định</option>
                <option value="percentage">Giảm theo phần trăm</option>
              </select>
            </div>
            <div>
              <Label className="text-black">
                {newVoucher.discountType === "percentage" ? "Phần trăm giảm (%)" : "Giá trị giảm (VNĐ)"}
              </Label>
              <Input
                type="number"
                className="border-pink-100 focus:ring-pink-100"
                value={newVoucher.discountValue}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, discountValue: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Đơn hàng tối thiểu (VNĐ)</Label>
              <Input
                type="number"
                className="border-pink-100 focus:ring-pink-100"
                value={newVoucher.minPurchase}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, minPurchase: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Ngày bắt đầu</Label>
              <Input
                type="date"
                className="border-pink-100 focus:ring-pink-100"
                value={newVoucher.startDate}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Ngày kết thúc</Label>
              <Input
                type="date"
                className="border-pink-100 focus:ring-pink-100"
                value={newVoucher.endDate}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, endDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Giới hạn lượt dùng</Label>
              <Input
                type="number"
                className="border-pink-100 focus:ring-pink-100"
                value={newVoucher.usageLimit}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, usageLimit: +e.target.value })
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
                onClick={handleAddVoucher}
              >
                Thêm
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bạn có chắc chắn muốn xóa voucher này không? Hành động này không thể hoàn tác.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="text-black border-pink-100 hover:bg-pink-100"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteConfirm}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoucherManagementPage;