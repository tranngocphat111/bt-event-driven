import { appConfig } from "../config/appConfig";
import type {
    AuthResponse,
    BookingResponse,
    CreateBookingRequest,
    MovieResponse,
    RegisterRequest,
    ShowtimeSeatResponse,
    ShowtimeResponse,
    UserResponse,
} from "../types/domain";

const SESSION_KEY = "movie-event-fe-session";

const getSessionToken = (): string | null => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as { token?: string };
        return parsed.token?.trim() ? parsed.token.trim() : null;
    } catch {
        return null;
    }
};

const withAuthHeaders = (
    headers: Record<string, string> = {},
): Record<string, string> => {
    const token = getSessionToken();
    if (!token) {
        return headers;
    }

    return {
        ...headers,
        Authorization: `Bearer ${token}`,
    };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const extractDataField = (payload: unknown): unknown => {
    if (!isRecord(payload)) {
        return payload;
    }

    return "data" in payload ? payload.data : payload;
};

const extractMessage = (payload: unknown): string | null => {
    if (typeof payload === "string" && payload.trim()) {
        return payload;
    }

    if (!isRecord(payload)) {
        return null;
    }

    const directMessage = payload.message;
    if (typeof directMessage === "string" && directMessage.trim()) {
        return directMessage;
    }

    const nestedData = extractDataField(payload);
    if (isRecord(nestedData)) {
        const nestedMessage = nestedData.message;
        if (typeof nestedMessage === "string" && nestedMessage.trim()) {
            return nestedMessage;
        }
    }

    return null;
};

const parseMovies = (payload: unknown): MovieResponse[] => {
    const data = extractDataField(payload);

    if (isRecord(data) && Array.isArray(data.content)) {
        return data.content as MovieResponse[];
    }

    return asArray<MovieResponse>(data);
};

const parseShowtimes = (payload: unknown): ShowtimeResponse[] =>
    asArray<ShowtimeResponse>(extractDataField(payload));

const parseShowtimeSeats = (payload: unknown): ShowtimeSeatResponse[] =>
    asArray<ShowtimeSeatResponse>(extractDataField(payload));

const parseBookings = (payload: unknown): BookingResponse[] =>
    asArray<BookingResponse>(extractDataField(payload));

const parseUsers = (payload: unknown): UserResponse[] =>
    asArray<UserResponse>(extractDataField(payload));

const parseResponse = async (response: Response): Promise<unknown> => {
    const text = await response.text();

    let payload: unknown = text;
    if (text) {
        try {
            payload = JSON.parse(text);
        } catch {
            payload = text;
        }
    }

    if (!response.ok) {
        const message = extractMessage(payload);

        if (message) {
            throw new Error(`Request failed (${response.status}): ${message}`);
        }

        const pretty = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
        throw new Error(`Request failed (${response.status}): ${pretty}`);
    }

    return payload;
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${appConfig.gatewayUrl}/api/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    const payload = await parseResponse(response);
    return payload as AuthResponse;
};

export const register = async (request: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${appConfig.gatewayUrl}/api/users/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    const payload = await parseResponse(response);
    return payload as AuthResponse;
};

export const loadUsers = async (): Promise<UserResponse[]> => {
    const response = await fetch(`${appConfig.gatewayUrl}/api/users`, {
        headers: withAuthHeaders(),
    });
    const payload = await parseResponse(response);
    return parseUsers(payload);
};

export const loadMovies = async (): Promise<MovieResponse[]> => {
    const response = await fetch(`${appConfig.gatewayUrl}/api/movies?page=0&size=20`, {
        headers: withAuthHeaders(),
    });
    const payload = await parseResponse(response);
    return parseMovies(payload);
};

export const loadMovieDetail = async (movieId: number): Promise<MovieResponse> => {
    const response = await fetch(`${appConfig.gatewayUrl}/api/movies/${movieId}`, {
        headers: withAuthHeaders(),
    });
    const payload = await parseResponse(response);
    return extractDataField(payload) as MovieResponse;
};

export const loadMovieShowtimes = async (
    movieId: number,
): Promise<ShowtimeResponse[]> => {
    const response = await fetch(
        `${appConfig.gatewayUrl}/api/movies/${movieId}/showtimes`,
        {
            headers: withAuthHeaders(),
        },
    );
    const payload = await parseResponse(response);
    return parseShowtimes(payload);
};

export const loadShowtimeSeats = async (
    showtimeId: number,
): Promise<ShowtimeSeatResponse[]> => {
    const response = await fetch(
        `${appConfig.gatewayUrl}/api/showtimes/${showtimeId}/seats`,
        {
            headers: withAuthHeaders(),
        },
    );
    const payload = await parseResponse(response);
    return parseShowtimeSeats(payload);
};

export const createBooking = async (
    request: CreateBookingRequest,
    token?: string,
): Promise<BookingResponse> => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token?.trim()) {
        headers.Authorization = `Bearer ${token.trim()}`;
    }

    const response = await fetch(`${appConfig.gatewayUrl}/api/bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
    });

    const payload = await parseResponse(response);
    return payload as BookingResponse;
};

export const loadBookings = async (
    userIdFilter: string,
    statusFilter: string,
): Promise<BookingResponse[]> => {
    const query = new URLSearchParams();

    if (userIdFilter.trim()) {
        query.set("userId", userIdFilter.trim());
    }

    if (statusFilter.trim()) {
        query.set("status", statusFilter.trim());
    }

    const suffix = query.toString();
    const endpoint = suffix
        ? `${appConfig.gatewayUrl}/api/bookings?${suffix}`
        : `${appConfig.gatewayUrl}/api/bookings`;

    const response = await fetch(endpoint, {
        headers: withAuthHeaders(),
    });
    const payload = await parseResponse(response);
    return parseBookings(payload);
};

export const loadPaymentHealth = async (): Promise<unknown> => {
    const response = await fetch(`${appConfig.gatewayUrl}/api/payments/health`, {
        headers: withAuthHeaders(),
    });
    return parseResponse(response);
};
