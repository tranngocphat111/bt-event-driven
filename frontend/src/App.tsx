import { useEffect, useState } from "react";
import {
    Navigate,
    Route,
    Routes,
    useNavigate,
    useParams,
} from "react-router-dom";
import { appConfig } from "./config/appConfig";
import { useSocketNotifications } from "./hooks/useSocketNotifications";
import DetailPage from "./pages/DetailPage.tsx";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { loadMovies, login, register } from "./services/api";
import type {
    MovieResponse,
    RegisterRequest,
    SocketNotificationPayload,
} from "./types/domain";
import "./App.css";

type Session = {
    userId: number | null;
    username: string;
    token: string;
};

const SESSION_KEY = "movie-event-fe-session";

const extractUserIdFromToken = (token: string): number | null => {
    if (!token) {
        return null;
    }

    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) {
            return null;
        }

        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        const payload = JSON.parse(atob(normalized)) as Record<string, unknown>;
        const rawUserId = payload.userId;

        if (typeof rawUserId === "number" && Number.isFinite(rawUserId)) {
            return rawUserId;
        }

        if (typeof rawUserId === "string") {
            const parsed = Number(rawUserId);
            return Number.isFinite(parsed) ? parsed : null;
        }

        return null;
    } catch {
        return null;
    }
};

const readSession = (): Session | null => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as Partial<Session>;
        if (!parsed.token) {
            return null;
        }

        return {
            userId:
                typeof parsed.userId === "number"
                    ? parsed.userId
                    : extractUserIdFromToken(parsed.token),
            username: parsed.username ?? "",
            token: parsed.token,
        };
    } catch {
        return null;
    }
};

const getErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : "Da co loi xay ra";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const toSocketPayload = (value: unknown): SocketNotificationPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    return {
        eventType:
            typeof value.eventType === "string" ? value.eventType : undefined,
        message: typeof value.message === "string" ? value.message : undefined,
        userId:
            typeof value.userId === "number"
                ? value.userId
                : typeof value.userId === "string"
                  ? Number(value.userId)
                  : undefined,
        sentAt: typeof value.sentAt === "string" ? value.sentAt : undefined,
    };
};

type MovieDetailRouteProps = {
    userId: number | null;
    token: string;
    onBack: () => void;
};

const MovieDetailRoute = ({ userId, token, onBack }: MovieDetailRouteProps) => {
    const { movieId } = useParams();
    const parsedMovieId = Number(movieId);

    return (
        <DetailPage
            movieId={Number.isFinite(parsedMovieId) ? parsedMovieId : null}
            userId={userId}
            authToken={token}
            onBack={onBack}
        />
    );
};

function App() {
    const navigate = useNavigate();
    const initialSession = readSession();
    const [session, setSession] = useState<Session | null>(initialSession);

    const [movies, setMovies] = useState<MovieResponse[]>([]);

    const [errorMessage, setErrorMessage] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [pendingRegisteredUserId, setPendingRegisteredUserId] = useState<
        number | null
    >(null);
    const [socketNotice, setSocketNotice] = useState("");

    const [moviesLoading, setMoviesLoading] = useState(false);

    const { socketState, notifications, connect, disconnect } =
        useSocketNotifications({
            wsEndpoint: appConfig.wsEndpoint,
            topic: appConfig.notificationTopic,
        });

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, []);

    useEffect(() => {
        if (!session) {
            return;
        }

        void handleLoadMovies();
    }, [session]);

    useEffect(() => {
        if (!pendingRegisteredUserId) {
            return;
        }

        const matched = notifications.find((item) => {
            const payload = toSocketPayload(item.payload);
            if (!payload?.eventType) {
                return false;
            }

            const eventType = payload.eventType.toUpperCase();
            if (eventType !== "USER_REGISTERED") {
                return false;
            }

            return payload.userId === pendingRegisteredUserId;
        });

        if (!matched) {
            return;
        }

        const payload = toSocketPayload(matched.payload);
        setSocketNotice(
            payload?.message
                ? `${payload.message} (Socket 192.168.1.155)`
                : "Nhan thong bao dang ky thanh cong tu notification socket (192.168.1.155).",
        );
        setPendingRegisteredUserId(null);
    }, [notifications, pendingRegisteredUserId]);
    const handleLoadMovies = async () => {
        setMoviesLoading(true);
        setErrorMessage("");
        try {
            setMovies(await loadMovies());
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setMoviesLoading(false);
        }
    };

    const handleLogin = async (username: string, password: string) => {
        setLoginLoading(true);
        setErrorMessage("");

        try {
            const auth = await login(username, password);

            if (!auth.success || !auth.token) {
                throw new Error(auth.message || "Dang nhap that bai");
            }

            const nextSession: Session = {
                userId: auth.userId ?? extractUserIdFromToken(auth.token),
                username: auth.username || username,
                token: auth.token,
            };

            setSession(nextSession);
            localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
            await handleLoadMovies();
            navigate("/", { replace: true });
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegister = async (request: RegisterRequest) => {
        setRegisterLoading(true);
        setErrorMessage("");

        try {
            const auth = await register(request);

            if (!auth.success || !auth.token) {
                throw new Error(auth.message || "Dang ky that bai");
            }

            const nextSession: Session = {
                userId: auth.userId ?? extractUserIdFromToken(auth.token),
                username: auth.username || request.username,
                token: auth.token,
            };

            if (nextSession.userId) {
                setPendingRegisteredUserId(nextSession.userId);
            }

            if (socketState === "disconnected" || socketState === "error") {
                connect();
            }

            setSession(nextSession);
            localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
            await handleLoadMovies();
            navigate("/", { replace: true });
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleLogout = () => {
        setSession(null);
        setMovies([]);
        localStorage.removeItem(SESSION_KEY);
        navigate("/login", { replace: true });
    };

    const handleOpenMovieDetail = (movieId: number) => {
        navigate(`/movies/${movieId}`);
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    return (
        <main className="app-shell">
            {socketNotice && (
                <div className="mb-3 flex items-start justify-between gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    <div>
                        <p className="font-semibold">Thong bao realtime</p>
                        <p>{socketNotice}</p>
                        <p className="text-xs text-emerald-300/80">
                            Socket state: {socketState}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSocketNotice("")}
                        className="rounded-lg border border-emerald-300/40 bg-emerald-900/20 px-2 py-1 text-xs font-semibold text-emerald-200"
                    >
                        Dong
                    </button>
                </div>
            )}

            <Routes>
                <Route
                    path="/login"
                    element={
                        session ? (
                            <Navigate to="/" replace />
                        ) : (
                            <LoginPage
                                loginLoading={loginLoading}
                                registerLoading={registerLoading}
                                errorMessage={errorMessage}
                                onLoginSubmit={handleLogin}
                                onRegisterSubmit={handleRegister}
                            />
                        )
                    }
                />

                <Route
                    path="/"
                    element={
                        session ? (
                            <HomePage
                                username={session.username || ""}
                                movies={movies}
                                moviesLoading={moviesLoading}
                                errorMessage={errorMessage}
                                onLoadMovies={handleLoadMovies}
                                onOpenMovieDetail={handleOpenMovieDetail}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                <Route
                    path="/movies/:movieId"
                    element={
                        session ? (
                            <MovieDetailRoute
                                userId={session.userId}
                                token={session.token}
                                onBack={handleBackToHome}
                            />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to={session ? "/" : "/login"} replace />}
                />
            </Routes>
        </main>
    );
}

export default App;
