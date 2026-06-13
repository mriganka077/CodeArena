import React, {
  useEffect,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardList,
  Mic,
} from "lucide-react";

import CircleProgress from "../charts/CircleProgress";
import CountUp from "./CountUp";

const KPICards = () => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    assessmentsCompleted: 0,
    interviewsConducted: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          "/api/dashboard/stats",
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error(
          "Dashboard stats error:",
          error
        );
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total Candidates",
      value: stats.totalCandidates,
      sub: "Registered candidates",
      pct: 73,
      color: "#8b5cf6",
      glow: "rgba(139,92,246,0.28)",
      Icon: Users,
    },
    {
      label: "Assessments Completed",
      value: stats.assessmentsCompleted,
      sub: "Completed assessments",
      pct: 80,
      color: "#fb7185",
      glow: "rgba(244,63,94,0.28)",
      Icon: ClipboardList,
    },
    {
      label: "Interviews Conducted",
      value: stats.interviewsConducted,
      sub: "Finished interviews",
      pct: 85,
      color: "#facc15",
      glow: "rgba(250,204,21,0.22)",
      Icon: Mic,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {cards.map((c, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: i * 0.1,
          }}
          className="relative overflow-hidden rounded-[28px] border border-white/[0.08] p-6 flex items-center gap-6 backdrop-blur-xl"
          style={{
            background:
              "rgba(255,255,255,0.03)",
          }}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background: `radial-gradient(circle at top left, ${c.glow} 0%, transparent 90%)`,
            }}
          />

          <div className="relative z-10">
            <CircleProgress
              pct={c.pct}
              size={82}
              stroke={6}
              color={c.color}
            />
          </div>

          <div className="relative z-10 flex-1">
            <p className="text-white/65 text-sm mb-2">
              {c.label}
            </p>

            <h2 className="text-[30px] font-black text-white">
              <CountUp end={c.value} />
            </h2>

            <p
              className="text-sm mt-3 font-semibold"
              style={{
                color: c.color,
              }}
            >
              {c.sub}
            </p>
          </div>

          <div className="relative z-10">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: c.glow,
              }}
            >
              <c.Icon
                size={24}
                style={{
                  color: c.color,
                }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default KPICards;