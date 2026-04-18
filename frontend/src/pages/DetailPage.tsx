import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../config/appConfig";
import { useSocketNotifications } from "../hooks/useSocketNotifications";
import {
    createBooking,
    loadMovieDetail,
    loadMovieShowtimes,
    loadShowtimeSeats,
} from "../services/api";
import type {
    BookingResponse,
    MovieResponse,
    ShowtimeResponse,
    ShowtimeSeatResponse,
    SocketNotificationPayload,
} from "../types/domain";

type DetailPageProps = {
    movieId: number | null;
    userId: number | null;
    authToken: string;
    onBack: () => void;
};

type PaymentState = "idle" | "processing" | "success" | "failed";

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

const extractBookingIdFromMessage = (message?: string): number | null => {
    if (!message) {
        return null;
    }

    const matched = message.match(/#(\d+)/);
    if (!matched?.[1]) {
        return null;
    }

    const parsed = Number(matched[1]);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatDate = (value?: string): string => {
    if (!value) {
        return "Dang cap nhat";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatSeatLabel = (seat: ShowtimeSeatResponse): string => {
    const row = seat.rowLabel ?? "?";
    const number = seat.seatNumber ?? 0;
    return `${row}${number}`;
};

const DetailPage = ({
    movieId,
    userId,
    authToken,
    onBack,
}: DetailPageProps) => {
    const [movie, setMovie] = useState<MovieResponse | null>(null);
    const [showtimes, setShowtimes] = useState<ShowtimeResponse[]>([]);
    const [seats, setSeats] = useState<ShowtimeSeatResponse[]>([]);
    const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(
        null,
    );
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
    const [notes, setNotes] = useState("");
    const [latestBooking, setLatestBooking] = useState<BookingResponse | null>(
        null,
    );

    const [loading, setLoading] = useState(false);
    const [seatsLoading, setSeatsLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [paymentState, setPaymentState] = useState<PaymentState>("idle");
    const [paymentMessage, setPaymentMessage] = useState("");

    const {
        socketState,
        notifications,
        connect,
        disconnect,
        clearNotifications,
    } = useSocketNotifications({
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
        if (!movieId) {
            setMovie(null);
            setShowtimes([]);
            setSeats([]);
            setSelectedShowtimeId(null);
            setSelectedSeatIds([]);
            return;
        }

        const fetchDetail = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const [moviePayload, showtimePayload] = await Promise.all([
                    loadMovieDetail(movieId),
                    loadMovieShowtimes(movieId),
                ]);

                setMovie(moviePayload);
                setShowtimes(showtimePayload);

                const firstShowtimeId = showtimePayload[0]?.id ?? null;
                setSelectedShowtimeId(firstShowtimeId);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Khong the tai chi tiet phim";
                setErrorMessage(message);
            } finally {
                setLoading(false);
            }
        };

        void fetchDetail();
    }, [movieId]);

    useEffect(() => {
        if (!selectedShowtimeId) {
            setSeats([]);
            setSelectedSeatIds([]);
            return;
        }

        const fetchSeats = async () => {
            setSeatsLoading(true);
            setErrorMessage("");
            try {
                const seatPayload = await loadShowtimeSeats(selectedShowtimeId);
                setSeats(seatPayload);
                setSelectedSeatIds([]);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Khong the tai danh sach ghe";
                setErrorMessage(message);
            } finally {
                setSeatsLoading(false);
            }
        };

        void fetchSeats();
    }, [selectedShowtimeId]);

    useEffect(() => {
        if (!latestBooking?.id || !userId) {
            return;
        }

        const matchedNotification = notifications.find((item) => {
            const payload = toSocketPayload(item.payload);
            if (!payload?.eventType || !payload.message) {
                return false;
            }

            if (payload.userId && payload.userId !== userId) {
                return false;
            }

            const eventType = payload.eventType.toUpperCase();
            if (
                eventType !== "PAYMENT_COMPLETED" &&
                eventType !== "BOOKING_FAILED"
            ) {
                return false;
            }

            const bookingIdFromMessage = extractBookingIdFromMessage(
                payload.message,
            );
            return bookingIdFromMessage === latestBooking.id;
        });

        if (!matchedNotification) {
            return;
        }

        const payload = toSocketPayload(matchedNotification.payload);
        const eventType = payload?.eventType?.toUpperCase();
        if (eventType === "PAYMENT_COMPLETED") {
            setPaymentState("success");
        } else if (eventType === "BOOKING_FAILED") {
            setPaymentState("failed");
        }

        if (payload?.message) {
            setPaymentMessage(payload.message);
        }
    }, [latestBooking?.id, notifications, userId]);

    const totalAvailableSeats = useMemo(
        () =>
            showtimes.reduce(
                (sum, showtime) => sum + (showtime.availableSeats ?? 0),
                0,
            ),
        [showtimes],
    );

    const userNotifications = useMemo(
        () =>
            notifications.filter((item) => {
                if (!userId) {
                    return true;
                }

                const payload = toSocketPayload(item.payload);
                return !payload?.userId || payload.userId === userId;
            }),
        [notifications, userId],
    );

    const selectedSeatLabels = useMemo(() => {
        if (selectedSeatIds.length === 0) {
            return [] as string[];
        }

        const seatMap = new Map(seats.map((seat) => [seat.seatId, seat]));
        return selectedSeatIds.map((seatId) => {
            const seat = seatMap.get(seatId);
            return seat ? formatSeatLabel(seat) : `#${seatId}`;
        });
    }, [selectedSeatIds, seats]);

    const toggleSeat = (seatId: number) => {
        setSelectedSeatIds((prev) =>
            prev.includes(seatId)
                ? prev.filter((id) => id !== seatId)
                : [...prev, seatId],
        );
    };

    const handleCreateBooking = async () => {
        if (!userId) {
            setErrorMessage("Khong tim thay userId, vui long dang nhap lai");
            return;
        }

        if (!selectedShowtimeId) {
            setErrorMessage("Vui long chon suat chieu");
            return;
        }

        if (selectedSeatIds.length === 0) {
            setErrorMessage("Vui long chon it nhat 1 ghe");
            return;
        }

        setBookingLoading(true);
        setErrorMessage("");
        setPaymentState("processing");
        setPaymentMessage(
            "Da tao booking. He thong dang xu ly thanh toan va gui thong bao...",
        );

        try {
            const created = await createBooking(
                {
                    userId,
                    showtimeId: selectedShowtimeId,
                    seatIds: selectedSeatIds,
                    notes,
                },
                authToken,
            );

            setLatestBooking(created);

            setShowtimes((prev) =>
                prev.map((showtime) =>
                    showtime.id === selectedShowtimeId
                        ? {
                              ...showtime,
                              availableSeats: Math.max(
                                  (showtime.availableSeats ?? 0) -
                                      selectedSeatIds.length,
                                  0,
                              ),
                          }
                        : showtime,
                ),
            );

            setSeats((prev) =>
                prev.map((seat) =>
                    selectedSeatIds.includes(seat.seatId)
                        ? { ...seat, status: "BOOKED" }
                        : seat,
                ),
            );
            setSelectedSeatIds([]);

            if (socketState === "disconnected" || socketState === "error") {
                connect();
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Khong the tao booking";
            setErrorMessage(message);
            setPaymentState("failed");
            setPaymentMessage("Tao booking that bai. Vui long thu lai.");
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <section className="space-y-6 text-slate-100">
            <header className="rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Chi tiet phim
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-100 md:text-3xl">
                    {movie?.title ?? "Dang tai thong tin phim"}
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                    Tong so ghe con trong hien tai: {totalAvailableSeats}
                </p>

                <div className="mt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                        Quay lai trang chu
                    </button>
                </div>
            </header>

            {errorMessage && (
                <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-sm font-medium text-red-300">
                    {errorMessage}
                </div>
            )}

            {loading && (
                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-400">
                    Dang tai chi tiet phim...
                </div>
            )}

            {movie && (
                <article className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80 shadow-[0_14px_35px_rgba(2,6,23,0.5)]">
                    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                        <div className="h-full min-h-[200px] bg-slate-800">
                            {movie.posterUrl ? (
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-cyan-900 text-4xl font-bold text-cyan-200">
                                    {movie.title.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 p-5">
                            <h2 className="text-xl font-bold text-slate-100">
                                {movie.title}
                            </h2>
                            <p className="text-sm text-slate-400">
                                {movie.description || "Chua co mo ta chi tiet."}
                            </p>

                            <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                                <p>
                                    <span className="font-semibold">
                                        The loai:
                                    </span>{" "}
                                    {movie.genre ?? "N/A"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Thoi luong:
                                    </span>{" "}
                                    {movie.duration ?? "N/A"} phut
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Dao dien:
                                    </span>{" "}
                                    {movie.director ?? "N/A"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Dien vien:
                                    </span>{" "}
                                    {movie.castMembers ?? "N/A"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Ngon ngu:
                                    </span>{" "}
                                    {movie.language ?? "N/A"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Danh gia:
                                    </span>{" "}
                                    {movie.rating ?? "N/A"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Khoi chieu:
                                    </span>{" "}
                                    {formatDate(movie.releaseDate)}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Trang thai:
                                    </span>{" "}
                                    {movie.status ?? "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </article>
            )}

            <section className="space-y-3">
                <h2 className="text-xl font-bold text-cyan-200">
                    Chon suat chieu
                </h2>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {showtimes.map((showtime) => {
                        const active = showtime.id === selectedShowtimeId;

                        return (
                            <article
                                key={showtime.id}
                                className={`rounded-2xl border p-4 shadow-sm transition ${
                                    active
                                        ? "border-cyan-400 bg-cyan-500/10"
                                        : "border-slate-700 bg-slate-900/70"
                                }`}
                            >
                                <p className="text-sm font-semibold text-slate-100">
                                    Suat #{showtime.id} - Hall{" "}
                                    {showtime.hallId ?? "N/A"}
                                </p>
                                <p className="mt-1 text-sm text-slate-400">
                                    Ngay: {showtime.showDate ?? "N/A"}
                                </p>
                                <p className="text-sm text-slate-400">
                                    Gio: {showtime.startTime ?? "N/A"} -{" "}
                                    {showtime.endTime ?? "N/A"}
                                </p>
                                <p className="mt-2 text-sm font-medium text-emerald-700">
                                    Ghe trong: {showtime.availableSeats ?? 0}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedShowtimeId(showtime.id)
                                    }
                                    className="mt-3 w-full rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                                >
                                    {active ? "Dang chon" : "Chon suat nay"}
                                </button>
                            </article>
                        );
                    })}
                </div>

                {!loading && showtimes.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-400">
                        Phim nay hien chua co suat chieu.
                    </div>
                )}
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-[0_14px_35px_rgba(2,6,23,0.5)]">
                <h2 className="text-xl font-bold text-cyan-200">
                    Dat ve va thanh toan
                </h2>

                <p className="text-sm text-slate-400">
                    Chon ghe trong, bam dat ve. Backend se tu dong xu ly thanh
                    toan va gui thong bao qua socket.
                </p>

                {seatsLoading ? (
                    <p className="text-sm text-slate-400">
                        Dang tai danh sach ghe...
                    </p>
                ) : (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                        {seats.map((seat) => {
                            const isBooked =
                                (seat.status ?? "").toUpperCase() === "BOOKED";
                            const selected = selectedSeatIds.includes(
                                seat.seatId,
                            );

                            return (
                                <button
                                    key={seat.seatId}
                                    type="button"
                                    aria-pressed={selected}
                                    disabled={isBooked}
                                    onClick={() => toggleSeat(seat.seatId)}
                                    className={`rounded-lg px-2 py-2 text-xs font-semibold transition-all duration-150 ${
                                        isBooked
                                            ? "cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-500"
                                            : selected
                                              ? "-translate-y-0.5 scale-105 bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 shadow-lg"
                                              : "bg-cyan-500/20 text-cyan-200 hover:-translate-y-0.5 hover:bg-cyan-500/30"
                                    }`}
                                >
                                    {selected
                                        ? `✓ ${formatSeatLabel(seat)}`
                                        : formatSeatLabel(seat)}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-200">
                            Ghe dang chon: {selectedSeatLabels.length}
                        </p>
                        <button
                            type="button"
                            onClick={() => setSelectedSeatIds([])}
                            disabled={selectedSeatLabels.length === 0}
                            className="rounded-lg border border-slate-600 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Bo chon tat ca
                        </button>
                    </div>

                    {selectedSeatLabels.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selectedSeatLabels.map((seatLabel) => (
                                <span
                                    key={seatLabel}
                                    className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                                >
                                    {seatLabel}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">
                            Chua chon ghe nao.
                        </p>
                    )}
                </div>

                <label className="block text-sm font-medium text-slate-300">
                    Ghi chu booking
                    <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="VD: uu tien ghe giua"
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 focus:ring"
                        rows={3}
                    />
                </label>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => void handleCreateBooking()}
                        disabled={
                            bookingLoading || selectedSeatIds.length === 0
                        }
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {bookingLoading
                            ? "Dang dat ve..."
                            : `Dat ve va thanh toan (${selectedSeatIds.length} ghe)`}
                    </button>

                    <p className="text-sm text-slate-400">
                        Socket:{" "}
                        <span className="font-semibold text-cyan-300">
                            {socketState}
                        </span>
                    </p>
                </div>

                {latestBooking && (
                    <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300">
                        Booking moi nhat: #{latestBooking.id} - Code{" "}
                        {latestBooking.bookingCode} - Status{" "}
                        {latestBooking.status}
                    </div>
                )}

                {paymentState !== "idle" && (
                    <div
                        className={`rounded-xl p-3 text-sm font-medium ${
                            paymentState === "success"
                                ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                                : paymentState === "failed"
                                  ? "border border-red-300 bg-red-50 text-red-700"
                                  : "border border-amber-300 bg-amber-50 text-amber-700"
                        }`}
                    >
                        {paymentMessage}
                    </div>
                )}
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-[0_14px_35px_rgba(2,6,23,0.5)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-bold text-cyan-200">
                        Thong bao realtime
                    </h2>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={connect}
                            className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950"
                        >
                            Ket noi lai
                        </button>
                        <button
                            type="button"
                            onClick={clearNotifications}
                            className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300"
                        >
                            Xoa log
                        </button>
                    </div>
                </div>

                <ul className="space-y-2">
                    {userNotifications.slice(0, 12).map((item) => {
                        const payload = toSocketPayload(item.payload);

                        return (
                            <li
                                key={item.id}
                                className="rounded-xl border border-slate-700 bg-slate-950/60 p-3"
                            >
                                <p className="text-xs font-semibold text-slate-400">
                                    {item.receivedAt}
                                </p>
                                <p className="text-sm font-medium text-cyan-200">
                                    {payload?.eventType ?? "UNKNOWN_EVENT"}
                                </p>
                                <p className="text-sm text-slate-300">
                                    {payload?.message ?? "Khong co noi dung"}
                                </p>
                            </li>
                        );
                    })}
                </ul>

                {userNotifications.length === 0 && (
                    <p className="text-sm text-slate-400">
                        Chua co thong bao nao tu socket.
                    </p>
                )}
            </section>
        </section>
    );
};

export default DetailPage;
