import { type FormEvent, useState } from "react";
import type { RegisterRequest } from "../types/domain";

type LoginPageProps = {
    loginLoading: boolean;
    registerLoading: boolean;
    errorMessage: string;
    onLoginSubmit: (username: string, password: string) => Promise<void>;
    onRegisterSubmit: (request: RegisterRequest) => Promise<void>;
};

type AuthMode = "login" | "register";

const LoginPage = ({
    loginLoading,
    registerLoading,
    errorMessage,
    onLoginSubmit,
    onRegisterSubmit,
}: LoginPageProps) => {
    const [mode, setMode] = useState<AuthMode>("login");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerUsername, setRegisterUsername] = useState("");
    const [registerFullName, setRegisterFullName] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
        useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === "login") {
            await onLoginSubmit(username, password);
            return;
        }

        await onRegisterSubmit({
            email: registerEmail,
            username: registerUsername,
            fullName: registerFullName.trim() || undefined,
            password: registerPassword,
            confirmPassword: registerConfirmPassword,
        });
    };

    const isSubmitting = mode === "login" ? loginLoading : registerLoading;

    return (
        <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur">
            <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Movie Event Platform
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-100 md:text-3xl">
                    {mode === "login"
                        ? "Dang nhap he thong"
                        : "Dang ky tai khoan"}
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                    {mode === "login"
                        ? "Su dung tai khoan backend de vao trang chu quan ly."
                        : "Tao tai khoan moi theo dung schema RegisterRequest cua backend."}
                </p>
            </div>

            <div
                className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 p-1"
                role="tablist"
                aria-label="auth mode"
            >
                <button
                    type="button"
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        mode === "login"
                            ? "bg-cyan-500 text-slate-900"
                            : "text-slate-300 hover:bg-slate-800"
                    }`}
                    onClick={() => setMode("login")}
                >
                    Dang nhap
                </button>
                <button
                    type="button"
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        mode === "register"
                            ? "bg-cyan-500 text-slate-900"
                            : "text-slate-300 hover:bg-slate-800"
                    }`}
                    onClick={() => setMode("register")}
                >
                    Dang ky
                </button>
            </div>

            <form className="grid gap-3" onSubmit={handleSubmit}>
                {mode === "login" ? (
                    <>
                        <label className="grid gap-1 text-sm font-medium text-slate-300">
                            Username
                            <input
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                placeholder="nhap username"
                                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400 focus:ring"
                                required
                            />
                        </label>

                        <label className="grid gap-1 text-sm font-medium text-slate-300">
                            Password
                            <div className="relative">
                                <input
                                    type={
                                        showLoginPassword ? "text" : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="nhap password"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pr-14 text-slate-100 outline-none ring-cyan-400 focus:ring"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowLoginPassword((prev) => !prev)
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-cyan-300"
                                >
                                    {showLoginPassword ? "An" : "Hien"}
                                </button>
                            </div>
                        </label>
                    </>
                ) : (
                    <>
                        <label className="grid gap-1 text-sm font-medium text-slate-300">
                            Email
                            <input
                                type="email"
                                value={registerEmail}
                                onChange={(event) =>
                                    setRegisterEmail(event.target.value)
                                }
                                placeholder="email@example.com"
                                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400 focus:ring"
                                required
                            />
                        </label>

                        <label className="grid gap-1 text-sm font-medium text-slate-300">
                            Username
                            <input
                                value={registerUsername}
                                onChange={(event) =>
                                    setRegisterUsername(event.target.value)
                                }
                                placeholder="nhap username"
                                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400 focus:ring"
                                required
                            />
                        </label>

                        <label className="grid gap-1 text-sm font-medium text-slate-300">
                            Full Name
                            <input
                                value={registerFullName}
                                onChange={(event) =>
                                    setRegisterFullName(event.target.value)
                                }
                                placeholder="nhap ho ten"
                                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-400 focus:ring"
                                required
                            />
                        </label>

                        <label className="grid gap-1 text-sm font-medium text-slate-300">
                            Password
                            <div className="relative">
                                <input
                                    type={
                                        showRegisterPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={registerPassword}
                                    onChange={(event) =>
                                        setRegisterPassword(event.target.value)
                                    }
                                    placeholder="toi thieu 6 ky tu"
                                    minLength={6}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pr-14 text-slate-100 outline-none ring-cyan-400 focus:ring"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowRegisterPassword((prev) => !prev)
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-cyan-300"
                                >
                                    {showRegisterPassword ? "An" : "Hien"}
                                </button>
                            </div>
                        </label>

                        <label className="grid gap-1 text-sm font-medium text-slate-300">
                            Confirm Password
                            <div className="relative">
                                <input
                                    type={
                                        showRegisterConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={registerConfirmPassword}
                                    onChange={(event) =>
                                        setRegisterConfirmPassword(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="nhap lai mat khau"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 pr-14 text-slate-100 outline-none ring-cyan-400 focus:ring"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowRegisterConfirmPassword(
                                            (prev) => !prev,
                                        )
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-cyan-300"
                                >
                                    {showRegisterConfirmPassword
                                        ? "An"
                                        : "Hien"}
                                </button>
                            </div>
                        </label>
                    </>
                )}

                {errorMessage && (
                    <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300">
                        {errorMessage}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting
                        ? mode === "login"
                            ? "Dang dang nhap..."
                            : "Dang tao tai khoan..."
                        : mode === "login"
                          ? "Dang nhap"
                          : "Dang ky"}
                </button>
            </form>
        </section>
    );
};

export default LoginPage;
