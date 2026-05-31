import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import SoftBackdrop from "../../components/SoftBackdrop";
import LenisScroll from "../../components/lenis";

const ResultPage = () => {
  const { driveId, type } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/result/${driveId}/${type}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.success) {
          setResultData(data.result);
        } else {
          setError(data.message || "Failed to fetch result data.");
        }
      } catch (err) {
        setError("An error occurred while fetching the result.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [driveId, type]);

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const getStatusStyle = (value) => {
    const val = String(value).toLowerCase();
    if (["pass", "passed", "selected", "cleared", "good", "excellent"].includes(val)) {
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
    }
    if (["fail", "failed", "rejected", "poor", "bad"].includes(val)) {
      return "text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
    }
    return "text-indigo-400 bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]";
  };

  const formatTimeTaken = (seconds) => {
    if (isNaN(seconds) || seconds === null) return seconds;
    const totalSeconds = Number(seconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const renderSmartLayout = () => {
    if (!resultData) return null;

    const metrics = [];
    const longTexts = [];
    const complexData = [];

    Object.entries(resultData).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();

      if (
        ["_id", "driveId", "userId", "__v"].includes(key) ||
        lowerKey.includes("coding") ||
        lowerKey.includes("mcq")
      ) {
        return;
      }

      if (type === "interview") {
        const interviewExclusions = [
          "status", "technicalknowledge", "communication", 
          "problemsolving", "confidence", "feedback", "transcript"
        ];
        if (interviewExclusions.includes(lowerKey)) return;
      } else if (type === "assessment") {
        if (lowerKey === "status") return;
      }

      let displayValue = value;
      if (lowerKey === "timetaken" || lowerKey === "duration") {
        displayValue = formatTimeTaken(value);
      }

      if (typeof displayValue === "object" && displayValue !== null) {
        complexData.push({ key, value: displayValue });
      } else if (typeof displayValue === "string" && displayValue.length > 50) {
        longTexts.push({ key, value: displayValue });
      } else {
        metrics.push({ key, value: displayValue });
      }
    });

    const containerVariants = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="space-y-8"
      >
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {metrics.map(({ key, value }) => {
              const isStatus = key.toLowerCase().includes("status");
              return (
                <motion.div
                  variants={itemVariants}
                  key={key}
                  className="relative group overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-md p-6 rounded-[2rem] border border-white/10 hover:border-indigo-500/50 transition-all duration-500"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-indigo-500/50 transition-colors duration-500" />
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/80 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em]">
                      {formatLabel(key)}
                    </h3>
                  </div>

                  {isStatus ? (
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-black tracking-wide border backdrop-blur-sm ${getStatusStyle(value)}`}>
                      {String(value).toUpperCase()}
                    </span>
                  ) : (
                    <p className="text-white text-3xl font-bold tracking-tight">
                      {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {longTexts.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {longTexts.map(({ key, value }) => (
              <motion.div
                variants={itemVariants}
                key={key}
                className="relative bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-80" />
                <h3 className="text-indigo-300 text-xs font-black uppercase tracking-[0.25em] mb-4 pl-4">
                  {formatLabel(key)}
                </h3>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium pl-4">
                  {value}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {complexData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complexData.map(({ key, value }) => (
              <motion.div
                variants={itemVariants}
                key={key}
                className="bg-white/[0.02] backdrop-blur-lg p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <svg className="w-4 h-4 text-indigo-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  {formatLabel(key)}
                </h3>
                
                {Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-2.5">
                    {value.map((item, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm text-indigo-200 font-semibold shadow-sm"
                      >
                        {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(value).map(([subKey, subVal]) => (
                      <div key={subKey} className="flex justify-between items-center group border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">{formatLabel(subKey)}</span>
                        <span className="text-white text-sm font-semibold bg-white/5 px-3 py-1.5 rounded-lg group-hover:bg-white/10 transition-colors">
                          {typeof subVal === 'object' ? 'Nested Data' : String(subVal)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <SoftBackdrop />
      <LenisScroll />
      <div className="min-h-screen font-geist text-white relative">
        <div className="absolute top-40 left-20 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

        <Header />

        <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 mb-8 text-xs font-bold tracking-[0.2em] uppercase"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Overview
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-indigo-400/50 mb-4">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Result
                </h1>
                <p className="text-gray-400 font-medium text-lg max-w-2xl leading-relaxed">
                  A comprehensive breakdown of your performance metrics and analytical feedback.
                </p>
              </div>
              
            </div>
          </motion.div>

          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col justify-center items-center h-[50vh] bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-md shadow-2xl"
            >
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin duration-700" />
              </div>
              <p className="text-indigo-300 font-bold tracking-[0.3em] text-xs uppercase animate-pulse">Compiling Data...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-500/10 border border-rose-500/20 rounded-[3rem] p-12 text-center backdrop-blur-md"
            >
              <div className="bg-rose-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-rose-200 text-xl font-bold tracking-wide">{error}</p>
            </motion.div>
          ) : (
            renderSmartLayout()
          )}
        </main>
      </div>
    </>
  );
};

export default ResultPage;