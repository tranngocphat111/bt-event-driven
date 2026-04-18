import { useState, useEffect } from 'react';
import { movieAPI } from '../api';
import '../styles/Movies.css';

export function MovieList({ onSelectMovie }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await movieAPI.getMovies();
        if (response.data && response.data.content) {
          setMovies(response.data.content);
        } else if (Array.isArray(response.data)) {
          setMovies(response.data);
        }
      } catch (err) {
        setError('Không thể tải danh sách phim');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <div className="loading">Đang tải phim...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="movie-list-container">
      <h2>Danh Sách Phim</h2>
      <div className="movie-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            {movie.posterUrl && (
              <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
            )}
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p className="movie-genre">{movie.genre}</p>
              <p className="movie-duration">Thời lượng: {movie.duration} phút</p>
              <p className="movie-description">{movie.description}</p>
              <button
                className="btn-primary"
                onClick={() => onSelectMovie(movie)}
              >
                Xem Suất Chiếu
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
