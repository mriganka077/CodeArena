import { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext.jsx";
import SoftBackdrop from "../../components/SoftBackdrop.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL?.replace("/api", "");
const API = API_URL;

const COLORS = {
  deepNavy: "#050816",
  darkPurple: "#1A0B2E",
  midPurple: "#2A1454",
  accent: "#6C63FF",
  accentLight: "#8B85FF",
  accentDim: "rgba(108,99,255,0.18)",
  cardDark: "#1F2937",
  grayMuted: "#A1A1AA",
  green: "#22C55E",
  amber: "#f59e0b",
  red: "#f87171",
};

// ── Global Styles ─────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

@keyframes spin { to { transform: rotate(360deg); } }

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(108,99,255,0.55), 0 0 28px 4px rgba(108,99,255,0.22); }
  70%  { box-shadow: 0 0 0 8px rgba(108,99,255,0),  0 0 28px 4px rgba(108,99,255,0.22); }
  100% { box-shadow: 0 0 0 0 rgba(108,99,255,0),    0 0 28px 4px rgba(108,99,255,0.22); }
}

@keyframes orb-drift {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(18px,-12px) scale(1.06); }
  66%      { transform: translate(-10px,16px) scale(0.96); }
}

@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

@keyframes tab-slide {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes bar-grow {
  from { width: 0%; }
}

@keyframes glow-pulse {
  0%,100% { opacity: 0.6; }
  50%      { opacity: 1; }
}

.profile-card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.profile-card-hover:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 48px rgba(108,99,255,0.22) !important;
}

.nav-btn-hover {
  transition: all 0.18s ease;
}
.nav-btn-hover:hover {
  background: rgba(108,99,255,0.12) !important;
  color: #8B85FF !important;
}

.action-btn-hover {
  transition: all 0.18s ease;
}
.action-btn-hover:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
}

.input-field:focus {
  outline: none;
  border-color: rgba(108,99,255,0.7) !important;
  box-shadow: 0 0 0 3px rgba(108,99,255,0.18), 0 0 12px rgba(108,99,255,0.12) !important;
}

.skill-chip-hover:hover {
  background: rgba(108,99,255,0.25) !important;
  border-color: rgba(108,99,255,0.5) !important;
  transform: translateY(-1px);
  transition: all 0.18s;
}

.section-animate {
  animation: fadeSlideUp 0.32s ease both;
}
`;

// ── Glassmorphism helper ──────────────────────────────────────────────────────
const glass = (opts = {}) => ({
  background: `linear-gradient(
  135deg,
  rgba(36, 20, 70, 0.11) 0%,
  rgba(28, 18, 60, 0.11) 50%,
  rgba(22, 16, 48, 0) 100%
)`,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: opts.active
    ? "1px solid rgba(108,99,255,0.40)"
    : "1px solid rgba(255,255,255,0.07)",
  boxShadow: opts.active
    ? "0 0 40px rgba(108,99,255,0.14), 0 8px 32px rgba(0,0,0,0.4)"
    : "0 8px 40px rgba(0,0,0,0.38)",
  borderRadius: opts.radius ?? 20,
  ...opts.extra,
});

const EMPTY_EDU = {
  _id: null,
  degree: "", institution: "", university: "",
  year: "", cgpa: "", current: false, docs: [],
};

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Icons ─────────────────────────────────────────────────────────────────────
const PencilIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const CheckIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const FileIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const ImageIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const UploadIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
  </svg>
);
const FolderOpenIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);
const UserIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const GraduationCapIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const IdCardIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <circle cx="8" cy="12" r="2" />
    <path d="M14 9h4M14 12h4M14 15h2" />
  </svg>
);
const LockIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const CameraIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const CircleCheckIcon = ({ size = 10, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const CircleHalfIcon = ({ size = 10, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20" />
  </svg>
);
const CircleDotIcon = ({ size = 8, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
  </svg>
);
const ArrowRightIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const ExternalLinkIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const SparkleIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 16.5l-6.2 4.5 2.4-7.3L2 9.2h7.6z" />
  </svg>
);

const Spinner = ({ size = 14 }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid rgba(108,99,255,0.25)`,
    borderTop: `2px solid ${COLORS.accent}`,
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    flexShrink: 0,
  }} />
);

// ── Background Orbs ───────────────────────────────────────────────────────────
function BackgroundOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "8%", left: "12%",
        width: 420, height: 420, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
        animation: "orb-drift 18s ease-in-out infinite",
        filter: "blur(2px)",
      }} />
      <div style={{
        position: "absolute", top: "55%", right: "8%",
        width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(76,29,149,0.15) 0%, transparent 70%)",
        animation: "orb-drift 24s ease-in-out infinite reverse",
        filter: "blur(2px)",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", left: "35%",
        width: 260, height: 260, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,133,255,0.09) 0%, transparent 70%)",
        animation: "orb-drift 20s ease-in-out infinite 4s",
        filter: "blur(2px)",
      }} />
    </div>
  );
}

// ── Doc Preview Modal ─────────────────────────────────────────────────────────
function DocPreviewModal({ doc, onClose }) {
  if (!doc) return null;
  const url = doc.url || (doc.path ? `${SERVER_URL}${doc.path}` : null);
  if (!url) return null;
  const isImage = /\.(jpg|jpeg|png)$/i.test(doc.name || "");
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(5,8,22,0.82)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
      backdropFilter: "blur(12px)",
      animation: "toast-in 0.22s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...glass({ active: true, radius: 20 }),
        overflow: "hidden", width: "100%", maxWidth: 860,
        display: "flex", flexDirection: "column",
        maxHeight: "90vh", boxShadow: "0 32px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(108,99,255,0.25)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: `1px solid rgba(108,99,255,0.15)`,
          background: "rgba(108,99,255,0.05)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: COLORS.accent, display: "flex" }}>
              {isImage ? <ImageIcon size={18} color={COLORS.accent} /> : <FileIcon size={18} color={COLORS.accent} />}
            </span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#fff", maxWidth: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid rgba(108,99,255,0.35)`, padding: "5px 12px", borderRadius: 8, textDecoration: "none", background: "rgba(108,99,255,0.12)" }}>
              Open <ExternalLinkIcon size={11} color={COLORS.accent} />
            </a>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(161,161,170,0.25)`, color: COLORS.grayMuted, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          {isImage
            ? <img src={url} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <iframe src={url} title={doc.name} style={{ width: "100%", height: "75vh", border: "none", display: "block", background: "#fff" }} />
          }
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  const color = type === "error" ? COLORS.red : COLORS.green;
  const bg = type === "error" ? "rgba(248,113,113,0.1)" : "rgba(34,197,94,0.1)";
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      ...glass({ active: false, radius: 14 }),
      border: `1px solid ${color}44`,
      background: bg,
      color, fontFamily: "'Space Mono',monospace", fontSize: 12,
      padding: "12px 20px", display: "flex", alignItems: "center", gap: 10,
      animation: "toast-in 0.22s ease",
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${color}22`,
    }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", background: `${color}22`, flexShrink: 0 }}>
        {type === "success" ? <CheckIcon size={11} color={color} /> : <span style={{ fontSize: 11 }}>✕</span>}
      </span>
      {message}
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ children, editing, style }) {
  return (
    <div
      style={{
        ...glass({ active: editing }),
        padding: 32,
        borderRadius: 28,
        position: "relative",
        overflow: "hidden",

        // same feel as Drive cards
        background:
          "linear-gradient(135deg,rgba(36, 20, 70, 0.21) 0%,rgba(28, 18, 60, 0.2) 55%,rgba(22, 16, 48, 0.31) 100%)",

        border: "1px solid rgba(255,255,255,0.08)",

        boxShadow: `
        0 8px 40px rgba(0,0,0,0.4),
        inset 0 1px 0 rgba(255,255,255,0.04)
      `,

        ...style,
      }}
    >
      {/* top highlight */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
        }}
      />

      {children}
    </div>
  );
}

// ── Edit Banner ───────────────────────────────────────────────────────────────
function EditBanner() {
  return (
    <div style={{
      background: "linear-gradient(90deg, rgba(108,99,255,0.14), rgba(108,99,255,0.06))",
      border: `1px solid rgba(108,99,255,0.28)`,
      borderRadius: 10, padding: "9px 14px", marginBottom: 20,
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 11, color: COLORS.accentLight,
      fontFamily: "'Space Mono',monospace",
      backdropFilter: "blur(8px)",
    }}>
      <PencilIcon size={11} />
      <span>Editing mode</span>
      <span style={{ color: "rgba(139,133,255,0.5)", margin: "0 4px" }}>·</span>
      <span style={{ color: COLORS.grayMuted }}>Click Save when done</span>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, editing, saving, onToggle, icon }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginTop: 2,
            background: "rgba(108,99,255,0.15)",
            border: "1px solid rgba(108,99,255,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {icon}
          </div>
        )}
        <div>
          <h2 style={{
            fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, margin: 0,
            background: "linear-gradient(135deg, #fff 30%, rgba(139,133,255,0.85) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>{title}</h2>
          <p style={{ fontSize: 12, color: COLORS.grayMuted, margin: "4px 0 0", lineHeight: 1.4 }}>{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={saving}
        className="action-btn-hover"
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "9px 18px", borderRadius: 10, flexShrink: 0, marginLeft: 16,
          border: editing ? `1.5px solid rgba(34,197,94,0.5)` : `1.5px solid rgba(108,99,255,0.4)`,
          color: editing ? COLORS.green : COLORS.accent,
          background: editing
            ? `linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.07))`
            : `linear-gradient(135deg, rgba(108,99,255,0.18), rgba(108,99,255,0.08))`,
          backdropFilter: "blur(8px)",
          fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700,
          cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
          boxShadow: editing ? "0 0 16px rgba(34,197,94,0.12)" : "0 0 16px rgba(108,99,255,0.1)",
        }}>
        {saving ? <Spinner size={12} /> : editing ? <><CheckIcon size={12} color={COLORS.green} /> Save</> : <><PencilIcon size={12} /> Edit</>}
      </button>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 18px" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(108,99,255,0.22))" }} />
      {label && (
        <span style={{ fontSize: 9, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.85, whiteSpace: "nowrap" }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(108,99,255,0.22), transparent)" }} />
    </div>
  );
}

// ── Editable Input ────────────────────────────────────────────────────────────
function EditableInput({ label, value, editing, onChange, textarea, type = "text", readOnly = false }) {
  const active = editing && !readOnly;
  const base = {
    width: "100%", borderRadius: 10, padding: "10px 14px",
    fontSize: 13, fontFamily: "'DM Sans',sans-serif",
    outline: "none", resize: "none", transition: "all 0.22s",
    boxSizing: "border-box",
    color: active ? "#fff" : "#c8c8d8",
    background: active ? "rgba(108,99,255,0.12)" : "rgba(255,255,255,0.025)",
    border: active ? `1.5px solid rgba(108,99,255,0.48)` : "1.5px solid rgba(255,255,255,0.05)",
    backdropFilter: "blur(6px)",
    cursor: readOnly ? "default" : "text",
  };
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{
        fontSize: 10, display: "flex", alignItems: "center", gap: 5,
        marginBottom: 6, letterSpacing: 1.2,
        textTransform: "uppercase", fontFamily: "'Space Mono',monospace",
        color: active ? COLORS.accent : "rgba(161,161,170,0.7)",
        transition: "color 0.22s",
      }}>
        {label}
        {active && <span style={{ color: `${COLORS.accent}70`, fontSize: 9 }}>✎</span>}
      </label>
      {textarea
        ? <textarea rows={3} className="input-field" style={base} value={value} readOnly={!active} onChange={e => onChange && onChange(e.target.value)} />
        : <input type={type} className="input-field" style={base} value={value} readOnly={!active} onChange={e => onChange && onChange(e.target.value)} />
      }
    </div>
  );
}

// ── Add Skill Input ───────────────────────────────────────────────────────────
function AddSkillInput({ onAdd }) {
  const [val, setVal] = useState("");
  const [show, setShow] = useState(false);
  const submit = () => { if (val.trim()) { onAdd(val.trim()); setVal(""); setShow(false); } };
  if (!show) return (
    <button
      onClick={() => setShow(true)}
      className="action-btn-hover"
      style={{
        fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace",
        background: "linear-gradient(135deg, rgba(108,99,255,0.16), rgba(108,99,255,0.08))",
        border: `1px solid rgba(108,99,255,0.32)`,
        padding: "6px 14px", borderRadius: 8, cursor: "pointer",
        backdropFilter: "blur(6px)",
      }}>+ Add Skill</button>
  );
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input autoFocus value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") setShow(false); }}
        placeholder="e.g. TypeScript"
        className="input-field"
        style={{
          background: "rgba(108,99,255,0.14)", border: `1.5px solid rgba(108,99,255,0.45)`,
          color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12,
          fontFamily: "'Space Mono',monospace", outline: "none", width: 150,
          backdropFilter: "blur(6px)",
        }} />
      <button onClick={submit} style={{ background: `linear-gradient(135deg, ${COLORS.accent}, #5752E8)`, border: "none", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontFamily: "'Space Mono',monospace", cursor: "pointer", fontWeight: 700 }}>Add</button>
      <button onClick={() => setShow(false)} style={{ background: "transparent", border: `1px solid rgba(161,161,170,0.25)`, color: COLORS.grayMuted, borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: "pointer" }}>✕</button>
    </div>
  );
}

// ── Personal Section ──────────────────────────────────────────────────────────
function PersonalSection({ initialData, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [data, setData] = useState({ firstName: "", lastName: "", email: "", phone: "", location: "", linkedin: "", github: "", bio: "" });
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (initialData) {
      setData({ firstName: initialData.firstName || "", lastName: initialData.lastName || "", email: initialData.email || "", phone: initialData.phone || "", location: initialData.location || "", linkedin: initialData.linkedin || "", github: initialData.github || "", bio: initialData.bio || "" });
      setSkills(initialData.skills || []);
    }
  }, [initialData]);

  const set = key => val => setData(d => ({ ...d, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/profile`, { method: "PUT", headers: authHeader(), body: JSON.stringify({ ...data, skills }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEditing(false);
      setToast({ msg: "Personal details saved!", type: "success" });
      onSaved && onSaved(json.user);
    } catch (err) {
      setToast({ msg: err.message || "Save failed", type: "error" });
    } finally { setSaving(false); }
  };

  return (
    <>
      <SectionCard editing={editing}>
        {editing && <EditBanner />}
        <SectionHeader
          title="Personal Details"
          subtitle="Your basic information shown to interviewers"
          editing={editing} saving={saving}
          onToggle={() => editing ? handleSave() : setEditing(true)}
          icon={<UserIcon size={16} color={COLORS.accent} />}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 18px" }}>
          <EditableInput label="First Name" value={data.firstName} editing={editing} onChange={set("firstName")} />
          <EditableInput label="Last Name" value={data.lastName} editing={editing} onChange={set("lastName")} />
          <EditableInput label="Email Address" value={data.email} editing={false} onChange={() => { }} readOnly />
          <EditableInput label="Phone Number" value={data.phone} editing={editing} onChange={set("phone")} />
          <EditableInput label="Location" value={data.location} editing={editing} onChange={set("location")} />
          <EditableInput label="LinkedIn" value={data.linkedin} editing={editing} onChange={set("linkedin")} />
          <div style={{ gridColumn: "1 / -1" }}>
            <EditableInput label="GitHub" value={data.github} editing={editing} onChange={set("github")} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <EditableInput label="About / Bio" value={data.bio} editing={editing} onChange={set("bio")} textarea />
          </div>
        </div>

        <SectionDivider label="Technical Skills" />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: COLORS.grayMuted, margin: 0 }}>
            {skills.length} skill{skills.length !== 1 ? "s" : ""} added
          </p>
          {editing && <AddSkillInput onAdd={s => setSkills(p => [...p, s])} />}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {skills.map((s, i) => (
            <span key={i} className="skill-chip-hover" style={{
              background: "rgba(42,20,84,0.65)", backdropFilter: "blur(8px)",
              color: COLORS.accent, fontFamily: "'Space Mono',monospace",
              fontSize: 11, padding: "6px 14px", borderRadius: 99,
              border: `1px solid rgba(108,99,255,0.22)`,
              display: "flex", alignItems: "center", gap: 6,
              cursor: "default",
            }}>
              {s}
              {editing && (
                <button onClick={() => setSkills(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: `${COLORS.accent}80`, cursor: "pointer", padding: 0, fontSize: 13, lineHeight: 1, display: "flex", transition: "color 0.15s" }}>✕</button>
              )}
            </span>
          ))}
          {skills.length === 0 && !editing && (
            <span style={{ fontSize: 12, color: `${COLORS.grayMuted}80`, fontStyle: "italic" }}>No skills added yet — click Edit to add some</span>
          )}
        </div>
      </SectionCard>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

// ── Education Section ─────────────────────────────────────────────────────────
function EduCard({ edu, editing, onFieldChange, onDocUpload, onRemoveDoc, uploadingDocId }) {
  const [previewDoc, setPreviewDoc] = useState(null);
  const id = edu._id ? String(edu._id) : edu.tempId;
  return (
    <div style={{
      border: editing ? `1.5px solid rgba(108,99,255,0.35)` : `1px solid rgba(108,99,255,0.1)`,
      borderRadius: 16, padding: 18, marginBottom: 16, position: "relative",
      background: editing ? "rgba(108,99,255,0.06)" : "rgba(255,255,255,0.018)",
      backdropFilter: "blur(12px)",
      transition: "all 0.25s",
      overflow: "hidden",
    }}>
      {/* top edge glow when editing */}
      {editing && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(108,99,255,0.5), transparent)" }} />}

      {edu.current && (
        <span style={{ position: "absolute", top: 12, right: 12, background: `rgba(34,197,94,0.14)`, color: COLORS.green, fontSize: 9, fontFamily: "'Space Mono',monospace", padding: "3px 10px", borderRadius: 99, border: `1px solid rgba(34,197,94,0.35)`, display: "flex", alignItems: "center", gap: 4 }}>
          <CircleDotIcon size={6} color={COLORS.green} /> Current
        </span>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 14px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <EditableInput label="Degree / Program" value={edu.degree} editing={editing} onChange={v => onFieldChange(id, "degree", v)} />
        </div>
        <EditableInput label="Institution" value={edu.institution} editing={editing} onChange={v => onFieldChange(id, "institution", v)} />
        <EditableInput label="University" value={edu.university} editing={editing} onChange={v => onFieldChange(id, "university", v)} />
        <EditableInput label="Year" value={edu.year} editing={editing} onChange={v => onFieldChange(id, "year", v)} />
        <EditableInput label="CGPA / %" value={edu.cgpa} editing={editing} onChange={v => onFieldChange(id, "cgpa", v)} />
      </div>

      <SectionDivider label="Supporting Documents" />

      {edu.docs.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.05)", backdropFilter: "blur(6px)", padding: "8px 12px", borderRadius: 10, border: `1px solid rgba(34,197,94,0.18)`, marginBottom: 6, fontSize: 12 }}>
          <FileIcon size={14} color={COLORS.green} />
          <span style={{ color: COLORS.green, fontFamily: "'Space Mono',monospace", fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
          <span style={{ fontSize: 10, color: COLORS.grayMuted, flexShrink: 0 }}>{d.size}</span>
          <button onClick={() => setPreviewDoc(d)} className="action-btn-hover" style={{ background: "rgba(108,99,255,0.1)", border: `1px solid rgba(108,99,255,0.28)`, color: COLORS.accent, cursor: "pointer", fontSize: 10, padding: "3px 10px", borderRadius: 7, fontFamily: "'Space Mono',monospace", flexShrink: 0 }}>Preview</button>
          {editing && <button onClick={() => onRemoveDoc(id, d._id, i)} style={{ background: "none", border: "none", color: COLORS.red, cursor: "pointer", fontSize: 14, padding: 0, flexShrink: 0, lineHeight: 1 }}>✕</button>}
        </div>
      ))}
      {editing && edu.docs.length === 0 && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, border: `2px dashed rgba(108,99,255,0.3)`, borderRadius: 12, padding: "11px 16px", cursor: uploadingDocId === id ? "not-allowed" : "pointer", fontSize: 12, color: COLORS.grayMuted, transition: "border 0.2s", opacity: uploadingDocId === id ? 0.6 : 1, background: "rgba(108,99,255,0.04)", backdropFilter: "blur(6px)" }}>
          {uploadingDocId === id
            ? <><Spinner /><span style={{ color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 11 }}>Uploading...</span></>
            : <><UploadIcon size={14} color={COLORS.accent} /><span style={{ color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 11 }}>Upload PDF</span><span style={{ marginLeft: "auto", fontSize: 10, color: COLORS.grayMuted }}>PDF only</span></>
          }
          <input type="file" style={{ display: "none" }} accept=".pdf" onChange={e => onDocUpload(id, e)} disabled={uploadingDocId === id} />
        </label>
      )}
      {editing && edu.docs.length >= 1 && (
        <p style={{ fontSize: 11, color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace", marginTop: 8, textAlign: "center", opacity: 0.7 }}>Max 1 document per qualification — remove to replace</p>
      )}
      <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}

function EducationSection({ initialData, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [toast, setToast] = useState(null);
  const [eduList, setEduList] = useState([]);

  useEffect(() => {
    if (initialData?.education) setEduList(initialData.education);
  }, [initialData]);

  const handleFieldChange = (id, field, val) => {
    setEduList(prev => prev.map(ed => (String(ed._id) === id || ed.tempId === id) ? { ...ed, [field]: val } : ed));
  };

  const handleDocUpload = async (id, e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    const edu = eduList.find(ed => String(ed._id) === id || ed.tempId === id);
    if (!edu) return;
    if (edu._id) {
      setUploadingDocId(id);
      try {
        const form = new FormData(); form.append("doc", file);
        const res = await fetch(`${API}/profile/education/${edu._id}/doc`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: form });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        setEduList(prev => prev.map(ed => String(ed._id) === id ? { ...ed, docs: [...ed.docs, json.doc] } : ed));
        setToast({ msg: "Document uploaded!", type: "success" });
      } catch (err) { setToast({ msg: err.message || "Upload failed", type: "error" }); }
      finally { setUploadingDocId(null); }
    } else {
      const preview = { name: file.name, size: `${Math.round(file.size / 1024)} KB`, _file: file };
      setEduList(prev => prev.map(ed => ed.tempId === id ? { ...ed, docs: [...ed.docs, preview] } : ed));
    }
  };

  const handleRemoveDoc = async (eduId, docId, docIndex) => {
    const edu = eduList.find(ed => String(ed._id) === eduId || ed.tempId === eduId);
    if (edu._id && docId) {
      try { await fetch(`${API}/profile/education/${edu._id}/doc/${docId}`, { method: "DELETE", headers: authHeader() }); } catch { }
    }
    setEduList(prev => prev.map(ed => (String(ed._id) === eduId || ed.tempId === eduId) ? { ...ed, docs: ed.docs.filter((_, i) => i !== docIndex) } : ed));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const clean = eduList.map(({ tempId, ...ed }) => ({ ...ed, docs: ed.docs.filter(d => !d._file).map(({ _file, ...d }) => d) }));
      const res = await fetch(`${API}/profile/education`, { method: "PUT", headers: authHeader(), body: JSON.stringify({ education: clean }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEduList(json.education);
      setEditing(false);
      setToast({ msg: "Education saved!", type: "success" });
      onSaved && onSaved();
    } catch (err) { setToast({ msg: err.message || "Save failed", type: "error" }); }
    finally { setSaving(false); }
  };

  return (
    <>
      <SectionCard editing={editing}>
        {editing && <EditBanner />}
        <SectionHeader title="Educational Details" subtitle="Academic background and credentials"
          editing={editing} saving={saving} onToggle={() => editing ? handleSave() : setEditing(true)}
          icon={<GraduationCapIcon size={16} color={COLORS.accent} />} />
        {eduList.map(edu => (
          <EduCard key={edu._id || edu.tempId} edu={edu} editing={editing} onFieldChange={handleFieldChange} onDocUpload={handleDocUpload} onRemoveDoc={handleRemoveDoc} uploadingDocId={uploadingDocId} />
        ))}
        {editing && (
          <button onClick={() => setEduList(p => [...p, { ...EMPTY_EDU, tempId: `temp-${Date.now()}` }])}
            className="action-btn-hover"
            style={{ width: "100%", border: `1.5px dashed rgba(108,99,255,0.3)`, borderRadius: 14, padding: "12px 0", color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 12, background: "rgba(108,99,255,0.05)", backdropFilter: "blur(6px)", cursor: "pointer" }}>
            + Add Another Education
          </button>
        )}
      </SectionCard>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

// ── Resume Section ────────────────────────────────────────────────────────────
function ResumeSection({ initialData, onSaved }) {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    if (initialData?.resumeUrl) {
      const fullUrl = initialData.resumeUrl.startsWith("http") ? initialData.resumeUrl : `${SERVER_URL}${initialData.resumeUrl}`;
      setResume({ name: initialData.resumeOriginalName || "Resume", url: fullUrl });
    }
  }, [initialData]);

  const handleFile = async e => {
    const f = e.target.files[0]; if (!f) return;
    setUploading(true); setAnalysis(null);
    try {
      const form = new FormData(); form.append("resume", f);
      const res = await fetch(`${API}/profile/resume`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const fullUrl = json.resumeUrl.startsWith("http") ? json.resumeUrl : `${SERVER_URL}${json.resumeUrl}`;
      setResume({ name: json.originalName, size: json.size, url: fullUrl });
      setToast({ msg: "Resume uploaded!", type: "success" });
      onSaved && onSaved();
    } catch (err) { setToast({ msg: err.message || "Upload failed", type: "error" }); }
    finally { setUploading(false); }
  };

  const handleDelete = async () => {
    try { await fetch(`${API}/profile/resume`, { method: "DELETE", headers: authHeader() }); setResume(null); setAnalysis(null); onSaved && onSaved(); } catch { }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true); setAnalysis(null);
    try {
      const res = await fetch(`${API}/profile/resume/analyze`, { method: "POST", headers: authHeader() });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setAnalysis(json.analysis);
    } catch (err) { setToast({ msg: err.message || "Analysis failed", type: "error" }); }
    finally { setAnalyzing(false); }
  };

  const ScoreRing = ({ score, size = 72, label }) => {
    const r = (size / 2) - 7;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = score >= 75 ? COLORS.green : score >= 50 ? COLORS.accent : COLORS.amber;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ position: "relative" }}>
          <svg width={size} height={size} style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={6} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dasharray 0.6s ease" }} />
            <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
              fill={color} fontSize={size * 0.22} fontFamily="'Space Mono',monospace" fontWeight="700">{score}</text>
          </svg>
        </div>
        {label && <span style={{ fontSize: 10, color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace" }}>{label}</span>}
      </div>
    );
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SectionCard>
          <SectionHeader title="Resume" subtitle="Upload your latest resume for interviewers to review"
            editing={false} saving={false} onToggle={() => { }}
            icon={<FileIcon size={16} color={COLORS.accent} />} />

          {!resume ? (
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              border: `2px dashed rgba(108,99,255,0.28)`, borderRadius: 18, padding: "52px 24px",
              cursor: uploading ? "not-allowed" : "pointer", transition: "all 0.25s",
              opacity: uploading ? 0.7 : 1, background: "rgba(108,99,255,0.04)",
              backdropFilter: "blur(8px)",
            }}
              onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor = `rgba(108,99,255,0.55)`; e.currentTarget.style.background = `rgba(108,99,255,0.09)`; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(108,99,255,0.28)"; e.currentTarget.style.background = "rgba(108,99,255,0.04)"; }}>
              {uploading ? (
                <><Spinner size={24} /><p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: COLORS.accent, marginTop: 14 }}>Uploading...</p></>
              ) : (
                <>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, rgba(108,99,255,0.2), rgba(42,20,84,0.7))", border: "1px solid rgba(108,99,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, boxShadow: "0 0 24px rgba(108,99,255,0.18)" }}>
                    <FileIcon size={28} color={COLORS.accent} />
                  </div>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#fff", margin: 0, fontWeight: 700 }}>Drag & drop your resume</p>
                  <p style={{ fontSize: 13, color: COLORS.grayMuted, marginTop: 6 }}>or <span style={{ color: COLORS.accent, textDecoration: "underline", textDecorationColor: `${COLORS.accent}50` }}>browse to upload</span></p>
                  <p style={{ fontSize: 10, color: `${COLORS.grayMuted}80`, marginTop: 12, fontFamily: "'Space Mono',monospace" }}>PDF, DOCX · up to 5MB</p>
                </>
              )}
              <input type="file" style={{ display: "none" }} accept=".pdf,.docx" onChange={handleFile} disabled={uploading} />
            </label>
          ) : (
            <div style={{ border: `1px solid rgba(34,197,94,0.28)`, borderRadius: 16, padding: 18, background: "rgba(34,197,94,0.05)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(34,197,94,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 16px rgba(34,197,94,0.18)" }}>
                <FileIcon size={22} color={COLORS.green} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resume.name}</p>
                {resume.size && <p style={{ fontSize: 11, color: COLORS.grayMuted, marginTop: 3 }}>{resume.size}</p>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setPreviewDoc({ name: resume.name, url: resume.url })} className="action-btn-hover" style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid rgba(108,99,255,0.3)`, padding: "5px 12px", borderRadius: 8, background: "rgba(108,99,255,0.1)", cursor: "pointer" }}>Preview</button>
                <label className="action-btn-hover" style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid rgba(108,99,255,0.3)`, padding: "5px 12px", borderRadius: 8, background: "rgba(108,99,255,0.1)", cursor: "pointer" }}>Replace <input type="file" style={{ display: "none" }} accept=".pdf,.docx" onChange={handleFile} /></label>
                <button onClick={handleDelete} className="action-btn-hover" style={{ fontSize: 11, color: COLORS.red, fontFamily: "'Space Mono',monospace", border: `1px solid rgba(248,113,113,0.28)`, padding: "5px 12px", borderRadius: 8, background: "rgba(248,113,113,0.07)", cursor: "pointer" }}>Remove</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "rgba(108,99,255,0.06)", border: `1px solid rgba(108,99,255,0.15)`, backdropFilter: "blur(8px)" }}>
            <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12, marginTop: 0 }}>Resume Tips</p>
            {["Keep your resume to 1–2 pages maximum", "Highlight projects, GitHub links, and measurable results", "Use consistent formatting and clear section headers", "Our AI will analyze your resume and suggest improvements"].map((tip, i) => (
              <p key={i} style={{ fontSize: 12, color: COLORS.grayMuted, margin: "0 0 7px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <ArrowRightIcon size={11} color={COLORS.accent} style={{ flexShrink: 0, marginTop: 2 }} />{tip}
              </p>
            ))}
          </div>

          <button onClick={handleAnalyze} disabled={!resume || analyzing} className={resume ? "action-btn-hover" : ""} style={{
            width: "100%", marginTop: 18, padding: "14px 0", borderRadius: 12,
            background: !resume ? "rgba(42,20,84,0.4)" : `linear-gradient(135deg, ${COLORS.accent} 0%, #8B5CF6 50%, ${COLORS.midPurple} 100%)`,
            color: !resume ? COLORS.grayMuted : "#fff",
            fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700,
            border: "none", cursor: !resume ? "not-allowed" : analyzing ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            opacity: analyzing ? 0.82 : 1,
            boxShadow: resume ? "0 4px 24px rgba(108,99,255,0.35)" : "none",
            letterSpacing: 0.5,
          }}>
            {analyzing ? <><Spinner size={14} /> Analyzing with AI...</> : <><SparkleIcon size={14} color="#fff" /> Analyze Resume with AI</>}
          </button>
        </SectionCard>

        {analysis && (
          <SectionCard style={{ animation: "fadeSlideUp 0.3s ease" }}>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, margin: 0, background: "linear-gradient(135deg, #fff 30%, rgba(139,133,255,0.85) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AI Analysis Results</h2>
              <p style={{ fontSize: 12, color: COLORS.grayMuted, marginTop: 4 }}>Powered by AI — tap Analyze again to refresh</p>
            </div>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 24, padding: 24, background: "rgba(42,20,84,0.4)", backdropFilter: "blur(10px)", border: "1px solid rgba(108,99,255,0.14)", borderRadius: 16 }}>
              <ScoreRing score={analysis.overallScore} size={84} label="Overall" />
              <ScoreRing score={analysis.atsScore} size={84} label="ATS Score" />
            </div>
            <div style={{ marginBottom: 20, padding: 16, background: "rgba(108,99,255,0.07)", border: `1px solid rgba(108,99,255,0.16)`, backdropFilter: "blur(8px)", borderRadius: 12 }}>
              <p style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.75, margin: 0 }}>{analysis.summary}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>Section Breakdown</p>
              {Object.entries(analysis.sections || {}).map(([key, score]) => {
                const color = score >= 75 ? COLORS.green : score >= 50 ? COLORS.accent : COLORS.amber;
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "#e2e8f0", textTransform: "capitalize" }}>{key}</span>
                      <span style={{ fontSize: 11, color, fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{score}/100</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: "rgba(42,20,84,0.9)", overflow: "hidden" }}>
                      <div style={{ width: `${score}%`, height: "100%", background: `linear-gradient(90deg, ${color}cc, ${color})`, borderRadius: 99, animation: "bar-grow 0.6s ease", boxShadow: `0 0 8px ${color}55` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 16, background: "rgba(34,197,94,0.06)", border: `1px solid rgba(34,197,94,0.18)`, backdropFilter: "blur(8px)", borderRadius: 14 }}>
                <p style={{ fontSize: 10, color: COLORS.green, fontFamily: "'Space Mono',monospace", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12, marginTop: 0 }}>Strengths</p>
                {(analysis.strengths || []).map((s, i) => (
                  <p key={i} style={{ fontSize: 12, color: "#e2e8f0", margin: "0 0 7px", display: "flex", alignItems: "flex-start", gap: 7 }}>
                    <CheckIcon size={12} color={COLORS.green} style={{ flexShrink: 0, marginTop: 2 }} />{s}
                  </p>
                ))}
              </div>
              <div style={{ padding: 16, background: "rgba(245,158,11,0.06)", border: `1px solid rgba(245,158,11,0.18)`, backdropFilter: "blur(8px)", borderRadius: 14 }}>
                <p style={{ fontSize: 10, color: COLORS.amber, fontFamily: "'Space Mono',monospace", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12, marginTop: 0 }}>Improvements</p>
                {(analysis.improvements || []).map((item, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 12, color: COLORS.amber, margin: "0 0 3px", fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 7 }}>
                      <ArrowRightIcon size={11} color={COLORS.amber} style={{ flexShrink: 0, marginTop: 2 }} />{item.issue}
                    </p>
                    <p style={{ fontSize: 11, color: COLORS.grayMuted, margin: 0, paddingLeft: 18 }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            {(analysis.atsTips || []).length > 0 && (
              <div style={{ marginBottom: 20, padding: 16, background: "rgba(255,255,255,0.025)", backdropFilter: "blur(8px)", border: `1px solid rgba(108,99,255,0.18)`, borderRadius: 14 }}>
                <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12, marginTop: 0 }}>ATS Optimisation Tips</p>
                {analysis.atsTips.map((tip, i) => (
                  <p key={i} style={{ fontSize: 12, color: COLORS.grayMuted, margin: "0 0 7px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <ArrowRightIcon size={11} color={COLORS.accent} style={{ flexShrink: 0, marginTop: 2 }} />{tip}
                  </p>
                ))}
              </div>
            )}
            {(analysis.missingKeywords || []).length > 0 && (
              <div>
                <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Suggested Keywords to Add</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {analysis.missingKeywords.map((kw, i) => (
                    <span key={i} className="skill-chip-hover" style={{ background: "rgba(108,99,255,0.1)", backdropFilter: "blur(6px)", color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 11, padding: "5px 14px", borderRadius: 99, border: `1px solid rgba(108,99,255,0.24)` }}>+ {kw}</span>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        )}
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </>
  );
}

// ── KYC Doc Widget ────────────────────────────────────────────────────────────
function KycDocWidget({ label, docData, fieldName, editing, uploading, onUpload }) {
  const [previewDoc, setPreviewDoc] = useState(null);
  const hasDoc = docData?.name && docData?.path;
  const isImage = docData?.name && /\.(jpg|jpeg|png)$/i.test(docData.name);
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ fontSize: 10, display: "block", marginBottom: 8, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "'Space Mono',monospace", color: editing ? COLORS.accent : "rgba(161,161,170,0.7)" }}>
        {label} Document <span style={{ fontSize: 9, textTransform: "none", letterSpacing: 0, color: COLORS.grayMuted }}>(JPG, PNG, PDF)</span>
      </label>
      {hasDoc ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.06)", backdropFilter: "blur(8px)", border: `1px solid rgba(34,197,94,0.22)`, borderRadius: 12, padding: "10px 14px" }}>
          <span style={{ display: "flex", flexShrink: 0 }}>
            {isImage ? <ImageIcon size={16} color={COLORS.green} /> : <FileIcon size={16} color={COLORS.green} />}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: COLORS.green, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{docData.name}</p>
            {docData.size && <p style={{ fontSize: 10, color: COLORS.grayMuted, margin: "2px 0 0" }}>{docData.size}</p>}
          </div>
          <button onClick={() => setPreviewDoc(docData)} className="action-btn-hover" style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid rgba(108,99,255,0.28)`, padding: "4px 10px", borderRadius: 7, background: "rgba(108,99,255,0.1)", cursor: "pointer", flexShrink: 0 }}>Preview</button>
          {editing && (
            <label className="action-btn-hover" style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid rgba(108,99,255,0.28)`, padding: "5px 10px", borderRadius: 7, background: "rgba(108,99,255,0.1)", cursor: uploading === fieldName ? "not-allowed" : "pointer", flexShrink: 0 }}>
              {uploading === fieldName ? <Spinner size={11} /> : "Replace"}
              <input type="file" style={{ display: "none" }} accept=".jpg,.jpeg,.png,.pdf" onChange={e => onUpload(fieldName, e)} disabled={uploading === fieldName} />
            </label>
          )}
        </div>
      ) : (
        editing ? (
          <label style={{ display: "flex", alignItems: "center", gap: 10, border: `2px dashed ${uploading === fieldName ? COLORS.accent : "rgba(108,99,255,0.32)"}`, borderRadius: 12, padding: "11px 14px", cursor: uploading === fieldName ? "not-allowed" : "pointer", opacity: uploading === fieldName ? 0.7 : 1, transition: "all 0.22s", background: "rgba(108,99,255,0.04)", backdropFilter: "blur(6px)" }}>
            {uploading === fieldName
              ? <><Spinner /><span style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace" }}>Uploading...</span></>
              : <><UploadIcon size={15} color={COLORS.accent} /><span style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace" }}>Upload {label} Document</span><span style={{ marginLeft: "auto", fontSize: 10, color: COLORS.grayMuted }}>JPG, PNG, PDF</span></>
            }
            <input type="file" style={{ display: "none" }} accept=".jpg,.jpeg,.png,.pdf" onChange={e => onUpload(fieldName, e)} disabled={uploading === fieldName} />
          </label>
        ) : (
          <div style={{ border: `1px dashed rgba(108,99,255,0.16)`, borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.015)" }}>
            <FolderOpenIcon size={15} color={COLORS.grayMuted} />
            <span style={{ fontSize: 12, color: `${COLORS.grayMuted}88` }}>No document uploaded yet</span>
          </div>
        )
      )}
      <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}

