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
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200">
            Đã dùng hết
          </Badge>
        );
      default:
        return null;
    }
  };

  // Format discount value
  const formatDiscountValue = (voucher: Voucher) => {
    if (voucher.discountType === "percentage") {
      return `${voucher.discountValue}%`;
    } else {
      return formatCurrency(voucher.discountValue);
    }
  };

  // Progress bar component
  const UsageProgressBar = ({ current, total }: { current: number, total: number }) => {
    const percentage = Math.min(Math.round((current / total) * 100), 100);
    const getColorClass = () => {
      if (percentage >= 90) return "bg-red-500";
      if (percentage >= 70) return "bg-amber-500";
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

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Quản lý Voucher</h2>
          <p className="text-sm text-amber-700">Danh sách voucher khuyến mãi</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
            <Input
              placeholder="Tìm kiếm mã voucher..."
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
            Thêm voucher
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Trạng thái</label>
              <select
                className="w-full p-2 border border-amber-200 rounded-md bg-white text-amber-900 focus:ring-amber-300"
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
              <label className="block text-sm font-medium text-amber-800 mb-1">Loại giảm giá</label>
              <select
                className="w-full p-2 border border-amber-200 rounded-md bg-white text-amber-900 focus:ring-amber-300"
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

      <div className="rounded-lg border border-amber-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-amber-50">
            <TableRow>
              <TableHead className="text-amber-900 w-32">Mã voucher</TableHead>
              <TableHead className="text-amber-900">Mô tả</TableHead>
              <TableHead className="text-amber-900 w-36">Giảm giá</TableHead>
              <TableHead className="text-amber-900 w-48">Thời gian</TableHead>
              <TableHead className="text-amber-900 w-32">Sử dụng</TableHead>
              <TableHead className="text-amber-900 w-32">Trạng thái</TableHead>
              <TableHead className="text-amber-900 text-right w-24">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentVouchers.map((voucher) => (
              <TableRow key={voucher.id} className="hover:bg-amber-50/50">
                <TableCell className="font-bold text-amber-900">
                  {voucher.code}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-amber-950">{voucher.description}</div>
                  <div className="text-xs text-amber-600 mt-1">
                    Đơn tối thiểu: {formatCurrency(voucher.minPurchase)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {voucher.discountType === "percentage" ? (
                      <div className="bg-amber-100 text-amber-800 rounded-full px-2 py-1 text-sm flex items-center">
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
                    <div className="text-xs text-amber-600 mt-1">
                      Tối đa: {formatCurrency(voucher.maxDiscount)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center text-amber-800">
                      <Calendar className="h-3 w-3 mr-1 text-amber-500" />
                      Bắt đầu: {formatDate(voucher.startDate)}
                    </div>
                    <div className="flex items-center text-amber-800">
                      <Calendar className="h-3 w-3 mr-1 text-amber-500" />
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

      {filteredVouchers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-amber-200 rounded-lg bg-amber-50">
          <Tag className="h-12 w-12 text-amber-400 mb-4" />
          <h3 className="text-lg font-medium text-amber-900">Không tìm thấy voucher</h3>
          <p className="text-sm text-amber-700 mt-1">
            Không có voucher nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredVouchers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-amber-700">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredVouchers.length)} của {filteredVouchers.length} voucher
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

export default VoucherManagementPage;