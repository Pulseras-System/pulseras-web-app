import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import PaymentService from "@/services/PaymentService";

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const code = searchParams.get('code');
  const status = searchParams.get('status');
  const orderCode = searchParams.get('orderCode');
  const cancel = searchParams.get('cancel') === 'true';

  const verifyPayment = async () => {
    if (orderCode) {
      try {
        setRefreshing(true);
        const paymentStatus = await PaymentService.getPaymentByOrderCode(Number(orderCode));
        setPaymentData(paymentStatus.data);
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setRefreshing(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    verifyPayment();
  }, [orderCode]);

  const getStatusInfo = () => {
    if (cancel) {
      return {
        icon: <XCircle className="h-16 w-16 text-red-500" />,
        title: "Thanh toán đã bị hủy",
        message: "Bạn đã hủy giao dịch thanh toán.",
        bgColor: "bg-red-50",
        textColor: "text-red-800"
      };
    }

    if (code === '00' || status === 'PAID') {
      return {
        icon: <CheckCircle className="h-16 w-16 text-green-500" />,
        title: "Thanh toán thành công!",
        message: "Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xác nhận.",
        bgColor: "bg-green-50",
        textColor: "text-green-800"
      };
    }

    return {
      icon: <Clock className="h-16 w-16 text-yellow-500" />,
      title: "Đang xử lý thanh toán",
      message: "Giao dịch của bạn đang được xử lý. Vui lòng chờ trong giây lát.",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800"
    };
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Đang xác minh thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className={`${statusInfo.bgColor} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6`}>
            {statusInfo.icon}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {statusInfo.title}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {statusInfo.message}
          </p>

          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-700 mb-3">Thông tin giao dịch</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã đơn hàng:</span>
                  <span className="font-medium">{paymentData.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tiền:</span>
                  <span className="font-medium">{paymentData.amount?.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    paymentData.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                    paymentData.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {paymentData.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {orderCode && (
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={verifyPayment}
                disabled={refreshing}
              >
                {refreshing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Đang kiểm tra...
                  </div>
                ) : (
                  "Kiểm tra lại trạng thái thanh toán"
                )}
              </Button>
            )}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate('/orders')}
            >
              Xem đơn hàng của tôi
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
