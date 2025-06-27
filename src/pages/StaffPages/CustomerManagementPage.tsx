import { useEffect, useState } from "react";
import AccountService, { Account } from "@/services/AccountService";
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

const itemsPerPage = 5;

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [spendingFilter, setSpendingFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Account | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await AccountService.getCustomers();
        // Fetch totalOrders và totalSpent cho từng customer
        const customersWithStats = await Promise.all(
          data.map(async (customer) => {
            let totalOrders = 0;
            let totalSpent = 0;
            try {
              totalOrders = await AccountService.getTotalOrdersByCustomer(customer.id);
            } catch {
              totalOrders = 0;
            }
            try {
              totalSpent = await AccountService.getTotalSpentByCustomer(customer.id);
            } catch {
              totalSpent = 0;
            }
            // Gán avatar mặc định nếu không có
            const defaultAvatar = "/src/assets/icons/noavatar.png";
            return { 
              ...customer, 
              totalOrders, 
              totalSpent: typeof totalSpent === "number" && !isNaN(totalSpent) ? totalSpent : 0,
              avatar: customer.avatar ? customer.avatar : defaultAvatar
            };
          })
        );
        setCustomers(customersWithStats);
      } catch (e) {
        setCustomers([]);
      }
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && customer.status === 1) ||
      (statusFilter === "inactive" && customer.status === 0);

    // Đảm bảo totalSpent là số
    const spent = typeof customer.totalSpent === "number" && !isNaN(customer.totalSpent) ? customer.totalSpent : 0;
    const matchesSpending =
      spendingFilter === "all" ||
      (spendingFilter === "under1m" && spent < 1000000) ||
      (spendingFilter === "1mto5m" && spent >= 1000000 && spent <= 5000000) ||
      (spendingFilter === "over5m" && spent > 5000000);

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

  const handleEditCustomer = (customer: Account) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleSaveCustomer = async (customer: Account) => {
    // Chỉ cho phép cập nhật, không cho phép tạo mới
    setCustomers(customers.map(c => (c.id === customer.id ? customer : c)));
    await AccountService.update(customer.id, 
      {
        fullName: customer.fullName,
        password: customer.password, 
        username: customer.username,
        email: customer.email,
        phone: customer.phone,
        roleId: customer.roleId,
        status: customer.status,
      }
    );
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
                      alt={customer.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-black whitespace-nowrap">
                  <div className="font-semibold">{customer.fullName}</div>
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
                    {formatDate(customer.createDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${
                    customer.status === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {customer.status === 1 ? "Đang hoạt động" : "Không hoạt động"}
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
                Chỉnh sửa khách hàng
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
                    value={selectedCustomer.fullName}
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-black">Email</Label>
                  <Input
                    type="email"
                    value={selectedCustomer.email}
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black">Số điện thoại</Label>
                  <Input
                    value={selectedCustomer.phone}
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-black">Trạng thái</Label>
                  <select
                    className="w-full p-2 border border-pink-100 rounded-md bg-white text-black"
                    value={selectedCustomer.status}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        status: Number(e.target.value) as 0 | 1,
                      })
                    }
                  >
                    <option value={1}>Đang hoạt động</option>
                    <option value={0}>Không hoạt động</option>
                  </select>
                </div>
              </div>
              {/* Đã xóa trường địa chỉ */}
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