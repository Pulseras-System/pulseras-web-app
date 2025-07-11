// src/components/BankTransferQR.tsx
const BankTransferQR = ({ orderId, amount }: { orderId: string; amount: number }) => {
  const bankCode = 'TPB';
  const accountNumber = '0913428487';
  const accountName = 'VO HUY HOANG';
  const transferContent = `Thanh toan don hang Pulseras ${orderId}`;

  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="mt-6 text-center space-y-4 border p-4 rounded-lg bg-white shadow">
      <h3 className="text-lg font-semibold text-gray-800">Chuyển khoản ngân hàng</h3>
      <img src={qrUrl} alt="QR chuyển khoản TPBank" className="mx-auto w-64 h-64 border" />
      <div className="text-sm text-gray-700">
        <p><strong>Ngân hàng:</strong> TPBank</p>
        <p><strong>Chủ tài khoản:</strong> VO HUY HOANG</p>
        <p><strong>Số tài khoản:</strong> 0913428487</p>
        <p><strong>Nội dung:</strong> {transferContent}</p>
        <p><strong>Số tiền:</strong> {amount.toLocaleString('vi-VN')}₫</p>
      </div>
    </div>
  );
};

export default BankTransferQR;
