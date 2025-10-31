import { Link, NavLink, useLocation } from "react-router-dom";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// function ThemeToggle() {
//     const [dark, setDark] = useState<boolean>(() => {
//         return localStorage.getItem("theme") === "dark" || localStorage.getItem("theme") === null;
//     });

//     useEffect(() => {
//         if (dark) {
//             document.documentElement.classList.add("dark");
//             localStorage.setItem("theme", "dark");
//         } else {
//             document.documentElement.classList.remove("dark");
//             localStorage.setItem("theme", "light");
//         }
//     }, [dark]);

//     return (
//         <button
//             aria-label="Toggle theme"
//             onClick={() => setDark((v) => !v)}
//             className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
//         >
//             {dark ? "☀️ Light" : "🌙 Dark"}
//         </button>
//     );
// }

function DownloadButton() {
    return (
        <a
            href="/summary.pdf"
            download="SnapMind_Summary.pdf"
            className="rounded-lg border border-cyan-700/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20 hover:border-cyan-600"
        >
            ↓ Download
        </a>
    );
}

function PrivacyBadge() {
    return (
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Local-first • Private
        </span>
    );
}

function Brand() {
    return (
        <Link to="/" className="group inline-flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg transition-transform group-hover:scale-105" />
            <span className="text-xl font-extrabold tracking-tight text-zinc-100">SnapMind</span>
        </Link>
    );
}

function Header() {
    const { pathname } = useLocation();
    const nav = useMemo(
        () => [
            { to: "/", label: "Dashboard" },
            { to: "/analytics", label: "Analytics" },
             { to: "/settings", label: "Settings" },
        ],
        [],
    );
    return (
        <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-900/95 backdrop-blur-lg supports-[backdrop-filter]:bg-zinc-900/80">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Brand />
                    <nav className="hidden md:flex items-center gap-2">
                        {nav.map((n) => (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                className={({ isActive }) =>
                                    cn(
                                        "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                                        isActive || pathname === n.to
                                            ? "bg-cyan-500/20 text-cyan-400"
                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800",
                                    )
                                }
                            >
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <PrivacyBadge />
                    <DownloadButton />
                    {/* <ThemeToggle /> */}
                </div>
            </div>
        </header>
    );
}

function Footer() {
    return (
        <footer className="border-t border-zinc-800/60 bg-zinc-900/50">
            <div className="container flex flex-col items-center justify-between gap-3 py-6 md:h-16 md:flex-row">
                <p className="text-xs text-zinc-500">
                    © {new Date().getFullYear()} SnapMind. Your private memory assistant.
                </p>
                <div className="inline-flex items-center gap-4 text-xs text-zinc-500">
                    <a href="#" className="transition-colors hover:text-cyan-400">
                        Privacy
                    </a>
                    <a href="#" className="transition-colors hover:text-cyan-400">
                        Terms
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-zinc-950">
            <Header />
            <main className="container py-8 md:py-10">{children}</main>
            <Footer />
        </div>
    );
}