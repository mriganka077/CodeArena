// src/components/admin/dashboard/GreetingSection.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const GreetingSection = ({ now }) => {
    const [admin, setAdmin] = useState(null);

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
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <p className="text-white/35 text-xs mb-1 flex items-center gap-1.5">
                <Clock size={11} />
                {fmt(now)}
            </p>

            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                Welcome, {admin?.name || "Admin"}
            </h1>
        </motion.div>
    );
};

export default GreetingSection;