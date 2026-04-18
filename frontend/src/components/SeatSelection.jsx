import { useState, useEffect } from 'react';
import { movieAPI } from '../api';
import '../styles/Seats.css';

export function SeatSelection({ showtimeId, showtime, onConfirm, onBack }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const seatsResponse = await movieAPI.getSeatsByShowtime(showtimeId);

        if (seatsResponse.data) {
          const seatList = Array.isArray(seatsResponse.data)
            ? seatsResponse.data
            : seatsResponse.data.seats || [];
          setSeats(seatList);
        }
      } catch (err) {
        setError('Không thể tải thông tin ghế');
        console.error('Error fetching seats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [showtimeId]);

  const toggleSeat = (seat) => {
    const seatKey = String(seat.seatId);
    const isBooked = seat.status === 'BOOKED' || seat.status === 'UNAVAILABLE';

    if (isBooked) return; // Can't select booked seat

    setSelectedSeats((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(seatKey)) {
        newSelected.delete(seatKey);
      } else {
        newSelected.add(seatKey);
      }
      return newSelected;
    });
  };

  const handleConfirm = () => {
    if (selectedSeats.size === 0) {
      alert('Vui lòng chọn ít nhất một ghế');
      return;
    }

    const selectedSeatIds = Array.from(selectedSeats).map(id => {
      const seat = seats.find(s => String(s.seatId) === id);
      return {
        id: parseInt(id),
        row: seat?.rowLabel,
        seatNumber: seat?.seatNumber,
      };
    });

    onConfirm(selectedSeatIds);
  };

  if (loading) return <div className="loading">Đang tải bản đồ ghế...</div>;
  if (error) return <div className="error">{error}</div>;

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.rowLabel]) acc[seat.rowLabel] = [];
    acc[seat.rowLabel].push(seat);
    return acc;
  }, {});

  return (
    <div className="seat-selection-container">
      <button className="btn-back" onClick={onBack}>← Quay lại</button>
      <h2>Chọn Ghế</h2>
      <p className="showtime-info">
        {new Date(showtime.showDate).toLocaleDateString('vi-VN')} lúc{' '}
        {showtime.startTime}
      </p>

      <div className="legend">
        <div className="legend-item">
          <div className="seat seat-available"></div>
          <span>Ghế trống</span>
        </div>
        <div className="legend-item">
          <div className="seat seat-selected"></div>
          <span>Ghế được chọn</span>
        </div>
        <div className="legend-item">
          <div className="seat seat-booked"></div>
          <span>Ghế đã đặt</span>
        </div>
      </div>

      <div className="screen">Màn hình</div>

      <div className="seats-layout">
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <div key={row} className="seat-row">
            <div className="row-label">{row}</div>
            <div className="seats">
              {rowSeats
                .sort((a, b) => a.seatNumber - b.seatNumber)
                .map((seat) => {
                  const isBooked = seat.status === 'BOOKED' || seat.status === 'UNAVAILABLE';
                  const seatKey = String(seat.seatId);
                  const isSelected = selectedSeats.has(seatKey);

                  return (
                    <button
                      key={seat.seatId}
                      className={`seat ${
                        isBooked ? 'seat-booked' : isSelected ? 'seat-selected' : 'seat-available'
                      }`}
                      onClick={() => toggleSeat(seat)}
                      disabled={isBooked}
                      title={`Ghế ${seat.rowLabel}${seat.seatNumber}`}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
            </div>
            <div className="row-label">{row}</div>
          </div>
        ))}
      </div>

      <div className="seat-selection-summary">
        <p>
          Ghế đã chọn: <strong>{selectedSeats.size}</strong> |
          Giá tiền: <strong>{selectedSeats.size * 150000} đ</strong>
        </p>
        <button className="btn-primary" onClick={handleConfirm}>
          Tiếp tục thanh toán
        </button>
      </div>
    </div>
  );
}
