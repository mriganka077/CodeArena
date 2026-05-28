import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

const skills = [
  {
    title: "Technical Skills",
    score: "5/10",
    percent: "50%",
    description:
      "Shows understanding of basic concepts but needs deeper technical knowledge.",
    icon: <Code2 size={20} />,
    color: "from-violet-500 to-indigo-500",
  },
  {
    title: "Problem Solving",
    score: "7/10",
    percent: "70%",
    description:
      "Good approach to problem-solving with logical thinking and methodical breakdown.",
    icon: <Brain size={20} />,
    color: "from-green-400 to-emerald-500",
  },
  {
    title: "Communication",
    score: "6/10",
    percent: "60%",
    description:
      "Clear communication with room for improvement in technical depth and clarity.",
    icon: <MessageSquareText size={20} />,
    color: "from-violet-400 to-purple-500",
  },
  {
    title: "Experience",
    score: "N/A",
    percent: "0%",
    description:
      "Limited discussion about past experience and real-world applications.",
    icon: <BriefcaseBusiness size={20} />,
    color: "from-slate-500 to-slate-600",
  },
];

const recommendations = [
  {
    title: "Strengthen Backend Fundamentals",
    desc: "Focus on system design, database modeling, and API architecture.",
    icon: <BookOpen size={20} />,
  },
  {
    title: "Improve Communication",
    desc: "Practice explaining complex concepts clearly and actively listening.",
    icon: <Headphones size={20} />,
  },
  {
    title: "Build Real-world Projects",
    desc: "Create and showcase projects with backend contributions.",
    icon: <FolderKanban size={20} />,
  },
];

const MockInterviewFeedback = () => {
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
                    AH
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">
                      Adhip Halder
                    </h2>

                    <p className="text-sm text-gray-400">
                      adhiphalder8585@gmail.com
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
                        MRA-2024-042
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
                        Java
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
                        May 21, 2024
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
                        45 mins
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
                    6.0
                    <span className="text-xl text-gray-500">/10</span>
                  </h2>

                  <p className="mt-2 font-medium text-green-400">
                    Good Start
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
                        strokeDashoffset: 155.8,
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
                      strokeDashoffset="155.8"
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
                      60%
                    </span>

                    <span className="mt-1 text-xs tracking-wide text-gray-400">
                      PERFORMANCE
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-sm leading-6 text-gray-300">
                  You have a solid foundation. Focus on deeper technical depth
                  and communication improvement.
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
                The candidate demonstrated solid problem-solving ability and
                team leadership experience, but lacked depth in backend
                technical specifics. Communication showed room for improvement.
                Concrete API or backend contributions are needed to fully gauge
                technical proficiency.
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
                <li>• Good problem-solving approach</li>
                <li>• Clear logical thinking</li>
                <li>• Team leadership experience</li>
                <li>• Basic technical concepts</li>
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
                <li>• Backend technical depth</li>
                <li>• Active listening skills</li>
                <li>• API & system design knowledge</li>
                <li>• Concrete project contributions</li>
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