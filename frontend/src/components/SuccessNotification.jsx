import '../styles/Success.css';

export function SuccessNotification({ bookingId, totalPrice, seats, onClose }) {
  return (
    <div className="success-overlay">
      <div className="success-modal">
        <div className="success-icon">✓</div>
        <h2>Đặt Vé Thành Công!</h2>

        <div className="success-details">
          <p>Cảm ơn bạn đã đặt vé tại rạp chiếu phim của chúng tôi</p>

          <div className="booking-info">
            <div className="info-row">
              <span>Mã đặt vé:</span>
              <strong>{bookingId}</strong>
            </div>
            <div className="info-row">
              <span>Số ghế:</span>
              <strong>{seats}</strong>
            </div>
            <div className="info-row">
              <span>Tổng tiền:</span>
              <strong>{totalPrice.toLocaleString('vi-VN')} đ</strong>
            </div>
          </div>

          <p className="notice">
            Vui lòng đến rạp chiếu phim 15 phút trước giờ chiếu.
            <br />
            Mã đặt vé đã được gửi đến email của bạn.
          </p>
        </div>

        <button className="btn-primary" onClick={onClose}>
          Quay về Trang Chủ
        </button>
      </div>
    </div>
  );
}
