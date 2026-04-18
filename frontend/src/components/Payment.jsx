import { useState } from 'react';
import { bookingAPI } from '../api';
import '../styles/Payment.css';

export function Payment({ showtime, seats, movieTitle, onPaymentSuccess, onBack }) {
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const totalPrice = seats.length * 150000;
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookingRequest = {
        showtimeId: showtime.id,
        userId: parseInt(userId),
        seatIds: seats.map(s => s.id), // Extract just the IDs
      };

      const response = await bookingAPI.createBooking(bookingRequest, token);

      if (response.data || response.id || response.bookingId) {
        onPaymentSuccess({
          bookingId: response.id || response.bookingId || response.data.id,
          totalPrice,
          seats: seats.length,
        });
      } else {
        setError(response.message || 'Lỗi thanh toán');
      }
    } catch (err) {
      setError('Lỗi kết nối khi thanh toán');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <button className="btn-back" onClick={onBack}>← Quay lại</button>
      <h2>Thanh Toán</h2>

      <div className="payment-summary">
        <div className="summary-section">
          <h3>Chi tiết đặt vé</h3>
          <p><strong>Phim:</strong> {movieTitle}</p>
          <p>
            <strong>Ngày chiếu:</strong>{' '}
            {new Date(showtime.showDate).toLocaleDateString('vi-VN')}
          </p>
          <p>
            <strong>Giờ chiếu:</strong> {showtime.startTime}
          </p>
          <p><strong>Rạp:</strong> {showtime.theater}</p>
          <p>
            <strong>Ghế:</strong> {seats.map((s) => `${s.row}${s.seatNumber}`).join(', ')}
          </p>
        </div>

        <div className="summary-section">
          <h3>Tổng cộng</h3>
          <p className="seat-price">
            <span>{seats.length} ghế × 150,000 đ</span>
            <strong>{totalPrice.toLocaleString('vi-VN')} đ</strong>
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="payment-methods">
          <h3>Chọn phương thức thanh toán</h3>

          <label className="payment-option">
            <input
              type="radio"
              value="credit-card"
              checked={paymentMethod === 'credit-card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Thẻ tín dụng / Thẻ ghi nợ</span>
          </label>

          <label className="payment-option">
            <input
              type="radio"
              value="bank-transfer"
              checked={paymentMethod === 'bank-transfer'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Chuyển khoản ngân hàng</span>
          </label>

          <label className="payment-option">
            <input
              type="radio"
              value="wallet"
              checked={paymentMethod === 'wallet'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Ví điện tử</span>
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Đang xử lý...' : `Thanh Toán ${totalPrice.toLocaleString('vi-VN')} đ`}
        </button>
      </form>
    </div>
  );
}
