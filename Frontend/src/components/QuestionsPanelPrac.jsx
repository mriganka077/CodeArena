import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import QuestionCard from './QuestionCardPrac';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const QuestionsPanelPrac = ({
  domain,
  difficulty,
  questions,
  currentIndex,
  answers,
  codes,
  outputs,
  onQuestionsLoaded,
  onNavigate,
  onSelectAnswer,
  onSubmitComplete,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [hint, setHint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    setHint('');
    setSubmitResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/ai/practice-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ domain, difficulty }),
      });
      const data = await res.json();
      if (data.success) {
        onQuestionsLoaded(data.questions);
      } else {
        setError('Failed to generate questions.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  }, [domain, difficulty, onQuestionsLoaded]);

  useEffect(() => { fetchQuestions(); }, []);
  useEffect(() => { setHint(''); }, [currentIndex]);

  const handleAnalyze = async () => {
    const q = questions[currentIndex];
    if (!q || q.type !== 'CODING') return;
    setAnalyzing(true);
    setHint('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/practice/analyze`,
        { type: 'CODING', question: q.question, code: codes[currentIndex] || '', output: outputs[currentIndex] || '', language: q.language || 'python3' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHint(res.data.hint || 'No hints available.');
    } catch {
      setHint('Failed to get AI hints. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const attempts = questions.map((q, i) => ({
        questionIndex: i,
        question: q.question,
        type: q.type,
        options: q.options || [],
        correctAnswer: q.answer || '',
        selectedAnswer: answers[i] || '',
        code: codes[i] || '',
        language: q.language || 'python3',
        output: outputs[i] || '',
      }));
      const res = await axios.post(
        `${API_URL}/api/practice/submit`,
        { domain, difficulty, attempts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitResult({ aiReview: res.data.submission.aiReview, stats: res.data.stats });
      onSubmitComplete();
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitResult({ aiReview: 'Submission failed. Please try again.', stats: null });
    } finally {
      setSubmitting(false);
    }
  };

  const mcqQuestions = questions.filter((q) => q.type === 'MCQ');
  const codingQuestions = questions.filter((q) => q.type === 'CODING');
  const mcqScore = questions.reduce((total, q, i) => {
    if (q.type === 'MCQ' && answers[i] === q.answer) return total + 1;
    return total;
  }, 0);

  const q = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCodingQuestion = q?.type === 'CODING';

  const difficultyConfig = {
    easy:   { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'   },
    medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)'  },
    hard:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'   },
  };
  const diff = difficultyConfig[difficulty] || difficultyConfig.medium;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <aside className="h-full flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #07091a 0%, #0d1128 100%)' }}>
        <div className="text-center px-8">
          <div className="relative mx-auto mb-6 w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-[#6C63FF]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#6C63FF] animate-spin" />
            <div className="absolute inset-2 rounded-full border border-[#9B5CFF]/30 animate-pulse" />
          </div>
          <p className="text-[13px] font-semibold text-white/80 tracking-wide mb-1">
            Generating questions
          </p>
          <p className="text-[11px] text-white/35 font-mono">
            {domain} · {difficulty}
          </p>
        </div>
      </aside>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <aside className="h-full flex items-center justify-center flex-col gap-4"
        style={{ background: 'linear-gradient(180deg, #07091a 0%, #0d1128 100%)' }}>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-5 text-center max-w-xs">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button onClick={fetchQuestions}
            className="px-5 py-2 rounded-xl bg-[#6C63FF] text-white text-sm font-semibold hover:bg-[#7b73ff] transition-all">
            Try Again
          </button>
        </div>
      </aside>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (!questions.length) {
    return (
      <aside className="h-full flex items-center justify-center text-white/30 text-sm"
        style={{ background: 'linear-gradient(180deg, #07091a 0%, #0d1128 100%)' }}>
        No questions available.
      </aside>
    );
  }

  // ── Post-submit results ───────────────────────────────────────────────────
  if (submitResult) {
    return (
      <aside className="h-full flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #07091a 0%, #0d1128 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Results header */}
        <div className="px-6 py-6 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(108,99,255,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎯</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C63FF]">Session Complete</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{domain}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ color: diff.color, background: diff.bg, border: `1px solid ${diff.border}` }}>
              {difficulty}
            </span>
          </div>
        </div>

        {/* Stats */}
        {submitResult.stats && (
          <div className="px-5 py-4 shrink-0 grid grid-cols-2 gap-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="rounded-2xl px-4 py-4 text-center"
              style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">MCQ Score</p>
              <p className="text-2xl font-bold text-amber-400">
                {submitResult.stats.correctMCQ}
                <span className="text-sm text-white/30 font-normal"> / {mcqQuestions.length}</span>
              </p>
            </div>
            <div className="rounded-2xl px-4 py-4 text-center"
              style={{ background: 'rgba(108,99,255,0.07)', border: '1px solid rgba(108,99,255,0.2)' }}>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">
                Coding Score
              </p>

              <p className="text-2xl font-bold text-[#a89eff]">
                {submitResult.stats.correctCoding}
                <span className="text-sm text-white/30 font-normal">
                  / {codingQuestions.length}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* AI Review */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm">🤖</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C63FF]">AI Overall Review</span>
          </div>
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-headings:text-sm prose-p:text-white/60 prose-p:text-[13px] prose-p:leading-7 prose-strong:text-white prose-li:text-white/60 prose-li:text-[13px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{submitResult.aiReview}</ReactMarkdown>
          </div>
        </div>
      </aside>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  const answeredCount = questions.filter((qItem, idx) =>
    qItem.type === 'MCQ' ? !!answers[idx] : !!(codes[idx]?.trim())
  ).length;

  return (
    <aside className="h-full min-h-0 flex flex-col overflow-hidden"
        style={{background: 'rgba(7, 9, 26, 0.55)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.08)', }}>

      {/* ── Top header ── */}
      <div className="px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Practice</span>
              <span className="w-1 h-1 rounded-full bg-white/15" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
                style={{ color: diff.color, background: diff.bg, border: `1px solid ${diff.border}` }}>
                {difficulty}
              </span>
            </div>
            <h1 className="text-[17px] font-bold text-white truncate">{domain}</h1>
          </div>

          {/* Progress ring + count */}
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              {answeredCount}/{questions.length}
            </div>
            {mcqQuestions.length > 0 && (
              <div className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                MCQ {mcqScore}/{mcqQuestions.length}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #6C63FF, #9B5CFF)',
            }} />
        </div>
      </div>

      {/* ── Question pills ── */}
      <div className="px-5 pt-4 pb-3 shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25 mb-2.5">Questions</p>
        <div className="flex gap-1.5 flex-wrap">
          {questions.map((qItem, idx) => {
            const answered = qItem.type === 'MCQ' ? !!answers[idx] : !!(codes[idx]?.trim());
            const isCurrent = idx === currentIndex;
            const isCoding = qItem.type === 'CODING';

            return (
              <button key={idx} onClick={() => onNavigate(idx)}
                title={qItem.type}
                className="w-8 h-8 rounded-lg text-[11px] font-bold transition-all duration-200 relative"
                style={{
                  background: isCurrent
                    ? 'linear-gradient(135deg, #6C63FF, #9B5CFF)'
                    : answered
                    ? 'rgba(34,197,94,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  border: isCurrent
                    ? '1px solid rgba(108,99,255,0.5)'
                    : answered
                    ? '1px solid rgba(34,197,94,0.25)'
                    : '1px solid rgba(255,255,255,0.08)',
                  color: isCurrent ? '#fff' : answered ? '#4ade80' : 'rgba(255,255,255,0.35)',
                  boxShadow: isCurrent ? '0 0 12px rgba(108,99,255,0.3)' : 'none',
                }}>
                {answered && !isCurrent ? '✓' : idx + 1}
                {/* coding dot indicator */}
                {isCoding && !isCurrent && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#6C63FF]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Question type badge ── */}
      <div className="px-5 pb-2 shrink-0">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full"
          style={{
            background: isCodingQuestion ? 'rgba(108,99,255,0.1)' : 'rgba(245,158,11,0.08)',
            border: isCodingQuestion ? '1px solid rgba(108,99,255,0.25)' : '1px solid rgba(245,158,11,0.2)',
            color: isCodingQuestion ? '#a89eff' : '#F59E0B',
          }}>
          {isCodingQuestion ? '⌨ Coding' : '◉ MCQ'}
          <span className="opacity-50">·</span>
          <span className="opacity-60">Q{currentIndex + 1}</span>
        </span>
      </div>

      {/* ── Question card ── */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-5 pb-3">
        <QuestionCard
          question={q}
          index={currentIndex + 1}
          selectedAnswer={answers[currentIndex]}
          onAnswer={(option) => onSelectAnswer(currentIndex, option)}
          type={q?.type}
        />

        {/* AI hint */}
        {hint && (
          <div className="mt-3 rounded-2xl p-4"
            style={{ background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">🤖</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C63FF]">AI Hints</span>
            </div>
            <div className="prose prose-invert max-w-none prose-p:text-white/60 prose-p:text-[12px] prose-p:leading-6 prose-strong:text-white prose-li:text-white/60 prose-li:text-[12px] prose-headings:text-white prose-headings:text-[13px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{hint}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom actions ── */}
      <div className="px-5 py-4 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>

        {/* Prev / Next */}
        <div className="flex gap-2 mb-2.5">
          <button disabled={currentIndex === 0} onClick={() => onNavigate(currentIndex - 1)}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-25"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
            ← Prev
          </button>
          <button disabled={isLastQuestion} onClick={() => onNavigate(currentIndex + 1)}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-25"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
            Next →
          </button>
        </div>

        {/* AI Analyze — coding only */}
        {isCodingQuestion && (
          <button onClick={handleAnalyze} disabled={analyzing}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all mb-2.5 disabled:opacity-40"
            style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.22)', color: '#a89eff' }}>
            {analyzing ? '🤖 Analyzing…' : '🤖 AI Analyze'}
          </button>
        )}

        {/* Submit */}
        {isLastQuestion && (
          <button onClick={handleFinalSubmit} disabled={submitting}
            className="w-full py-3 rounded-xl text-[13px] font-bold transition-all disabled:opacity-40"
            style={{
              background: submitting ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #22C55E, #16a34a)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#fff',
              boxShadow: submitting ? 'none' : '0 4px 20px rgba(34,197,94,0.2)',
            }}>
            {submitting ? 'Submitting…' : '✓ Submit All Questions'}
          </button>
        )}
      </div>
    </aside>
  );
};

export default QuestionsPanelPrac;