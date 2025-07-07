import { useState, useEffect } from 'react';
import OrderService, { Order } from '../../services/OrderService';
import OrderDetailService, { OrderDetail as OrderDetailType } from '../../services/OrderDetailService';
import ProductService from '../../services/ProductService';

// Mở rộng interface OrderDetail để bao gồm thông tin sản phẩm
interface OrderDetailWithProduct extends OrderDetailType {
  productName: string;
  productImage?: string;
}
import { Eye, Search, CalendarIcon, Package, RefreshCw, Loader2, ShoppingBag, CreditCard } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import Pagination from "../../components/pagination";

function MyOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetailWithProduct[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const accountStr = localStorage.getItem('account');
    if (accountStr) {
      try {
        const account = JSON.parse(accountStr);
        setAccountId(account.id || null);
      } catch {
        setAccountId(null);
      }
    } else {
      setAccountId(null);
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!accountId) {
        setOrders([]);
        setFilteredOrders([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const allOrders = (await OrderService.getByAccountId(accountId)).filter((order: Order) => order.status !== 1); 
        setOrders(allOrders);
        setFilteredOrders(allOrders);
      } catch (err) {
        setError('Không thể lấy danh sách đơn hàng');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [accountId]);
  
  // Xử lý lọc và tìm kiếm đơn hàng
  useEffect(() => {
    let result = [...orders];
    
    // Lọc theo tab đang chọn
    if (activeTab !== "all") {
      const statusMap: Record<string, number> = {
        "canceled": 0,
        "ordered": 2,
        "paid": 3,
        "completed": 4
      };
      
      result = result.filter((order) => order.status === statusMap[activeTab]);
    }
    
    // Tìm kiếm theo ID
    if (searchQuery.trim()) {
      result = result.filter((order) => 
        order.id.toString().includes(searchQuery.trim())
      );
    }
    
    setFilteredOrders(result);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi filter
  }, [orders, activeTab, searchQuery]);
  
  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Xử lý chuyển đổi tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Xử lý tìm kiếm
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Xử lý xem chi tiết đơn hàng
  const handleViewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    
    try {
      // Lấy chi tiết đơn hàng từ API
      const details = await OrderDetailService.getByOrderId(order.id);
      
      // Lấy thông tin sản phẩm cho từng chi tiết đơn hàng
      const detailsWithProducts = await Promise.all(
        details.map(async (detail) => {
          try {
            const product = await ProductService.getById(detail.productId);
            return {
              ...detail,
              productName: product.productName,
              productImage: product.productImage
            };
          } catch (error) {
            console.error(`Không thể lấy thông tin sản phẩm ID=${detail.productId}:`, error);
            return {
              ...detail,
              productName: "Sản phẩm không xác định",
              productImage: undefined
            };
          }
        })
      );
      
      setOrderDetails(detailsWithProducts);
    } catch (err) {
      console.error("Không thể lấy chi tiết đơn hàng:", err);
    } finally {
      setLoadingDetails(false);
      setShowOrderDetails(true);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="text-red-600">Đã xảy ra lỗi</CardTitle>
            <CardDescription>Không thể tải thông tin đơn hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-pink-800 mb-2">Đơn hàng của tôi</h1>
        <p className="text-pink-600">Xem lịch sử đơn hàng và theo dõi trạng thái đơn hàng</p>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng..."
                className="pl-9"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          <div className="flex gap-2 items-center overflow-x-auto pb-2 sm:pb-0">
            {/* Tabs để lọc theo trạng thái */}
            <div className="flex p-1 bg-pink-50 rounded-md">
              <Button
                variant={activeTab === 'all' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs whitespace-nowrap ${activeTab === 'all' ? 'bg-white shadow text-pink-600' : 'text-gray-600'} hover:text-pink-600`}
                onClick={() => handleTabChange('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={activeTab === 'ordered' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs whitespace-nowrap ${activeTab === 'ordered' ? 'bg-white shadow text-pink-600' : 'text-gray-600'} hover:text-pink-600`}
                onClick={() => handleTabChange('ordered')}
              >
                Đặt hàng
              </Button>
              <Button
                variant={activeTab === 'paid' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs whitespace-nowrap ${activeTab === 'paid' ? 'bg-white shadow text-pink-600' : 'text-gray-600'} hover:text-pink-600`}
                onClick={() => handleTabChange('paid')}
              >
                Thanh toán
              </Button>
              <Button
                variant={activeTab === 'completed' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs whitespace-nowrap ${activeTab === 'completed' ? 'bg-white shadow text-pink-600' : 'text-gray-600'} hover:text-pink-600`}
                onClick={() => handleTabChange('completed')}
              >
                Hoàn thành
              </Button>
              <Button
                variant={activeTab === 'canceled' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs whitespace-nowrap ${activeTab === 'canceled' ? 'bg-white shadow text-red-500' : 'text-gray-600'} hover:text-red-500`}
                onClick={() => handleTabChange('canceled')}
              >
                Hủy
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="text-pink-600 border-pink-200 hover:bg-pink-50"
              onClick={() => {
                setLoading(true);
                const accountStr = localStorage.getItem('account');
                if (accountStr) {
                  try {
                    const account = JSON.parse(accountStr);
                    OrderService.getByAccountId(account.id)
                      .then(orders => {
                        setOrders(orders.filter((order: Order) => order.status !== 1));
                        setLoading(false);
                      })
                      .catch(err => {
                        console.error(err);
                        setError('Không thể làm mới danh sách đơn hàng');
                        setLoading(false);
                      });
                  } catch {
                    setLoading(false);
                  }
                } else {
                  setLoading(false);
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-pink-600" />
          <span className="ml-3 text-lg font-medium text-gray-700">Đang tải...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="shadow-sm p-8 text-center">
          <CardContent className="pt-8">
            <Package className="h-16 w-16 mx-auto text-pink-400 mb-4" />
            <CardTitle className="text-xl mb-2">Chưa có đơn hàng nào</CardTitle>
            <CardDescription className="mb-4">
              {searchQuery.trim() || activeTab !== 'all' 
                ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc' 
                : 'Bạn chưa đặt đơn hàng nào'}
            </CardDescription>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              Mua sắm ngay
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {currentOrders.map((order) => {
              let statusText = "";
              let statusColor = "";
              let statusBg = "";
              
              switch (order.status) {
                case 0: 
                  statusText = "Đã hủy"; 
                  statusColor = "text-red-600";
                  statusBg = "bg-red-50 border-red-200";
                  break;
                case 2: 
                  statusText = "Đã đặt hàng"; 
                  statusColor = "text-blue-600";
                  statusBg = "bg-blue-50 border-blue-200";
                  break;
                case 3: 
                  statusText = "Đã thanh toán"; 
                  statusColor = "text-orange-600";
                  statusBg = "bg-orange-50 border-orange-200";
                  break;
                case 4: 
                  statusText = "Đã hoàn thành"; 
                  statusColor = "text-green-600";
                  statusBg = "bg-green-50 border-green-200";
                  break;
                default: 
                  statusText = "Không xác định";
                  statusColor = "text-gray-600";
                  statusBg = "bg-gray-50 border-gray-200";
              }
              
              return (
                <Card key={order.id} className="border overflow-hidden hover:shadow-lg transition-all bg-white">
                  <CardHeader className="p-4 sm:p-5 border-b bg-white/90">
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <CardTitle className="text-lg font-medium">
                            Đơn hàng #{order.id.substring(0, 8)}...
                          </CardTitle>
                          <Badge className={`${statusColor} ${statusBg.replace('bg-', 'bg-opacity-20 ')}`}>
                            {statusText}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center mt-1">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          {new Date(order.createDate).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        className={`border-pink-300 text-pink-700 hover:bg-pink-50 hover:text-pink-800`}
                        size="sm"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        <span className="whitespace-nowrap">Xem chi tiết sản phẩm</span>
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 sm:p-5 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Thông tin đơn hàng</h4>
                        <p className="text-gray-800 line-clamp-2">{order.orderInfor || 'Không có'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Số lượng sản phẩm</h4>
                        <p className="text-gray-800">{order.amount}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Tổng tiền</h4>
                        <p className="text-gray-800 font-medium text-lg">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </>
      )}
      
      {/* Modal chi tiết đơn hàng */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-4xl bg-white text-black rounded-2xl shadow-xl border border-pink-100 p-0 overflow-hidden">
          <DialogHeader className="bg-pink-100 px-6 py-4">
            <DialogTitle className="text-black text-xl">Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
            <DialogDescription className="text-black opacity-75">
              {selectedOrder && (
                <div className="text-sm mt-1">
                  Đặt hàng ngày {new Date(selectedOrder.createDate).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600"></div>
                <span className="text-pink-600 font-medium">Đang tải thông tin đơn hàng...</span>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Thông tin đơn hàng và khách hàng trong layout ngang */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-pink-50 to-white rounded-lg border border-pink-100 p-4 h-full shadow-sm">
                  <h3 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Thông tin đơn hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-black">Số đơn:</span>
                    <span className="font-medium text-black truncate" title={`#${selectedOrder?.id}`}>
                      #{String(selectedOrder?.id).length > 10 ? String(selectedOrder?.id).substring(0, 10) + '...' : selectedOrder?.id}
                    </span>
                    
                    <span className="text-black">Ngày đặt:</span>
                    <span className="font-medium text-black">
                      {selectedOrder && new Date(selectedOrder.createDate).toLocaleDateString('vi-VN')}
                    </span>
                    
                    <span className="text-black">Số lượng:</span>
                    <span className="font-medium text-black">{selectedOrder?.amount || 0} sản phẩm</span>
                    
                    <span className="text-black">Trạng thái:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedOrder?.status === 0 ? 'bg-red-100 text-red-800 border border-red-200' : 
                      selectedOrder?.status === 2 ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                      selectedOrder?.status === 3 ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                      selectedOrder?.status === 4 ? 'bg-green-100 text-green-800 border border-green-200' : 
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {selectedOrder?.status === 0 ? 'Đã hủy' : 
                        selectedOrder?.status === 2 ? 'Đã đặt hàng' : 
                        selectedOrder?.status === 3 ? 'Đã thanh toán' : 
                        selectedOrder?.status === 4 ? 'Đã hoàn thành' : 
                        'Không xác định'}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-white rounded-lg border border-pink-100 p-4 h-full shadow-sm">
                  <h3 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Thông tin thanh toán
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-black">Phương thức:</span>
                    <span className="font-medium text-black">
                      {selectedOrder?.orderInfor?.includes("COD") ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán trực tuyến"}
                    </span>
                    
                    <span className="text-black">Phí sản phẩm:</span>
                    <span className="font-medium text-black">
                      {selectedOrder && new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(selectedOrder.totalPrice)}
                    </span>
                    
                    <span className="text-black">Phí vận chuyển:</span>
                    <span className="font-medium text-black">0 ₫</span>
                    
                    <span className="text-black font-semibold">Tổng thanh toán:</span>
                    <span className="font-bold text-black">
                      {selectedOrder && new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(selectedOrder.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Sản phẩm đã mua */}
              <div className="mb-3 pb-3 border-b border-pink-100 flex items-center justify-between">
                <h3 className="font-semibold text-black flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-black" />
                  Sản phẩm đã mua
                </h3>
                <span className="text-sm text-black font-medium">{orderDetails.length} sản phẩm</span>
              </div>
              
              {orderDetails.length > 0 ? (
                <div className="bg-white rounded-lg border border-pink-100 overflow-hidden shadow-sm">
                  <Table className="min-w-[600px]">
                    <TableHeader className="bg-pink-100">
                      <TableRow className="border-b border-pink-100">
                        <TableHead className="text-black font-medium py-3">STT</TableHead>
                        <TableHead className="text-black font-medium">Sản phẩm</TableHead>
                        <TableHead className="text-black font-medium">Giá</TableHead>
                        <TableHead className="text-black font-medium">SL</TableHead>
                        <TableHead className="text-black font-medium text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.map((detail, idx) => (
                        <TableRow key={detail.id} className="hover:bg-pink-100 border-b border-pink-100 transition-colors">
                          <TableCell className="font-medium text-black">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {detail.productImage ? (
                                <img 
                                  src={detail.productImage} 
                                  alt={detail.productName} 
                                  className="h-16 w-16 object-cover rounded-md border border-pink-100 shadow-sm" 
                                />
                              ) : (
                                <div className="h-16 w-16 bg-pink-50 rounded-md border border-pink-100 flex items-center justify-center shadow-sm">
                                  <Package className="h-6 w-6 text-pink-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-black">
                                  {detail.productName || "Sản phẩm không xác định"}
                                </div>
                                <div className="text-xs text-black mt-1 flex gap-2">
                                  <span className="px-2 py-0.5 bg-pink-50 rounded-full border border-pink-100">ID: {detail.productId}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-black">
                            {new Intl.NumberFormat('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND' 
                            }).format(detail.price)}
                          </TableCell>
                          <TableCell className="text-black">
                            <span className="px-2 py-0.5 bg-pink-50 rounded border border-pink-100 inline-block min-w-[30px] text-center">
                              {detail.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-black text-right">
                            {new Intl.NumberFormat('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND' 
                            }).format(detail.price * detail.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 text-center border border-pink-100 shadow-sm">
                  <Package className="h-12 w-12 text-pink-300 mx-auto mb-3" />
                  <p className="text-black">Không có thông tin sản phẩm trong đơn hàng này</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MyOrderPage;