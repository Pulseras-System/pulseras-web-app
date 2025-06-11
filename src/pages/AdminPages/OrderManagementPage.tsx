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
import { Pen, Trash2, Plus, Search, Filter, Package, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/pagination";
import OrderService, { Order as ApiOrder } from "../../services/OrderService";

// Updated Order interface to match our UI needs
interface Order {
  id: number;
  customerName: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  accountId: number;
  voucherId: number | null;
  orderInfo: string;
}

// Status mapping
const statusMapping: Record<number, string> = {
  0: "Đang xử lý",
  1: "Đã xác nhận",
  2: "Đang giao",
  3: "Đã giao",
  4: "Hủy"
};

const itemsPerPage = 5;

const OrderManagement = () => {
  // API related states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<Order>({
    id: 0,
    customerName: "",
    orderDate: new Date().toISOString().split('T')[0],
    status: "Đang xử lý",
    totalAmount: 0,
    accountId: 0,
    voucherId: null,
    orderInfo: ""
  });
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Fetch orders from API
  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        const apiOrders = await OrderService.get();
        
        // Map API data to our UI format
        const mappedOrders: Order[] = apiOrders.map(apiOrder => ({
          id: apiOrder.order_id,
          customerName: `Khách hàng #${apiOrder.account_id}`,  // In a real app, you'd fetch customer names
          orderDate: apiOrder.createDate,
          status: statusMapping[apiOrder.status] || "Không xác định",
          totalAmount: apiOrder.totalPrice,
          accountId: apiOrder.account_id,
          voucherId: apiOrder.voucher_id || null,
          orderInfo: apiOrder.orderInfor
        }));
        
        setOrders(mappedOrders);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Không thể tải dữ liệu đơn hàng, vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderInfo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "under300" && order.totalAmount < 300000) ||
      (priceFilter === "300to400" &&
        order.totalAmount >= 300000 && order.totalAmount <= 400000) ||
      (priceFilter === "over400" && order.totalAmount > 400000);

    return matchesSearch && matchesStatus && matchesPrice;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get unique statuses
  const uniqueStatuses = Array.from(new Set(orders.map(order => order.status)));

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (editingOrder) {
      setIsLoading(true);
      try {
        // Get the numeric status from our mapping
        const numericStatus = Object.entries(statusMapping)
          .find(([_, value]) => value === editingOrder.status)?.[0];
          
        if (!numericStatus) throw new Error("Invalid status");
        
        // Call API to update the order
        await OrderService.update(editingOrder.id, {
          status: parseInt(numericStatus),
          totalPrice: editingOrder.totalAmount,
          // Add other fields as needed
        });
        
        // Update local state
        setOrders(prev =>
          prev.map(o => (o.id === editingOrder.id ? editingOrder : o))
        );
        
        setIsEditOpen(false);
      } catch (err) {
        console.error("Failed to update order:", err);
        setError("Không thể cập nhật đơn hàng, vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddOrder = async () => {
    if (newOrder.customerName.trim()) {
      setIsLoading(true);
      try {
        // Get the numeric status from our mapping
        const numericStatus = Object.entries(statusMapping)
          .find(([_, value]) => value === newOrder.status)?.[0];
          
        if (!numericStatus) throw new Error("Invalid status");
        
        // Call API to create the order
        const response = await OrderService.create({
          account_id: newOrder.accountId,
          orderInfor: newOrder.orderInfo,
          status: parseInt(numericStatus),
          totalPrice: newOrder.totalAmount,
          amount: 1, // Default amount
          // Add other required fields
        });
        
        // Map the API response to our UI format
        const createdOrder: Order = {
          id: response.order_id,
          customerName: newOrder.customerName,
          orderDate: response.createDate,
          status: statusMapping[response.status] || "Không xác định",
          totalAmount: response.totalPrice,
          accountId: response.account_id,
          voucherId: response.voucher_id || null,
          orderInfo: response.orderInfor
        };
        
        setOrders(prev => [...prev, createdOrder]);
        setNewOrder({
          id: 0,
          customerName: "",
          orderDate: new Date().toISOString().split('T')[0],
          status: "Đang xử lý",
          totalAmount: 0,
          accountId: 0,
          voucherId: null,
          orderInfo: ""
        });
        setIsAddOpen(false);
      } catch (err) {
        console.error("Failed to add order:", err);
        setError("Không thể thêm đơn hàng mới, vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Quản lý Đơn hàng</h2>
          <p className="text-sm text-black">Danh sách đơn hàng trong hệ thống</p>
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
            Thêm đơn hàng
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-pink-100 p-4 rounded-lg border border-pink-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-black mb-1">Lọc theo trạng thái</Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-black mb-1">Lọc theo giá trị</Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
                value={priceFilter}
                onChange={(e) => {
                  setPriceFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả giá trị</option>
                <option value="under300">Dưới 300.000₫</option>
                <option value="300to400">300.000₫ - 400.000₫</option>
                <option value="over400">Trên 400.000₫</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
          <span className="ml-2 text-lg text-blue-800">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-lg border border-pink-100 bg-white shadow-sm overflow-hidden">
            <Table className="min-w-[700px]">
              <TableHeader className="bg-pink-100">
                <TableRow>
                  <TableHead className="text-black">ID</TableHead>
                  <TableHead className="text-black">Tên khách hàng</TableHead>
                  <TableHead className="text-black">Ngày đặt hàng</TableHead>
                  <TableHead className="text-black">Trạng thái</TableHead>
                  <TableHead className="text-black">Tổng tiền (VND)</TableHead>
                  <TableHead className="text-black text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-pink-100 border-pink-100">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell className="font-medium text-black">
                      <div className="font-semibold">{order.customerName}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{order.orderInfo}</div>
                    </TableCell>
                    <TableCell className="text-black">{formatDate(order.orderDate)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "Đang xử lý" || order.status === "Đã xác nhận" || order.status === "Đang giao"
                          ? "bg-yellow-100 text-yellow-800" 
                          : order.status === "Đã giao"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-black">
                      {order.totalAmount.toLocaleString()}₫
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-black border-pink-100 hover:bg-pink-100 hover:text-black"
                        onClick={() => handleEditClick(order)}
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

          {/* No results */}
          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-pink-100 rounded-lg bg-pink-100">
              <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <Package className="h-12 w-12 text-blue-100" />
              </div>
              <h3 className="text-xl font-medium text-black mb-2">
                Không tìm thấy đơn hàng
              </h3>
              <p className="text-sm text-black mt-1">
                Không có đơn hàng nào phù hợp với tiêu chí tìm kiếm
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="text-sm text-black">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} của {filteredOrders.length} đơn hàng
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">Chỉnh sửa đơn hàng</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div>
                <Label className="text-black">Tên khách hàng</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingOrder.customerName}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, customerName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Thông tin đơn hàng</Label>
                <Input
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingOrder.orderInfo}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, orderInfo: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black">Trạng thái</Label>
                <select
                  className="w-full p-2 border border-pink-100 rounded-md focus:ring-pink-100"
                  value={editingOrder.status}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, status: e.target.value })
                  }
                >
                  {Object.values(statusMapping).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-black">Tổng tiền</Label>
                <Input
                  type="number"
                  className="border-pink-100 focus:ring-pink-100"
                  value={editingOrder.totalAmount}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, totalAmount: +e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  className="text-black border-pink-100 hover:bg-pink-100"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button 
                  className="bg-blue-100 hover:bg-blue-100 text-black"
                  onClick={handleEditSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu
                    </>
                  ) : (
                    "Lưu"
                  )}
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
            <DialogTitle className="text-black">Thêm đơn hàng mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Tên khách hàng</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newOrder.customerName}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, customerName: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Thông tin đơn hàng</Label>
              <Input
                className="border-pink-100 focus:ring-pink-100"
                value={newOrder.orderInfo}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, orderInfo: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">ID Tài khoản</Label>
              <Input
                type="number"
                className="border-pink-100 focus:ring-pink-100"
                value={newOrder.accountId || ''}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, accountId: +e.target.value })
                }
              />
            </div>
            <div>
              <Label className="text-black">Trạng thái</Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md focus:ring-pink-100"
                value={newOrder.status}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, status: e.target.value })
                }
              >
                {Object.values(statusMapping).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-black">Tổng tiền</Label>
              <Input
                type="number"
                className="border-pink-100 focus:ring-pink-100"
                value={newOrder.totalAmount}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, totalAmount: +e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                className="text-black border-pink-100 hover:bg-pink-100"
                onClick={() => setIsAddOpen(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button 
                className="bg-blue-100 hover:bg-blue-100 text-black"
                onClick={handleAddOrder}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang thêm
                  </>
                ) : (
                  "Thêm"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;