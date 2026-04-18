export type AuthResponse = {
    userId?: number;
    username?: string;
    email?: string;
    token?: string;
    message?: string;
    success?: boolean;
};

export type RegisterRequest = {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    fullName?: string;
    phone?: string;
};

export type UserResponse = {
    id?: number;
    userId?: number;
    username?: string;
    email?: string;
    fullName?: string;
};

export type MovieResponse = {
    id: number;
    title: string;
    description?: string;
    genre?: string;
    duration?: number;
    director?: string;
    castMembers?: string;
    language?: string;
    status?: string;
    rating?: number;
    posterUrl?: string;
    releaseDate?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type ShowtimeResponse = {
    id: number;
    movieId?: number;
    hallId?: number;
    showDate?: string;
    startTime?: string;
    endTime?: string;
    availableSeats?: number;
    status?: string;
};

export type ShowtimeSeatResponse = {
    seatId: number;
    rowLabel?: string;
    seatNumber?: number;
    seatType?: string;
    status?: string;
};

export type CreateBookingRequest = {
    userId: number;
    showtimeId: number;
    seatIds: number[];
    notes?: string;
};

export type BookingResponse = {
    id: number;
    bookingCode?: string;
    userId?: number;
    showtimeId?: number;
    totalSeats?: number;
    totalAmount?: number;
    status?: string;
    seatLabels?: string[];
    createdAt?: string;
};

export type DetailRecord = {
    title: string;
    source: string;
    payload: unknown;
};

export type SocketState = "disconnected" | "connecting" | "connected" | "error";

export type NotificationItem = {
    id: string;
    receivedAt: string;
    payload: unknown;
};

export type SocketNotificationPayload = {
    eventType?: string;
    message?: string;
    userId?: number;
    sentAt?: string;
};
