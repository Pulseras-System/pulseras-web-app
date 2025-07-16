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
  Search, 
  Filter, 
  User, 
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AccountService, { Account } from "@/services/AccountService";

// Define unique roles from the account data
interface Role {
  id: string;
  name: string;
}

const itemsPerPage = 5;

const UserManagementPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debounced search to improve performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      if (event.key === 'Escape') {
        setSearchTerm("");
        setCurrentPage(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get unique roles from accounts data and sort them
  const getUniqueRoles = (accounts: Account[]): Role[] => {
    const roleMap = new Map<string, Role>();
    accounts.forEach(account => {
      if (account.roleId && account.roleName) {
        roleMap.set(account.roleId, {
          id: account.roleId,
          name: account.roleName
        });
      }
    });
    const roles = Array.from(roleMap.values());
    
    // Sort roles with Admin and Staff first
    return roles.sort((a, b) => {
      const order = { "Admin": 1, "Staff": 2, "Customer": 3 };
      const aOrder = order[a.name as keyof typeof order] || 999;
      const bOrder = order[b.name as keyof typeof order] || 999;
      return aOrder - bOrder;
    });
  };

  // Fetch accounts on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accountsData = await AccountService.get();
        setAccounts(accountsData);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
        alert("Không thể tải dữ liệu tài khoản. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const uniqueRoles = getUniqueRoles(accounts);

  const filteredAccounts = accounts.filter(account => {
    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    
    // Simple search by name only
    const matchesSearch = searchLower === '' || 
      account.fullName.toLowerCase().includes(searchLower);
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && account.status === 1) ||
      (statusFilter === "inactive" && account.status === 0);
    
    const matchesRole =
      roleFilter === "all" ||
      uniqueRoles.some(role => role.id === roleFilter && account.roleId === role.id);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Sort filtered accounts with Admin and Staff first
  const sortedAccounts = filteredAccounts.sort((a, b) => {
    const roleOrder = { "Admin": 1, "Staff": 2, "Customer": 3 };
    const aOrder = roleOrder[a.roleName as keyof typeof roleOrder] || 999;
    const bOrder = roleOrder[b.roleName as keyof typeof roleOrder] || 999;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // If same role, sort by name
    return a.fullName.localeCompare(b.fullName);
  });

  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccounts = sortedAccounts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN').format(date);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setModalOpen(true);
  };

  const handleSaveAccount = async (account: Account) => {
    try {
      if (!account.id) {
        // New account - create
        const newAccount = await AccountService.create({
          fullName: account.fullName,
          username: account.username,
          email: account.email,
          phone: account.phone,
          roleId: account.roleId,
          status: account.status
        });
        // Add roleName to the new account
        const newAccountWithRole = {
          ...newAccount,
          roleName: account.roleName
        };
        setAccounts([...accounts, newAccountWithRole]);
        console.log("Tạo người dùng mới thành công");
        alert("Tạo người dùng mới thành công!");
      } else {
        // Update existing account
        const updatedAccount = await AccountService.update(account.id, {
          fullName: account.fullName,
          username: account.username,
          email: account.email,
          phone: account.phone,
          roleId: account.roleId,
          status: account.status
        });
        // Add roleName to the updated account
        const updatedAccountWithRole = {
          ...updatedAccount,
          roleName: account.roleName
        };
        setAccounts(accounts.map(a => (a.id === account.id ? updatedAccountWithRole : a)));
        console.log("Cập nhật người dùng thành công");
        alert("Cập nhật người dùng thành công!");
      }
      setModalOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error("Failed to save account:", error);
      alert("Có lỗi xảy ra khi lưu thông tin tài khoản. Vui lòng thử lại.");
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getRoleName = (account: Account) => {
    const roleTranslations: { [key: string]: string } = {
      "Admin": "Quản trị viên",
      "Staff": "Nhân viên",
      "Customer": "Khách hàng"
    };
    return roleTranslations[account.roleName || ""] || account.roleName || "Không xác định";
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) {
      try {
        await AccountService.delete(accountId);
        setAccounts(accounts.filter(account => account.id !== accountId));
        console.log("Xóa tài khoản thành công");
      } catch (error) {
        console.error("Failed to delete account:", error);
        alert("Không thể xóa tài khoản. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Quản lý Người dùng</h2>
          <p className="text-sm text-black">Danh sách người dùng của hệ thống</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/1 h-4 w-4 text-blue-800" />
            <Input
              placeholder="Tìm kiếm theo tên người dùng... (Ctrl+K)"
              className="pl-9 pr-8 w-full sm:w-80 bg-pink-100 border-pink-100 focus-visible:ring-pink-100 text-black placeholder-black"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-pink-200"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                ×
              </Button>
            )}
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
              <label className="block text-sm font-medium text-black mb-1">Lọc theo vai trò</label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả vai trò</option>
                {uniqueRoles.map(role => {
                  const roleTranslations: { [key: string]: string } = {
                    "Admin": "Quản trị viên",
                    "Staff": "Nhân viên", 
                    "Customer": "Khách hàng"
                  };
                  const displayName = roleTranslations[role.name] || role.name;
                  return (
                    <option key={role.id} value={role.id}>
                      {displayName}
                    </option>
                  );
                })}
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
              <TableHead className="text-black">Thông tin người dùng</TableHead>
              <TableHead className="text-black">Liên hệ</TableHead>
              <TableHead className="text-black">Vai trò</TableHead>
              <TableHead className="text-black">Ngày tham gia</TableHead>
              <TableHead className="text-black">Trạng thái</TableHead>
              <TableHead className="text-black text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-100 mb-2"></div>
                    <p className="text-black">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentAccounts.map((account) => (
              <TableRow key={account.id} className="hover:bg-pink-100 border-pink-100">
                <TableCell>
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-pink-100 bg-blue-100 flex items-center justify-center text-white font-semibold">
                    {getInitials(account.fullName)}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-black whitespace-nowrap">
                  <div className="font-semibold">
                    {account.fullName}
                  </div>
                  <div className="text-xs text-black">
                    @{account.username}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm mb-1">
                    <Mail className="h-3 w-3 mr-1 text-blue-100" />
                    {account.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-3 w-3 mr-1 text-blue-100" />
                    {account.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${
                    account.roleName === "Admin" 
                      ? "bg-purple-100 text-purple-800" 
                      : account.roleName === "Staff"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {getRoleName(account)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-blue-100" />
                    {formatDate(account.createDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${
                    account.status === 1 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    <UserCheck className="h-3 w-3 mr-1" />
                    {account.status === 1 ? "Đang hoạt động" : "Không hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-black border-pink-100 hover:bg-pink-100 hover:text-black"
                      onClick={() => handleEditAccount(account)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteAccount(account.id)}
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

      {!isLoading && sortedAccounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-pink-100 rounded-lg bg-pink-100">
          <User className="h-12 w-12 text-blue-100 mb-4" />
          <h3 className="text-lg font-medium text-black">Không tìm thấy người dùng</h3>
          <p className="text-sm text-black mt-1">
            Không có người dùng nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {sortedAccounts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-black">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, sortedAccounts.length)} của {sortedAccounts.length} người dùng
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {modalOpen && selectedAccount && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white text-black rounded-2xl shadow-xl border border-pink-100">
            <DialogHeader>
              <DialogTitle className="text-black">
                {!selectedAccount.id ? "Thêm người dùng" : "Chỉnh sửa người dùng"}
              </DialogTitle>
            </DialogHeader>
            <form
              className="grid gap-4 py-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAccount(selectedAccount);
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black">Họ tên đầy đủ</Label>
                  <Input
                    value={selectedAccount.fullName}
                    onChange={(e) => setSelectedAccount({ ...selectedAccount, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-black">Tên đăng nhập</Label>
                  <Input
                    value={selectedAccount.username}
                    onChange={(e) => setSelectedAccount({ ...selectedAccount, username: e.target.value })}
                    required
                    disabled={!!selectedAccount.id} // Disable username editing for existing accounts
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black">Email</Label>
                  <Input
                    type="email"
                    value={selectedAccount.email}
                    onChange={(e) => setSelectedAccount({ ...selectedAccount, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-black">Số điện thoại</Label>
                  <Input
                    value={selectedAccount.phone}
                    onChange={(e) => setSelectedAccount({ ...selectedAccount, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black">Vai trò</Label>
                  <select
                    className="w-full p-2 border border-pink-100 rounded-md bg-white text-black"
                    value={selectedAccount.roleId}
                    onChange={(e) => {
                      const selectedRoleId = e.target.value;
                      const selectedRole = uniqueRoles.find(r => r.id === selectedRoleId);
                      setSelectedAccount({ 
                        ...selectedAccount, 
                        roleId: selectedRoleId,
                        roleName: selectedRole?.name || "Customer"
                      });
                    }}
                  >
                    {uniqueRoles.map(role => {
                      const roleTranslations: { [key: string]: string } = {
                        "Admin": "Quản trị viên",
                        "Staff": "Nhân viên",
                        "Customer": "Khách hàng"
                      };
                      const displayName = roleTranslations[role.name] || role.name;
                      return (
                        <option key={role.id} value={role.id}>
                          {displayName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <Label className="text-black">Trạng thái</Label>
                  <select
                    className="w-full p-2 border border-pink-100 rounded-md bg-white text-black"
                    value={selectedAccount.status}
                    onChange={(e) => setSelectedAccount({ ...selectedAccount, status: parseInt(e.target.value) })}
                  >
                    <option value={1}>Đang hoạt động</option>
                    <option value={0}>Không hoạt động</option>
                  </select>
                </div>
              </div>
              {!selectedAccount.id && (
                <div className="bg-yellow-100 p-3 rounded-md text-sm">
                  <p className="font-medium">Lưu ý:</p>
                  <p>Người dùng mới sẽ được tạo với mật khẩu mặc định. Họ cần đổi mật khẩu khi đăng nhập lần đầu.</p>
                </div>
              )}
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

export default UserManagementPage;