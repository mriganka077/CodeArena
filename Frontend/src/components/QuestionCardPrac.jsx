import { useState } from 'react';

const QuestionCard = ({
  question,
  index,
  delay = 0,
  selectedAnswer,
  onAnswer,
}) => {
  if (!question) return null;

  const handleOptionClick = (option) => {
    onAnswer(option);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden animate-fadeUp"
      style={{
        animationDelay: `${delay}s`,
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Mac-style dots */}
      <div className="flex items-center gap-1.5 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="ml-auto text-[10px] font-mono text-white/20">Q{index}</span>
      </div>

      {/* Question text */}
      <div className="px-5 pt-4 pb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6C63FF] mb-2">
          Question {index}
        </p>
        <h2 className="text-[14px] font-semibold text-white leading-[1.7]">
          {question.question}
        </h2>
      </div>

      {/* Optional code block */}
      {question.code && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <pre className="p-4 overflow-x-auto text-[12px] leading-6 font-mono text-slate-300 scrollbar-thin">
            <code>{question.code}</code>
          </pre>
        </div>
      )}

      {/* MCQ options */}
      {question.options?.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/25 mb-2.5">
            Choose one
          </p>
          <div className="flex flex-col gap-2">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className="w-full rounded-xl px-4 py-3 text-left text-[13px] transition-all duration-150"
                  style={{
                    background: isSelected ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid rgba(108,99,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.65)',
                    boxShadow: isSelected ? '0 0 0 1px rgba(108,99,255,0.2) inset' : 'none',
                  }}
                >
                  <span className="font-bold mr-2.5"
                    style={{ color: isSelected ? '#a89eff' : 'rgba(255,255,255,0.25)' }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Coding prompt footer */}
      {!question.options?.length && (
        <div className="px-4 pb-4">
          <p className="text-[11px] text-white/25 font-mono">
            → Write your solution in the editor
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;