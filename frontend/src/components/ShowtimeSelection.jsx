import { useState, useEffect } from 'react';
import { movieAPI } from '../api';
import '../styles/Showtime.css';

export function ShowtimeSelection({ movieId, movieTitle, onSelectShowtime, onBack }) {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const response = await movieAPI.getShowtimesByMovie(movieId);
        if (response.data) {
          setShowtimes(Array.isArray(response.data) ? response.data : [response.data]);
        }
      } catch (err) {
        setError('Không thể tải suất chiếu');
        console.error('Error fetching showtimes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId]);

  if (loading) return <div className="loading">Đang tải suất chiếu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="showtime-container">
      <button className="btn-back" onClick={onBack}>← Quay lại</button>
      <h2>Suất Chiếu: {movieTitle}</h2>

      {showtimes.length === 0 ? (
        <p>Không có suất chiếu nào</p>
      ) : (
        <div className="showtime-grid">
          {showtimes.map((showtime) => (
            <div key={showtime.id} className="showtime-card">
              <div className="showtime-info">
                <p className="showtime-date">
                  {new Date(showtime.showDate).toLocaleDateString('vi-VN')}
                </p>
                <p className="showtime-time">
                  {showtime.startTime}
                </p>
                <p className="showtime-theater">
                  Rạp ID: {showtime.hallId}
                </p>
                <p className="showtime-seats">
                  Ghế còn: {showtime.availableSeats}
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => onSelectShowtime(showtime)}
                disabled={showtime.availableSeats === 0}
              >
                Chọn Suất Chiếu
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
