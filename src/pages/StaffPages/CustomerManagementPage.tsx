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
  User, 
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/pagination";


interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  status: "active" | "inactive";
  avatar: string;
}

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    address: "123 Lê Lợi, Quận 1, TP.HCM",
    totalOrders: 12,
    totalSpent: 5600000,
    joinDate: "2023-05-15",
    status: "active",
    avatar: "/api/placeholder/100/100?text=NVA"
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "0912345678",
    address: "456 Nguyễn Huệ, Quận 1, TP.HCM",
    totalOrders: 8,
    totalSpent: 3200000,
    joinDate: "2023-06-20",
    status: "active",
    avatar: "/api/placeholder/100/100?text=TTB"
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@example.com",
    phone: "0923456789",
    address: "789 Điện Biên Phủ, Quận 3, TP.HCM",
    totalOrders: 5,
    totalSpent: 1800000,
    joinDate: "2023-07-10",
    status: "inactive",
    avatar: "/api/placeholder/100/100?text=LVC"
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    phone: "0934567890",
    address: "101 Cách Mạng Tháng 8, Quận 3, TP.HCM",
    totalOrders: 15,
    totalSpent: 7500000,
    joinDate: "2023-04-05",
    status: "active",
    avatar: "/api/placeholder/100/100?text=PTD"
  },
  {
    id: 5,
    name: "Võ Thị E",
    email: "vothie@example.com",
    phone: "0945678901",
    address: "202 Trần Hưng Đạo, Quận 5, TP.HCM",
    totalOrders: 3,
    totalSpent: 1200000,
    joinDate: "2023-08-12",
    status: "active",
    avatar: "/api/placeholder/100/100?text=VTE"
  },
  {
    id: 6,
    name: "Đặng Văn F",
    email: "dangvanf@example.com",
    phone: "0956789012",
    address: "303 Nguyễn Đình Chiểu, Quận 3, TP.HCM",
    totalOrders: 9,
    totalSpent: 4200000,
    joinDate: "2023-03-25",
    status: "active",
    avatar: "/api/placeholder/100/100?text=DVF"
  },
  {
    id: 7,
    name: "Hoàng Thị G",
    email: "hoangthig@example.com",
    phone: "0967890123",
    address: "404 Lý Tự Trọng, Quận 1, TP.HCM",
    totalOrders: 7,
    totalSpent: 2800000,
    joinDate: "2023-09-08",
    status: "inactive",
    avatar: "/api/placeholder/100/100?text=HTG"
  },
  {
    id: 8,
    name: "Ngô Văn H",
    email: "ngovanh@example.com",
    phone: "0978901234",
    address: "505 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM",
    totalOrders: 11,
    totalSpent: 5100000,
    joinDate: "2023-02-18",
    status: "active",
    avatar: "/api/placeholder/100/100?text=NVH"
  },
  {
    id: 9,
    name: "Trương Văn I",
    email: "truongvani@example.com",
    phone: "0989012345",
    address: "606 Hai Bà Trưng, Quận 1, TP.HCM",
    totalOrders: 6,
    totalSpent: 2400000,
    joinDate: "2023-10-05",
    status: "active",
    avatar: "/api/placeholder/100/100?text=TVI"
  },
  {
    id: 10,
    name: "Lý Thị K",
    email: "lythik@example.com",
    phone: "0990123456",
    address: "707 Phan Xích Long, Phú Nhuận, TP.HCM",
    totalOrders: 4,
    totalSpent: 1600000,
    joinDate: "2023-11-15",
    status: "inactive",
    avatar: "/api/placeholder/100/100?text=LTK"
  }
];

const itemsPerPage = 5;

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [spendingFilter, setSpendingFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      customer.status === statusFilter;
    
    const matchesSpending =
      spendingFilter === "all" ||
      (spendingFilter === "under1m" && customer.totalSpent < 1000000) ||
      (spendingFilter === "1mto5m" && customer.totalSpent >= 1000000 && customer.totalSpent <= 5000000) ||
      (spendingFilter === "over5m" && customer.totalSpent > 5000000);
    
    return matchesSearch && matchesStatus && matchesSpending;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN').format(date);
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

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Quản lý Khách hàng</h2>
          <p className="text-sm text-amber-700">Danh sách khách hàng của cửa hàng</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
            <Input
              placeholder="Tìm kiếm khách hàng..."
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
            Thêm khách hàng
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Lọc theo trạng thái</label>
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
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Lọc theo chi tiêu</label>
              <select
                className="w-full p-2 border border-amber-200 rounded-md bg-white text-amber-900 focus:ring-amber-300"
                value={spendingFilter}
                onChange={(e) => {
                  setSpendingFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả mức chi tiêu</option>
                <option value="under1m">Dưới 1 triệu</option>
                <option value="1mto5m">1 - 5 triệu</option>
                <option value="over5m">Trên 5 triệu</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-amber-50">
            <TableRow>
              <TableHead className="text-amber-900 w-16">Avatar</TableHead>
              <TableHead className="text-amber-900">Thông tin khách hàng</TableHead>
              <TableHead className="text-amber-900">Liên hệ</TableHead>
              <TableHead className="text-amber-900">Tổng đơn hàng</TableHead>
              <TableHead className="text-amber-900">Tổng chi tiêu</TableHead>
              <TableHead className="text-amber-900">Ngày tham gia</TableHead>
              <TableHead className="text-amber-900">Trạng thái</TableHead>
              <TableHead className="text-amber-900 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCustomers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-amber-50/50">
                <TableCell>
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-200">
                    <img 
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-amber-900">
                  <div className="font-semibold">{customer.name}</div>
                  <div className="text-xs text-amber-500">ID: {customer.id}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm mb-1">
                    <Mail className="h-3 w-3 mr-1 text-amber-500" />
                    {customer.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-3 w-3 mr-1 text-amber-500" />
                    {customer.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-1 text-amber-500" />
                    {customer.totalOrders}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1 text-amber-500" />
                    {formatCurrency(customer.totalSpent)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-amber-500" />
                    {formatDate(customer.joinDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${
                    customer.status === "active" 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }`}>
                    {customer.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
                  </Badge>
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

      {filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-amber-200 rounded-lg bg-amber-50">
          <User className="h-12 w-12 text-amber-400 mb-4" />
          <h3 className="text-lg font-medium text-amber-900">Không tìm thấy khách hàng</h3>
          <p className="text-sm text-amber-700 mt-1">
            Không có khách hàng nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredCustomers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-amber-700">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} của {filteredCustomers.length} khách hàng
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

export default CustomerManagementPage;