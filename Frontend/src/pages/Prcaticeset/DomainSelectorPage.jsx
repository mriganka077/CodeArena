import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SoftBackdropNew from "../../components/SoftBackdropNew";
import LenisScroll from "../../components/lenis";
import Header from "../../components/Header";
import {
  Circle,
  AlertTriangle,
  Search,
  Sparkles,
  ArrowRight,
  Hourglass,
  X,
} from "lucide-react";

const API_URL = "http://localhost:4000/api/admin";
const USER_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Glass styles ─────────────────────────────────────────────────────────────
const glass = {
  section: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "22px",
    padding: "24px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.09)",
    borderRadius: "16px",
  },
  cardHover: {
    background: "rgba(108, 99, 255, 0.08)",
    border: "1px solid rgba(108, 99, 255, 0.4)",
  },
  headerCard: {
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "24px",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
};

// ─── Difficulty levels config ─────────────────────────────────────────────────
const DIFFICULTIES = [
  {
    id: "easy",
    label: "Easy",
    icon: <Circle size={18} fill="#22C55E" stroke="#22C55E" />,
    description: "Fundamental concepts, definitions & basic problem-solving",
    color: "#22C55E",
    glow: "rgba(34,197,94,0.25)",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.3)",
  },
  {
    id: "medium",
    label: "Medium",
    icon: <Circle size={18} fill="#F59E0B" stroke="#F59E0B" />,
    description: "Applied knowledge, common interview patterns & trade-offs",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.25)",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
  },
  {
    id: "hard",
    label: "Hard",
    icon: <Circle size={18} fill="#EF4444" stroke="#EF4444" />,
    description: "Advanced topics, edge cases & system-design level depth",
    color: "#EF4444",
    glow: "rgba(239,68,68,0.25)",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.3)",
  },
];

// ─── Difficulty Popup ─────────────────────────────────────────────────────────
function DifficultyPopup({ domain, category, onClose, onConfirm, mode }) {
  const [selected, setSelected] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    await onConfirm(selected);
    setLoading(false);
  };

  const isInterview = mode === "interview";
  const accentColor = isInterview ? "#F97316" : "#6C63FF";
  const accentGradient = isInterview
    ? "linear-gradient(135deg, #F97316 0%, #EF4444 100%)"
    : "linear-gradient(135deg, #6C63FF 0%, #9B5CFF 100%)";
  const accentShadow = isInterview
    ? "0 8px 24px rgba(249,115,22,0.35)"
    : "0 8px 24px rgba(108,99,255,0.35)";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: "rgba(18, 16, 38, 0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "28px",
          padding: "32px",
          maxWidth: "480px",
          width: "100%",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
          animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "20px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "rgba(255,255,255,0.5)",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <X size={16} />
        </button>

        {/* Mode badge */}
        <div style={{ marginBottom: "24px" }}>
          <span
            style={{
              display: "inline-block",
              background: isInterview
                ? "rgba(249,115,22,0.15)"
                : "rgba(108,99,255,0.18)",
              border: `1px solid ${isInterview ? "rgba(249,115,22,0.3)" : "rgba(108,99,255,0.3)"}`,
              color: isInterview ? "#fb923c" : "#a89eff",
              borderRadius: "999px",
              padding: "2px 12px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            {isInterview ? "🎤 Mock Interview" : "📚 Practice Set"} · {category}
          </span>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#f1f5f9",
              margin: "8px 0 6px 0",
              lineHeight: 1.3,
            }}
          >
            {domain}
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            {isInterview
              ? "Choose difficulty to start your AI mock interview session."
              : "Choose your difficulty level to begin the practice set."}
          </p>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "20px" }} />

        {/* Difficulty options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          {DIFFICULTIES.map((diff) => {
            const isSelected = selected === diff.id;
            const isHovered = hoveredId === diff.id;
            return (
              <button
                key={diff.id}
                onClick={() => setSelected(diff.id)}
                onMouseEnter={() => setHoveredId(diff.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: isSelected
                    ? `1.5px solid ${diff.border}`
                    : "1px solid rgba(255,255,255,0.07)",
                  background: isSelected
                    ? diff.bg
                    : isHovered
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.18s ease",
                  boxShadow: isSelected ? `0 0 20px ${diff.glow}` : "none",
                  outline: "none",
                }}
              >
                <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                  {diff.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: isSelected ? diff.color : "#f1f5f9",
                      marginBottom: "2px",
                      transition: "color 0.18s",
                    }}
                  >
                    {diff.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                    {diff.description}
                  </div>
                </div>
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: isSelected
                      ? `2px solid ${diff.color}`
                      : "2px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.18s",
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: diff.color,
                        boxShadow: `0 0 6px ${diff.color}`,
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Start button */}
        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            border: "none",
            background:
              selected && !loading
                ? accentGradient
                : "rgba(255,255,255,0.06)",
            color: selected && !loading ? "#fff" : "rgba(255,255,255,0.25)",
            fontSize: "15px",
            fontWeight: 700,
            cursor: selected && !loading ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            boxShadow: selected && !loading ? accentShadow : "none",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            if (selected && !loading)
              e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Starting…
            </>
          ) : selected ? (
            isInterview
              ? `Start ${DIFFICULTIES.find((d) => d.id === selected)?.label} Interview →`
              : `Start ${DIFFICULTIES.find((d) => d.id === selected)?.label} Practice →`
          ) : (
            "Select a difficulty to continue"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Domain Card ──────────────────────────────────────────────────────────────
function DomainCard({ domain, category, active, onClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...glass.card,
        ...(hovered || active ? glass.cardHover : {}),
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 40px rgba(108, 99, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        transition: "all 0.25s ease",
        padding: "16px",
        textAlign: "left",
        width: "100%",
        cursor: "pointer",
        outline: active ? "2px solid rgba(108,99,255,0.5)" : "none",
        outlineOffset: "2px",
      }}
    >
      <span
        style={{
          display: "inline-block",
          background: "rgba(108, 99, 255, 0.18)",
          border: "1px solid rgba(108, 99, 255, 0.3)",
          color: "#a89eff",
          borderRadius: "999px",
          padding: "2px 10px",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {category}
      </span>
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <h3
          style={{
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: "1.4",
            color: hovered || active ? "#a89eff" : "#f1f5f9",
            transition: "color 0.2s",
            margin: 0,
          }}
        >
          {domain}
        </h3>
        <div
          style={{
            flexShrink: 0,
            background: hovered || active ? "#6C63FF" : "rgba(108, 99, 255, 0.15)",
            border: "1px solid rgba(108, 99, 255, 0.3)",
            borderRadius: "10px",
            padding: "6px 10px",
            fontSize: "13px",
            color: hovered || active ? "#fff" : "#6C63FF",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowRight size={14} />
        </div>
      </div>
      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#22C55E",
            boxShadow: "0 0 6px rgba(34,197,94,0.6)",
            display: "inline-block",
          }}
        />
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
          Open practice set
        </span>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DomainSelectorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // "practice" (default) or "interview"
  const mode = searchParams.get("mode") || "practice";
  const isInterview = mode === "interview";

  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [popup, setPopup] = useState(null); // { domain, category }

  useEffect(() => {
    const load = async () => {
      setLoadingDomains(true);
      setFetchError(null);
      try {
        const res = await fetch(`${API_URL}/domains`);
        const result = await res.json();
        if (result.success) {
          setGroups(result.data);
        } else {
          setFetchError("Failed to load domains.");
        }
      } catch (err) {
        setFetchError("Could not reach the server.");
      } finally {
        setLoadingDomains(false);
      }
    };
    load();
  }, []);

  const totalTopics = useMemo(
    () => groups.reduce((sum, g) => sum + (g.domains?.length || 0), 0),
    [groups]
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        domains: (g.domains || []).filter((d) => d.toLowerCase().includes(q)),
      }))
      .filter((g) => g.domains.length > 0);
  }, [search, groups]);

  // Replace handleCardClick
  const handleCardClick = useCallback(async (domain, category) => {
    if (isInterview) {
      try {
        const token = localStorage.getItem("token");

        console.log("Saving to DB:", { domain, category }); // ← check this fires
        console.log("API URL:", USER_API_URL);               // ← check URL is correct
        console.log("Token:", token);                        // ← check token exists

        const res = await fetch(`${USER_API_URL}/api/mockinterview`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
          body: JSON.stringify({
            domain,
            category,
            startedAt: new Date().toISOString(),
            status: "started",
          }),
        });

        const data = await res.json();
        console.log("DB response:", data); // ← check what backend returns

      } catch (err) {
        console.error("Failed to save mock interview session:", err);
      }
      navigate("/interview", { state: { domain, category } });
    } else {
      setPopup({ domain, category });
    }
  }, [isInterview, navigate]);

  // Replace handleConfirm (only used for practice now)
  const handleConfirm = useCallback(
    async (difficulty) => {
      if (!popup) return;
      const { domain } = popup;
      setPopup(null);
      navigate("/practiceset", { state: { domain, difficulty } });
    },
    [popup, navigate]
  );

  return (
    <>
      <SoftBackdropNew />
      <LenisScroll />
      <div className="relative z-50">
        <Header />
      </div>

      {popup && (
        <DifficultyPopup
          domain={popup.domain}
          category={popup.category}
          onClose={() => setPopup(null)}
          onConfirm={handleConfirm}
          mode={mode}
        />
      )}

      <div className="relative z-10 min-h-screen text-white bg-transparent">
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>

          {/* ── HEADER CARD ── */}
          <div style={{ ...glass.headerCard, padding: "32px", marginBottom: "32px" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              {/* Mode badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: isInterview
                    ? "rgba(249,115,22,0.12)"
                    : "rgba(108, 99, 255, 0.12)",
                  border: `1px solid ${isInterview ? "rgba(249,115,22,0.25)" : "rgba(108, 99, 255, 0.25)"}`,
                  borderRadius: "999px",
                  padding: "6px 16px",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <Sparkles size={14} color={isInterview ? "#fb923c" : "#a89eff"} />
                {isInterview ? "Mock Interview Domain Selector" : "Interview Practice Domain Selector"}
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: loadingDomains ? "#F59E0B" : "#22C55E",
                    boxShadow: `0 0 6px ${loadingDomains ? "rgba(245,158,11,0.5)" : "rgba(34,197,94,0.5)"}`,
                    display: "inline-block",
                  }}
                />
                {loadingDomains
                  ? "Loading…"
                  : `${groups.length} categories · ${totalTopics} topics`}
              </div>
            </div>

            {/* heading + search */}
            <div
              style={{
                marginTop: "28px",
                display: "grid",
                gap: "24px",
                gridTemplateColumns: "1.4fr 0.9fr",
                alignItems: "end",
              }}
              className="header-grid"
            >
              <div>
                <h1
                  style={{
                    fontSize: "clamp(28px, 4vw, 48px)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  {isInterview ? "Choose a domain," : "Choose a domain,"}{" "}
                  <span
                    style={{
                      background: isInterview
                        ? "linear-gradient(135deg, #fb923c 0%, #ef4444 100%)"
                        : "linear-gradient(135deg, #a89eff 0%, #6C63FF 100%)",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {isInterview ? "ace your interview." : "start practicing."}
                  </span>
                </h1>
                <p
                  style={{
                    marginTop: "16px",
                    fontSize: "14px",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.5)",
                    maxWidth: "480px",
                  }}
                >
                  {isInterview
                    ? "Select a domain for your AI-powered mock interview. Your session will be saved and tracked."
                    : "Browse every interview topic in one place. Search fast, pick a domain, and jump straight into a focused practice session."}
                </p>
              </div>

              {/* search box */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  Search Domains
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.25)",
                      pointerEvents: "none",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Search size={14} />
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to filter..."
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      padding: "10px 14px 10px 36px",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = isInterview
                        ? "rgba(249,115,22,0.5)"
                        : "rgba(108,99,255,0.5)";
                      e.target.style.boxShadow = isInterview
                        ? "0 0 0 3px rgba(249,115,22,0.12)"
                        : "0 0 0 3px rgba(108,99,255,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.08)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── STATES ── */}
          {loadingDomains && (
            <div style={{ ...glass.section, textAlign: "center", padding: "60px 24px", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                <Hourglass size={32} color="rgba(255,255,255,0.4)" />
              </div>
              <p style={{ margin: 0, fontSize: "14px" }}>Loading domains from server…</p>
            </div>
          )}

          {!loadingDomains && fetchError && (
            <div
              style={{
                ...glass.section,
                textAlign: "center",
                padding: "60px 24px",
                color: "rgba(239,68,68,0.8)",
                borderColor: "rgba(239,68,68,0.2)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                <AlertTriangle size={32} color="rgba(239,68,68,0.8)" />
              </div>
              <p style={{ margin: 0, fontSize: "14px" }}>{fetchError}</p>
            </div>
          )}

          {!loadingDomains && !fetchError && filteredGroups.length === 0 && (
            <div style={{ ...glass.section, textAlign: "center", padding: "60px 24px", color: "rgba(255,255,255,0.35)" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                <Search size={32} color="rgba(255,255,255,0.35)" />
              </div>
              <p style={{ margin: 0, fontSize: "14px" }}>
                {search ? `No domains match "${search}"` : "No domains added yet. Ask an admin to add some!"}
              </p>
            </div>
          )}

          {/* ── CATEGORY SECTIONS ── */}
          {!loadingDomains && !fetchError && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {filteredGroups.map((group, idx) => (
                <section key={group._id || group.category} style={glass.section}>
                  <div
                    style={{
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          background: "rgba(108, 99, 255, 0.18)",
                          border: "1px solid rgba(108, 99, 255, 0.3)",
                          color: "#a89eff",
                          borderRadius: "999px",
                          padding: "2px 12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          marginBottom: "8px",
                        }}
                      >
                        Section {idx + 1}
                      </span>
                      <h2 style={{ fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, margin: "0 0 4px 0" }}>
                        {group.category}
                      </h2>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                        {group.domains?.length || 0} topic{(group.domains?.length || 0) !== 1 ? "s" : ""} available
                      </p>
                    </div>
                    <span
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "999px",
                        padding: "4px 14px",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.4)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {group.domains?.length || 0} topics
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "14px",
                      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    }}
                  >
                    {(group.domains || []).map((domain) => (
                      <DomainCard
                        key={domain}
                        domain={domain}
                        category={group.category}
                        active={false}
                        onClick={() => handleCardClick(domain, group.category)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .header-grid { grid-template-columns: 1fr !important; }
        }
        input::placeholder { color: rgba(255,255,255,0.25); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}