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
import { 
  Pen, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Tag,
  Calendar,
  Percent,
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

// Mock Data
const mockVouchers: Voucher[] = [
  {
    id: 1,
    code: "SUMMER25",
    description: "Giảm giá 25% cho mùa hè",
    discountType: "percentage",
    discountValue: 25,
    minPurchase: 500000,
    maxDiscount: 200000,
    startDate: "2025-05-01",
    endDate: "2025-07-31",
    usageLimit: 100,
    usageCount: 45,
    status: "active"
  },
  {
    id: 2,
    code: "WELCOME100K",
    description: "Giảm 100K cho khách hàng mới",
    discountType: "fixed",
    discountValue: 100000,
    minPurchase: 300000,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    usageLimit: 200,
    usageCount: 187,
    status: "active"
  },
  {
    id: 3,
    code: "SPECIAL50",
    description: "Giảm 50% cho khách VIP",
    discountType: "percentage",
    discountValue: 50,
    minPurchase: 1000000,
    maxDiscount: 500000,
    startDate: "2025-04-15",
    endDate: "2025-04-25",
    usageLimit: 50,
    usageCount: 50,
    status: "used"
  },
  {
    id: 4,
    code: "NEWYEAR2025",
    description: "Khuyến mãi đầu năm 2025",
    discountType: "percentage",
    discountValue: 30,
    minPurchase: 800000,
    maxDiscount: 300000,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    usageLimit: 150,
    usageCount: 150,
    status: "expired"
  },
  {
    id: 5,
    code: "FREESHIP",
    description: "Miễn phí vận chuyển",
    discountType: "fixed",
    discountValue: 50000,
    minPurchase: 250000,
    startDate: "2025-05-01",
    endDate: "2025-06-30",
    usageLimit: 300,
    usageCount: 122,
    status: "active"
  },
  {
    id: 6,
    code: "BIRTHDAY30",
    description: "Giảm 30% cho sinh nhật khách hàng",
    discountType: "percentage",
    discountValue: 30,
    minPurchase: 400000,
    maxDiscount: 300000,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    usageLimit: 500,
    usageCount: 215,
    status: "active"
  },
  {
    id: 7,
    code: "FLASH24H",
    description: "Flash sale 24h giảm 15%",
    discountType: "percentage",
    discountValue: 15,
    minPurchase: 200000,
    maxDiscount: 100000,
    startDate: "2025-03-10",
    endDate: "2025-03-11",
    usageLimit: 100,
    usageCount: 82,
    status: "expired"
  },
  {
    id: 8,
    code: "LOYALTY200K",
    description: "Giảm 200K cho khách hàng thân thiết",
    discountType: "fixed",
    discountValue: 200000,
    minPurchase: 1000000,
    startDate: "2025-05-01",
    endDate: "2025-12-31",
    usageLimit: 50,
    usageCount: 12,
    status: "active"
  }
];

const itemsPerPage = 5;

const VoucherManagementPage = () => {
  // Voucher States
  const [vouchers, setVouchers] = useState(mockVouchers);
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
      discountType: "fixed",
      discountValue: 0,
      minPurchase: 0,
      startDate: Date.now().toString(),
      endDate: Date.now().toString(),
      usageLimit: 0,
      usageCount: 0,
      status: "active"
    });
    const [isAddOpen, setIsAddOpen] = useState(false);

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

  // Get status badge component
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

  // Format discount value
  // const formatDiscountValue = (voucher: Voucher) => {
  //   if (voucher.discountType === "percentage") {
  //     return `${voucher.discountValue}%`;
  //   } else {
  //     return formatCurrency(voucher.discountValue);
  //   }
  // };

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

  const handleEditSave = () => {
    if (editingVoucher) {
      setVouchers((prev) =>
        prev.map((b) => (b.id === editingVoucher.id ? editingVoucher : b))
      );
      setIsEditOpen(false);
    }
  };

  const handleAddVoucher = () => {
    if (newVoucher.code.trim() && newVoucher.discountValue > 0) {
      setVouchers((prev) => [...prev, { ...newVoucher, id: Date.now() }]);
      setNewVoucher({
        id: 0,
        code: "",
        description: "",
        discountType: "fixed",
        discountValue: 0,
        minPurchase: 0,
        startDate: Date.now().toString(),
        endDate: Date.now().toString(),
        usageLimit: 0,
        usageCount: 0,
        status: "active"
        });
      setIsAddOpen(false);
    }
  };
  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-pink-900">Quản lý Voucher</h2>
          <p className="text-sm text-pink-700">Danh sách voucher khuyến mãi</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
            <Input
              placeholder="Tìm kiếm mã voucher..."
              className="pl-9 w-full sm:w-64 bg-pink-50 border-pink-200 focus-visible:ring-pink-300"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button 
            variant="outline" 
            className="text-pink-700 border-pink-300 hover:bg-pink-100"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700 text-pink-50" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm voucher
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-800 mb-1">Trạng thái</label>
              <select
                className="w-full p-2 border border-pink-200 rounded-md bg-white text-pink-900 focus:ring-pink-300"
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
              <label className="block text-sm font-medium text-pink-800 mb-1">Loại giảm giá</label>
              <select
                className="w-full p-2 border border-pink-200 rounded-md bg-white text-pink-900 focus:ring-pink-300"
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

      <div className="rounded-lg border border-pink-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-pink-50">
            <TableRow>
              <TableHead className="text-pink-900 w-32">Mã voucher</TableHead>
              <TableHead className="text-pink-900">Mô tả</TableHead>
              <TableHead className="text-pink-900 w-36">Giảm giá</TableHead>
              <TableHead className="text-pink-900 w-48">Thời gian</TableHead>
              <TableHead className="text-pink-900 w-32">Sử dụng</TableHead>
              <TableHead className="text-pink-900 w-32">Trạng thái</TableHead>
              <TableHead className="text-pink-900 text-right w-24">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentVouchers.map((voucher) => (
              <TableRow key={voucher.id} className="hover:bg-pink-50/50">
                <TableCell className="font-bold text-pink-900">
                  {voucher.code}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-pink-950">{voucher.description}</div>
                  <div className="text-xs text-pink-600 mt-1">
                    Đơn tối thiểu: {formatCurrency(voucher.minPurchase)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {voucher.discountType === "percentage" ? (
                      <div className="bg-pink-100 text-pink-800 rounded-full px-2 py-1 text-sm flex items-center">
                        <Percent className="h-3 w-3 mr-1" />
                        {voucher.discountValue}%
                      </div>
                    ) : (
                      <div className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-sm">
                        {formatCurrency(voucher.discountValue)}
                      </div>
                    )}
                  </div>
                  {voucher.maxDiscount && (
                    <div className="text-xs text-pink-600 mt-1">
                      Tối đa: {formatCurrency(voucher.maxDiscount)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center text-pink-800">
                      <Calendar className="h-3 w-3 mr-1 text-pink-500" />
                      Bắt đầu: {formatDate(voucher.startDate)}
                    </div>
                    <div className="flex items-center text-pink-800">
                      <Calendar className="h-3 w-3 mr-1 text-pink-500" />
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
                  <Button variant="outline" size="sm" className="text-pink-700 border-pink-300 hover:bg-pink-100" onClick={() => handleEditClick(voucher)}>
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

      {filteredVouchers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-pink-200 rounded-lg bg-pink-50">
          <Tag className="h-12 w-12 text-pink-400 mb-4" />
          <h3 className="text-lg font-medium text-pink-900">Không tìm thấy voucher</h3>
          <p className="text-sm text-pink-700 mt-1">
            Không có voucher nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredVouchers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-pink-700">
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
        <DialogContent className="sm:max-w-md bg-white text-gray-900 rounded-2xl shadow-xl border border-pink-200">
          <DialogHeader>
            <DialogTitle className="text-pink-800">Chỉnh sửa Ưu đãi</DialogTitle>
          </DialogHeader>
          {editingVoucher && (
            <div className="space-y-4">
              <div>
                <Label className="text-pink-700">Mã ưu đãi</Label>
                <Input
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingVoucher.code}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, code: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Mô tả</Label>
                <Input
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingVoucher.description}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Loại giảm giá</Label>
                <select
                  className="w-full border border-pink-200 rounded-lg p-2 focus:ring-pink-300"
                  value={editingVoucher.discountType}
                  onChange={(e) =>
                    setNewVoucher({ ...editingVoucher, discountType: e.target.value as "fixed" | "percentage" })
                  }
                >
                  <option value="fixed">Giảm số tiền cố định</option>
                  <option value="percent">Giảm theo phần trăm</option>
                </select>
              </div>
              <div>
                <Label className="text-pink-700">
                  {editingVoucher.discountType === "percentage" ? "Phần trăm giảm (%)" : "Giá trị giảm (VNĐ)"}
                </Label>
                <Input
                  type="number"
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingVoucher.discountValue}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, discountValue: +e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Đơn hàng tối thiểu (VNĐ)</Label>
                <Input
                  type="number"
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingVoucher.minPurchase}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, minPurchase: +e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Ngày bắt đầu</Label>
                <Input
                  type="date"
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingVoucher.startDate}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Ngày kết thúc</Label>
                <Input
                  type="date"
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingVoucher.endDate}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, endDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Giới hạn lượt dùng</Label>
                <Input
                  type="number"
                  className="border-pink-200 focus:ring-pink-300"
                  value={editingVoucher.usageLimit}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, usageLimit: +e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-pink-700">Trạng thái</Label>
                <select
                  className="w-full border border-pink-200 rounded-lg p-2 focus:ring-pink-300"
                  value={editingVoucher.status}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, status: e.target.value as "active" | "expired" | "used"})
                  }
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
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
            <DialogTitle className="text-pink-800">Thêm ưu đãi mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-pink-700">Mã ưu đãi</Label>
              <Input
                className="border-pink-200 focus:ring-pink-300"
                value={newVoucher.code}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, code: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Mô tả</Label>
              <Input
                className="border-pink-200 focus:ring-pink-300"
                value={newVoucher.description}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Loại giảm giá</Label>
              <select
                className="w-full border border-pink-200 rounded-lg p-2 focus:ring-pink-300"
                value={newVoucher.discountType}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, discountType: e.target.value as "fixed" | "percentage" })
                }
              >
                <option value="fixed">Giảm số tiền cố định</option>
                <option value="percent">Giảm theo phần trăm</option>
              </select>
            </div>
            <div>
              <Label className="text-pink-700">
                {newVoucher.discountType === "percentage" ? "Phần trăm giảm (%)" : "Giá trị giảm (VNĐ)"}
              </Label>
              <Input
                type="number"
                className="border-pink-200 focus:ring-pink-300"
                value={newVoucher.discountValue}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, discountValue: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Đơn hàng tối thiểu (VNĐ)</Label>
              <Input
                type="number"
                className="border-pink-200 focus:ring-pink-300"
                value={newVoucher.minPurchase}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, minPurchase: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Ngày bắt đầu</Label>
              <Input
                type="date"
                className="border-pink-200 focus:ring-pink-300"
                value={newVoucher.startDate}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Ngày kết thúc</Label>
              <Input
                type="date"
                className="border-pink-200 focus:ring-pink-300"
                value={newVoucher.endDate}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, endDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Giới hạn lượt dùng</Label>
              <Input
                type="number"
                className="border-pink-200 focus:ring-pink-300"
                value={newVoucher.usageLimit}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, usageLimit: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-pink-700">Trạng thái</Label>
              <select
                className="w-full border border-pink-200 rounded-lg p-2 focus:ring-pink-300"
                value={newVoucher.status}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, status: e.target.value as "active" | "expired" | "used"})
                }
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
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
                onClick={handleAddVoucher}
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

export default VoucherManagementPage;