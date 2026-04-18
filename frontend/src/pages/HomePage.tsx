import type { MovieResponse } from "../types/domain";

type HomePageProps = {
    username: string;
    movies: MovieResponse[];
    moviesLoading: boolean;
    errorMessage: string;
    onLoadMovies: () => Promise<void>;
    onOpenMovieDetail: (movieId: number) => void;
    onLogout: () => void;
};

const formatReleaseDate = (value?: string): string => {
    if (!value) {
        return "Dang cap nhat";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString();
};

const HomePage = ({
    username,
    movies,
    moviesLoading,
    errorMessage,
    onLoadMovies,
    onOpenMovieDetail,
    onLogout,
}: HomePageProps) => {
    return (
        <section className="space-y-6 text-slate-100">
            <header className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.6)]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Trang chu
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-100 md:text-3xl">
                    Xin chao, {username || "User"}
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
                    Danh sach phim dang duoc lay tu backend. Bam vao tung card
                    de mo trang chi tiet va xem so ghe con trong theo suat
                    chieu.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => void onLoadMovies()}
                        disabled={moviesLoading}
                        className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {moviesLoading
                            ? "Dang tai phim..."
                            : "Lam moi danh sach"}
                    </button>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                    >
                        Dang xuat
                    </button>
                </div>
            </header>

            {errorMessage && (
                <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-sm font-medium text-red-300">
                    {errorMessage}
                </div>
            )}

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-cyan-200">
                    Danh sach phim
                </h2>
                <p className="text-sm font-medium text-slate-400">
                    Tong: {movies.length}
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {movies.map((movie) => (
                    <article
                        key={movie.id}
                        className="group overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80 shadow-[0_14px_35px_rgba(2,6,23,0.5)] transition hover:-translate-y-0.5 hover:border-cyan-400/50"
                    >
                        <div className="aspect-[16/9] bg-slate-800">
                            {movie.posterUrl ? (
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-cyan-900 text-lg font-bold text-cyan-200">
                                    {movie.title.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 p-4">
                            <div>
                                <h3 className="line-clamp-1 text-lg font-bold text-slate-100">
                                    {movie.title}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                                    {movie.description ||
                                        "Chua co mo ta cho phim nay."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-300">
                                <span className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1">
                                    Genre: {movie.genre ?? "N/A"}
                                </span>
                                <span className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1">
                                    Rating: {movie.rating ?? "N/A"}
                                </span>
                                <span className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1">
                                    Duration: {movie.duration ?? "N/A"}m
                                </span>
                                <span className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1">
                                    Status: {movie.status ?? "N/A"}
                                </span>
                            </div>

                            <p className="text-xs text-slate-500">
                                Release: {formatReleaseDate(movie.releaseDate)}
                            </p>

                            <button
                                type="button"
                                onClick={() => onOpenMovieDetail(movie.id)}
                                className="w-full rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition group-hover:bg-cyan-400"
                            >
                                Xem chi tiet phim
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {!moviesLoading && movies.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
                    Chua co du lieu phim. Bam "Lam moi danh sach" de tai lai.
                </div>
            )}
        </section>
    );
};

export default HomePage;
