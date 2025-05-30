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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

const emptyCustomer: Customer = {
  id: -1,
  name: "",
  email: "",
  phone: "",
  address: "",
  totalOrders: 0,
  totalSpent: 0,
  joinDate: new Date().toISOString().split("T")[0],
  status: "active",
  avatar: "/api/placeholder/100/100?text=?"
};

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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

  const handleAddCustomer = () => {
    setSelectedCustomer(emptyCustomer);
    setModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleSaveCustomer = (customer: Customer) => {
    if (customer.id === -1) {
      const newCustomer = {
        ...customer,
        id: Math.max(...customers.map(c => c.id)) + 1,
        avatar: `/api/placeholder/100/100?text=${customer.name.split(" ").map(s => s[0]).join("")}`
      };
      setCustomers([...customers, newCustomer]);
    } else {
      setCustomers(customers.map(c => (c.id === customer.id ? customer : c)));
    }
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Quản lý Khách hàng</h2>
          <p className="text-sm text-black">Danh sách khách hàng của cửa hàng</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/1 h-4 w-4 text-blue-800" />
            <Input
              placeholder="Tìm kiếm khách hàng..."
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
            onClick={handleAddCustomer}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-pink-100 p-4 rounded-lg border border-pink-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Lọc theo trạng thái</label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
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
              <label className="block text-sm font-medium text-black mb-1">Lọc theo chi tiêu</label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
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

      <div className="rounded-lg border border-pink-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-pink-100">
            <TableRow>
              <TableHead className="text-black w-16">Avatar</TableHead>
              <TableHead className="text-black">Thông tin khách hàng</TableHead>
              <TableHead className="text-black">Liên hệ</TableHead>
              <TableHead className="text-black">Tổng đơn hàng</TableHead>
              <TableHead className="text-black">Tổng chi tiêu</TableHead>
              <TableHead className="text-black">Ngày tham gia</TableHead>
              <TableHead className="text-black">Trạng thái</TableHead>
              <TableHead className="text-black text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCustomers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-pink-100 border-pink-100">
                <TableCell>
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-pink-100 bg-pink-100">
                    <img 
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-black whitespace-nowrap">
                  <div className="font-semibold">{customer.name}</div>
                  <div className="text-xs text-black">ID: {customer.id}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm mb-1">
                    <Mail className="h-3 w-3 mr-1 text-blue-100" />
                    {customer.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-3 w-3 mr-1 text-blue-100" />
                    {customer.phone}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-1 text-blue-100" />
                    {customer.totalOrders}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1 text-blue-100" />
                    {formatCurrency(customer.totalSpent)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-blue-100" />
                    {formatDate(customer.joinDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${
                    customer.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {customer.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-black border-pink-100 hover:bg-pink-100 hover:text-black"
                    onClick={() => handleEditCustomer(customer)}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-pink-100 rounded-lg bg-pink-100">
          <User className="h-12 w-12 text-blue-100 mb-4" />
          <h3 className="text-lg font-medium text-black">Không tìm thấy khách hàng</h3>
          <p className="text-sm text-black mt-1">
            Không có khách hàng nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredCustomers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-black">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} của {filteredCustomers.length} khách hàng
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {modalOpen && selectedCustomer && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white text-black rounded-2xl shadow-xl border border-pink-100">
            <DialogHeader>
              <DialogTitle className="text-black">
                {selectedCustomer.id === -1 ? "Thêm khách hàng" : "Chỉnh sửa khách hàng"}
              </DialogTitle>
            </DialogHeader>
            <form
              className="grid gap-4 py-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCustomer(selectedCustomer);
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black">Tên</Label>
                  <Input
                    value={selectedCustomer.name}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-black">Email</Label>
                  <Input
                    type="email"
                    value={selectedCustomer.email}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black">Số điện thoại</Label>
                  <Input
                    value={selectedCustomer.phone}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-black">Trạng thái</Label>
                  <select
                    className="w-full p-2 border border-pink-100 rounded-md bg-white text-black"
                    value={selectedCustomer.status}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, status: e.target.value as "active" | "inactive" })}
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-black">Địa chỉ</Label>
                <Textarea
                  value={selectedCustomer.address}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" className="text-black border-pink-100 hover:bg-pink-100" onClick={() => setModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-100 hover:bg-blue-100 text-black">
                  Lưu
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerManagementPage;