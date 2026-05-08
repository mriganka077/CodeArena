import { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";

const QuestionsPanel = ({ onQuestionChange }) => {

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Questions
  const fetchQuestions = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domain: "Python",
            difficulty: "Intermediate",
            type: "MCQ",
            count: 5,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (data.success) {

        // Reset old answers
        setAnswers({});
        setCurrent(0);

        setQuestions(data.questions);

        onQuestionChange?.({
          ...data.questions[0],
          selectedAnswer: answers[0]
        });

      } else {

        setError("Failed to generate questions");
      }

    } catch (error) {

      console.error(error);

      setError("Unable to connect to server");

    } finally {

      setLoading(false);
    }
  };

  // Store Answers
  const handleAnswer = (questionIndex, option) => {

    setAnswers((prev) => {

      const updated = {
        ...prev,
        [questionIndex]: option,
      };
    
      onQuestionChange?.({
        ...questions[questionIndex],
        selectedAnswer: option
      });
    
      return updated;
    });
  };

  useEffect(() => {

    fetchQuestions();

  }, []);

  // Navigation
  const goTo = (idx) => {

    setCurrent(idx);

    onQuestionChange?.({
      ...questions[idx],
      selectedAnswer: answers[idx]
    });
  };

  // Loading State
  if (loading) {
    return (
      <aside className="h-full flex items-center justify-center text-white">
        Generating AI Questions...
      </aside>
    );
  }

  // Error State
  if (error) {
    return (
      <aside className="h-full flex items-center justify-center text-red-400">
        {error}
      </aside>
    );
  }

  // Empty State
  if (!questions.length) {
    return (
      <aside className="h-full flex items-center justify-center text-red-400">
        No questions available
      </aside>
    );
  }

  const q = questions[current];

  // Calculate Score
  const score = questions.reduce((total, question, idx) => {

    if (answers[idx] === question.answer) {
      return total + 1;
    }

    return total;

  }, 0);

  return (
    <aside className="h-full min-h-0 border-r border-white/10 bg-[#050816]/80 backdrop-blur-xl flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/5 shrink-0">

        <div className="flex items-center justify-between gap-6 flex-nowrap">

          <div className="flex items-center gap-4 flex-wrap">

            <div>

              <p className="text-[11px] uppercase tracking-[0.24em] text-[#A1A1AA] font-semibold">
                Practice Workspace
              </p>

              <h1 className="mt-1 text-2xl font-bold text-white whitespace-nowrap">
                Python Questions
              </h1>

            </div>

          </div>

          <div className="flex items-center gap-3">

            {/* Score */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-400 font-semibold">
              Score: {score}/{questions.length}
            </div>

            {/* Generate */}
            {/* <button
              onClick={fetchQuestions}
              className="px-4 py-2 rounded-lg bg-[#6C63FF] text-white text-sm hover:opacity-90 transition-all"
            >
              Generate New
            </button> */}

            {/* Count */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-[#A1A1AA]">

              <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E] animate-pulseDot" />

              {questions.length} MCQs

            </div>

          </div>

        </div>

      </div>

      {/* Question Numbers */}
      <div className="px-4 pt-4 shrink-0 flex gap-2 flex-wrap">

        {questions.map((_, idx) => (

          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
              ${
                idx === current
                  ? "bg-[#6C63FF] text-white shadow-[0_0_12px_rgba(108,99,255,0.4)]"
                  : answers[idx]
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/5 text-[#A1A1AA] border border-white/10 hover:bg-white/10"
              }`}
          >

            {answers[idx] ? "✓" : idx + 1}

          </button>

        ))}

      </div>

      {/* Current Question */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-4">

        <QuestionCard
          question={q}
          index={current + 1}
          selectedAnswer={answers[current]}
          onAnswer={(option) => handleAnswer(current, option)}
        />

      </div>

      {/* Navigation */}
      <div className="px-4 py-4 border-t border-white/10 shrink-0 flex justify-between gap-3">

        <button
          disabled={current === 0}
          onClick={() => goTo(current - 1)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-[#A1A1AA]
          hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
        >
          ← Previous
        </button>

        <button
          disabled={current === questions.length - 1}
          onClick={() => goTo(current + 1)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-[#A1A1AA]
          hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
        >
          Next →
        </button>

      </div>

    </aside>
  );
};

export default QuestionsPanel;