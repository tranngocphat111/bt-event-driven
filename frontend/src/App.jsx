import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { MovieList } from './components/MovieList';
import { ShowtimeSelection } from './components/ShowtimeSelection';
import { SeatSelection } from './components/SeatSelection';
import { Payment } from './components/Payment';
import { SuccessNotification } from './components/SuccessNotification';
import { authAPI } from './api';
import './App.css';

function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('');

  // Navigation states
  const [currentScreen, setCurrentScreen] = useState('movies'); // movies, showtime, seats, payment
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setIsAuthenticated(true);
      setUsername(username);
    }
  }, []);

  // Authentication handlers
  const handleLoginSuccess = () => {
    setUsername(localStorage.getItem('username'));
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setUsername(localStorage.getItem('username'));
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await authAPI.logout(token);
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setCurrentScreen('movies');
  };

  // Movie selection handlers
  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setCurrentScreen('showtime');
  };

  const handleSelectShowtime = (showtime) => {
    setSelectedShowtime(showtime);
    setCurrentScreen('seats');
  };

  const handleSelectSeats = (seats) => {
    setSelectedSeats(seats);
    setCurrentScreen('payment');
  };

  const handlePaymentSuccess = (bookingData) => {
    setBookingSuccess(bookingData);
  };

  const handleBackToHome = () => {
    setCurrentScreen('movies');
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setBookingSuccess(null);
  };

  // If not authenticated, show login/register
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="navbar">
          <h1>🎬 Đặt Vé Xem Phim</h1>
        </div>
        <div className="auth-container">
          {showRegister ? (
            <div>
              <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
              <div className="auth-switch">
                <p>
                  Đã có tài khoản?{' '}
                  <button onClick={() => setShowRegister(false)}>
                    Đăng Nhập
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div>
              <LoginForm onLoginSuccess={handleLoginSuccess} />
              <div className="auth-switch">
                <p>
                  Chưa có tài khoản?{' '}
                  <button onClick={() => setShowRegister(true)}>
                    Đăng Ký
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If authenticated and booking is successful, show success notification
  if (bookingSuccess) {
    return (
      <div className="app-container">
        <div className="navbar">
          <h1>🎬 Đặt Vé Xem Phim</h1>
          <div className="navbar-right">
            <span className="username">Xin chào {username}</span>
            <button onClick={handleLogout}>Đăng Xuất</button>
          </div>
        </div>
        <SuccessNotification
          bookingId={bookingSuccess.bookingId}
          totalPrice={bookingSuccess.totalPrice}
          seats={bookingSuccess.seats}
          onClose={handleBackToHome}
        />
      </div>
    );
  }

  // Main app screens
  return (
    <div className="app-container">
      <div className="navbar">
        <h1>🎬 Đặt Vé Xem Phim</h1>
        <div className="navbar-right">
          <span className="username">Xin chào {username}</span>
          <button onClick={handleLogout}>Đăng Xuất</button>
        </div>
      </div>

      <main className="main-content">
        {currentScreen === 'movies' && (
          <MovieList onSelectMovie={handleSelectMovie} />
        )}

        {currentScreen === 'showtime' && selectedMovie && (
          <ShowtimeSelection
            movieId={selectedMovie.id}
            movieTitle={selectedMovie.title}
            onSelectShowtime={handleSelectShowtime}
            onBack={handleBackToHome}
          />
        )}

        {currentScreen === 'seats' && selectedShowtime && (
          <SeatSelection
            showtimeId={selectedShowtime.id}
            showtime={selectedShowtime}
            onConfirm={handleSelectSeats}
            onBack={() => setCurrentScreen('showtime')}
          />
        )}

        {currentScreen === 'payment' && selectedShowtime && selectedSeats.length > 0 && (
          <Payment
            showtime={selectedShowtime}
            seats={selectedSeats}
            movieTitle={selectedMovie.title}
            onPaymentSuccess={handlePaymentSuccess}
            onBack={() => setCurrentScreen('seats')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
