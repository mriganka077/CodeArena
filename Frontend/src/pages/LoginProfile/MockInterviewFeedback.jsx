import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  CalendarDays,
  Clock3,
  Code2,
  Brain,
  MessageSquareText,
  BriefcaseBusiness,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Headphones,
  FolderKanban,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Bot,
  Hash,
} from "lucide-react";

import Header from "../../components/Header";
import LenisScroll from "../../components/lenis";
import SoftBackdrop from "../../components/SoftBackdrop";


const MockInterviewFeedback = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  let storedResult = {};

  try {
    storedResult = JSON.parse(
      localStorage.getItem("latestInterviewResult")
    ) || {};
  } catch {
    storedResult = {};
  }
  
  const result =
    location.state?.result ||
    storedResult;
  
  const skills = [
    {
      title: "Technical Skills",
      score: `${Math.round(
        (result?.technicalKnowledge || 0) / 10
      )}/10`,
      percent: `${result?.technicalKnowledge || 0}%`,
      description:
        "Knowledge of technical concepts and subject expertise.",
      icon: <Code2 size={20} />,
      color: "from-violet-500 to-indigo-500",
    },
  
    {
      title: "Problem Solving",
      score: `${Math.round(
        (result?.problemSolving || 0) / 10
      )}/10`,
      percent: `${result?.problemSolving || 0}%`,
      description:
        "Logical thinking and problem-solving ability.",
      icon: <Brain size={20} />,
      color: "from-green-400 to-emerald-500",
    },
  
    {
      title: "Communication",
      score: `${Math.round(
        (result?.communication || 0) / 10
      )}/10`,
      percent: `${result?.communication || 0}%`,
      description:
        "Communication and articulation skills.",
      icon: <MessageSquareText size={20} />,
      color: "from-violet-400 to-purple-500",
    },
  
    {
      title: "Confidence",
      score: `${Math.round(
        (result?.confidence || 0) / 10
      )}/10`,
      percent: `${result?.confidence || 0}%`,
      description:
        "Confidence while answering interview questions.",
      icon: <BriefcaseBusiness size={20} />,
      color: "from-orange-400 to-red-500",
    },
  ];
  
  const strengths = [];
  
  if (
    result?.technicalKnowledge >= 70
  )
    strengths.push(
      "Strong technical knowledge"
    );
  
  if (
    result?.problemSolving >= 70
  )
    strengths.push(
      "Excellent problem solving"
    );
  
  if (
    result?.communication >= 70
  )
    strengths.push(
      "Good communication skills"
    );
  
  if (
    result?.confidence >= 70
  )
    strengths.push(
      "High confidence level"
    );
  
  
  const improvements = [];
  
  if (
    result?.technicalKnowledge < 70
  )
    improvements.push(
      "Improve technical depth"
    );
  
  if (
    result?.problemSolving < 70
  )
    improvements.push(
      "Practice problem solving"
    );
  
  if (
    result?.communication < 70
  )
    improvements.push(
      "Enhance communication"
    );
  
  if (
    result?.confidence < 70
  )
    improvements.push(
      "Build confidence"
    );
  
  const recommendations = [];
  
  if (
    result?.technicalKnowledge < 70
  ) {
    recommendations.push({
      title:
        "Strengthen Technical Knowledge",
      desc:
        "Focus on core concepts and practical implementation.",
      icon: <BookOpen size={20} />,
    });
  }
  
  if (
    result?.communication < 70
  ) {
    recommendations.push({
      title:
        "Improve Communication",
      desc:
        "Practice explaining concepts clearly.",
      icon: <Headphones size={20} />,
    });
  }
  
  if (
    result?.problemSolving < 70
  ) {
    recommendations.push({
      title:
        "Practice Problem Solving",
      desc:
        "Solve more real-world interview questions.",
      icon: <FolderKanban size={20} />,
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Excellent Performance",
      desc: "Continue maintaining your current level.",
      icon: <CheckCircle2 size={20} />,
    });
  }
  const navigate = useNavigate();

  return (
    <>
      <SoftBackdrop />
      <Header />
      <LenisScroll />

      <div className="relative z-10 min-h-screen overflow-hidden px-4 py-10 text-white md:px-10">
        {/* Background Glow Effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-120px] top-[120px] h-[350px] w-[350px] rounded-full bg-violet-600/20 blur-[120px]" />

          <div className="absolute bottom-[-120px] right-[-120px] h-[350px] w-[350px] rounded-full bg-indigo-600/20 blur-[120px]" />

          <div className="absolute left-[40%] top-[30%] h-[250px] w-[250px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-7xl">
          {/* Top Section */}
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3 backdrop-blur-xl">
                  <Sparkles className="text-violet-300" size={24} />
                </div>

                <h1 className="bg-gradient-to-r from-white to-violet-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                  AI Interview Feedback
                </h1>
              </div>

              <p className="mt-3 ml-16 text-gray-400">
                Comprehensive analysis of your interview performance
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="
                flex items-center gap-2 rounded-2xl
                border border-violet-500/20
                bg-violet-500/10
                px-5 py-3
                text-sm font-medium text-violet-200
                backdrop-blur-xl
                transition-all duration-300
                hover:bg-violet-500/20
                hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]
              "
            >
              <ArrowLeft size={18} />
              Go to Dashboard
            </button>
          </div>

          {/* Profile + Score */}
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            {/* Candidate Info */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{
                y: -5,
                scale: 1.01,
              }}
              className="
                rounded-3xl border border-white/10
                bg-white/[0.04]
                p-6
                backdrop-blur-2xl
                shadow-[0_8px_32px_rgba(31,38,135,0.37)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-violet-500/20
                hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]
              "
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                    {
                      result?.userId
                        ? `${result.userId.firstName?.[0] || ""}${result.userId.lastName?.[0] || ""}`
                        : `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`
                    }
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">
                      {result?.userId
                        ? `${result.userId.firstName} ${result.userId.lastName}`
                        : `${user?.firstName || ""} ${user?.lastName || ""}`}
                    </h2>

                    <p className="text-sm text-gray-400">
                      {result?.userId?.email || user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex flex-wrap items-center
                    gap-10
                    text-sm
                  "
                >

                  {/* Interview ID */}
                  <div className="flex items-center gap-3">

                    <div className="text-violet-400">
                      <Hash size={20} />
                    </div>

                    <div className="leading-tight">
                      <p className="text-gray-500">
                        Interview ID
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {`INT-${result?._id?.slice(-6) || "000000"}`}
                      </p>
                    </div>
                  </div>

                  {/* Domain */}
                  <div className="flex items-center gap-3">

                    <div className="text-violet-400">
                      <Code2 size={20} />
                    </div>

                    <div className="leading-tight">
                      <p className="text-gray-500">
                        Domain
                      </p>

                      <p className="mt-1 font-semibold text-white">
                      {result?.domain}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-3">

                    <div className="text-violet-400">
                      <CalendarDays size={20} />
                    </div>

                    <div className="leading-tight">
                      <p className="text-gray-500">
                        Date
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {new Date(
                          result?.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-3">

                    <div className="text-violet-400">
                      <Clock3 size={20} />
                    </div>

                    <div className="leading-tight">
                      <p className="text-gray-500">
                        Duration
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {result?.timeTaken
                          ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60
                          }s`
                          : "0s"}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>

            {/* Score Card */}
            <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{
              y: -5,
              scale: 1.02,
            }}
              className="
                rounded-3xl border border-violet-500/20
                bg-white/[0.04]
                p-6
                backdrop-blur-2xl
                shadow-[0_8px_32px_rgba(31,38,135,0.37)]
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-[0_0_50px_rgba(139,92,246,0.2)]
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Overall Score</p>

                  <h2 className="mt-2 text-5xl font-bold text-violet-300">
                    {(
                      (result?.score || 0) / 10
                    ).toFixed(1)}
                    <span className="text-xl text-gray-500">/10</span>
                  </h2>

                  <p className="mt-2 font-medium text-green-400">
                   {result?.recommendation}
                  </p>
                </div>

                {/* Progress Ring */}
                <div className="relative h-40 w-40">
                  <svg
                    className="h-40 w-40 rotate-[-90deg]"
                    viewBox="0 0 160 160"
                  >
                    {/* Outer Glow */}
                    <motion.circle
                      initial={{
                        strokeDashoffset: 389.5,
                      }}
                      animate={{
                        strokeDashoffset:
                          389.5 -
                          ((result?.score || 0) / 100) *
                            389.5,
                      }}
                      transition={{
                        duration: 1.8,
                        ease: "easeOut",
                      }}
                      cx="80"
                      cy="80"
                      r="62"
                      stroke="rgba(139,92,246,0.08)"
                      strokeWidth="14"
                      fill="none"
                    />

                    {/* Background Ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r="62"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="12"
                      fill="none"
                    />

                    {/* Progress Ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r="62"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="389.5"
                      strokeDashoffset={
                        389.5 -
                        ((result?.score || 0) / 100) *
                          389.5
                      }
                      className="drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]"
                    />

                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#A855F7" />
                        <stop offset="100%" stopColor="#6366F1" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {result?.score || 0}%
                    </span>

                    <span className="mt-1 text-xs tracking-wide text-gray-400">
                      PERFORMANCE
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-sm leading-6 text-gray-300">
                 {result?.feedback}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Skills */}
          <div className="mt-10">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2 backdrop-blur-xl">
                  <BarChart3 className="text-violet-300" size={20} />
                </div>

                <h2 className="text-2xl font-semibold">
                  Skills Assessment
                </h2>
              </div>

              <p className="mt-2 ml-14 text-sm text-gray-400">
                Detailed breakdown of your performance across key areas
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                  }}
                  className="
                    rounded-3xl border border-white/10
                    bg-white/[0.04]
                    p-6
                    backdrop-blur-2xl
                    shadow-[0_8px_32px_rgba(31,38,135,0.25)]
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-violet-500/20
                    hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]
                  "
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/[0.05] p-2 text-violet-300">
                        {skill.icon}
                      </div>

                      <h3 className="font-semibold">{skill.title}</h3>
                    </div>

                    <span className="text-lg font-bold text-violet-300">
                      {skill.score}
                    </span>
                  </div>

                  <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                      style={{ width: skill.percent }}
                    />
                  </div>

                  <p className="text-sm leading-7 text-gray-400">
                    {skill.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {/* Performance Summary */}
            <div
              className="
                rounded-3xl border border-white/10
                bg-white/[0.04]
                p-6
                backdrop-blur-2xl
                shadow-[0_8px_32px_rgba(31,38,135,0.25)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-violet-500/20
              "
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2 backdrop-blur-xl">
                  <BarChart3 className="text-violet-300" size={20} />
                </div>

                <h3 className="text-xl font-semibold">
                  Performance Summary
                </h3>
              </div>

              <p className="text-sm leading-8 text-gray-400">
                {result?.feedback}
              </p>
            </div>

            {/* Strengths */}
            <div
              className="
                rounded-3xl border border-white/10
                bg-white/[0.04]
                p-6
                backdrop-blur-2xl
                shadow-[0_8px_32px_rgba(31,38,135,0.25)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-green-500/20
              "
            >
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-green-400" size={22} />

                <h3 className="text-xl font-semibold">Strengths</h3>
              </div>

              <ul className="space-y-4 text-sm text-gray-300">
                {strengths.length ? (
                  strengths.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))
                ) : (
                  <li>No major strengths identified yet.</li>
                )}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div
              className="
                rounded-3xl border border-white/10
                bg-white/[0.04]
                p-6
                backdrop-blur-2xl
                shadow-[0_8px_32px_rgba(31,38,135,0.25)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-yellow-500/20
              "
            >
              <div className="mb-4 flex items-center gap-2">
                <AlertCircle className="text-yellow-400" size={22} />

                <h3 className="text-xl font-semibold">
                  Areas to Improve
                </h3>
              </div>

              <ul className="space-y-4 text-sm text-gray-300">
                {improvements.length ? (
                  improvements.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))
                ) : (
                  <li>No significant improvement areas identified.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div
            className="
              mt-10 rounded-3xl border border-white/10
              bg-white/[0.04]
              p-6
              backdrop-blur-2xl
              shadow-[0_8px_32px_rgba(31,38,135,0.25)]
            "
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2 backdrop-blur-xl">
                <Bot className="text-violet-300" size={22} />
              </div>

              <h2 className="text-2xl font-semibold">
                AI Recommendations
              </h2>
            </div>

            <div className="space-y-5">
              {recommendations.map((item, index) => (
                <div
                  key={index}
                  className="
                    flex flex-col gap-5 rounded-3xl
                    border border-white/10
                    bg-white/[0.03]
                    p-5
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:border-violet-500/20
                    hover:bg-white/[0.05]
                    hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]
                    md:flex-row md:items-center md:justify-between
                  "
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-300">
                      {item.icon}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    className="
                      rounded-2xl border border-violet-500/20
                      bg-violet-500/10
                      px-5 py-3
                      text-sm font-medium text-violet-200
                      backdrop-blur-xl
                      transition-all duration-300
                      hover:bg-violet-500/20
                      hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]
                    "
                  >
                    View Resources
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default MockInterviewFeedback;