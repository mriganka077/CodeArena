import { useState, useCallback } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const langLabel = (lang) => {
  const map = { python3: 'Python', nodejs: 'JavaScript', java: 'Java', cpp17: 'C++', c: 'C', php: 'PHP', typescript: 'TypeScript', go: 'Go', sql: 'SQL' };
  return map[lang] || lang;
};

const monacoLang = (lang) => {
  const map = { python3: 'python', nodejs: 'javascript', cpp17: 'cpp', java: 'java', c: 'c', php: 'php', typescript: 'typescript', go: 'go', sql: 'sql' };
  return map[lang] || 'plaintext';
};

const mapQuestionLanguage = (lang = '') => {
  switch (lang.toLowerCase()) {
    case 'python':     return 'python3';
    case 'javascript': return 'nodejs';
    case 'java':       return 'java';
    case 'c++':        return 'cpp17';
    case 'c':          return 'c';
    case 'php':        return 'php';
    case 'typescript': return 'typescript';
    case 'go':         return 'go';
    case 'sql':        return 'sql';
    default:           return 'python3';
  }
};

const CodeEditorPrac = ({ currentQuestion, currentIndex, code, output, onCodeChange, onOutputChange }) => {
  const language = mapQuestionLanguage(currentQuestion?.language);
  const [runStatus, setRunStatus] = useState('idle');
  const [metaText, setMetaText] = useState('');

  const runCode = useCallback(async () => {
    setRunStatus('running');
    onOutputChange('Running…');
    setMetaText('');
    try {
      const res = await axios.post(`${API_URL}/api/compiler/run`, { code, language, input: '' });
      const d = res.data?.data || {};
      const finalOutput = d.stdout || d.stderr || d.compile_output || 'No output';
      onOutputChange(finalOutput);
      setMetaText(`${d.time || 0}s · ${d.memory || 0} KB`);
      setRunStatus('success');
    } catch (err) {
      setRunStatus('error');
      const msg = typeof err.response?.data?.error === 'object'
        ? JSON.stringify(err.response.data.error, null, 2)
        : err.response?.data?.error || err.message || 'Execution failed';
      onOutputChange(msg);
    }
  }, [code, language, onOutputChange]);

  const clearEditor = () => {
    onCodeChange('');
    onOutputChange('');
    setMetaText('');
    setRunStatus('idle');
  };

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('codearena-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#060d1a',
        'editor.lineHighlightBackground': '#0d1627',
        'editorCursor.foreground': '#6C63FF',
        'editorLineNumber.foreground': '#2a3a55',
        'editorLineNumber.activeForeground': '#6C63FF',
        'editor.selectionBackground': '#1e2d4d',
      },
    });
  };

  const statusDot = {
    idle:    { color: 'rgba(255,255,255,0.2)', pulse: false  },
    running: { color: '#F59E0B',               pulse: true   },
    success: { color: '#22C55E',               pulse: false  },
    error:   { color: '#EF4444',               pulse: false  },
  }[runStatus];

  return (
    <main className="h-full min-h-0 flex flex-col overflow-hidden"
      style={{background: 'rgba(6, 13, 26, 0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', }}>

      {/* Toolbar */}
      <div className="h-14 shrink-0 px-5 flex items-center justify-between gap-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Editor</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', color: '#a89eff' }}>
              {langLabel(language)}
            </span>
          </div>
          <p className="text-[11px] text-white/35 font-mono mt-0.5 truncate max-w-[280px]">
            Q{currentIndex + 1} — {currentQuestion?.question?.slice(0, 50)}…
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clearEditor}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
            Clear
          </button>
          <button onClick={runCode} disabled={runStatus === 'running'}
            className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #6C63FF, #9B5CFF)',
              border: '1px solid rgba(108,99,255,0.4)',
              color: '#fff',
              boxShadow: '0 2px 12px rgba(108,99,255,0.25)',
            }}>
            ▶ Run
          </button>
        </div>
      </div>

      {/* Editor + Output */}
      <div className="flex-1 min-h-0 overflow-hidden grid grid-rows-[minmax(0,1fr)_200px]">

        <div className="min-h-0 overflow-hidden" style={{ background: 'rgba(6, 13, 26, 0.7)' }}>
          <Editor
            height="100%"
            beforeMount={handleEditorWillMount}
            theme="codearena-dark"
            language={monacoLang(language)}
            value={code}
            onChange={(value) => onCodeChange(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineHeight: 22,
              automaticLayout: true,
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              tabSize: 4,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
              scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
            }}
          />
        </div>

        {/* Output panel */}
        <div className="flex flex-col min-h-0 overflow-hidden"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)',  background: 'rgba(4, 9, 15, 0.6)' }}>

          <div className="h-10 shrink-0 px-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full transition-all ${statusDot.pulse ? 'animate-pulse' : ''}`}
                style={{ background: statusDot.color }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Output</span>
            </div>
            {metaText && (
              <span className="text-[10px] font-mono text-white/25">{metaText}</span>
            )}
          </div>

          <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-[12px] leading-6 text-slate-300 whitespace-pre-wrap scrollbar-thin"
            style={{ color: runStatus === 'error' ? '#fca5a5' : undefined }}>
            {output || <span style={{ color: 'rgba(255,255,255,0.15)' }}>Run your code to see output…</span>}
          </pre>
        </div>
      </div>
    </main>
  );
};

export default CodeEditorPrac;