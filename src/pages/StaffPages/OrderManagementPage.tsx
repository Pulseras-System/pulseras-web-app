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
import { Pen, Trash2, Plus, Search, Filter, Package } from "lucide-react";
import Pagination from "@/components/pagination";


interface Order {
  id: number;
  customerName: string;
  orderDate: string;
  status: string;
  totalAmount: number;
}

const mockOrders: Order[] = [
  { id: 1, customerName: "Nguyễn Văn A", orderDate: "2025-05-01", status: "Đang xử lý", totalAmount: 299000},
  { id: 2, customerName: "Trần Thị B", orderDate: "2025-05-02", status: "Đã giao", totalAmount: 399000},
  { id: 3, customerName: "Lê Văn C", orderDate: "2025-05-03", status: "Hủy", totalAmount: 499000},
  { id: 4, customerName: "Phạm Thị D", orderDate: "2025-05-04", status: "Đang xử lý", totalAmount: 349000},
  { id: 5, customerName: "Hoàng Minh E", orderDate: "2025-05-05", status: "Đã giao", totalAmount: 499000},
  { id: 6, customerName: "Nguyễn Thị F", orderDate: "2025-05-06", status: "Đang xử lý", totalAmount: 199000},
  { id: 7, customerName: "Trần Thanh G", orderDate: "2025-05-07", status: "Hủy", totalAmount: 249000},
  { id: 8, customerName: "Lê Minh H", orderDate: "2025-05-08", status: "Đang xử lý", totalAmount: 349000},
  { id: 9, customerName: "Võ Thị I", orderDate: "2025-05-09", status: "Đã giao", totalAmount: 459000},
  { id: 10, customerName: "Đặng Văn J", orderDate: "2025-05-10", status: "Đang xử lý", totalAmount: 279000},
  { id: 11, customerName: "Bùi Thị K", orderDate: "2025-05-11", status: "Đã giao", totalAmount: 389000},
  { id: 12, customerName: "Phan Văn L", orderDate: "2025-05-12", status: "Hủy", totalAmount: 199000},
];

const itemsPerPage = 5;

const OrderManagement = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      order.status === statusFilter;
    
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "under300" && order.totalAmount < 300000) ||
      (priceFilter === "300to400" && order.totalAmount >= 300000 && order.totalAmount <= 400000) ||
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


  // Lấy danh sách trạng thái độc nhất
  const uniqueStatuses = Array.from(new Set(mockOrders.map(order => order.status)));

  // Hàm định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-900">Quản lý Đơn hàng</h2>
          <p className="text-sm text-sky-700">Danh sách đơn hàng trong hệ thống</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9 w-full sm:w-64 bg-sky-50 border-sky-200 focus-visible:ring-sky-300"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button 
            variant="outline" 
            className="text-sky-700 border-sky-300 hover:bg-sky-100"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-700 text-sky-50">
            <Plus className="mr-2 h-4 w-4" />
            Thêm đơn hàng
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-sky-50 p-4 rounded-lg border border-sky-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sky-800 mb-1">Lọc theo trạng thái</label>
              <select
                className="w-full p-2 border border-sky-200 rounded-md bg-white text-sky-900 focus:ring-sky-300"
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
              <label className="block text-sm font-medium text-sky-800 mb-1">Lọc theo giá trị</label>
              <select
                className="w-full p-2 border border-sky-200 rounded-md bg-white text-sky-900 focus:ring-sky-300"
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

      <div className="rounded-lg border border-sky-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-sky-50">
            <TableRow>
              <TableHead className="text-sky-900">ID</TableHead>
              <TableHead className="text-sky-900">Tên khách hàng</TableHead>
              <TableHead className="text-sky-900">Ngày đặt hàng</TableHead>
              <TableHead className="text-sky-900">Trạng thái</TableHead>
              <TableHead className="text-sky-900">Tổng tiền (VND)</TableHead>
              <TableHead className="text-sky-900 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-sky-50/50">
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell className="font-medium text-sky-900">
                  <div className="font-semibold">{order.customerName}</div>
                </TableCell>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === "Đang xử lý" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : order.status === "Đã giao"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{order.totalAmount.toLocaleString()}₫</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="text-sky-700 border-sky-300 hover:bg-sky-100">
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

      {filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-sky-200 rounded-lg bg-sky-50">
          <Package className="h-12 w-12 text-sky-400 mb-4" />
          <h3 className="text-lg font-medium text-sky-900">Không tìm thấy đơn hàng</h3>
          <p className="text-sm text-sky-700 mt-1">
            Không có đơn hàng nào phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      )}

      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-sky-700">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} của {filteredOrders.length} đơn hàng
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

export default OrderManagement;