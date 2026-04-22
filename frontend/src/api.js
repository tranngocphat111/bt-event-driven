// API Gateway base URL
const API_GATEWAY_URL = 'http://192.168.1.145:8085/api';

export const authAPI = {
  register: (userData) =>
    fetch(`${API_GATEWAY_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }).then(r => r.json()),

  login: (credentials) =>
    fetch(`${API_GATEWAY_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(r => r.json()),

  logout: (token) =>
    fetch(`${API_GATEWAY_URL}/users/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.json()),

  verifyToken: (token) =>
    fetch(`${API_GATEWAY_URL}/users/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token),
    }).then(r => r.json()),
};

export const movieAPI = {
  getMovies: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_GATEWAY_URL}/movies${query ? '?' + query : ''}`).then(r => r.json());
  },

  getMovieById: (movieId) =>
    fetch(`${API_GATEWAY_URL}/movies/${movieId}`).then(r => r.json()),

  searchMovies: (keyword) =>
    fetch(`${API_GATEWAY_URL}/movies/search?keyword=${keyword}`).then(r => r.json()),

  getShowtimesByMovie: (movieId) =>
    fetch(`${API_GATEWAY_URL}/movies/${movieId}/showtimes`).then(r => r.json()),

  getSeatsByShowtime: (showtimeId) =>
    fetch(`${API_GATEWAY_URL}/movies/showtimes/${showtimeId}/seats`).then(r => r.json()),

  getBookedSeats: (showtimeId) =>
    fetch(`${API_GATEWAY_URL}/movies/showtimes/${showtimeId}/booked-seats`).then(r => r.json()),
};

export const bookingAPI = {
  createBooking: (bookingData, token) =>
    fetch(`${API_GATEWAY_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    }).then(r => r.json()),

  getBookings: (userId, token, status = null) => {
    const query = new URLSearchParams();
    if (userId) query.append('userId', userId);
    if (status) query.append('status', status);
    return fetch(`${API_GATEWAY_URL}/bookings${query.toString() ? '?' + query.toString() : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.json());
  },
};

export const paymentAPI = {
  health: () =>
    fetch(`${API_GATEWAY_URL}/payments/health`).then(r => r.json()),
};
