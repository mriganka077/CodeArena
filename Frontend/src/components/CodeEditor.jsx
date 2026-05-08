import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import LanguageDropdown from "./LanguageDropdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import { useAuth } from '../context/AuthContext'; // adjust path if needed

const CodeEditor = ({ currentQuestion }) => {
  const starterCodes = {
    python3: `print("Hello World")`,

    nodejs: `console.log("Hello World");`,

    java: `public class Main {
    public static void main(String[] args) {
      System.out.println("Hello World");
    }
  }`,

    cpp17: `#include <iostream>
  using namespace std;
  
  int main() {
    cout << "Hello World";
    return 0;
  }`,

    c: `#include <stdio.h>
  
  int main() {
    printf("Hello World");
    return 0;
  }`,

    sql: `SELECT * FROM employees;`


  };

  const token = localStorage.getItem('token');          // pull JWT from your auth context
  const [code, setCode] = useState(starterCodes.python3);
  const [output, setOutput] = useState('Run code to see output here...');
  const [status, setStatus] = useState('idle');
  const [metaText, setMetaText] = useState('');
  const [submitState, setSubmitState] = useState('idle'); // idle | loading | done | error
  const [aiReview, setAiReview] = useState('');
  const outputRef = useRef('');   // track output for submit

  const [language, setLanguage] = useState("python3");

  const [reviewHeight, setReviewHeight] = useState(260);
  const isDragging = useRef(false);

  useEffect(() => {

    const handleMouseMove = (e) => {
  
      if (!isDragging.current) return;
  
      const newHeight = window.innerHeight - e.clientY;
  
      if (newHeight > 150 && newHeight < 600) {
        setReviewHeight(newHeight);
      }
    };
  
    const stopDragging = () => {
      isDragging.current = false;
    };
  
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
  
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  
  }, []);
  // keep outputRef in sync
  useEffect(() => { outputRef.current = output; }, [output]);

  // reset editor when question changes
  // reset editor when question changes
  useEffect(() => {
    setCode(starterCodes[language]);
    setOutput('Run code to see output here...');
    setStatus('idle');
    setMetaText('');
    setSubmitState('idle');
    setAiReview('');
  }, [currentQuestion?.id]);

  // ADD HERE
  useEffect(() => {
    setCode(starterCodes[language]);
  }, [language]);





  const runCode = async () => {
    try {
      setStatus("running");
      setOutput("Running...");

      const response = await axios.post(
        "http://localhost:4000/api/compiler/run",
        {
          code,
          language,
          input: ""
        }
      );

      const data = response.data;

      const finalOutput =
        data.data?.stdout ||
        data.data?.stderr ||
        data.data?.compile_output ||
        "No output";

      setOutput(finalOutput);

      outputRef.current = finalOutput;

      setMetaText(
        `${data.data?.time || 0}s • ${data.data?.memory || 0} KB`
      );

      setStatus("success");

    } catch (err) {
      setStatus("error");

      const errorData = err.response?.data?.error;

      const errorMessage =
        typeof errorData === "object"
          ? JSON.stringify(errorData, null, 2)
          : errorData || err.message || "Execution failed";

      setOutput(errorMessage);
    }
  };

  const handleSubmit = async () => {

    if (!currentQuestion) return;
  
    setSubmitState('loading');
    setAiReview('');
  
    try {
  
      const res = await axios.post(
        '/api/practice/submit',
        {
          questionId: currentQuestion._id,
      
          type: currentQuestion.type || "MCQ",
      
          questionTitle:
            currentQuestion.title ||
            currentQuestion.question,
      
          question:
            currentQuestion.question,
      
          options:
            currentQuestion.options || [],
      
          correctAnswer:
            currentQuestion.answer,
      
          selectedAnswer:
            currentQuestion.selectedAnswer || null,
      
          code,
          language,
          output: outputRef.current
      
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      setAiReview(res.data.submission.aiReview);
  
      setSubmitState('done');
  
    } catch (err) {
  
      setSubmitState('error');
  
      console.error(
        'Submit error status:',
        err.response?.status
      );
  
      console.error(
        'Submit error data:',
        err.response?.data
      );
  
      console.error(
        'Submit error message:',
        err.message
      );
  
      setAiReview(
        `Error ${err.response?.status}: ${
          JSON.stringify(err.response?.data) || err.message
        }`
      );
    }
  };

  const clearEditor = () => {
    setCode('');
    setOutput('Run code to see output here...');
    setMetaText('');
    setStatus('idle');
    setSubmitState('idle');
    setAiReview('');
  };

  function handleEditorWillMount(monaco) {
    monaco.editor.defineTheme("codearena-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#000814",
        "editor.lineHighlightBackground": "#111111",
        "editorCursor.foreground": "#ffffff",
        "editorLineNumber.foreground": "#666666",
        "editor.selectionBackground": "#264F78",
      },
    });
  }

  return (
    <main className="h-full min-h-0 flex flex-col bg-[#0b1220]/70 overflow-visible">

      {/* Toolbar */}
      <div className="relative z-50 h-16 shrink-0 border-b border-white/10 bg-[#050816]/70 backdrop-blur-xl px-5 flex items-center justify-between gap-4 overflow-visible">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#A1A1AA] font-semibold">Code Editor</p>
          {/* <h2 className="mt-1 text-lg font-semibold text-white">
            {currentQuestion ? `Q${currentQuestion.id}: ${currentQuestion.title}` : 'Code Playground'}
          </h2> */}
        </div>
        <div className="relative group">
          {/* Glow Border */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-violet-600/40 via-fuchsia-500/30 to-indigo-500/30 blur-md opacity-0 transition-all duration-300 group-hover:opacity-100" />

          <LanguageDropdown
            language={language}
            setLanguage={setLanguage}
          />


        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearEditor}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#A1A1AA] hover:bg-white/10 hover:text-white transition-all"
          >
            Clear
          </button>
          <button
            onClick={runCode}
            disabled={status === 'running'}
            className="rounded-xl bg-[#6C63FF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7b73ff] transition-all shadow-[0_0_0_1px_rgba(108,99,255,0.16),_0_10px_30px_rgba(0,0,0,0.28)] disabled:opacity-50"
          >
            ▶ Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitState === 'loading' || status === 'running'}
            className="rounded-xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16a34a] transition-all shadow-[0_0_0_1px_rgba(34,197,94,0.16),_0_10px_30px_rgba(0,0,0,0.28)] disabled:opacity-50"
          >
            {submitState === 'loading' ? 'Submitting...' : '✓ Submit'}
          </button>
        </div>
      </div>

      {/* Editor + Output + AI Review */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">

        {/* Editor + Output */}
        <div className="flex-1 min-h-0 overflow-hidden grid grid-rows-[minmax(0,1fr)_180px]">

          {/* Code area */}
          <div className="min-h-0 bg-[#07101d] overflow-hidden">
            <Editor
              height="100%"
              beforeMount={handleEditorWillMount}
              theme="codearena-dark"
              language={
                language === "python3"
                  ? "python"
                  : language === "nodejs"
                    ? "javascript"
                    : language === "cpp17"
                      ? "cpp"
                      : language
              }
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                tabSize: 4,
                wordWrap: "on"
              }}
            />
          </div>

          {/* Output panel */}
          <div className="border-t border-white/10 bg-[#050816]/80 flex flex-col min-h-0 overflow-hidden">

            <div className="h-11 shrink-0 px-4 border-b border-white/10 flex items-center justify-between">

              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#A1A1AA]">

                <span
                  className={`h-2.5 w-2.5 rounded-full transition-all ${status === 'running'
                      ? 'bg-yellow-400 animate-pulseDot'
                      : status === 'success'
                        ? 'bg-[#22C55E]'
                        : status === 'error'
                          ? 'bg-red-400'
                          : 'bg-white/30'
                    }`}
                />

                Output
              </div>

              <div className="text-xs text-[#A1A1AA] font-mono">
                {metaText}
              </div>

            </div>

            <pre className="min-h-0 flex-1 overflow-auto scrollbar-thin p-4 font-mono text-[13px] leading-7 text-slate-200 whitespace-pre-wrap">
              {output}
            </pre>

          </div>
        </div>

        {/* AI Review Panel Here */}

      </div>

      {/* AI Review Panel — slides in after submit */}
      {(submitState === 'done' || submitState === 'error') && (
        <div
          className="border-t border-white/10 bg-[#050816] overflow-hidden flex flex-col"
          style={{ height: `${reviewHeight}px` }}
        >

          {/* Resize Handle */}
          <div
            onMouseDown={() => (isDragging.current = true)}
            className="h-2 cursor-row-resize bg-white/5 hover:bg-[#6C63FF]/40 transition-all"
          />

          {aiReview && (
            <div className="flex-1 overflow-auto mt-2 ml-4 mb-4 pr-4 scrollbar-thin">

              <h3 className="text-xs text-[#6C63FF] font-semibold mb-3">
                🐇 AI Review
              </h3>

              <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white text-sm leading-7">

                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiReview
                    .replace(/^Correctness/gm, "# Correctness")
                    .replace(/^Code Quality/gm, "# Code Quality")
                    .replace(/^Optimization/gm, "# Optimization")
                    .replace(/^Verdict/gm, "# Verdict")
                  }
                </ReactMarkdown>

              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default CodeEditor;