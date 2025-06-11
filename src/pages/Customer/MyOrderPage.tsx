import { useState, useEffect } from 'react';
import OrderService, { Order } from '../../services/OrderService';

function MyOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // In a real app, you would get the current user's ID from authentication context
  // This is just a placeholder
  const currentUserId = 1; 

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Get all orders
        const allOrders = await OrderService.get();
        // Filter orders by user ID
        const userOrders = allOrders.filter(order => order.account_id === currentUserId);
        setOrders(userOrders);
      } catch (err) {
        setError('Failed to fetch orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Helper function to render status in a user-friendly format
  const renderStatus = (status: number): string => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Processing';
      case 2: return 'Shipped';
      case 3: return 'Delivered';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return <div className="p-4">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      
      {orders.length === 0 ? (
        <p>You don't have any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.order_id} className="border rounded p-4 shadow-sm">
              <h3 className="font-bold">Order #{order.order_id}</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <p>Order Information: {order.orderInfor}</p>
                <p>Amount: {order.amount}</p>
                <p>Total Price: ${order.totalPrice}</p>
                <p>Status: <span className="font-semibold">{renderStatus(order.status)}</span></p>
                <p>Created: {new Date(order.createDate).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrderPage
