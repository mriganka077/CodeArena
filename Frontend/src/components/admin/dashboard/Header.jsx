import { useEffect, useState } from "react";

import {
    Clock,
    Eye,
    Server,
    Trophy,
    FileText,
    Plug,
} from "lucide-react";

import NotificationPanel from "./NotificationPanel";

const headerNav = [
    {
        label: "Overview",
        Icon: Eye,
    },
    {
        label: "Drives",
        Icon: Server,
    },
    {
        label: "Results",
        Icon: Trophy,
    },
    {
        label: "Reports",
        Icon: FileText,
    },
    {
        label: "Integrations",
        Icon: Plug,
    },
];

const Header = ({ now }) => {

    const [admin, setAdmin] = useState(null);

    const initials = admin?.name
        ? admin.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "A";

    useEffect(() => {

        const fetchAdmin = async () => {

            try {

                const token = localStorage.getItem("adminToken");

                if (!token) return;

                const API_URL = import.meta.env.VITE_API_URL;

                const res = await fetch(
                    `${API_URL}/admin/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();

                if (data.success) {
                    setAdmin(data.admin);
                }

            } catch (error) {
                console.error(error);
            }
        };

        fetchAdmin();

    }, []);
    const fmt = (d) =>
        d.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        }) +
        " " +
        d.toLocaleTimeString("en-US", {
            hour12: false,
        });

    return (
        <header
            className="flex items-center justify-between px-6 py-3 border-b border-white/5 backdrop-blur-sm sticky top-0 z-50"
            style={{
                background:
                    "rgba(13,10,26,0.88)",
            }}
        >
            <div className="flex items-center gap-3">
                <span className="
                        font-bold tracking-tight
                        text-slate-200
                        hover:text-white
                        transition-all duration-300
                        cursor-pointer
                    "
                >
                    Code<span className="text-violet-400">Arena</span>
                </span>

                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/40 text-purple-400 uppercase tracking-widest">
                    Pro
                </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
                {headerNav.map(
                    ({ label, Icon }) => (
                        <button
                            key={label}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/45 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <Icon size={13} />
                            {label}
                        </button>
                    )
                )}
            </nav>

            <div className="flex items-center gap-3">
                <span className="text-white/35 text-[11px] hidden lg:flex items-center gap-1.5">
                    <Clock size={12} />
                    {fmt(now)}
                </span>

                {/* notification */}
                <NotificationPanel />

                {/* avatar */}
                <div
                    className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex items-center justify-center text-xs font-bold text-white"
                    style={{
                        background:
                            "linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)",
                    }}
                >
                    {admin?.photo ? (
                        <img
                            src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${admin.photo}`}
                            alt="admin"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;