// ── KYC Section ───────────────────────────────────────────────────────────────
function KycSection({ initialData, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [toast, setToast] = useState(null);
  const [data, setData] = useState({ dob: "", nationality: "", state: "", district: "", pin: "", locality: "", postOffice: "", aadhaarNumber: "", panNumber: "" });
  const [aadhaarDoc, setAadhaarDoc] = useState(null);
  const [panDoc, setPanDoc] = useState(null);

  useEffect(() => {
    if (initialData) {
      setData({ dob: initialData.dob || "", nationality: initialData.nationality || "", state: initialData.address?.state || "", district: initialData.address?.district || "", pin: initialData.address?.pin || "", locality: initialData.address?.locality || "", postOffice: initialData.address?.postOffice || "", aadhaarNumber: initialData.aadhaarNumber || "", panNumber: initialData.panNumber || "" });
      setAadhaarDoc(initialData.aadhaarDoc?.name ? initialData.aadhaarDoc : null);
      setPanDoc(initialData.panDoc?.name ? initialData.panDoc : null);
    }
  }, [initialData]);

  const set = key => val => setData(d => ({ ...d, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      ["dob", "nationality", "aadhaarNumber", "panNumber", "state", "district", "pin", "locality", "postOffice"].forEach(k => form.append(k, data[k]));
      const res = await fetch(`${API}/profile/complete-setup`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEditing(false);
      setToast({ msg: "KYC & Address saved!", type: "success" });
      onSaved && onSaved();
    } catch (err) { setToast({ msg: err.message || "Save failed", type: "error" }); }
    finally { setSaving(false); }
  };

  const handleDocUpload = async (field, e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    setUploadingDoc(field);
    try {
      const form = new FormData(); form.append(field, file);
      const res = await fetch(`${API}/profile/complete-setup`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const docInfo = { name: json.doc.name, size: json.doc.size, path: json.doc.path, url: json.doc.url };
      if (field === "aadhaar") setAadhaarDoc(docInfo);
      if (field === "pan") setPanDoc(docInfo);
      setToast({ msg: `${field === "aadhaar" ? "Aadhaar" : "PAN"} document uploaded!`, type: "success" });
      onSaved && onSaved();
    } catch (err) { setToast({ msg: err.message || "Upload failed", type: "error" }); }
    finally { setUploadingDoc(null); }
  };

  const maskNumber = val => { if (!val || editing) return val; if (val.length <= 4) return val; return "•".repeat(val.length - 4) + val.slice(-4); };

  const inputStyle = (isEditing) => ({
    width: "100%", borderRadius: 10, padding: "10px 14px", fontSize: 13,
    fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "all 0.22s",
    boxSizing: "border-box",
    color: isEditing ? "#fff" : "#c8c8d8",
    background: isEditing ? "rgba(108,99,255,0.12)" : "rgba(255,255,255,0.025)",
    border: isEditing ? `1.5px solid rgba(108,99,255,0.48)` : "1.5px solid rgba(255,255,255,0.05)",
    backdropFilter: "blur(6px)",
  });

  return (
    <>
      <SectionCard editing={editing}>
        {editing && <EditBanner />}
        <SectionHeader title="KYC & Address" subtitle="Identity verification and residential details"
          editing={editing} saving={saving} onToggle={() => editing ? handleSave() : setEditing(true)}
          icon={<IdCardIcon size={16} color={COLORS.accent} />} />

        <SectionDivider label="Personal Identity" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 18px", marginBottom: 4 }}>
          <EditableInput label="Date of Birth" value={data.dob} editing={editing} onChange={set("dob")} type="date" />
          <EditableInput label="Nationality" value={data.nationality} editing={editing} onChange={set("nationality")} />
        </div>

        <SectionDivider label="Residential Address" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 18px", marginBottom: 4 }}>
          <EditableInput label="State" value={data.state} editing={editing} onChange={set("state")} />
          <EditableInput label="District" value={data.district} editing={editing} onChange={set("district")} />
          <EditableInput label="PIN Code" value={data.pin} editing={editing} onChange={set("pin")} />
          <EditableInput label="Post Office" value={data.postOffice} editing={editing} onChange={set("postOffice")} />
          <div style={{ gridColumn: "1 / -1" }}>
            <EditableInput label="Locality / Area" value={data.locality} editing={editing} onChange={set("locality")} />
          </div>
        </div>

        <SectionDivider label="KYC Numbers" />
        <p style={{ fontSize: 11, color: `${COLORS.grayMuted}90`, marginBottom: 14, marginTop: -8, fontStyle: "italic" }}>Sensitive fields are masked when not in edit mode.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 18px", marginBottom: 4 }}>
          <div>
            <label style={{ fontSize: 10, display: "block", marginBottom: 6, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "'Space Mono',monospace", color: editing ? COLORS.accent : "rgba(161,161,170,0.7)" }}>
              Aadhaar Number {editing && <span style={{ opacity: 0.6, fontSize: 9 }}>✎</span>}
            </label>
            <input className="input-field" style={{ ...inputStyle(editing), letterSpacing: editing ? "normal" : "2px" }}
              value={editing ? data.aadhaarNumber : maskNumber(data.aadhaarNumber)}
              readOnly={!editing} onChange={e => set("aadhaarNumber")(e.target.value)} maxLength={12}
              placeholder={editing ? "12-digit Aadhaar number" : ""} />
          </div>
          <div>
            <label style={{ fontSize: 10, display: "block", marginBottom: 6, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "'Space Mono',monospace", color: editing ? COLORS.accent : "rgba(161,161,170,0.7)" }}>
              PAN Number {editing && <span style={{ opacity: 0.6, fontSize: 9 }}>✎</span>}
            </label>
            <input className="input-field" style={{ ...inputStyle(editing), letterSpacing: editing ? "normal" : "2px", textTransform: "uppercase" }}
              value={editing ? data.panNumber : maskNumber(data.panNumber)}
              readOnly={!editing} onChange={e => set("panNumber")(e.target.value.toUpperCase())} maxLength={10}
              placeholder={editing ? "10-character PAN" : ""} />
          </div>
        </div>

        <SectionDivider label="KYC Documents" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <KycDocWidget label="Aadhaar" docData={aadhaarDoc} fieldName="aadhaar" editing={editing} uploading={uploadingDoc} onUpload={handleDocUpload} />
          <KycDocWidget label="PAN" docData={panDoc} fieldName="pan" editing={editing} uploading={uploadingDoc} onUpload={handleDocUpload} />
        </div>
        {!editing && (
          <div style={{ marginTop: 18, padding: "10px 16px", borderRadius: 10, background: "rgba(108,99,255,0.05)", border: "1px solid rgba(108,99,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <LockIcon size={12} color={COLORS.grayMuted} />
            <p style={{ fontSize: 11, color: `${COLORS.grayMuted}90`, fontFamily: "'Space Mono',monospace", margin: 0 }}>Your KYC documents are stored securely and never shared.</p>
          </div>
        )}
      </SectionCard>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

// ── Profile Completion ────────────────────────────────────────────────────────
function calcCompletion(profile) {
  if (!profile) return 0;
  let score = 0;
  const personalFields = ["firstName", "lastName", "phone", "location", "linkedin", "github", "bio"];
  score += (personalFields.filter(f => profile[f]?.trim()).length / personalFields.length) * 30;
  if ((profile.education || []).filter(e => e.degree && e.institution).length > 0) score += 25;
  if (profile.resumeUrl) score += 20;
  const kycFields = ["dob", "nationality", "aadhaarNumber", "panNumber"];
  score += (kycFields.filter(f => profile[f]?.trim()).length / kycFields.length) * 15;
  const addrFields = ["state", "district", "pin", "locality"];
  score += (addrFields.filter(f => profile.address?.[f]?.trim()).length / addrFields.length) * 10;
  return Math.round(score);
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: authUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const json = await res.json();
        if (json.success) setProfile(json.user);
      } catch (err) { console.error("Profile fetch error:", err); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handlePhotoChange = async e => {
    const f = e.target.files[0]; if (!f) return;
    setPhotoUploading(true);
    try {
      const form = new FormData(); form.append("photo", f);
      const res = await fetch(`${API}/profile/photo`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: form });
      const json = await res.json();
      if (json.success) { setProfile(p => ({ ...p, picture: json.photoUrl })); const token = localStorage.getItem("token"); login({ ...(authUser || {}), picture: json.photoUrl }, token); }
    } catch (err) { console.error(err); }
    finally { setPhotoUploading(false); }
  };

  const refreshProfile = async () => {
    try {
      const res = await fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      const json = await res.json();
      if (json.success) setProfile(json.user);
    } catch { }
  };

  const tabs = [
    { id: "personal", label: "Personal", Icon: UserIcon },
    { id: "education", label: "Education", Icon: GraduationCapIcon },
    { id: "resume", label: "Resume", Icon: FileIcon },
    { id: "kyc", label: "KYC", Icon: IdCardIcon },
  ];

  const profilePct = calcCompletion(profile);
  const pctColor = profilePct >= 80 ? COLORS.green : profilePct >= 50 ? COLORS.accent : COLORS.amber;

  const photoSrc = profile?.picture ? (profile.picture.startsWith("http") ? profile.picture : `${SERVER_URL}${profile.picture}`) : null;
  const initials = `${profile?.firstName?.[0] || ""}${profile?.lastName?.[0] || ""}`.toUpperCase() || "?";
  const isProfileComplete = profile?.profileComplete === true;

  const completionItems = [
    ["Personal Info", !!profile?.bio, "Personal"],
    ["Education", (profile?.education?.length > 0), "Education"],
    ["Resume", !!profile?.resumeUrl, "Resume"],
    ["KYC Numbers", !!(profile?.aadhaarNumber && profile?.panNumber), "KYC"],
    ["KYC Docs", !!(profile?.aadhaarDoc?.name && profile?.panDoc?.name), "KYC"],
    ["Address", !!profile?.address?.state, "KYC"],
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: COLORS.deepNavy, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid rgba(108,99,255,0.25)`, borderTop: `3px solid ${COLORS.accent}`, animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace", fontSize: 12, letterSpacing: 1 }}>Loading profile...</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <BackgroundOrbs />
      <SoftBackdrop />
      <div className="relative z-10" style={{ minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>
        <Header />

        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px", display: "flex", gap: 26, alignItems: "flex-start" }}>

          {/* ── Sidebar ── */}
          <aside style={{ width: 248, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>

            {/* Avatar Card */}
            <div style={{
              ...glass({ active: false, radius: 20 }),
              padding: "28px 20px 22px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
            }}>
              {/* Avatar */}
              <div style={{ position: "relative", marginBottom: 16 }}>
                <div style={{
                  width: 96, height: 96, borderRadius: "50%", overflow: "hidden",
                  animation: "pulse-ring 3s ease-in-out infinite",
                  opacity: photoUploading ? 0.6 : 1, transition: "opacity 0.2s",
                  border: `2.5px solid ${COLORS.accent}`,
                }}>
                  {photoSrc
                    ? <img src={photoSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${COLORS.midPurple} 0%, ${COLORS.accent} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{initials}</div>
                  }
                </div>
                <label style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "rgba(5,8,22,0.7)", backdropFilter: "blur(4px)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", opacity: 0, transition: "opacity 0.2s",
                  border: `2px solid ${COLORS.accent}55`,
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  {photoUploading ? <Spinner size={16} /> : <>
                    <CameraIcon size={16} color={COLORS.accent} />
                    <span style={{ fontSize: 9, color: COLORS.accent, fontFamily: "'Space Mono',monospace", marginTop: 4, letterSpacing: 0.5 }}>Change</span>
                  </>}
                  <input type="file" style={{ display: "none" }} accept="image/*" onChange={handlePhotoChange} />
                </label>
              </div>

              {/* Name & status */}
              <div style={{ textAlign: "center", width: "100%" }}>
                <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.3, lineHeight: 1.2 }}>{profile?.firstName} {profile?.lastName}</div>
                <div style={{ fontSize: 11, color: COLORS.grayMuted, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.email}</div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
                  {isProfileComplete ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(34,197,94,0.13)", color: COLORS.green, fontSize: 9, fontFamily: "'Space Mono',monospace", padding: "4px 10px", borderRadius: 99, border: `1px solid rgba(34,197,94,0.28)`, letterSpacing: 0.5 }}>
                      <CircleCheckIcon size={9} color={COLORS.green} /> Complete
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(245,158,11,0.11)", color: COLORS.amber, fontSize: 9, fontFamily: "'Space Mono',monospace", padding: "4px 10px", borderRadius: 99, border: `1px solid rgba(245,158,11,0.28)`, letterSpacing: 0.5 }}>
                      <CircleHalfIcon size={9} color={COLORS.amber} /> Incomplete
                    </span>
                  )}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.1)", color: COLORS.green, fontSize: 9, fontFamily: "'Space Mono',monospace", padding: "4px 10px", borderRadius: 99, border: `1px solid rgba(34,197,94,0.22)`, letterSpacing: 0.5 }}>
                    <CircleDotIcon size={5} color={COLORS.green} /> Available
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div style={{ width: "100%", borderTop: `1px solid rgba(108,99,255,0.14)`, paddingTop: 18, marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 8, alignItems: "center" }}>
                  <span style={{ color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace", fontSize: 10 }}>Profile</span>
                  <span style={{ color: pctColor, fontFamily: "'Space Mono',monospace", fontWeight: 700, transition: "color 0.4s", fontSize: 14 }}>{profilePct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(42,20,84,0.9)", overflow: "hidden", position: "relative" }}>
                  <div style={{
                    width: `${profilePct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${COLORS.accent}, ${pctColor})`,
                    borderRadius: 99, transition: "width 0.6s ease",
                    boxShadow: `0 0 10px ${pctColor}66`,
                    animation: "bar-grow 0.8s ease",
                  }} />
                </div>
                <p style={{ fontSize: 10, color: `${COLORS.grayMuted}90`, marginTop: 8, lineHeight: 1.4 }}>
                  {profilePct < 50 ? "Fill in your details to get started" : profilePct < 100 ? "Almost there — complete your KYC!" : "🎉 Profile complete!"}
                </p>
              </div>
            </div>

            {/* Nav */}
            <div style={{ ...glass({ active: false, radius: 18 }), padding: 10 }}>
              {tabs.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} className="nav-btn-hover" style={{
                  width: "100%", textAlign: "left", padding: "11px 14px", borderRadius: 11,
                  display: "flex", alignItems: "center", gap: 11, fontSize: 13, fontWeight: 500,
                  cursor: "pointer", border: "none", marginBottom: 3,
                  background: activeTab === id ? "linear-gradient(135deg, rgba(108,99,255,0.18), rgba(108,99,255,0.08))" : "transparent",
                  backdropFilter: activeTab === id ? "blur(6px)" : "none",
                  color: activeTab === id ? COLORS.accentLight : COLORS.grayMuted,
                  borderLeft: activeTab === id ? `3px solid ${COLORS.accent}` : "3px solid transparent",
                  boxShadow: activeTab === id ? "inset 0 0 24px rgba(108,99,255,0.06)" : "none",
                  transition: "all 0.18s ease",
                }}>
                  <Icon size={15} color={activeTab === id ? COLORS.accentLight : COLORS.grayMuted} />
                  {label}
                  {activeTab === id && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: COLORS.accent, boxShadow: `0 0 6px ${COLORS.accent}` }} />}
                </button>
              ))}
            </div>

            {/* Completion Checklist */}
            <div style={{ ...glass({ active: false, radius: 18 }), padding: 20 }}>
              <p style={{ fontSize: 9, color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, marginTop: 0 }}>Checklist</p>
              {completionItems.map(([label, done, tab]) => (
                <button key={label} onClick={() => setActiveTab(tab.toLowerCase())} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)",
                  transition: "opacity 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <span style={{ fontSize: 12, color: done ? "#e2e8f0" : COLORS.grayMuted, textAlign: "left" }}>{label}</span>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    background: done ? "rgba(34,197,94,0.16)" : "rgba(255,255,255,0.04)",
                    border: done ? `1.5px solid rgba(34,197,94,0.4)` : "1.5px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s",
                    boxShadow: done ? "0 0 8px rgba(34,197,94,0.2)" : "none",
                  }}>
                    {done && <CheckIcon size={9} color={COLORS.green} />}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main style={{ flex: 1, minWidth: 0 }} key={activeTab}>
            {activeTab === "personal" && <PersonalSection initialData={profile} onSaved={refreshProfile} />}
            {activeTab === "education" && <EducationSection initialData={profile} onSaved={refreshProfile} />}
            {activeTab === "resume" && <ResumeSection initialData={profile} onSaved={refreshProfile} />}
            {activeTab === "kyc" && <KycSection initialData={profile} onSaved={refreshProfile} />}
          </main>
        </div>
      </div>
    </>
  );
}