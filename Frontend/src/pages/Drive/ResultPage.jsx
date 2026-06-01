import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
          },
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
    if (
      ["pass", "passed", "selected", "cleared", "good", "excellent"].includes(
        val,
      )
    ) {
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
    if (["fail", "failed", "rejected", "poor", "bad"].includes(val)) {
      return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
    return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
  };

  const formatTime = (value) => {
    const totalSeconds = parseInt(value, 10);
    if (isNaN(totalSeconds)) return value;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const renderSmartLayout = () => {
    if (!resultData) return null;

    const currentType = type?.toLowerCase() || "";
    const metrics = [];
    const longTexts = [];
    const complexData = [];

    const getOriginalKey = (possibleKeys) =>
      Object.keys(resultData).find((k) =>
        possibleKeys.includes(k.toLowerCase()),
      );

    const kScore = getOriginalKey(["score"]);
    const kPercentage = getOriginalKey(["percentage"]);
    const kTimeTaken = getOriginalKey(["timetaken", "duration"]);
    const kTerminationReason = getOriginalKey(["terminationreason"]);
    const kIsPass = getOriginalKey(["ispass"]);
    const kRecommendation = getOriginalKey(["recommendation"]);
    const kViolations = getOriginalKey(["violations", "violation"]);

    const layoutExcludedKeys = [
      kScore,
      kPercentage,
      kTimeTaken,
      kTerminationReason,
      kIsPass,
      kRecommendation,
      kViolations,
    ].filter(Boolean);

    Object.entries(resultData).forEach(([key, value]) => {
      if (
        ["_id", "driveId", "userId", "__v"].includes(key) ||
        layoutExcludedKeys.includes(key)
      ) {
        return;
      }

      const lowerKey = key.toLowerCase();

      const assessmentExclusions = ["status", "mcqanswers", "codinganswers"];
      const interviewExclusions = [
        "status",
        "technicalknowledge",
        "communication",
        "problemsolving",
        "confidence",
        "feedback",
        "transcript",
        "interviewid",
      ];

      if (
        currentType === "assessment" &&
        assessmentExclusions.includes(lowerKey)
      ) {
        return;
      }

      if (
        currentType === "interview" &&
        interviewExclusions.includes(lowerKey)
      ) {
        return;
      }

      if (typeof value === "object" && value !== null) {
        complexData.push({ key, value });
      } else if (typeof value === "string" && value.length > 50) {
        longTexts.push({ key, value });
      } else {
        metrics.push({ key, value });
      }
    });

    const renderMetricBox = (key, value, customStatusColor) => {
      const isTime =
        key.toLowerCase().includes("time") ||
        key.toLowerCase().includes("duration");
      let displayValue = value;
      if (typeof value === "boolean") {
        displayValue = value ? "Yes" : "No";
      } else if (isTime && value !== "N/A") {
        displayValue = formatTime(value);
      }

      return (
        <div className="bg-white/[0.03] backdrop-blur-md p-5 md:p-6 rounded-[1.5rem] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 h-full flex flex-col justify-center">
          <h3 className="text-gray-400 text-[11px] md:text-xs font-bold uppercase tracking-widest mb-2">
            {formatLabel(key)}
          </h3>
          {customStatusColor ? (
            <div>
              <span
                className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${customStatusColor}`}
              >
                {String(displayValue).toUpperCase()}
              </span>
            </div>
          ) : (
            <p className="text-white text-xl md:text-2xl lg:text-3xl font-semibold break-words">
              {displayValue}
            </p>
          )}
        </div>
      );
    };

    const renderViolationsBlock = (key, value) => (
      <div className="bg-white/[0.02] backdrop-blur-md p-5 md:p-6 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-colors h-full">
        <h3 className="text-rose-400 text-[11px] md:text-xs font-bold uppercase tracking-widest mb-3">
          {formatLabel(key)}
        </h3>
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-2">
            {value.map((item, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 font-medium"
              >
                {typeof item === "object" ? JSON.stringify(item) : String(item)}
              </span>
            ))}
          </div>
        ) : typeof value === "object" && value !== null ? (
          <div className="space-y-2.5">
            {Object.entries(value).map(([subKey, subVal]) => (
              <div
                key={subKey}
                className="flex justify-between items-start border-b border-white/5 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-gray-500 text-xs md:text-sm font-medium">
                  {formatLabel(subKey)}
                </span>
                <span className="text-white text-xs md:text-sm font-semibold text-right pl-3">
                  {typeof subVal === "object" ? "Nested Data" : String(subVal)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {String(value)}
          </p>
        )}
      </div>
    );

    return (
      <div className="space-y-4 md:space-y-5">
        {(currentType === "assessment" || currentType === "interview") && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
            <div className="lg:col-span-2 flex flex-col gap-4 md:gap-5">
              {currentType === "assessment" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {renderMetricBox(
                      kScore || "Score",
                      kScore ? resultData[kScore] : "N/A",
                    )}
                    {renderMetricBox(
                      kPercentage || "Percentage",
                      kPercentage ? resultData[kPercentage] : "N/A",
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {renderMetricBox(
                      kTimeTaken || "Time Taken",
                      kTimeTaken ? resultData[kTimeTaken] : "N/A",
                    )}
                    {renderMetricBox(
                      kTerminationReason || "Termination Reason",
                      kTerminationReason
                        ? resultData[kTerminationReason]
                        : "N/A",
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:gap-5">
                    {(() => {
                      const passVal = kIsPass ? resultData[kIsPass] : "N/A";
                      const isPassYes =
                        passVal === true ||
                        String(passVal).toLowerCase() === "yes" ||
                        String(passVal).toLowerCase() === "true";
                      const color =
                        passVal !== "N/A"
                          ? isPassYes
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                          : "";
                      return renderMetricBox(
                        kIsPass || "Is Pass",
                        passVal,
                        color,
                      );
                    })()}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {renderMetricBox(
                      kScore || "Score",
                      kScore ? resultData[kScore] : "N/A",
                    )}
                    {renderMetricBox(
                      kTimeTaken || "Time Taken",
                      kTimeTaken ? resultData[kTimeTaken] : "N/A",
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {renderMetricBox(
                      kTerminationReason || "Termination Reason",
                      kTerminationReason
                        ? resultData[kTerminationReason]
                        : "N/A",
                    )}
                    {(() => {
                      const recVal = kRecommendation
                        ? resultData[kRecommendation]
                        : "N/A";
                      const isHire = String(recVal).toLowerCase() === "hire";
                      const color =
                        recVal !== "N/A"
                          ? isHire
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                          : "";
                      return renderMetricBox(
                        kRecommendation || "Recommendation",
                        recVal,
                        color,
                      );
                    })()}
                  </div>
                </>
              )}
            </div>

            <div className="lg:col-span-1">
              {kViolations ? (
                renderViolationsBlock(kViolations, resultData[kViolations])
              ) : (
                <div className="bg-white/[0.02] backdrop-blur-md p-5 md:p-6 rounded-[1.5rem] border border-white/5 h-full flex flex-col justify-center items-center text-center">
                  <h3 className="text-gray-400 text-[11px] md:text-xs font-bold uppercase tracking-widest mb-2">
                    Violations
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm font-medium">
                    No violations recorded.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {metrics.map(({ key, value }) => {
              const lowerKey = key.toLowerCase();
              const isStatus = lowerKey.includes("status");
              const isTime =
                lowerKey.includes("time") || lowerKey.includes("duration");

              let displayValue = value;
              if (typeof value === "boolean") {
                displayValue = value ? "Yes" : "No";
              } else if (isTime) {
                displayValue = formatTime(value);
              }

              return (
                <div
                  key={key}
                  className="bg-white/[0.03] backdrop-blur-md p-5 rounded-[1.5rem] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 flex flex-col justify-center"
                >
                  <h3 className="text-gray-400 text-[11px] md:text-xs font-bold uppercase tracking-widest mb-2">
                    {formatLabel(key)}
                  </h3>
                  {isStatus ? (
                    <div>
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${getStatusStyle(
                          value,
                        )}`}
                      >
                        {String(value).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <p className="text-white text-xl md:text-2xl font-semibold break-words">
                      {displayValue}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {longTexts.length > 0 && (
          <div className="space-y-4">
            {longTexts.map(({ key, value }) => (
              <div
                key={key}
                className="bg-white/[0.02] backdrop-blur-md p-6 md:p-8 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-colors"
              >
                <h3 className="text-indigo-400 text-[11px] md:text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                  {formatLabel(key)}
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {complexData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {complexData.map(({ key, value }) => (
              <div
                key={key}
                className="bg-white/[0.02] backdrop-blur-md p-6 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-colors"
              >
                <h3 className="text-gray-400 text-[11px] md:text-xs font-bold uppercase tracking-widest mb-4">
                  {formatLabel(key)}
                </h3>

                {Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-2">
                    {value.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 font-medium"
                      >
                        {typeof item === "object"
                          ? JSON.stringify(item)
                          : String(item)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {Object.entries(value).map(([subKey, subVal]) => (
                      <div
                        key={subKey}
                        className="flex justify-between items-start border-b border-white/5 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="text-gray-500 text-xs md:text-sm font-medium">
                          {formatLabel(subKey)}
                        </span>
                        <span className="text-white text-xs md:text-sm font-semibold text-right pl-3">
                          {typeof subVal === "object"
                            ? "Nested Data"
                            : String(subVal)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <SoftBackdrop />
      <LenisScroll />
      <div className="min-h-screen font-geist text-white flex flex-col">
        <Header />

        <main className="pt-6 pb-12 px-5 md:px-8 max-w-5xl mx-auto relative z-10 w-full flex-1">
          <div className="mb-8 md:mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-400">
              {type.charAt(0).toUpperCase() + type.slice(1)} Result
            </h1>
            <p className="text-gray-400 mt-2 font-medium text-sm md:text-base">
              Detailed breakdown of your performance metrics.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-48 bg-white/[0.02] border border-white/5 rounded-[2rem]">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">
                Compiling Results...
              </p>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-8 text-center backdrop-blur-md">
              <div className="bg-rose-500/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-rose-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-rose-200 text-sm md:text-base font-medium">
                {error}
              </p>
            </div>
          ) : (
            <div className="animate-fade-in-up">{renderSmartLayout()}</div>
          )}
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white flex items-center transition-colors text-[11px] md:text-xs font-bold tracking-widest uppercase group"
          >
            <span className="bg-white/5 p-2 rounded-full mr-3 group-hover:bg-white/10 transition-all duration-300 border border-white/5 group-hover:scale-105">
              <svg
                className="w-3.5 h-3.5 md:w-4 md:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </span>
            Return to Drive Preview
          </button>
        </main>
      </div>
    </>
  );
};

export default ResultPage;
