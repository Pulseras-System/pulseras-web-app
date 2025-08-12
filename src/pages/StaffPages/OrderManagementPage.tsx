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
import { Pen, Plus, Search, Filter, Package, Eye, ShoppingBag, User, CreditCard, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/pagination";
import OrderService, { Order as ApiOrder } from "@/services/OrderService";
import OrderDetailService, { OrderDetail } from "@/services/OrderDetailService";
import ProductService, { Product } from "@/services/ProductService";


const itemsPerPage = 10;

interface OrderRow {
  id: string | number;
  customerName: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  orderInfor: string;
  amount: number;
  paymentMethod?: string; // Thêm trường paymentMethod nếu cần
  raw: ApiOrder;
}

const statusMap: Record<number, string> = {
  0: "Đã hủy",
  1: "Trong giỏ hàng",
  2: "Đã đặt hàng",
  3: "Đã thanh toán",
  4: "Đã hoàn thành",
};

// Danh sách trạng thái chuyển tiếp
const statusTransitions: Record<string, string[]> = {
  "Trong giỏ hàng": ["Đã đặt hàng", "Đã hủy"],
  "Đã đặt hàng": ["Đã thanh toán", "Đã hoàn thành", "Đã hủy"],
  "Đã thanh toán": ["Đã hoàn thành", "Đã hủy"],
  "Đã hoàn thành": [],
  "Đã hủy": [],
};

// Thứ tự ưu tiên trạng thái
const statusPriority: Record<string, number> = {
  "Đã đặt hàng": 1,
  "Đã thanh toán": 2,
  "Đã hoàn thành": 3,
  "Đã hủy": 4,
  "Trong giỏ hàng": 5,
};

const getStatusPriority = (status: string) => statusPriority[status] ?? 99;

const OrderManagement = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRow | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<OrderRow>>({
    customerName: "",
    orderDate: new Date().toISOString().split('T')[0],
    status: "Đang xử lý",
    totalAmount: 0,
    orderInfor: "",
    amount: 1,
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<OrderRow | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | { type: "cancel" | "delete", order: OrderRow }>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Fetch orders and customer names
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const orderList = await OrderService.get();
        // Sử dụng fullName trực tiếp từ API trả về
        const ordersWithCustomer = orderList.map((order) => ({
          id: order.id,
          customerName: order.fullName || "Unknown",
          orderDate: order.createDate,
          status: statusMap[order.status] || "Đang xử lý",
          totalAmount: order.totalPrice,
          orderInfor: order.orderInfor,
          amount: order.amount,
          paymentMethod: order.paymentMethod,
          raw: order,
        }) as OrderRow);
        setOrders(ordersWithCustomer);
      } catch (e) {
        setOrders([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Lấy danh sách trạng thái độc nhất
  const uniqueStatuses = Array.from(new Set(Object.values(statusMap)));

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderInfor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "under300" && order.totalAmount < 300000) ||
      (priceFilter === "300to400" &&
        order.totalAmount >= 300000 && order.totalAmount <= 400000) ||
      (priceFilter === "over400" && order.totalAmount > 400000);

    return matchesSearch && matchesStatus && matchesPrice;
  })
  // Sắp xếp theo trạng thái ưu tiên
  .sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status));

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // CRUD handlers (bạn có thể thay thế bằng API nếu muốn)
  const handleEditClick = (order: OrderRow) => {
    setEditingOrder(order);
    setIsEditOpen(true);
  };

  const statusTextToNumber = (status: string) => {
    switch (status) {
      case "Đã hủy": return 0;
      case "Trong giỏ hàng": return 1;
      case "Đã đặt hàng": return 2;
      case "Đã thanh toán": return 3;
      case "Đã hoàn thành": return 4;
      default: return 1;
    }
  };

  const handleEditSave = async () => {
    if (editingOrder) {
      // Nếu chuyển sang "Đã hủy" và chưa nhập lý do thì mở modal nhập lý do
      if (
        editingOrder.status === "Đã hủy" &&
        !showCancelModal &&
        (!editingOrder.orderInfor || !editingOrder.orderInfor.includes("Lý do hủy"))
      ) {
        setPendingAction({ type: "cancel", order: editingOrder });
        setShowCancelModal(true);
        return;
      }
      try {
        // Nếu trạng thái là "Đã hủy" và có lý do hủy, chỉ lưu lý do hủy, xóa toàn bộ orderInfor trước đó
        let newOrderInfor = editingOrder.orderInfor || "";
        if (
          editingOrder.status === "Đã hủy" &&
          cancelReason.trim()
        ) {
          newOrderInfor = `Lý do hủy: ${cancelReason.trim()}`;
        }
        await OrderService.update(editingOrder.id, {
          orderInfor: newOrderInfor,
          amount: editingOrder.amount || 1,
          // accountId: editingOrder.raw.accountId,
          voucherId: editingOrder.raw.voucherId || "0",
          totalPrice: editingOrder.totalAmount || 0,
          paymentMethod: editingOrder.paymentMethod || "COD",
          status: statusTextToNumber(editingOrder.status),
          lastEdited: new Date().toISOString(),
        });
        setOrders((prev) =>
          prev.map((o) =>
            o.id === editingOrder.id
              ? {
                ...editingOrder,
                orderInfor: newOrderInfor,
                raw: {
                  ...editingOrder.raw,
                  status: statusTextToNumber(editingOrder.status),
                  orderInfor: newOrderInfor,
                },
              }
              : o
          )
        );
      } catch (e) {
        alert("Có lỗi khi cập nhật trạng thái đơn hàng!");
      }
      setIsEditOpen(false);
      setCancelReason("");
    }
  };

  const handleAddOrder = async () => {
    if (newOrder.customerName?.trim()) {
      setOrders((prev) => [
        ...prev,
        {
          ...newOrder,
          id: Date.now(),
          status: newOrder.status || "Đang xử lý",
          totalAmount: newOrder.totalAmount || 0,
          orderInfor: newOrder.orderInfor || "",
          amount: newOrder.amount || 1,
        } as OrderRow,
      ]);
      setNewOrder({
        customerName: "",
        orderDate: new Date().toISOString().split('T')[0],
        status: "Đang xử lý",
        totalAmount: 0,
        orderInfor: "",
        amount: 1,
      });
      setIsAddOpen(false);
    }
  };



  // Khi bấm nút Xóa
  const handleDeleteClick = (order: OrderRow) => {
    setPendingAction({ type: "delete", order });
    setShowCancelModal(true);
  };

  // Xác nhận lý do hủy/xóa
  const handleConfirmCancel = async () => {
    if (pendingAction && (pendingAction.type === "cancel" || pendingAction.type === "delete")) {
      const order = pendingAction.order;
      // Khi hủy hoặc xóa, chỉ lưu lý do hủy, xóa toàn bộ orderInfor trước đó
      const newOrderInfor = `Lý do hủy: ${cancelReason.trim()}`;
      try {
        await OrderService.update(order.id, {
          orderInfor: newOrderInfor,
          amount: order.amount || 1,
          accountId: order.raw.accountId,
          voucherId: order.raw.voucherId || "0",
          totalPrice: order.totalAmount || 0,
          status: 0, // Đã hủy
          lastEdited: new Date().toISOString(),
        });
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                ...o,
                status: "Đã hủy",
                orderInfor: newOrderInfor,
                raw: {
                  ...o.raw,
                  status: 0,
                  orderInfor: newOrderInfor,
                },
              }
              : o
          )
        );
      } catch (e) {
        alert("Có lỗi khi cập nhật trạng thái đơn hàng!");
      }
      setIsEditOpen(false);
    }
    setShowCancelModal(false);
    setCancelReason("");
    setPendingAction(null);
  };

  // Lấy danh sách trạng thái tiếp theo cho Edit
  const getNextStatuses = (current: string) => {
    return [current, ...(statusTransitions[current] || [])];
  };

  // Khi mở modal xem chi tiết đơn hàng
  const handleViewOrder = async (order: OrderRow) => {
    setViewOrder(order);
    setLoadingOrderDetails(true);
    setOrderDetails([]);
    setProducts([]);
    
    try {
      // Lấy chi tiết đơn hàng
      const details = await OrderDetailService.getByOrderId(String(order.id));
      const activeDetails = details.filter(d => d.status !== 0); // Chỉ lấy các item đang active
      setOrderDetails(activeDetails);

      // Lấy thông tin sản phẩm cho từng item
      if (activeDetails.length > 0) {
        try {
          const productPromises = activeDetails.map(detail => 
            ProductService.getById(detail.productId)
          );
          
          const fetchedProducts = await Promise.all(productPromises);
          setProducts(fetchedProducts.filter(p => p)); // Filter out any null results
        } catch (productError) {
          console.error("Error fetching products:", productError);
        }
      }
    } catch (e) {
      console.error("Error fetching order details:", e);
    } finally {
      setLoadingOrderDetails(false);
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

      {/* Filters */}
      {showFilters && (
        <div className="bg-pink-100 p-4 rounded-lg border border-pink-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <Label className="block text-sm font-medium text-black mb-1">Lọc theo thời gian</Label>
              <select
                className="w-full p-2 border border-pink-100 rounded-md bg-white text-black focus:ring-pink-100 focus:border-pink-100"
                defaultValue="all"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-pink-100 bg-white shadow-sm overflow-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-pink-100">
            <TableRow>
              <TableHead className="text-black">Thứ tự</TableHead>
              <TableHead className="text-black">Khách hàng</TableHead>
              <TableHead className="text-black">Ngày đặt</TableHead>
              <TableHead className="text-black">Trạng thái</TableHead>
              <TableHead className="text-black">Tổng tiền</TableHead>
              <TableHead className="text-black text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex items-center justify-center py-8 px-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-300 mr-3"></div>
                    <span className="text-black font-medium">Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentOrders.map((order, index) => {
              const isDisabled =
                order.status === "Đã hủy" ||
                order.status === "Đã hoàn thành" ||
                order.status === "Trong giỏ hàng";
              
              return (
                <TableRow key={order.id} className="hover:bg-pink-100 border-pink-100">
                  <TableCell className="font-medium text-black whitespace-nowrap">
                    <div className="font-semibold">{startIndex + index + 1}</div>
                    {/* <div className="font-semibold">#{order.id}</div>
                    <div className="text-xs text-black mt-0.5">ID: {order.id}</div> */}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-black">{order.customerName}</div>
                    {/* <div className="text-xs text-black mt-0.5 line-clamp-1">
                      {order.orderInfor || "Không có ghi chú"}
                    </div> */}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-black">{formatDate(order.orderDate)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === "Đã hoàn thành" 
                        ? "bg-green-100 text-green-800" 
                        : order.status === "Đã hủy" 
                          ? "bg-red-100 text-red-800" 
                          : order.status === "Đã thanh toán"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                    }`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap text-black">
                    <div>{order.totalAmount.toLocaleString()}₫</div>
                    <div className="text-xs text-black mt-0.5">{order.amount} sản phẩm</div>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-black border-pink-100 hover:bg-pink-100 hover:text-black"
                      onClick={() => handleViewOrder(order)}
                      title="Xem chi tiết đơn hàng"
                      disabled={order.status === "Trong giỏ hàng"}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-black border-pink-100 hover:bg-pink-100 hover:text-black"
                      onClick={() => handleEditClick(order)}
                      title="Cập nhật trạng thái"
                      disabled={isDisabled}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 border-pink-100 hover:bg-pink-100 hover:text-red-600"
                      onClick={() => handleDeleteClick(order)}
                      title="Xóa đơn hàng"
                      disabled={order.status === "Trong giỏ hàng"}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredOrders.length === 0 && !loading && (
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
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriceFilter("all");
              setCurrentPage(1);
            }}
            className="mt-4 text-black border-pink-100 hover:bg-pink-100"
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}

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

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">Chỉnh sửa trạng thái đơn hàng</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div>
                <Label className="text-black">Trạng thái</Label>
                <select
                  className="w-full p-2 border border-pink-100 rounded-md focus:ring-pink-100"
                  value={editingOrder.status}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, status: e.target.value })
                  }
                >
                  {getNextStatuses(editingOrder.status).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
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

      {/* CANCEL/DELETE REASON MODAL */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md bg-white text-black rounded-2xl shadow-xl border border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-black">
              {pendingAction?.type === "delete" ? "Lý do xóa đơn hàng" : "Lý do hủy đơn hàng"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              className="border-pink-100 focus:ring-pink-100"
              placeholder="Nhập lý do..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            />
            <DialogFooter>
              <Button
                variant="outline"
                className="text-black border-pink-100 hover:bg-pink-100"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setPendingAction(null);
                }}
              >
                Hủy
              </Button>
              <Button
                className="bg-blue-100 hover:bg-blue-100 text-black"
                onClick={handleConfirmCancel}
                disabled={!cancelReason.trim()}
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </div>
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
              <Label className="text-black">Ngày đặt hàng</Label>
              <Input
                type="date"
                className="border-pink-100 focus:ring-pink-100"
                value={newOrder.orderDate}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, orderDate: e.target.value })
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
                {uniqueStatuses.map(status => (
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
              >
                Hủy
              </Button>
              <Button
                className="bg-blue-100 hover:bg-blue-100 text-black"
                onClick={handleAddOrder}
              >
                Thêm
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW MODAL */}
      <Dialog open={!!viewOrder} onOpenChange={() => {
        setViewOrder(null);
        setOrderDetails([]);
        setProducts([]);
      }}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] bg-white text-black rounded-2xl shadow-xl border border-pink-100 p-0 overflow-hidden">
          <DialogHeader className="bg-pink-100 px-4 py-3">
            <DialogTitle className="text-black text-lg">Chi tiết đơn hàng #{viewOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {viewOrder && (
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Layout 2x2 cho thông tin đơn hàng - Compact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {/* Hàng 1 */}
                <div className="bg-gradient-to-br from-pink-50 to-white rounded-lg border border-pink-100 p-3 shadow-sm">
                  <h3 className="text-xs font-semibold text-black mb-2 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Thông tin đơn hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className="text-black">Số đơn:</span>
                    <span className="font-medium text-black truncate" title={`#${viewOrder.id}`}>#{String(viewOrder.id).length > 8 ? String(viewOrder.id).substring(0, 8) + '...' : viewOrder.id}</span>
                    
                    <span className="text-black">Ngày đặt:</span>
                    <span className="font-medium text-black">{formatDate(viewOrder.orderDate)}</span>
                    
                    <span className="text-black">Trạng thái:</span>
                    <span 
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        viewOrder.status === "Đã hủy" 
                          ? "bg-red-100 text-red-800 border border-red-200" 
                          : viewOrder.status === "Đã hoàn thành" 
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : viewOrder.status === "Đã thanh toán"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-pink-100 text-pink-800 border border-pink-200"
                      }`}
                    >
                      {viewOrder.status}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-pink-50 to-white rounded-lg border border-pink-100 p-3 shadow-sm">
                  <h3 className="text-xs font-semibold text-black mb-2 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className="text-black">Tên khách hàng:</span>
                    <span className="font-medium text-black">{viewOrder.customerName}</span>
                    
                    <span className="text-black">Mã khách hàng:</span>
                    <span className="font-medium text-black">KH-{viewOrder.raw?.accountId || "---"}</span>
                  </div>
                </div>
                
                {/* Hàng 2 */}
                <div className="bg-gradient-to-br from-pink-50 to-white rounded-lg border border-pink-100 p-3 shadow-sm">
                  <h3 className="text-xs font-semibold text-black mb-2 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Ghi chú đơn hàng
                  </h3>
                  <div className="text-xs">
                    <div className="bg-white rounded-md border border-pink-100 p-2 min-h-[60px]">
                      <span className="text-black">
                        {viewOrder.orderInfor || "Không có ghi chú"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-pink-50 to-white rounded-lg border border-pink-100 p-3 shadow-sm">
                  <h3 className="text-xs font-semibold text-black mb-2 flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Thông tin thanh toán
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className="text-black">Tổng sản phẩm:</span>
                    <span className="font-medium text-black">{viewOrder.amount} sản phẩm</span>
                    
                    <span className="text-black">Phí vận chuyển:</span>
                    <span className="font-medium text-black">30,000₫</span>
                    
                    <span className="text-black font-semibold">Tổng thanh toán:</span>
                    <span className="font-bold text-black">
                      {viewOrder.totalAmount.toLocaleString()}₫
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Sản phẩm đã mua */}
              <div className="mb-2 pb-2 border-b border-pink-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-black flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-black" />
                  Sản phẩm đã mua
                </h3>
                <span className="text-xs text-black font-medium">{orderDetails.length} sản phẩm</span>
              </div>
              
              {loadingOrderDetails ? (
                <div className="flex justify-center items-center py-4 bg-white rounded-lg border border-pink-100 shadow-sm">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-200 mr-2"></div>
                  <span className="text-black text-sm">Đang tải thông tin sản phẩm...</span>
                </div>
              ) : orderDetails.length === 0 ? (
                <div className="bg-white rounded-lg p-4 text-center border border-pink-100 shadow-sm">
                  <Package className="h-8 w-8 text-pink-300 mx-auto mb-2" />
                  <p className="text-black text-sm">Không có thông tin sản phẩm</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-pink-100 overflow-hidden shadow-sm">
                  <Table className="min-w-[600px]">
                    <TableHeader className="bg-pink-100">
                      <TableRow className="border-b border-pink-100">
                        <TableHead className="text-black font-medium py-2 text-xs">STT</TableHead>
                        <TableHead className="text-black font-medium text-xs">Sản phẩm</TableHead>
                        <TableHead className="text-black font-medium text-xs">Giá</TableHead>
                        <TableHead className="text-black font-medium text-xs">SL</TableHead>
                        <TableHead className="text-black font-medium text-xs text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.map((detail, idx) => {
                        const product = products.find(p => p.productId === detail.productId);
                        return (
                          <TableRow key={detail.id} className="hover:bg-pink-100 border-b border-pink-100 transition-colors">
                            <TableCell className="font-medium text-black text-xs py-2">{idx + 1}</TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                {product && product.productImage && (
                                  <img src={product.productImage} alt={product.productName} className="h-12 w-12 object-cover rounded-md border border-pink-100 shadow-sm" />
                                )}
                                <div>
                                  <div className="font-medium text-black text-xs">
                                    {product ? product.productName : "Sản phẩm không xác định"}
                                  </div>
                                  {product && (
                                    <div className="text-xs text-black mt-1 flex gap-1">
                                      <span className="px-1.5 py-0.5 bg-pink-50 rounded-full border border-pink-100 text-xs">{product.type}</span>
                                      <span className="px-1.5 py-0.5 bg-pink-50 rounded-full border border-pink-100 text-xs">{product.productMaterial || "-"}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-black text-xs">{detail.price.toLocaleString()}₫</TableCell>
                            <TableCell className="text-black text-xs">
                              <span className="px-1.5 py-0.5 bg-pink-50 rounded border border-pink-100 inline-block min-w-[25px] text-center">
                                {detail.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-black text-xs text-right">
                              {(detail.price * detail.quantity).toLocaleString()}₫
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;