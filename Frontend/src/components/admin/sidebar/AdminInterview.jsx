import React, {
  useState,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Plus, Search, X, ChevronRight, ChevronDown,
  SlidersHorizontal, Users, Star, BarChart2, Clock,
  Calendar, CheckCircle2, AlertCircle, Download,
  ArrowUpRight, Mic, MicOff, Camera, CameraOff,
  MessageSquare, FileText, Briefcase,
  TrendingUp, Award, Play, Pause, MoreHorizontal,
  Filter, RefreshCw, Send, ThumbsUp, ThumbsDown,
  ClipboardList, Zap, Eye, Edit3, Copy,
  PhoneOff, CircleDot, Timer,
  ChevronLeft, Hash, BookOpen, Folder, Mail, Target,
} from "lucide-react";
import ScheduleInterviewModal from "../drive/ScheduleInterviewModal";

// ── mock data ─────────────────────────────────────────────────────────────────


// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_META = {
  Scheduled:    { cls: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25",    dot: "#818cf8" },
  Completed:    { cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25", dot: "#4ade80" },
  "In Progress":{ cls: "bg-amber-500/15 text-amber-400 border border-amber-500/25",       dot: "#fbbf24" },
  "No-Show":    { cls: "bg-rose-500/15 text-rose-400 border border-rose-500/25",           dot: "#f87171" },
};

const TYPE_META = {
  Technical: { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)" },
  HR:        { color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.25)"  },
  Design:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
};

const REC_META = {
  "Strong Hire": { color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.25)"  },
  "Hire":        { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)" },
  "No Hire":     { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
};

const DIFFICULTY_META = {
  easy:   { label: "Easy",   color: "#4ade80", bg: "rgba(74,222,128,0.1)",   border: "rgba(74,222,128,0.3)"   },
  medium: { label: "Medium", color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.3)"   },
  hard:   { label: "Hard",   color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.3)"  },
  expert: { label: "Expert", color: "#a78bfa", bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.3)"  },
};

const AVATAR_COLORS = ["#6366f1","#8b5cf6","#a855f7","#ec4899","#f59e0b","#10b981","#0ea5e9","#f43f5e"];
const avatarColor = (s) => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];

const fmtDate     = (iso) => new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
const fmtTime     = (iso) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
const fmtDateTime = (iso) => `${fmtDate(iso)} · ${fmtTime(iso)}`;

const isToday = (iso) => {
  const d = new Date(iso), n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
};

// ── MiniBar ───────────────────────────────────────────────────────────────────
const MiniBar = ({ pct, color }) => (
  <div className="h-1 rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
    <motion.div
      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="h-full rounded-full" style={{ background: color }}
    />
  </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ initials, size = 36, pulse = false }) => {
  const color = avatarColor(initials);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full flex items-center justify-center font-bold"
        style={{ width: size, height: size, fontSize: size * 0.32, background: `${color}22`, border: `1.5px solid ${color}50`, color }}
      >
        {initials}
      </div>
      {pulse && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[#0a0816] animate-pulse" />}
    </div>
  );
};

// ── Difficulty Badge ──────────────────────────────────────────────────────────
const DifficultyBadge = ({ level }) => {
  const m = DIFFICULTY_META[level];
  if (!m) return null;
  return (
    <span
      className="px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1"
      style={{ background: m.bg, borderColor: m.border, color: m.color }}
    >
      <Zap size={8} /> {m.label}
    </span>
  );
};

// ── Focus Area Pills ──────────────────────────────────────────────────────────
const FocusPills = ({ areas, max = 3 }) => {
  if (!areas?.length) return null;
  const shown = areas.slice(0, max);
  const rest  = areas.length - max;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((a) => (
        <span key={a} className="px-1.5 py-0.5 rounded text-[9px] font-semibold border border-indigo-500/20 text-indigo-300"
          style={{ background: "rgba(99,102,241,0.08)" }}>
          {a}
        </span>
      ))}
      {rest > 0 && (
        <span className="px-1.5 py-0.5 rounded text-[9px] border border-white/10 text-white/30"
          style={{ background: "rgba(255,255,255,0.03)" }}>
          +{rest}
        </span>
      )}
    </div>
  );
};

