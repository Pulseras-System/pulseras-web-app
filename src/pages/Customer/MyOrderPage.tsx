import { useState, useEffect } from 'react';
import OrderService, { Order } from '../../services/OrderService';
import { Eye } from "lucide-react";

function MyOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

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
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const allOrders = (await OrderService.getByAccountId(accountId)).filter((order: Order) => order.status !== 1); 
        setOrders(allOrders);
      } catch (err) {
        setError('Không thể lấy danh sách đơn hàng');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [accountId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto mt-10 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Đơn hàng của tôi</h1>
        <p className="text-gray-600">Xem lịch sử đơn hàng và theo dõi trạng thái đơn hàng</p>
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500 mb-4">Bạn chưa đặt đơn hàng nào</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            let statusText = "";
            let statusColor = "";
            switch (order.status) {
              case 0: 
                statusText = "Đã hủy"; 
                statusColor = "bg-red-100 text-red-800";
                break;
              case 1: 
                statusText = "Trong giỏ hàng"; 
                statusColor = "bg-gray-200 text-gray-800";
                break;
              case 2: 
                statusText = "Đã đặt hàng"; 
                statusColor = "bg-yellow-100 text-yellow-800";
                break;
              case 3: 
                statusText = "Đã thanh toán"; 
                statusColor = "bg-blue-100 text-blue-800";
                break;
              case 4: 
                statusText = "Đã hoàn thành"; 
                statusColor = "bg-green-100 text-green-800";
                break;
              default: 
                statusText = "Không xác định";
                statusColor = "bg-gray-100 text-gray-800";
            }
            
            return (
              <div key={order.id} className="border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Đơn hàng #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createDate).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                        {statusText}
                      </span>
                      <button
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Xem chi tiết đơn hàng"
                      >
                        <Eye className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">Xem chi tiết</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Thông tin đơn hàng</h4>
                      <p className="text-gray-800">{order.orderInfor || 'Không có'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Số lượng sản phẩm</h4>
                      <p className="text-gray-800">{order.amount}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Tổng tiền</h4>
                      <p className="text-gray-800 font-medium">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrderPage;