import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import QuestionCard from './QuestionCardPrac';
import SoftBackdrop from './SoftBackdrop';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/* ─── tiny icon components (inline SVG so no extra deps) ─── */
const IconSpark = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813L20 11l-6.088 2.187L12 19l-1.912-5.813L4 11l6.088-2.187L12 3z" />
  </svg>
);
const IconCode = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconCircle = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
  </svg>
);
const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconBot = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);
const IconTrophy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

/* ─── difficulty palette ─── */
const diffPalette = {
  easy: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.22)' },
  medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.22)' },
  hard: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.22)' },
};

/* ─── ScoreRing ─── */
const ScoreRing = ({ pct, color, size = 52, stroke = 5 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <span className="absolute text-[11px] font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
};

/* ─── MiniBar ─── */
const MiniBar = ({ pct, color }) => (
  <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', width: '100%' }}>
    <div style={{ height: '100%', borderRadius: 99, background: color, width: `${pct}%`, transition: 'width 0.5s ease' }} />
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
const QuestionsPanelPrac = ({
  domain, difficulty, questions, currentIndex,
  answers, codes, outputs,
  onQuestionsLoaded, onNavigate, onSelectAnswer, onSubmitComplete,
}) => {
  const navigate = useNavigate(); // ✅ moved inside component

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [hint, setHint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  /* ── fetch ── */
  const fetchQuestions = useCallback(async () => {
    setLoading(true); setError(''); setHint(''); setSubmitResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/ai/practice-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain, difficulty }),
      });
      const data = await res.json();
      data.success ? onQuestionsLoaded(data.questions) : setError('Failed to generate questions.');
    } catch { setError('Unable to connect to server.'); }
    finally { setLoading(false); }
  }, [domain, difficulty, onQuestionsLoaded]);

  useEffect(() => { fetchQuestions(); }, []);
  useEffect(() => { setHint(''); }, [currentIndex]);

  /* ── analyze ── */
  const handleAnalyze = async () => {
    const q = questions[currentIndex];
    if (!q || q.type !== 'CODING') return;
    setAnalyzing(true); setHint('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/practice/analyze`,
        { type: 'CODING', question: q.question, code: codes[currentIndex] || '', output: outputs[currentIndex] || '', language: q.language || 'python3' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHint(res.data.hint || 'No hints available.');
    } catch { setHint('Failed to get AI hints. Please try again.'); }
    finally { setAnalyzing(false); }
  };

  /* ── submit ── */
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const attempts = questions.map((q, i) => ({
        questionIndex: i, question: q.question, type: q.type,
        options: q.options || [], correctAnswer: q.answer || '',
        selectedAnswer: answers[i] || '', code: codes[i] || '',
        language: q.language || 'python3', output: outputs[i] || '',
      }));
      const res = await axios.post(
        `${API_URL}/api/practice/submit`,
        { domain, difficulty, attempts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitResult({ aiReview: res.data.submission.aiReview, stats: res.data.stats });
      onSubmitComplete();
    } catch { setSubmitResult({ aiReview: 'Submission failed. Please try again.', stats: null }); }
    finally { setSubmitting(false); }
  };

  /* ── derived ── */
  const mcqQuestions = questions.filter(q => q.type === 'MCQ');
  const codingQuestions = questions.filter(q => q.type === 'CODING');
  const mcqScore = questions.reduce((t, q, i) => (q.type === 'MCQ' && answers[i] === q.answer ? t + 1 : t), 0);
  const diff = diffPalette[difficulty] || diffPalette.medium;
  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isCoding = q?.type === 'CODING';
  const answered = questions.filter((qI, i) => qI.type === 'MCQ' ? !!answers[i] : !!(codes[i]?.trim())).length;

  /* ─────────────────────── shared panel shell ─────────────────────── */
  const Shell = ({ children, className = '' }) => (
    <aside className={`h-full min-h-0 flex flex-col overflow-hidden ${className}`}
      style={{
        background: 'transparent',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(99,102,241,0.1)',
      }}>
      {children}
    </aside>
  );

  /* ═══════════ LOADING ═══════════ */
  if (loading) return (
    <Shell>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-8">
          <div className="relative mx-auto mb-7 w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-[#6366f1]/15" />
            <div className="absolute inset-0 rounded-full border border-t-[#6366f1] border-r-[#8b5cf6]/50"
              style={{ animation: 'spin 1.1s linear infinite' }} />
            <div className="absolute inset-[6px] rounded-full border border-t-[#a855f7]/60"
              style={{ animation: 'spin 0.75s linear infinite reverse' }} />
            <div className="absolute inset-[12px] rounded-full border border-[#c084fc]/25"
              style={{ animation: 'pulse 2s ease-in-out infinite' }} />
          </div>
          <p className="text-[13px] font-semibold text-white/75 tracking-wide mb-1.5">
            Generating Questions
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ color: diff.color, background: diff.bg, border: `1px solid ${diff.border}` }}>
              {difficulty}
            </span>
            <span className="text-[10px] text-white/30 font-mono">{domain}</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.8}}`}</style>
    </Shell>
  );

  /* ═══════════ ERROR ═══════════ */
  if (error) return (
    <Shell>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white/70 text-sm font-semibold mb-1">Connection Error</p>
          <p className="text-white/35 text-xs">{error}</p>
        </div>
        <button onClick={fetchQuestions}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.25)' }}>
          <IconRefresh /> Try Again
        </button>
      </div>
    </Shell>
  );

  /* ═══════════ EMPTY ═══════════ */
  if (!questions.length) return (
    <Shell>
      <div className="flex-1 flex items-center justify-center text-white/25 text-xs">
        No questions available.
      </div>
    </Shell>
  );

  /* ═══════════ POST-SUBMIT RESULTS ═══════════ */
  if (submitResult) {
    const mcqPct = mcqQuestions.length ? Math.round((submitResult.stats?.correctMCQ / mcqQuestions.length) * 100) : 0;
    const codingPct = codingQuestions.length ? Math.round((submitResult.stats?.correctCoding / codingQuestions.length) * 100) : 0;

    return (
      <Shell>
        {/* results header */}
        <div className="px-5 py-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <IconTrophy />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Session Complete</span>
          </div>
          <h1 className="text-lg font-bold text-white leading-tight">{domain}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ color: diff.color, background: diff.bg, border: `1px solid ${diff.border}` }}>
              {difficulty}
            </span>
            <span className="text-[10px] text-white/30">·</span>
            <span className="text-[10px] text-white/35">{questions.length} questions</span>
          </div>
        </div>

        {/* score cards */}
        {submitResult.stats && (
          <div className="px-5 py-4 shrink-0 grid grid-cols-2 gap-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {/* MCQ */}
            <div className="rounded-2xl p-4 flex flex-col items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <ScoreRing pct={mcqPct} color="#fb923c" size={52} />
              <div className="text-center">
                <p className="text-white font-bold text-base leading-none">
                  {submitResult.stats.correctMCQ}
                  <span className="text-white/30 font-normal text-xs"> / {mcqQuestions.length}</span>
                </p>
                <p className="text-[10px] text-white/35 uppercase tracking-widest mt-1">MCQ SCORE</p>
              </div>
              <MiniBar pct={mcqPct} color="#fb923c" />
            </div>
            {/* Coding */}
            <div className="rounded-2xl p-4 flex flex-col items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <ScoreRing pct={codingPct} color="#818cf8" size={52} />
              <div className="text-center">
                <p className="text-white font-bold text-base leading-none">
                  {submitResult.stats.correctCoding}
                  <span className="text-white/30 font-normal text-xs"> / {codingQuestions.length}</span>
                </p>
                <p className="text-[10px] text-white/35 uppercase tracking-widest mt-1">Coding SCORE</p>
              </div>
              <MiniBar pct={codingPct} color="#818cf8" />
            </div>
          </div>
        )}

        {/* ✅ Back to Dashboard button — outside the grid */}
        <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        {/* AI review */}
        <div className="flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <IconBot />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">AI Overall Review</span>
          </div>
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* top accent */}
            <div className="h-[2px] w-full"
              style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7)' }} />

            <div className="p-6">
              {/* heading */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)' }}>
                  <IconBot />
                </div>
                <div>
                  <p className="text-white font-semibold text-[15px]">Performance Analysis</p>
                  <p className="text-white/35 text-[11px] tracking-wide uppercase">AI Generated Technical Review</p>
                </div>
              </div>

              {/* content */}
              <div className="
                prose prose-invert max-w-none
                prose-headings:text-white prose-headings:font-semibold prose-headings:text-[15px]
                prose-p:text-white/65 prose-p:text-[13px] prose-p:leading-7
                prose-strong:text-white prose-strong:font-semibold
                prose-li:text-white/60 prose-li:text-[13px] prose-li:leading-7
                prose-ul:space-y-1
                prose-code:text-indigo-300 prose-code:bg-white/[0.04] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                prose-hr:border-white/10
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {submitResult.aiReview}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  /* ═══════════ MAIN PANEL ═══════════ */
  return (
    <Shell>
      {/* ── Header ── */}
      <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">Practice</span>
              <span className="w-[3px] h-[3px] rounded-full bg-white/15" />
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                style={{ color: diff.color, background: diff.bg, border: `1px solid ${diff.border}` }}>
                {difficulty}
              </span>
            </div>
            <h1 className="text-[16px] font-bold text-white tracking-tight truncate">{domain}</h1>
          </div>

          {/* live answered counter */}
          <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
              <span className="text-[11px] font-mono text-white/40">{answered}/{questions.length}</span>
            </div>
            {mcqQuestions.length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ color: '#fb923c', background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
                MCQ {mcqScore}/{mcqQuestions.length}
              </span>
            )}
          </div>
        </div>

        {/* progress bar */}
        <div className="mt-3 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full" style={{
            width: `${questions.length ? (answered / questions.length) * 100 : 0}%`,
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* ── Question Navigator ── */}
      <div className="px-5 pt-4 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/25">Navigator</p>
          <p className="text-[9px] text-white/20 font-mono">{answered} answered</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {questions.map((qItem, idx) => {
            const ans = qItem.type === 'MCQ' ? !!answers[idx] : !!(codes[idx]?.trim());
            const current = idx === currentIndex;
            const coding = qItem.type === 'CODING';

            return (
              <button key={idx} onClick={() => onNavigate(idx)} title={qItem.type}
                className="relative w-8 h-8 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center"
                style={{
                  background: current
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : ans
                      ? 'rgba(74,222,128,0.1)'
                      : 'rgba(255,255,255,0.04)',
                  border: current
                    ? '1px solid rgba(99,102,241,0.55)'
                    : ans
                      ? '1px solid rgba(74,222,128,0.22)'
                      : '1px solid rgba(255,255,255,0.07)',
                  color: current ? '#fff' : ans ? '#4ade80' : 'rgba(255,255,255,0.3)',
                  boxShadow: current ? '0 0 14px rgba(99,102,241,0.35)' : 'none',
                }}>
                {ans && !current ? <IconCheck /> : idx + 1}
                {coding && !current && (
                  <span className="absolute -top-[3px] -right-[3px] w-[7px] h-[7px] rounded-full bg-[#6366f1]"
                    style={{ border: '1.5px solid rgba(7,9,26,0.9)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Type badge ── */}
      <div className="px-5 pb-2.5 shrink-0">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full"
          style={{
            background: isCoding ? 'rgba(99,102,241,0.1)' : 'rgba(251,146,60,0.08)',
            border: isCoding ? '1px solid rgba(99,102,241,0.22)' : '1px solid rgba(251,146,60,0.2)',
            color: isCoding ? '#a5b4fc' : '#fb923c',
          }}>
          {isCoding ? <IconCode /> : <IconCircle />}
          {isCoding ? 'Coding' : 'MCQ'}
          <span className="opacity-40">·</span>
          <span className="opacity-55">Q{currentIndex + 1} of {questions.length}</span>
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 mb-3 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* ── Question card area ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-3"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
        <QuestionCard
          question={q}
          index={currentIndex + 1}
          selectedAnswer={answers[currentIndex]}
          onAnswer={(opt) => onSelectAnswer(currentIndex, opt)}
          type={q?.type}
        />

        {/* ── AI hint block ── */}
        {hint && (
          <div className="mt-4 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(99,102,241,0.18)', background: 'rgba(99,102,241,0.05)' }}>
            <div className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: '1px solid rgba(99,102,241,0.12)', background: 'rgba(99,102,241,0.07)' }}>
              <div className="w-5 h-5 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <IconBot />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-400">AI Hint</span>
            </div>
            <div className="px-4 py-3 prose prose-invert max-w-none
              prose-p:text-white/55 prose-p:text-[12px] prose-p:leading-6
              prose-strong:text-white/85
              prose-li:text-white/50 prose-li:text-[12px]
              prose-headings:text-white/80 prose-headings:text-xs prose-headings:font-semibold
              prose-code:text-indigo-300 prose-code:text-[11px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{hint}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom action bar ── */}
      <div className="px-5 py-4 shrink-0 space-y-2.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>

        {/* Prev / Next */}
        <div className="flex gap-2">
          <button disabled={currentIndex === 0} onClick={() => onNavigate(currentIndex - 1)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-20 hover:bg-white/[0.06] active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
            <IconChevronLeft /> Prev
          </button>
          <button disabled={isLast} onClick={() => onNavigate(currentIndex + 1)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-20 hover:bg-white/[0.06] active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
            Next <IconChevronRight />
          </button>
        </div>

        {/* AI Analyze — coding only */}
        {isCoding && (
          <button onClick={handleAnalyze} disabled={analyzing}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-40 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.22)',
              color: '#a5b4fc',
            }}>
            {analyzing ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 0.9s linear infinite' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </span>
                Analyzing code…
              </>
            ) : (
              <><IconSpark /> AI Analyze Code</>
            )}
          </button>
        )}

        {/* Submit — last question only */}
        {isLast && (
          <button onClick={handleFinalSubmit} disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all disabled:opacity-40 hover:scale-[1.01] active:scale-[0.98]"
            style={{
              background: submitting
                ? 'rgba(74,222,128,0.25)'
                : 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: '1px solid rgba(74,222,128,0.3)',
              color: '#fff',
              boxShadow: submitting ? 'none' : '0 6px 22px rgba(34,197,94,0.22)',
            }}>
            {submitting ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 0.9s linear infinite' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </span>
                Submitting…
              </>
            ) : (
              <><IconCheck /> Submit All Questions</>
            )}
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{ opacity:.4 } 50%{ opacity:1 } }
      `}</style>
    </Shell>
  );
};

export default QuestionsPanelPrac;