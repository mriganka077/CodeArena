import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import DateTime from "../../components/DateTime";
import SoftBackdropNew from "../../components/SoftBackdropNew";

// ─── Scroll Animation Hook ───
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || "0px",
      },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// ─── Animated Counter Hook ───
const useCounter = (target, isVisible, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);
  return count;
};

// ─── Scroll Reveal Wrapper ───
const ScrollReveal = ({
  children,
  delay = 0,
  direction = "up",
  className = "",
}) => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  const directionStyles = {
    up: "translate-y-12",
    down: "-translate-y-12",
    left: "translate-x-12",
    right: "-translate-x-12",
    scale: "scale-90",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0 translate-x-0 scale-100" : `opacity-0 ${directionStyles[direction]}`} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── Animated Collapsible Section ───
const CollapsibleSection = ({ isOpen, children, className = "" }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!contentRef.current) return;

    if (isOpen) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen, shouldRender]);

  const handleTransitionEnd = () => {
    if (!isOpen) {
      // Keep rendered but hidden
    }
  };

  return (
    <div
      className={className}
      style={{
        height: `${height}px`,
        overflow: "hidden",
        transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div ref={contentRef}>{shouldRender && children}</div>
    </div>
  );
};

// ─── Section Header with Dropdown Toggle ───
const SectionHeader = ({
  isOpen,
  onToggle,
  icon,
  title,
  gradientFrom,
  gradientTo,
  lineColor,
}) => {
  return (
    <div
      className="flex items-center gap-4 sm:gap-5 mb-0 cursor-pointer group select-none"
      onClick={onToggle}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${gradientFrom} border ${gradientTo} backdrop-blur-sm transition-all duration-300 group-hover:scale-110`}
      >
        {icon}
      </div>
      <h2 className="text-white text-xl sm:text-2xl font-bold whitespace-nowrap flex-shrink-0">
        {title}
      </h2>
      <div
        className={`flex-1 h-0.5 rounded-full bg-gradient-to-r ${lineColor} to-transparent transition-all duration-300`}
      />

      {/* Dropdown Toggle Button */}
      <button
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider
          border transition-all duration-300 shrink-0 ml-2
          ${
            isOpen
              ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-lg shadow-indigo-500/20"
              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20"
          }
        `}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <span>{isOpen ? "Hide" : "Show"}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-500 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate(); 

  // ─── Dropdown State ───
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [driveResultsOpen, setDriveResultsOpen] = useState(true);
  const [mockOpen, setMockOpen] = useState(true);
  const [practiceOpen, setPracticeOpen] = useState(true);

  // ─── State for backend integration ───
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Results State ───
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [interviewResults, setInterviewResults] = useState([]);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [mockSubmissions, setMockSubmissions] = useState([]);
  const [mockLoading, setMockLoading] = useState(false);
  const [practiceSubmissions, setPracticeSubmissions] = useState([]);
  const [practiceLoading, setPracticeLoading] = useState(false);
  // ─── Modal Selection State ───
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedMock, setSelectedMock] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);

  const [categoryData, setCategoryData] = useState([
    {
      id: "drive",
      title: "Drive",
      description:
        "Access your study materials, notes, and important documents all in one organized place.",
      badgeText: "New",
      stats: [
        { num: 0, text: "Drives" },
        { num: 0, text: "Assessments" },
        { num: 0, text: "Interviews" },
      ],
    },
    {
      id: "practice",
      title: "Practice Set",
      description:
        "Sharpen your skills with curated practice problems and real-world coding challenges.",
      badgeText: "Popular",
      stats: [
        { num: 0, text: "Questions" },
        { num: 0, text: "Solved" },
        { num: 0, text: "Rating" },
      ],
    },
    {
      id: "mock",
      title: "Mock Interview",
      description:
        "Prepare for real interviews with AI-powered mock sessions and detailed feedback.",
      badgeText: "Pro",
      stats: [
        { num: 0, text: "Sessions" },
        { num: 0, text: "Avg Score" },
        { num: 0, text: "Hours" },
      ],
    },
  ]);

  // ─── Backend Fetch Function ───
  const API_BASE = import.meta.env.VITE_API_URL;

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/dashboard/summary`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }

      const json = await res.json();

      if (json.success && json.data) {
        const { categories } = json.data;
        setCategoryData(categories);
      }
    } catch (err) {
      setError(err.message);
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);



  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ─── Fetch Assessment Results ───
  const fetchAssessmentResults = useCallback(async () => {
    setAssessmentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/dashboard/assessment-results`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setAssessmentResults(json.data);
    } catch (err) {
      console.error("Assessment results fetch error:", err);
    } finally {
      setAssessmentLoading(false);
    }
  }, [API_BASE]);

  // ─── Fetch Interview Results ───
  const fetchInterviewResults = useCallback(async () => {
    setInterviewLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/dashboard/interview-results`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setInterviewResults(json.data);
    } catch (err) {
      console.error("Interview results fetch error:", err);
    } finally {
      setInterviewLoading(false);
    }
  }, [API_BASE]);

  // ─── Fetch Mock Interview Submissions ───
  const fetchMockSubmissions = useCallback(async () => {
    setMockLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/dashboard/mock-submissions`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setMockSubmissions(json.data);
    } catch (err) {
      console.error("Mock submissions fetch error:", err);
    } finally {
      setMockLoading(false);
    }
  }, [API_BASE]);

  // ─── Fetch Practice Submissions ───
  const fetchPracticeSubmissions = useCallback(async () => {
    setPracticeLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/dashboard/practice-submissions`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setPracticeSubmissions(json.data);
    } catch (err) {
      console.error("Practice submissions fetch error:", err);
    } finally {
      setPracticeLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchAssessmentResults();
    fetchInterviewResults();
    fetchMockSubmissions();
    fetchPracticeSubmissions();
  }, [fetchAssessmentResults, fetchInterviewResults, fetchMockSubmissions, fetchPracticeSubmissions]);



  // ─── Helper Functions ───
  const getProgressWidth = (value) => `${Math.min(Math.max(value, 0), 100)}%`;
  const getBarHeight = (value) => `${Math.min(Math.max(value, 5), 100)}%`;

  const getLevelClasses = (level) => {
    const map = {
      high: {
        status: "bg-emerald-500/15 text-emerald-400",
        fill: "from-emerald-400 to-teal-400",
        shadow: "shadow-[0_0_20px_rgba(16,185,129,0.4)]",
      },
      medium: {
        status: "bg-amber-500/15 text-amber-400",
        fill: "from-amber-400 to-orange-400",
        shadow: "shadow-[0_0_20px_rgba(245,158,11,0.4)]",
      },
      low: {
        status: "bg-red-500/15 text-red-400",
        fill: "from-red-400 to-rose-500",
        shadow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]",
      },
    };
    return map[level] || map.low;
  };

  const cardConfig = {
    drive: {
      orb1: "bg-emerald-400",
      orb2: "bg-teal-400",
      iconBox:
        "from-emerald-400 to-teal-400 shadow-[0_10px_30px_rgba(16,185,129,0.4)]",
      iconGlow: "rgba(16,185,129,0.4)",
      badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      statIcon: "bg-emerald-500/15 text-emerald-400",
      btn: "from-emerald-400 to-teal-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_35px_rgba(16,185,129,0.5)]",
      icon: (
        <>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </>
      ),
    },
    practice: {
      orb1: "bg-purple-500",
      orb2: "bg-indigo-500",
      iconBox:
        "from-indigo-500 to-purple-600 shadow-[0_10px_30px_rgba(99,102,241,0.4)]",
      iconGlow: "rgba(99,102,241,0.4)",
      badge: "bg-purple-500/20 border-purple-500/40 text-purple-400",
      statIcon: "bg-purple-500/15 text-purple-400",
      btn: "from-indigo-500 to-purple-600 shadow-[0_8px_25px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_35px_rgba(99,102,241,0.5)]",
      icon: (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </>
      ),
    },
    mock: {
      orb1: "bg-orange-500",
      orb2: "bg-red-400",
      iconBox:
        "from-orange-500 to-red-400 shadow-[0_10px_30px_rgba(249,115,22,0.4)]",
      iconGlow: "rgba(249,115,22,0.4)",
      badge: "bg-orange-500/20 border-orange-500/40 text-orange-400",
      statIcon: "bg-orange-500/15 text-orange-400",
      btn: "from-orange-500 to-red-400 shadow-[0_8px_25px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_35px_rgba(249,115,22,0.5)]",
      icon: (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ),
    },
  };

  const statIcons = {
    Files: (
      <>
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </>
    ),
    Folders: (
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    ),
    GB: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    Questions: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    Solved: (
      <>
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </>
    ),
    Rating: (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    Sessions: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    "Avg Score": (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    Hours: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    // ─── NEW KEYS for backend data ───
    Drives: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),
    Assessments: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </>
    ),
    Interviews: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
  };

  const btnTexts = {
    drive: "Open Drive",
    practice: "Start Practice",
    mock: "Start Interview",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <h3 className="text-white text-lg font-bold mb-2">
            Something went wrong
          </h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SoftBackdropNew />

      <div className="min-h-screen relative">
        {/* ─── Global Keyframes ─── */}
        <style>{`
          @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
          @keyframes draw-segment { from{stroke-dasharray:0 251} }
          @keyframes ring-pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.6;transform:scale(1.05)} }
          @keyframes legend-pulse { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
          @keyframes shine-sweep { 0%{left:-100%} 50%,100%{left:100%} }
          @keyframes icon-glow { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.5} 50%{transform:translate(-50%,-50%) scale(1.3);opacity:.8} }
          @keyframes badge-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes section-fade-in { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

          @keyframes blob-1 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            25% { transform: translate(120px, -80px) scale(1.2); }
            50% { transform: translate(-80px, 120px) scale(0.85); }
            75% { transform: translate(100px, 60px) scale(1.1); }
          }
          @keyframes blob-2 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(-150px, 100px) scale(1.3); }
            66% { transform: translate(80px, -120px) scale(0.9); }
          }
          @keyframes blob-3 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            40% { transform: translate(100px, -100px) scale(1.15); }
            80% { transform: translate(-120px, 80px) scale(0.95); }
          }
          @keyframes blob-4 {
            0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
            50% { transform: translate(-100px, -60px) scale(1.2) rotate(180deg); }
          }
          @keyframes star-twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }

          .dot-pulse{animation:pulse-dot 2s infinite}
          .seg-completed{stroke:url(#completedGrad);stroke-dasharray:163 251;stroke-dashoffset:0;animation:draw-segment 1.5s ease-out forwards}
          .seg-progress{stroke:url(#progressGrad);stroke-dasharray:63 251;stroke-dashoffset:-163}
          .seg-not-started{stroke:url(#notStartedGrad);stroke-dasharray:25 251;stroke-dashoffset:-226}
          .legend-pulse-anim{animation:legend-pulse 2s ease-out infinite}
          .shine-anim{animation:shine-sweep 3s ease-in-out infinite}
          .icon-glow-anim{animation:icon-glow 2s ease-in-out infinite}
          .badge-pulse-anim{animation:badge-pulse 2s infinite}
          .float-anim{animation:float 3s ease-in-out infinite}
          .section-fade-in{animation:section-fade-in 0.4s ease-out forwards}

          .box-card{transition:all .4s cubic-bezier(.4,0,.2,1)}
          .box-card:hover{transform:translateY(-8px)}
          .box-card:hover .glow-overlay{opacity:1}
          .cat-card{transition:all .4s cubic-bezier(.4,0,.2,1)}
          .cat-card:hover{transform:translateY(-10px)}
          .cat-card:hover .orb-1{transform:scale(1.2);opacity:.4}
          .cat-card:hover .border-overlay{border-color:rgba(255,255,255,.25)}
          .btn-cta:hover .btn-shine-el{left:100%}
          .btn-cta:hover .btn-arrow{transform:translateX(5px)}
          .bar-col:hover{transform:scaleY(1.08)}
          .bar-col:hover .bar-tip{opacity:1;transform:translateX(-50%) scale(1)}
          .legend-row:hover{background:rgba(255,255,255,.08);transform:translateX(5px)}
          .stat-card-mini:hover{background:rgba(255,255,255,.06)}

          .bg-blob-1 { animation: blob-1 20s ease-in-out infinite; }
          .bg-blob-2 { animation: blob-2 25s ease-in-out infinite; }
          .bg-blob-3 { animation: blob-3 22s ease-in-out infinite; }
          .bg-blob-4 { animation: blob-4 30s ease-in-out infinite; }
          .star { animation: star-twinkle 3s ease-in-out infinite; }

          /* Collapsible section preview bar */
          .section-preview {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>

        {/* ═══════════════ ANIMATED BACKGROUND ═══════════════ */}
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <div
            className="bg-blob-1 absolute rounded-full"
            style={{
              top: "-10%",
              left: "-5%",
              width: "600px",
              height: "600px",
              background:
                "radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="bg-blob-2 absolute rounded-full"
            style={{
              top: "20%",
              right: "-10%",
              width: "550px",
              height: "550px",
              background:
                "radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, rgba(34, 211, 238, 0.08) 40%, transparent 70%)",
              filter: "blur(70px)",
            }}
          />
          <div
            className="bg-blob-3 absolute rounded-full"
            style={{
              bottom: "-10%",
              left: "20%",
              width: "500px",
              height: "500px",
              background:
                "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="bg-blob-4 absolute rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "450px",
              height: "450px",
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 60%)",
              filter: "blur(90px)",
            }}
          />
          <div
            className="bg-blob-1 absolute rounded-full"
            style={{
              bottom: "10%",
              right: "5%",
              width: "400px",
              height: "400px",
              background:
                "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 60%)",
              filter: "blur(70px)",
              animationDelay: "5s",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="star absolute rounded-full bg-white"
              style={{
                width: `${1 + (i % 3)}px`,
                height: `${1 + (i % 3)}px`,
                left: `${(i * 7) % 100}%`,
                top: `${(i * 13) % 100}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + (i % 4)}s`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Header */}
        <div className="relative" style={{ zIndex: 10 }}>
          <Header />
        </div>

        {/* ─── Main Content ─── */}
        <div
          className="relative px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-28 py-6 sm:py-8 max-w-[1600px] mx-auto"
          style={{ zIndex: 10 }}
        >
          {/* ═══════ Header Section ═══════ */}
          <ScrollReveal direction="up" delay={0}>
            <header className="mb-12 sm:mb-14">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 flex flex-wrap gap-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-fuchsia-400">
                      Dashboard
                    </span>
                    <span className="text-white">Overview</span>
                  </h1>
                  <p className="text-slate-400 text-base sm:text-lg font-normal">
                    Track your learning journey and progress
                  </p>
                  <div className="mt-5 inline-block">
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-md hover:bg-white/[0.08] transition-colors duration-300">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                        <svg
                          className="w-5 h-5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                          Today
                        </span>
                        <span className="text-white text-sm sm:text-base font-semibold">
                          <DateTime />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-10">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                <div className="w-2.5 h-2.5 rotate-45 rounded-sm bg-gradient-to-br from-indigo-500 to-purple-600 float-anim" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
              </div>
            </header>
          </ScrollReveal>

          {/* ═══════ Learning Categories Section ═══════ */}
          <ScrollReveal direction="left" delay={100}>
            <div className="mb-6">
              <SectionHeader
                isOpen={categoriesOpen}
                onToggle={() => setCategoriesOpen((prev) => !prev)}
                icon={
                  <svg
                    className="w-5 h-5 text-fuchsia-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                }
                title="Learning Categories"
                gradientFrom="bg-fuchsia-500/15"
                gradientTo="border-fuchsia-500/25"
                lineColor="from-fuchsia-500/40"
              />
            </div>
          </ScrollReveal>

          {/* Categories collapsed preview bar */}
          {!categoriesOpen && (
            <div
              className="section-preview mb-8 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-all duration-300"
              onClick={() => setCategoriesOpen(true)}
            >
              <div className="flex gap-3">
                {categoryData.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${cat.id === "drive" ? "bg-emerald-400" : cat.id === "practice" ? "bg-purple-400" : "bg-orange-400"}`}
                    />
                    <span className="text-slate-500 text-xs">{cat.title}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1" />
              <span className="text-fuchsia-400 text-xs font-semibold">
                Click to expand
              </span>
              <svg
                className="w-4 h-4 text-fuchsia-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          )}

          {/* ─── Collapsible Category Content ─── */}
          <CollapsibleSection isOpen={categoriesOpen}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 pb-12 pt-2">
              {categoryData.map((card, cardIndex) => {
                const conf = cardConfig[card.id];
                if (!conf) return null;
                return (
                  <ScrollReveal
                    key={card.id}
                    direction="up"
                    delay={100 + cardIndex * 150}
                  >
                    <div className="cat-card group relative rounded-3xl overflow-hidden backdrop-blur-md">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-white/[0.02] overflow-hidden">
                        <div
                          className={`orb-1 absolute w-48 h-48 -top-12 -right-12 rounded-full blur-[60px] opacity-30 transition-all duration-500 ${conf.orb1}`}
                        />
                        <div
                          className={`absolute w-36 h-36 -bottom-8 -left-8 rounded-full blur-[50px] opacity-20 ${conf.orb2}`}
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage:
                              "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                          }}
                        />
                      </div>
                      <div className="relative p-6 sm:p-8 z-10">
                        <div className="flex items-start justify-between mb-5">
                          <div
                            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${conf.iconBox}`}
                          >
                            <svg
                              className="w-7 h-7 text-white relative z-10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              {conf.icon}
                            </svg>
                            <div
                              className="icon-glow-anim absolute top-1/2 left-1/2 w-full h-full rounded-[inherit]"
                              style={{
                                background: `radial-gradient(circle, ${conf.iconGlow}, transparent 70%)`,
                              }}
                            />
                          </div>
                          <div
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider border ${conf.badge}`}
                          >
                            <span className="badge-pulse-anim w-1.5 h-1.5 rounded-full bg-current" />
                            {card.badgeText}
                          </div>
                        </div>
                        <h3 className="text-white text-2xl font-extrabold mb-2">
                          {card.title}
                        </h3>
                        <p className="text-slate-400 text-sm sm:text-[0.95rem] leading-relaxed mb-6">
                          {card.description}
                        </p>
                        {/* Stats block removed */}
                        <button
                          onClick={() => {
                            if (card.id === "drive") {
                              navigate("/drive");
                            }
                            else if (card.id === "practice") {
                              window.scrollTo({ top: 0, behavior: "instant" });
                              navigate("/domainselector?mode=practice");
                            } else if (card.id === "mock") {
                              window.scrollTo({ top: 0, behavior: "instant" });
                              navigate("/domainselector?mode=interview");
                            }
                          }}
                          className={`btn-cta relative w-full px-6 py-4 rounded-2xl text-sm sm:text-base font-bold text-white flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-r ${conf.btn}`}
                        >
                          <span className="relative z-10">
                            {btnTexts[card.id]}
                          </span>
                          <span className="btn-arrow relative z-10 flex items-center transition-transform duration-300">
                            <svg
                              className="w-5 h-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </span>
                          <div className="btn-shine-el absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-[left] duration-500" />
                        </button>
                      </div>
                      <div className="border-overlay absolute inset-0 rounded-3xl border border-white/10 pointer-events-none transition-all duration-300" />
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </CollapsibleSection>

          {/* ════════════════════════════════════════════════════════
              DRIVE RESULTS — Table
          ════════════════════════════════════════════════════════ */}
          {(() => {
            const rawResults = [
              ...assessmentResults.map(r => ({ ...r, __type: 'Assessment' })),
              ...interviewResults.map(r => ({ ...r, __type: 'Interview' }))
            ];
            
            const groups = {};
            rawResults.forEach(r => {
              const dId = r.drive?._id || r.driveId || r.drive?.name || r.id || 'unknown';
              if (!groups[dId]) {
                groups[dId] = {
                  id: dId,
                  latestDate: new Date(r.createdAt || Date.now()),
                  items: []
                };
              }
              groups[dId].items.push(r);
              const dDate = new Date(r.createdAt || Date.now());
              if (dDate > groups[dId].latestDate) {
                groups[dId].latestDate = dDate;
              }
            });

            const sortedGroups = Object.values(groups).sort((a, b) => b.latestDate - a.latestDate);
            const combinedDriveResults = [];
            sortedGroups.forEach((group, gIdx) => {
              const sortedItems = group.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              sortedItems.forEach((item, iIdx) => {
                combinedDriveResults.push({
                  ...item,
                  _groupId: group.id,
                  _isFirstInGroup: iIdx === 0,
                  _isLastInGroup: iIdx === sortedItems.length - 1,
                  _groupSize: sortedItems.length,
                  _groupIndex: gIdx
                });
              });
            });

            return (
              <>
                <ScrollReveal direction="left" delay={100}>
                  <div className="mb-6 mt-14">
                    <SectionHeader
                      isOpen={driveResultsOpen}
                      onToggle={() => setDriveResultsOpen((prev) => !prev)}
                icon={
                  <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                }
                title="Drive Results"
                gradientFrom="bg-amber-500/15"
                gradientTo="border-amber-500/25"
                lineColor="from-amber-500/40"
              />
            </div>
          </ScrollReveal>

          {!driveResultsOpen && combinedDriveResults.length > 0 && (
            <div className="section-preview mb-8 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-all duration-300" onClick={() => setDriveResultsOpen(true)}>
              <span className="text-slate-400 text-xs">{combinedDriveResults.length} result{combinedDriveResults.length !== 1 ? 's' : ''}</span>
              <div className="flex-1" />
              <span className="text-amber-400 text-xs font-semibold">Click to expand</span>
              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          )}

          <CollapsibleSection isOpen={driveResultsOpen} className="mb-10">
            {assessmentLoading || interviewLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : combinedDriveResults.length === 0 ? (
              <ScrollReveal direction="up" delay={100}>
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <h4 className="text-white text-base font-bold mb-1">No Drive Results Yet</h4>
                  <p className="text-slate-500 text-sm">Complete a drive to see your results here.</p>
                </div>
              </ScrollReveal>
            ) : (
              <div className="rounded-2xl overflow-x-auto border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm mb-8">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Drive', 'Type', 'Score', 'Result', 'Time Taken', 'Date', ''].map((h) => (
                        <th key={h} className="text-left text-slate-500 text-[0.7rem] font-semibold uppercase tracking-wider px-5 py-3 bg-white/[0.02] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {combinedDriveResults.map((result, idx) => {
                      const isAssessment = result.__type === 'Assessment';
                      let resultLabel = '';
                      let resultColor = '';
                      if (isAssessment) {
                        resultLabel = result.status === 'Terminated' ? 'Terminated' : result.isPass ? 'Passed' : 'Failed';
                        resultColor = result.status === 'Terminated' ? 'bg-red-500/15 border-red-500/25 text-red-400' : result.isPass ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' : 'bg-orange-500/15 border-orange-500/25 text-orange-400';
                      } else {
                        resultLabel = result.recommendation || 'Pending';
                        resultColor = result.recommendation === 'Strong Hire' ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' : result.recommendation === 'Hire' ? 'bg-sky-500/15 border-sky-500/25 text-sky-400' : 'bg-red-500/15 border-red-500/25 text-red-400';
                      }

                      const isGrouped = result._groupSize > 1;
                      const bgClass = isGrouped ? (result._groupIndex % 2 === 0 ? 'bg-indigo-500/[0.03]' : 'bg-fuchsia-500/[0.03]') : '';
                      const borderClass = (!result._isLastInGroup || idx !== combinedDriveResults.length - 1) ? 'border-b border-white/[0.04]' : '';

                      return (
                        <tr
                          key={`${result.__type}-${result.id || idx}`}
                          onClick={() => isAssessment ? setSelectedAssessment(result) : setSelectedInterview(result)}
                          className={`cursor-pointer transition-all duration-200 hover:bg-white/[0.08] group ${borderClass} ${bgClass}`}
                        >
                          <td className="px-5 py-4 relative">
                            {isGrouped && (
                              <div className={`absolute left-0 w-1 bg-indigo-500/50 ${result._isFirstInGroup ? 'top-1/2 bottom-0 rounded-tr-md' : result._isLastInGroup ? 'top-0 bottom-1/2 rounded-br-md' : 'top-0 bottom-0'}`} />
                            )}
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                {!result._isFirstInGroup && isGrouped && (
                                  <svg className="w-4 h-4 text-indigo-400/50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 4v10a2 2 0 0 0 2 2h8" />
                                    <polyline points="12 12 16 16 12 20" />
                                  </svg>
                                )}
                                <p className={`text-sm font-semibold truncate max-w-[180px] ${result._isFirstInGroup ? 'text-white' : 'text-slate-300'}`}>
                                  {result.drive?.name || result.__type}
                                </p>
                              </div>
                              <p className={`text-slate-500 text-xs ${!result._isFirstInGroup && isGrouped ? 'ml-6' : ''}`}>
                                {isAssessment ? (result.drive?.type || '—') : (result.interview?.type || '—')}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-slate-300 text-xs font-semibold">{result.__type}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-white text-sm font-bold">{result.score}</span>
                            {isAssessment ? (
                              result.drive?.totalMarks && <span className="text-slate-500 text-xs"> /{result.drive.totalMarks}</span>
                            ) : (
                              <span className="text-slate-500 text-xs"> /100</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {resultLabel !== 'No Hire' ? (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${resultColor}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {resultLabel}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs font-semibold">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-300 text-sm">{result.timeTaken >= 60 ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : `${result.timeTaken}s`}</td>
                          <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">{new Date(result.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-5 py-4">
                            <svg className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>
              </>
            );
          })()}

          {/* ─── Assessment Detail Modal ─── */}
          {selectedAssessment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAssessment(null)}>
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
              <div className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/[0.10] shadow-2xl shadow-black/60 section-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-400">Assessment</span>
                        {selectedAssessment.drive?.type && <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400">{selectedAssessment.drive.type}</span>}
                      </div>
                      <h3 className="text-white text-xl font-extrabold">{selectedAssessment.drive?.name || 'Assessment Result'}</h3>
                      <p className="text-slate-500 text-sm mt-0.5">{new Date(selectedAssessment.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setSelectedAssessment(null)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-200 shrink-0 ml-3">
                      <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-6 mb-6 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none"
                          stroke={selectedAssessment.isPass ? '#34d399' : selectedAssessment.status === 'Terminated' ? '#ef4444' : '#f59e0b'}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${(selectedAssessment.percentage / 100) * 94.2} 94.2`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xl font-extrabold leading-none ${selectedAssessment.isPass ? 'text-emerald-400' : selectedAssessment.status === 'Terminated' ? 'text-red-400' : 'text-amber-400'}`}>{selectedAssessment.percentage}%</span>
                        <span className="text-slate-500 text-[0.6rem] mt-0.5">Score</span>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      {[
                        { label: 'Score', value: `${selectedAssessment.score}${selectedAssessment.drive?.totalMarks ? ` / ${selectedAssessment.drive.totalMarks}` : ''}` },
                        { label: 'Percentage', value: `${selectedAssessment.percentage}%` },
                        { label: 'Time Taken', value: selectedAssessment.timeTaken >= 60 ? `${Math.floor(selectedAssessment.timeTaken / 60)}m ${selectedAssessment.timeTaken % 60}s` : `${selectedAssessment.timeTaken}s` },
                        { label: 'Result', value: selectedAssessment.status === 'Terminated' ? 'Terminated' : selectedAssessment.isPass ? 'Passed' : 'Failed' },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col gap-0.5">
                          <span className="text-slate-500 text-[0.65rem] uppercase tracking-wider">{item.label}</span>
                          <span className="text-white text-sm font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-slate-500 mb-2"><span>Score Progress</span><span>{selectedAssessment.percentage}%</span></div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${selectedAssessment.isPass ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : selectedAssessment.status === 'Terminated' ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} style={{ width: `${selectedAssessment.percentage}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${selectedAssessment.status === 'Terminated' ? 'bg-red-500/15 border-red-500/30 text-red-400' : selectedAssessment.isPass ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-orange-500/15 border-orange-500/30 text-orange-400'}`}>
                      <span className="w-2 h-2 rounded-full bg-current badge-pulse-anim" />
                      {selectedAssessment.status === 'Terminated' ? 'Terminated' : selectedAssessment.isPass ? 'Passed ✓' : 'Failed'}
                    </span>
                    {selectedAssessment.status === 'Terminated' && selectedAssessment.terminationReason && (
                      <span className="text-red-400/70 text-xs">⚠ {selectedAssessment.terminationReason}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}




          {/* ─── Interview Detail Modal ─── */}
          {selectedInterview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInterview(null)}>
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
              <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/[0.10] shadow-2xl shadow-black/60 section-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-violet-500/15 border border-violet-500/30 text-violet-400">Interview</span>
                        {selectedInterview.interview?.type && <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400">{selectedInterview.interview.type}</span>}
                      </div>
                      <h3 className="text-white text-xl font-extrabold">{selectedInterview.drive?.name || 'Interview Result'}</h3>
                      <p className="text-slate-500 text-sm mt-0.5">{new Date(selectedInterview.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setSelectedInterview(null)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-200 shrink-0 ml-3">
                      <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-center px-4 border-r border-white/[0.06]">
                      <div className="text-4xl font-extrabold text-white">{selectedInterview.score}</div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider">/ 100</div>
                    </div>
                    <div className="flex-1">
                      {selectedInterview.recommendation !== 'No Hire' && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border mb-2 ${selectedInterview.recommendation === 'Strong Hire' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : selectedInterview.recommendation === 'Hire' ? 'bg-sky-500/15 border-sky-500/30 text-sky-400' : 'bg-red-500/15 border-red-500/30 text-red-400'}`}>
                          <span className="w-2 h-2 rounded-full bg-current badge-pulse-anim" />
                          {selectedInterview.recommendation}
                        </div>
                      )}
                      <div className={`text-slate-400 text-xs ${selectedInterview.recommendation === 'No Hire' ? 'mt-2' : ''}`}>Time taken: <span className="text-white font-semibold">{selectedInterview.timeTaken >= 60 ? `${Math.floor(selectedInterview.timeTaken / 60)}m ${selectedInterview.timeTaken % 60}s` : `${selectedInterview.timeTaken}s`}</span></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {[
                      { label: 'Technical Knowledge', value: selectedInterview.technicalKnowledge, color: 'from-violet-400 to-purple-500' },
                      { label: 'Communication', value: selectedInterview.communication, color: 'from-sky-400 to-cyan-400' },
                      { label: 'Problem Solving', value: selectedInterview.problemSolving, color: 'from-amber-400 to-orange-400' },
                      { label: 'Confidence', value: selectedInterview.confidence, color: 'from-pink-400 to-rose-400' },
                    ].map((skill) => (
                      <div key={skill.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-400 text-xs">{skill.label}</span>
                          <span className="text-white text-xs font-bold">{skill.value}/100</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${skill.color}`} style={{ width: `${skill.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedInterview.feedback && (
                    <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        <span className="text-violet-400 text-xs font-semibold uppercase tracking-wider">AI Feedback</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{selectedInterview.feedback}</p>
                    </div>
                  )}
                  {selectedInterview.interview?.focusAreas?.length > 0 && (
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Focus Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedInterview.interview.focusAreas.map((area) => (
                          <span key={area} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.08] text-slate-300 text-xs">{area}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* ════════════════════════════════════════════════════════
              MOCK INTERVIEW SUBMISSIONS — Table + Modal
          ════════════════════════════════════════════════════════ */}
          <ScrollReveal direction="left" delay={100}>
            <div className="mb-6 mt-4">
              <SectionHeader
                isOpen={mockOpen}
                onToggle={() => setMockOpen((prev) => !prev)}
                icon={
                  <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
                title="Mock Interview"
                gradientFrom="bg-orange-500/15"
                gradientTo="border-orange-500/25"
                lineColor="from-orange-500/40"
              />
            </div>
          </ScrollReveal>

          {!mockOpen && mockSubmissions.length > 0 && (
            <div className="section-preview mb-8 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-all duration-300" onClick={() => setMockOpen(true)}>
              <span className="text-slate-400 text-xs">{mockSubmissions.length} session{mockSubmissions.length !== 1 ? 's' : ''} completed</span>
              <div className="flex-1" />
              <span className="text-orange-400 text-xs font-semibold">Click to expand</span>
              <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          )}

          <CollapsibleSection isOpen={mockOpen} className="mb-10">
            {mockLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : mockSubmissions.length === 0 ? (
              <ScrollReveal direction="up" delay={100}>
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <h4 className="text-white text-base font-bold mb-1">No Mock Interviews Yet</h4>
                  <p className="text-slate-500 text-sm">Complete a mock interview to see your time and feedback here.</p>
                </div>
              </ScrollReveal>
            ) : (
              <div className="rounded-2xl overflow-x-auto border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm mb-8">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Session', 'Time Taken', 'Feedback', 'Date', ''].map((h) => (
                        <th key={h} className="text-left text-slate-500 text-[0.7rem] font-semibold uppercase tracking-wider px-5 py-3 bg-white/[0.02] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockSubmissions.map((sub, idx) => (
                      <tr
                        key={sub.id || idx}
                        onClick={() => setSelectedMock(sub)}
                        className={`cursor-pointer transition-all duration-200 hover:bg-white/[0.05] group ${idx !== mockSubmissions.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
                      >
                        <td className="px-5 py-4">
                          <p className="text-white text-sm font-semibold">{sub.title || sub.domain || `Session ${idx + 1}`}</p>
                          <p className="text-slate-500 text-xs">{sub.type || 'Mock Interview'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            <span className="text-slate-300 text-sm">{sub.timeTaken >= 60 ? `${Math.floor(sub.timeTaken / 60)}m ${sub.timeTaken % 60}s` : `${sub.timeTaken}s`}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-[280px]">
                          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{sub.feedback || '—'}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">{new Date(sub.createdAt || sub.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="px-5 py-4">
                          <svg className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>

          {/* ─── Mock Interview Detail Modal ─── */}
          {selectedMock && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMock(null)}>
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
              <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/[0.10] shadow-2xl shadow-black/60 section-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-orange-500/15 border border-orange-500/30 text-orange-400">Mock Interview</span>
                        {selectedMock.type && <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400">{selectedMock.type}</span>}
                      </div>
                      <h3 className="text-white text-xl font-extrabold">{selectedMock.title || selectedMock.domain || 'Mock Interview Session'}</h3>
                      <p className="text-slate-500 text-sm mt-0.5">{new Date(selectedMock.createdAt || selectedMock.submittedAt).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setSelectedMock(null)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-200 shrink-0 ml-3">
                      <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>

                  {/* Time Taken card */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/20 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0">
                      <svg className="w-7 h-7 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[0.65rem] uppercase tracking-wider mb-0.5">Time Taken</p>
                      <p className="text-white text-2xl font-extrabold">
                        {selectedMock.timeTaken >= 60
                          ? `${Math.floor(selectedMock.timeTaken / 60)}m ${selectedMock.timeTaken % 60}s`
                          : `${selectedMock.timeTaken}s`}
                      </p>
                    </div>
                  </div>

                  {/* Feedback card */}
                  {selectedMock.feedback ? (
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="text-orange-400 text-xs font-semibold uppercase tracking-wider">AI Feedback</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedMock.feedback}</p>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-center">
                      <p className="text-slate-500 text-sm">No feedback available for this session.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              PRACTICE SUBMISSIONS — Table + Modal
          ════════════════════════════════════════════════════════ */}
          <ScrollReveal direction="left" delay={100}>
            <div className="mb-6 mt-4">
              <SectionHeader
                isOpen={practiceOpen}
                onToggle={() => setPracticeOpen((prev) => !prev)}
                icon={
                  <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                }
                title="Practice Submissions"
                gradientFrom="bg-cyan-500/15"
                gradientTo="border-cyan-500/25"
                lineColor="from-cyan-500/40"
              />
            </div>
          </ScrollReveal>

          {!practiceOpen && practiceSubmissions.length > 0 && (
            <div className="section-preview mb-8 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-all duration-300" onClick={() => setPracticeOpen(true)}>
              <span className="text-slate-400 text-xs">{practiceSubmissions.length} session{practiceSubmissions.length !== 1 ? 's' : ''}</span>
              <div className="flex-1" />
              <span className="text-cyan-400 text-xs font-semibold">Click to expand</span>
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          )}

          <CollapsibleSection isOpen={practiceOpen} className="mb-14">
            {practiceLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            ) : practiceSubmissions.length === 0 ? (
              <ScrollReveal direction="up" delay={100}>
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <h4 className="text-white text-base font-bold mb-1">No Practice Sessions Yet</h4>
                  <p className="text-slate-500 text-sm">Start a practice set to track your MCQ and coding performance here.</p>
                </div>
              </ScrollReveal>
            ) : (
              <div className="rounded-2xl overflow-x-auto border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm mb-8">
                <table className="w-full min-w-[660px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Domain', 'Difficulty', 'Total Q', 'MCQ (correct/attempted)', 'Coding (correct/attempted)', 'Date', ''].map((h) => (
                        <th key={h} className="text-left text-slate-500 text-[0.7rem] font-semibold uppercase tracking-wider px-5 py-3 bg-white/[0.02] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {practiceSubmissions.map((sub, idx) => {
                      const diffColor = sub.difficulty === 'easy' ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' : sub.difficulty === 'medium' ? 'bg-amber-500/15 border-amber-500/25 text-amber-400' : 'bg-red-500/15 border-red-500/25 text-red-400';
                      const mcqAcc = sub.attemptedMCQ > 0 ? Math.round((sub.correctMCQ / sub.attemptedMCQ) * 100) : 0;
                      const codingAcc = sub.attemptedCoding > 0 ? Math.round((sub.correctCoding / sub.attemptedCoding) * 100) : 0;
                      return (
                        <tr
                          key={sub.id}
                          onClick={() => setSelectedPractice(sub)}
                          className={`cursor-pointer transition-all duration-200 hover:bg-white/[0.05] group ${idx !== practiceSubmissions.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
                        >
                          <td className="px-5 py-4">
                            <p className="text-white text-sm font-semibold capitalize">{sub.domain}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${diffColor}`}>{sub.difficulty}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-white text-sm font-bold">{sub.totalQuestions}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400 text-sm font-semibold">{sub.correctMCQ}<span className="text-slate-500 text-xs font-normal">/{sub.attemptedMCQ}</span></span>
                              <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-400" style={{ width: `${mcqAcc}%` }} />
                              </div>
                              <span className="text-slate-500 text-xs">{mcqAcc}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-cyan-400 text-sm font-semibold">{sub.correctCoding}<span className="text-slate-500 text-xs font-normal">/{sub.attemptedCoding}</span></span>
                              <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-400" style={{ width: `${codingAcc}%` }} />
                              </div>
                              <span className="text-slate-500 text-xs">{codingAcc}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">{new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-5 py-4">
                            <svg className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>

          {/* ─── Practice Detail Modal ─── */}
          {selectedPractice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPractice(null)}>
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
              <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/[0.10] shadow-2xl shadow-black/60 section-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">Practice Set</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${selectedPractice.difficulty === 'easy' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : selectedPractice.difficulty === 'medium' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-red-500/15 border-red-500/30 text-red-400'}`}>{selectedPractice.difficulty}</span>
                      </div>
                      <h3 className="text-white text-xl font-extrabold capitalize">{selectedPractice.domain}</h3>
                      <p className="text-slate-500 text-sm mt-0.5">{new Date(selectedPractice.submittedAt).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setSelectedPractice(null)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-200 shrink-0 ml-3">
                      <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                  <div className="text-center py-5 mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-5xl font-extrabold text-white mb-1">{selectedPractice.totalQuestions}</div>
                    <div className="text-slate-500 text-sm uppercase tracking-wider">Total Questions</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <span className="text-white text-sm font-semibold">MCQ</span>
                      </div>
                      <span className="text-purple-400 text-sm font-bold">{selectedPractice.attemptedMCQ > 0 ? Math.round((selectedPractice.correctMCQ / selectedPractice.attemptedMCQ) * 100) : 0}% accuracy</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {[
                        { label: 'Attempted', value: selectedPractice.attemptedMCQ, color: 'text-slate-300' },
                        { label: 'Correct', value: selectedPractice.correctMCQ, color: 'text-emerald-400' },
                        { label: 'Wrong', value: selectedPractice.attemptedMCQ - selectedPractice.correctMCQ, color: 'text-red-400' },
                      ].map((item) => (
                        <div key={item.label} className="text-center p-2 rounded-lg bg-white/[0.04]">
                          <div className={`text-xl font-extrabold ${item.color}`}>{item.value}</div>
                          <div className="text-slate-500 text-[0.65rem] uppercase tracking-wider">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-400" style={{ width: `${selectedPractice.attemptedMCQ > 0 ? Math.round((selectedPractice.correctMCQ / selectedPractice.attemptedMCQ) * 100) : 0}%` }} />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                        </div>
                        <span className="text-white text-sm font-semibold">Coding</span>
                      </div>
                      <span className="text-cyan-400 text-sm font-bold">{selectedPractice.attemptedCoding > 0 ? Math.round((selectedPractice.correctCoding / selectedPractice.attemptedCoding) * 100) : 0}% accuracy</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {[
                        { label: 'Attempted', value: selectedPractice.attemptedCoding, color: 'text-slate-300' },
                        { label: 'Correct', value: selectedPractice.correctCoding, color: 'text-emerald-400' },
                        { label: 'Wrong', value: selectedPractice.attemptedCoding - selectedPractice.correctCoding, color: 'text-red-400' },
                      ].map((item) => (
                        <div key={item.label} className="text-center p-2 rounded-lg bg-white/[0.04]">
                          <div className={`text-xl font-extrabold ${item.color}`}>{item.value}</div>
                          <div className="text-slate-500 text-[0.65rem] uppercase tracking-wider">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-400" style={{ width: `${selectedPractice.attemptedCoding > 0 ? Math.round((selectedPractice.correctCoding / selectedPractice.attemptedCoding) * 100) : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Dashboard;