// ── Interview Card ────────────────────────────────────────────────────────────
const InterviewCard = ({ interview: iv, onClick }) => {
  const sm    = STATUS_META[iv.status] ?? STATUS_META.Scheduled;
  const tm    = TYPE_META[iv.type]     ?? TYPE_META.Technical;
  const today = isToday(iv.scheduledAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      onClick={onClick}
      className="rounded-2xl border border-white/[0.06] overflow-hidden cursor-pointer group flex flex-col"
      style={{ background: "rgba(255,255,255,0.025)" }}
    >
      {/* top accent bar */}
      <div className="h-[3px] shrink-0"
        style={{ background: `linear-gradient(90deg,${avatarColor(iv.avatar)},${avatarColor(iv.avatar)}55,transparent)` }} />

      <div className="p-5 space-y-3.5 flex-1 flex flex-col">

        {/* header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar initials={iv.avatar} pulse={iv.status === "In Progress"} />
            <div>
              <p className="text-white font-bold text-sm leading-tight group-hover:text-indigo-200 transition">{iv.candidate}</p>
              <p className="text-white/35 text-[10px] mt-0.5">{iv.role}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shrink-0 ${sm.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
            {iv.status}
          </span>
        </div>

        {/* drive */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/5"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <Folder size={10} className="text-indigo-400 shrink-0" />
          <span className="text-white/45 text-[10px] truncate">{iv.drive}</span>
        </div>

        {/* meta chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
            style={{ background: tm.bg, borderColor: tm.border, color: tm.color }}>
            {iv.type}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-white/40 flex items-center gap-1">
            <Hash size={8} /> {iv.round}
          </span>
          {iv.difficulty && <DifficultyBadge level={iv.difficulty} />}
          {today && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border border-amber-500/30 text-amber-400"
              style={{ background: "rgba(251,191,36,0.08)" }}>
              Today
            </span>
          )}
        </div>

        {/* focus areas */}
        {iv.focusAreas?.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/25 font-semibold mb-1">Focus</p>
            <FocusPills areas={iv.focusAreas} max={3} />
          </div>
        )}

        {/* time & duration */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Start",    val: fmtDateTime(iv.scheduledAt), Icon: Calendar },
            { label: "Duration", val: `${iv.duration} min`,        Icon: Timer    },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-2.5 border border-white/[0.05] flex flex-col gap-1"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center gap-1 text-white/25">
                <s.Icon size={9} /><p className="text-[9px] uppercase tracking-wider">{s.label}</p>
              </div>
              <p className="text-white text-[10px] font-semibold leading-snug">{s.val}</p>
            </div>
          ))}
        </div>

        {/* AI interview indicator + score */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-500/15"
          style={{ background: "rgba(99,102,241,0.06)" }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)" }}>
            <Zap size={11} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-indigo-300/80 text-[11px] font-semibold">AI Interview</p>
            <p className="text-white/25 text-[10px]">Automated assessment</p>
          </div>
          {iv.score !== null && (
            <div className="text-right shrink-0">
              <p className="font-bold text-sm" style={{ color: iv.score >= 80 ? "#4ade80" : iv.score >= 65 ? "#facc15" : "#f87171" }}>{iv.score}</p>
              <p className="text-white/25 text-[9px]">Score</p>
            </div>
          )}
        </div>

        {/* special instructions snippet */}
        {iv.instructions && (
          <div className="px-2.5 py-2 rounded-lg border border-amber-500/15 flex items-start gap-1.5"
            style={{ background: "rgba(251,191,36,0.05)" }}>
            <FileText size={10} className="text-amber-400/60 mt-0.5 shrink-0" />
            <p className="text-amber-300/60 text-[10px] leading-snug line-clamp-1">{iv.instructions}</p>
          </div>
        )}

        {/* bottom row */}
        <div className="flex items-center justify-between mt-auto pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-white/25 text-[10px]">Assessment:</span>
            <span className="text-white/70 text-[10px] font-bold">{iv.assessmentScore}</span>
            <span className="text-white/20 text-[10px]">· Rank #{iv.rank}</span>
          </div>
          {iv.recommendation ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
              style={{ background: REC_META[iv.recommendation]?.bg, borderColor: REC_META[iv.recommendation]?.border, color: REC_META[iv.recommendation]?.color }}>
              {iv.recommendation}
            </span>
          ) : (
            <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Interview Drawer ──────────────────────────────────────────────────────────
const InterviewDrawer = ({ interview: iv, onClose }) => {
  const [tab, setTab] = useState("details");
  const [note, setNote] = useState(iv?.notes || "");

  if (!iv) return null;

  const sm = STATUS_META[iv.status] ?? STATUS_META.Scheduled;
  const tm = TYPE_META[iv.type]     ?? TYPE_META.Technical;

  return (
    <AnimatePresence>
      <motion.div key="ov"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside key="dr"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full w-full max-w-[480px] z-50 flex flex-col border-l border-white/8 overflow-y-auto"
        style={{ background: "rgba(10,8,22,0.99)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* top gradient line */}
        <div className="h-[3px] shrink-0"
          style={{ background: `linear-gradient(90deg,${avatarColor(iv.avatar)},#8b5cf6,transparent)` }} />

        {/* sticky header */}
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-white/6"
          style={{ background: "rgba(10,8,22,0.97)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar initials={iv.avatar} size={40} pulse={iv.status === "In Progress"} />
              <div>
                <p className="text-white font-bold text-sm">{iv.candidate}</p>
                <p className="text-white/35 text-[11px] mt-0.5">{iv.role} · {iv.round}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Folder size={9} className="text-indigo-400" />
                  <span className="text-indigo-300/60 text-[9px]">{iv.drive}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${sm.cls}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                {iv.status}
              </span>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/6 transition">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* tabs */}
          <div className="flex gap-1 mt-4">
            {["details", "difficulty", "email", "feedback", "candidate"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition border ${tab === t
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "text-white/35 border-transparent hover:text-white/60"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5">

          {/* ── DETAILS TAB ── */}
          {tab === "details" && (<>

            {/* if in progress — live banner */}
            {iv.status === "In Progress" && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-3.5 flex items-center gap-3 border border-amber-500/25"
                style={{ background: "rgba(251,191,36,0.06)" }}>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <div className="flex-1">
                  <p className="text-amber-300 text-xs font-semibold">AI Interview in progress</p>
                  <p className="text-amber-400/50 text-[10px] mt-0.5">Session started at {fmtTime(iv.scheduledAt)}</p>
                </div>
                <div className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5"
                  style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)", color: "#a5b4fc" }}>
                  <Zap size={11} /> Live
                </div>
              </motion.div>
            )}

            {/* score + recommendation */}
            {iv.status === "Completed" && (
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Interview Score",  val: iv.score ?? "—",    color: iv.score >= 80 ? "#4ade80" : iv.score >= 65 ? "#facc15" : "#f87171", Icon: Star },
                  { label: "Assessment Score", val: iv.assessmentScore, color: "#818cf8", Icon: BarChart2 },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-3 border border-white/5 flex items-center gap-2.5"
                    style={{ background: "rgba(255,255,255,0.025)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${item.color}18`, border: `1px solid ${item.color}35` }}>
                      <item.Icon size={14} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-base leading-none">{item.val}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* recommendation badge */}
            {iv.recommendation && (
              <div className="rounded-xl p-4 border flex items-center gap-3"
                style={{ background: REC_META[iv.recommendation]?.bg ?? "rgba(255,255,255,0.02)", borderColor: REC_META[iv.recommendation]?.border ?? "rgba(255,255,255,0.05)" }}>
                {iv.recommendation === "Strong Hire" && <ThumbsUp size={16} style={{ color: REC_META[iv.recommendation]?.color }} />}
                {iv.recommendation === "Hire"        && <CheckCircle2 size={16} style={{ color: REC_META[iv.recommendation]?.color }} />}
                {iv.recommendation === "No Hire"     && <ThumbsDown size={16} style={{ color: REC_META[iv.recommendation]?.color }} />}
                <div>
                  <p className="text-xs font-bold" style={{ color: REC_META[iv.recommendation]?.color }}>{iv.recommendation}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">Recommendation by AI assessment</p>
                </div>
              </div>
            )}

            {/* schedule info */}
            <section>
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Schedule</p>
              <div className="space-y-2.5">
                {[
                  { Icon: Calendar, label: "Start",       val: fmtDateTime(iv.scheduledAt) },
                  { Icon: Calendar, label: "End",         val: iv.endDate ? fmtDateTime(iv.endDate) : "—" },
                  { Icon: Timer,    label: "Duration",    val: `${iv.duration} minutes` },
                  { Icon: Video,    label: "Type",        val: iv.type, color: tm.color },
                ].map(({ Icon, label, val, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <Icon size={12} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <p className="text-white/35 text-[11px]">{label}</p>
                      <p className="text-xs font-medium" style={{ color: color || "rgba(255,255,255,0.65)" }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* AI conducted banner */}
            <div className="rounded-xl p-3.5 border border-indigo-500/20 flex items-center gap-3"
              style={{ background: "rgba(99,102,241,0.06)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)" }}>
                <Zap size={16} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-semibold">Conducted by AI</p>
                <p className="text-indigo-300/40 text-[10px] mt-0.5">Fully automated interview — no human interviewer</p>
              </div>
            </div>

            {/* tags */}
            <section>
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Skills Focus</p>
              <div className="flex flex-wrap gap-1.5">
                {iv.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                    style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                    {t}
                  </span>
                ))}
              </div>
            </section>
          </>)}

          {/* ── DIFFICULTY TAB ── */}
          {tab === "difficulty" && (
            <div className="space-y-5">

              {/* difficulty level */}
              <section>
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Difficulty Level</p>
                {iv.difficulty ? (() => {
                  const dm = DIFFICULTY_META[iv.difficulty];
                  return (
                    <div className="rounded-xl p-4 border flex items-center gap-3"
                      style={{ background: dm.bg, borderColor: dm.border }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${dm.color}20`, border: `1px solid ${dm.color}40` }}>
                        <Zap size={16} style={{ color: dm.color }} />
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: dm.color }}>{dm.label}</p>
                        <p className="text-white/30 text-[10px] mt-0.5">Interview difficulty setting</p>
                      </div>
                    </div>
                  );
                })() : (
                  <p className="text-white/25 text-xs">No difficulty set</p>
                )}
              </section>

              {/* focus areas */}
              <section>
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Question Focus Areas</p>
                {iv.focusAreas?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {iv.focusAreas.map((area) => (
                      <span key={area}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border"
                        style={{ background: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/25 text-xs">No focus areas set</p>
                )}
              </section>

              {/* special instructions */}
              <section>
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Special Instructions</p>
                {iv.instructions ? (
                  <div className="rounded-xl p-4 border border-amber-500/20"
                    style={{ background: "rgba(251,191,36,0.05)" }}>
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-500/10">
                      <FileText size={12} className="text-amber-400" />
                      <p className="text-amber-300/80 text-[11px] font-bold uppercase tracking-widest">Instructions</p>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed">{iv.instructions}</p>
                  </div>
                ) : (
                  <div className="rounded-xl p-4 text-center border border-white/5"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-white/20 text-xs">No special instructions provided</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── EMAIL TAB ── */}
          {tab === "email" && (
            <div className="space-y-4">

              {/* subject */}
              <section>
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Email Subject</p>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/5"
                  style={{ background: "rgba(255,255,255,0.025)" }}>
                  <Mail size={12} className="text-indigo-400 shrink-0" />
                  <p className="text-white/70 text-[11px] flex-1">{iv.emailSubject || "—"}</p>
                  {iv.emailSubject && (
                    <button className="text-white/25 hover:text-white/60 transition"><Copy size={11} /></button>
                  )}
                </div>
              </section>

              {/* body */}
              <section>
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Email Body</p>
                {iv.emailBody ? (
                  <div className="rounded-xl border border-indigo-500/15"
                    style={{ background: "rgba(99,102,241,0.04)" }}>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-indigo-500/10">
                      <div className="flex items-center gap-2">
                        <Mail size={11} className="text-indigo-400" />
                        <p className="text-indigo-300/70 text-[10px] font-bold uppercase tracking-widest">Invitation Email</p>
                      </div>
                      <button className="text-white/25 hover:text-white/60 transition"><Copy size={11} /></button>
                    </div>
                    <pre className="px-4 py-3 text-white/55 text-[11px] leading-relaxed whitespace-pre-wrap font-sans">
                      {iv.emailBody}
                    </pre>
                  </div>
                ) : (
                  <div className="rounded-xl p-6 text-center border border-white/5"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <Mail size={20} className="text-indigo-400/30 mx-auto mb-2" />
                    <p className="text-white/20 text-xs">No email body configured</p>
                  </div>
                )}
              </section>

              {/* resend action */}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10 transition"
                style={{ background: "rgba(99,102,241,0.06)" }}>
                <Send size={12} /> Resend Invitation Email
              </button>
            </div>
          )}

          {/* ── FEEDBACK TAB ── */}
          {tab === "feedback" && (
            <div className="space-y-4">
              {iv.status === "Completed" && iv.notes ? (
                <>
                  <div className="rounded-xl p-4 border border-indigo-500/15"
                    style={{ background: "rgba(99,102,241,0.05)" }}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-500/10">
                      <MessageSquare size={13} className="text-indigo-400" />
                      <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest">Interviewer Notes</p>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed">{iv.notes}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">Skill Ratings</p>
                    {[
                      { skill: "Technical Knowledge", score: 88 },
                      { skill: "Problem Solving",     score: 82 },
                      { skill: "Communication",       score: 90 },
                      { skill: "Culture Fit",         score: 85 },
                    ].map((s) => (
                      <div key={s.skill} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-white/50 text-[11px]">{s.skill}</span>
                          <span className="text-white/70 text-[11px] font-bold">{s.score}</span>
                        </div>
                        <MiniBar pct={s.score} color={s.score >= 85 ? "#4ade80" : s.score >= 70 ? "#facc15" : "#f87171"} />
                      </div>
                    ))}
                  </div>
                </>
              ) : iv.status === "Completed" ? (
                <div className="space-y-3">
                  <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">Add Feedback</p>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your interview feedback here…" rows={5}
                    className="w-full px-4 py-3 rounded-xl text-xs text-white/70 placeholder-white/20 border border-white/6 outline-none focus:border-indigo-500/40 resize-none transition"
                    style={{ background: "rgba(255,255,255,0.04)" }} />
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    <Send size={12} /> Submit Feedback
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <MessageSquare size={20} className="text-indigo-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">No feedback yet</p>
                  <p className="text-white/30 text-xs max-w-[200px]">Feedback will be available once the interview is completed.</p>
                </div>
              )}
            </div>
          )}

          {/* ── CANDIDATE TAB ── */}
          {tab === "candidate" && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 border border-white/5 flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.025)" }}>
                <Avatar initials={iv.avatar} size={52} />
                <div>
                  <p className="text-white font-bold text-base">{iv.candidate}</p>
                  <p className="text-white/40 text-xs mt-0.5">{iv.role}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-white/30 text-[10px]">Drive:</span>
                    <span className="text-indigo-300 text-[10px]">{iv.drive}</span>
                  </div>
                </div>
              </div>

              <section>
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Performance</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Assessment Score", val: iv.assessmentScore, color: "#818cf8", Icon: ClipboardList },
                    { label: "Drive Rank",       val: `#${iv.rank}`,      color: "#fbbf24", Icon: Award },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl p-3 border border-white/5 flex items-center gap-2.5"
                      style={{ background: "rgba(255,255,255,0.025)" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${item.color}18`, border: `1px solid ${item.color}35` }}>
                        <item.Icon size={14} style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-base leading-none">{item.val}</p>
                        <p className="text-white/30 text-[10px] mt-0.5">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">Assessment Score</p>
                  <span className="text-white font-bold text-sm">{iv.assessmentScore}/100</span>
                </div>
                <MiniBar pct={iv.assessmentScore} color="#818cf8" />
              </div>

              

              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
                <Eye size={13} /> Show All Candidates
              </button>
            </div>
          )}
        </div>

        {/* sticky footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-white/6 flex gap-2"
          style={{ background: "rgba(10,8,22,0.97)" }}>
          {iv.status === "Scheduled" || iv.status === "In Progress" ? (
            <>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
                <RefreshCw size={13} /> Reschedule
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <Zap size={13} /> View AI Session
              </button>
            </>
          ) : (
            <>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
                <Copy size={13} /> Duplicate
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <Edit3 size={13} /> Edit
              </button>
            </>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// ── Table Row ─────────────────────────────────────────────────────────────────
const TableRow = ({ iv, i, onClick }) => {
  const sm = STATUS_META[iv.status] ?? STATUS_META.Scheduled;
  const tm = TYPE_META[iv.type]     ?? TYPE_META.Technical;
  const dm = iv.difficulty ? DIFFICULTY_META[iv.difficulty] : null;
  return (
    <motion.tr
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
      onClick={onClick}
      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer group"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar initials={iv.avatar} size={30} pulse={iv.status === "In Progress"} />
          <div>
            <p className="text-white font-semibold text-xs">{iv.candidate}</p>
            <p className="text-white/30 text-[10px] mt-0.5">{iv.role}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${sm.cls}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
          {iv.status}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
          style={{ background: tm.bg, borderColor: tm.border, color: tm.color }}>
          {iv.type}
        </span>
      </td>
      <td className="px-5 py-3.5">
        {dm ? (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 w-fit"
            style={{ background: dm.bg, borderColor: dm.border, color: dm.color }}>
            <Zap size={8} /> {dm.label}
          </span>
        ) : <span className="text-white/20 text-xs">—</span>}
      </td>
      <td className="px-5 py-3.5 text-white/50 text-xs">{fmtDate(iv.scheduledAt)}</td>
      <td className="px-5 py-3.5 text-white/50 text-xs">{iv.round}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <Zap size={10} className="text-indigo-400" />
          </div>
          <span className="text-indigo-300/70 text-[10px] font-medium">AI</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        {iv.score !== null
          ? <span className="font-bold text-xs" style={{ color: iv.score >= 80 ? "#4ade80" : iv.score >= 65 ? "#facc15" : "#f87171" }}>{iv.score}</span>
          : <span className="text-white/20 text-xs">—</span>}
      </td>
      <td className="px-5 py-3.5">
        {iv.recommendation
          ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
              style={{ background: REC_META[iv.recommendation]?.bg, borderColor: REC_META[iv.recommendation]?.border, color: REC_META[iv.recommendation]?.color }}>
              {iv.recommendation}
            </span>
          : <span className="text-white/20 text-xs">—</span>}
      </td>
      <td className="px-5 py-3.5">
        <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
      </td>
    </motion.tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminInterview = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setStatus]   = useState("All");
  const [filterType, setType]       = useState("All");
  const [filterDiff, setDiff]       = useState("All");
  const [sortBy, setSortBy]         = useState("date");
  const [viewMode, setViewMode]     = useState("grid");
  const [selected, setSelected]     = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const statuses   = ["All", "Scheduled", "In Progress", "Completed", "No-Show"];
  const types      = ["All", "Technical", "HR", "Design"];
  const diffs      = ["All", "easy", "medium", "hard", "expert"];

  const filtered = interviews
    .filter((iv) => {
      const q = search.toLowerCase();
      const matchQ = !q || iv.candidate.toLowerCase().includes(q) || iv.role.toLowerCase().includes(q) || iv.round.toLowerCase().includes(q) || iv.drive.toLowerCase().includes(q);
      const matchS = filterStatus === "All" || iv.status === filterStatus;
      const matchT = filterType   === "All" || iv.type   === filterType;
      const matchD = filterDiff   === "All" || iv.difficulty === filterDiff;
      return matchQ && matchS && matchT && matchD;
    })
    .sort((a, b) => {
      if (sortBy === "score")      return (b.score ?? 0) - (a.score ?? 0);
      if (sortBy === "assessment") return b.assessmentScore - a.assessmentScore;
      return new Date(b.scheduledAt) - new Date(a.scheduledAt);
    });

  const total      = interviews.length;
  const scheduled  = interviews.filter((iv) => iv.status === "Scheduled").length;
  const inProgress = interviews.filter((iv) => iv.status === "In Progress").length;
  const scored     = interviews.filter((iv) => iv.score !== null);
  const avgScore   = scored.length ? Math.round(scored.reduce((s, iv) => s + iv.score, 0) / scored.length) : 0;
  const strongHires = interviews.filter((iv) => iv.recommendation === "Strong Hire").length;
  const todayCount  = interviews.filter((iv) => isToday(iv.scheduledAt)).length;

  useEffect(() => {

    let interval;
  
    const startRealtime = async () => {
  
      await fetchInterviews();
  
      interval = setInterval(() => {
  
        fetchInterviews();
  
      }, 1000); // every 1 second
    };
  
    startRealtime();
  
    return () => clearInterval(interval);
  
  }, []);
  
  const fetchInterviews = async () => {

    try {
  
      const token = localStorage.getItem("token");
  
      const response = await fetch(
        "http://localhost:4000/api/drives/admin",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
  
          cache: "no-store",
        }
      );
  
      const data = await response.json();
  
      if (data.success) {
  
        setInterviews((prev) => {
  
          const oldData = JSON.stringify(prev);
          const newData = JSON.stringify(data.interviews);
  
          return oldData !== newData
            ? data.interviews
            : prev;
        });
      }
  
    } catch (error) {
  
      console.log(error);
  
    } finally {
  
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full flex flex-col space-y-4">

        {/* page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Video size={15} className="text-indigo-400" />
              <p className="text-white/45 font-semibold text-[11px] uppercase tracking-widest">Interviews</p>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Interview Hub</h2>
            <p className="text-white/35 text-xs mt-0.5">
              {total} interviews · {todayCount} today · {inProgress > 0 && <span className="text-amber-400">{inProgress} live</span>}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <Plus size={13} /> Schedule Interview
          </motion.button>
        </div>

        {/* summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",        value: total,                  color: "#818cf8", Icon: Video    },
            { label: "Scheduled",    value: scheduled + inProgress, color: "#4ade80", Icon: Calendar },
            { label: "Avg Score",    value: avgScore || "—",        color: "#facc15", Icon: Star     },
            { label: "Strong Hires", value: strongHires,            color: "#38bdf8", Icon: ThumbsUp },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-3 border border-white/5 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.025)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}35` }}>
                <s.Icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-white font-bold text-xl leading-none">{s.value}</p>
                <p className="text-white/35 text-[11px] mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* today's interviews quick bar */}
        {interviews.filter((iv) => isToday(iv.scheduledAt)).length > 0 && (
          <div className="rounded-2xl border border-indigo-500/15 px-5 py-4"
            style={{ background: "rgba(99,102,241,0.05)" }}>
            <div className="flex items-center gap-2 mb-3">
              <CircleDot size={12} className="text-indigo-400" />
              <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest">Today's Schedule</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {interviews.filter((iv) => isToday(iv.scheduledAt)).map((iv) => {
                const sm = STATUS_META[iv.status];
                const dm = iv.difficulty ? DIFFICULTY_META[iv.difficulty] : null;
                return (
                  <button key={iv.id} onClick={() => setSelected(iv)}
                    className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/6 hover:bg-white/5 transition text-left"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <Avatar initials={iv.avatar} size={28} pulse={iv.status === "In Progress"} />
                    <div>
                      <p className="text-white text-[11px] font-semibold whitespace-nowrap">{iv.candidate}</p>
                      <p className="text-white/30 text-[9px] whitespace-nowrap">{fmtTime(iv.scheduledAt)} · {iv.round}</p>
                    </div>
                    {dm && (
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0"
                        style={{ background: dm.bg, borderColor: dm.border, color: dm.color }}>
                        {dm.label}
                      </span>
                    )}
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sm?.dot }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates, roles, drives, rounds…"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs text-white/80 placeholder-white/25 border border-white/6 outline-none focus:border-indigo-500/40 transition"
              style={{ background: "rgba(255,255,255,0.04)" }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
                <X size={12} />
              </button>
            )}
          </div>

          {/* status filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {statuses.map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border ${filterStatus === s
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "text-white/35 border-white/6 hover:bg-white/4 hover:text-white/60"}`}>
                {s}
              </button>
            ))}
          </div>

          {/* type filter */}
          <div className="relative">
            <select value={filterType} onChange={(e) => setType(e.target.value)}
              className="appearance-none pl-8 pr-6 py-2.5 rounded-xl text-xs text-white/60 border border-white/6 outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              {types.map((t) => <option key={t} value={t}>Type: {t}</option>)}
            </select>
            <Filter size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>

          {/* difficulty filter */}
          <div className="relative">
            <select value={filterDiff} onChange={(e) => setDiff(e.target.value)}
              className="appearance-none pl-8 pr-6 py-2.5 rounded-xl text-xs text-white/60 border border-white/6 outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              {diffs.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "Difficulty: All" : `${d.charAt(0).toUpperCase()}${d.slice(1)}`}
                </option>
              ))}
            </select>
            <Zap size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>

          {/* sort */}
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 rounded-xl text-xs text-white/60 border border-white/6 outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <option value="date">Sort: Date</option>
              <option value="score">Sort: Score</option>
              <option value="assessment">Sort: Assessment</option>
            </select>
            <SlidersHorizontal size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>

          {/* view toggle */}
          <div className="flex gap-1 p-1 rounded-xl border border-white/6" style={{ background: "rgba(255,255,255,0.03)" }}>
            {[{ key: "grid", Icon: Users }, { key: "table", Icon: BarChart2 }].map(({ key, Icon }) => (
              <button key={key} onClick={() => setViewMode(key)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${viewMode === key ? "bg-indigo-500/25 text-indigo-300" : "text-white/25 hover:text-white/60"}`}>
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        {/* content */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.length === 0
                ? <div className="col-span-full flex flex-col items-center py-16 text-white/20 gap-2">
                    <AlertCircle size={28} />
                    <p className="text-sm">No interviews match your filters.</p>
                  </div>
                : filtered.map((iv) => (
                    <InterviewCard key={iv.id} interview={iv} onClick={() => setSelected(iv)} />
                  ))}
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/5 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30 border-b border-white/5">
                      {["Candidate", "Status", "Type", "Difficulty", "Date", "Round", "Conducted By", "Score", "Recommendation", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0
                      ? <tr><td colSpan={10} className="px-5 py-12 text-center text-white/25">No interviews match your filters.</td></tr>
                      : filtered.map((iv, i) => (
                          <TableRow key={iv.id} iv={iv} i={i} onClick={() => setSelected(iv)} />
                        ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-white/25 text-[11px]">Showing {filtered.length} of {interviews.length} interviews</p>
                <button className="text-indigo-400 text-[11px] hover:text-indigo-300 flex items-center gap-1 transition">
                  Export CSV <Download size={11} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <InterviewDrawer interview={selected} onClose={() => setSelected(null)} />
      {showSchedule && <ScheduleInterviewModal onClose={() => setShowSchedule(false)} />}
    </>
  );
};

export default AdminInterview;