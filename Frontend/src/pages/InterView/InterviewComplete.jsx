import React, {
  useEffect,
  useState,
} from "react";
import { motion } from "framer-motion";

import {
  CheckCircle2,
  Mail,
  FileText,
  ArrowRight,
} from "lucide-react";

import SoftBackdrop from "../../components/SoftBackdrop";
import LenisScroll from "../../components/lenis";
import Header from "../../components/HeaderComplete";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

const steps = [
  "Our team will review your interview responses",
  "You will receive an email with the next steps",
  "Expect to hear back within 2–5 business days",
];

const InterviewComplete = () => {

  const location =
    useLocation();

  const navigate =
    useNavigate();
  const [redirectTimer, setRedirectTimer] =
    useState(60);

    useEffect(() => {

      const redirectTimeout =
        setTimeout(() => {
    
          navigate("/drive");
    
        }, 60000);
    
      const interval =
        setInterval(() => {
    
          setRedirectTimer((prev) =>
            prev > 0
              ? prev - 1
              : 0
          );
    
        }, 1000);
    
      return () => {
    
        clearTimeout(
          redirectTimeout
        );
    
        clearInterval(
          interval
        );
      };
    
    }, [navigate]);

    const result =
    location.state?.result ||
    JSON.parse(
      localStorage.getItem(
        "latestInterviewResult"
      )
    );

  const candidateName =
    result?.userId
      ? `${result.userId.firstName || ""}
         ${result.userId.lastName || ""}`
      : "Candidate";

      const driveName =
    result?.driveId
      ?.hiringPositionName ||
    "Interview";

    const questionCount =
  result?.transcript?.filter(
    (t) =>
      t.role === "assistant" &&
      t.text.length > 25
  )?.length || 0;

  const minutes =
    Math.floor(
      (result?.timeTaken || 0) / 60
    );

  const seconds =
    (result?.timeTaken || 0) % 60;

  return (
    <>
      <SoftBackdrop />
      <LenisScroll />
      <Header />

      <div className="relative z-0 h-[calc(100vh-80px)] overflow-hidden flex items-center justify-center px-6">

        {/* top lines */}
        <div className="absolute inset-0 pointer-events-none">

          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

          <div className="absolute top-10 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />

          <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent" />
        </div>

        {/* glow */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-emerald-500/10 blur-[140px] rounded-full" />

        <motion.div
          initial={{
            opacity: 0,
            y: 28,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            duration: 0.6,
          }}

          className="relative z-10 w-full max-w-[560px] flex flex-col items-center text-center scale-[0.82] origin-center"
        >

          {/* success icon */}
          <motion.div
            initial={{
              scale: 0.7,
              opacity: 0,
            }}

            animate={{
              scale: 1,
              opacity: 1,
            }}

            transition={{
              delay: 0.15,
              duration: 0.45,
            }}

            className="relative mb-5"
          >

            <div className="absolute inset-0 scale-[1.9] rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="relative w-24 h-24 rounded-full border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center">

              <div className="w-14 h-14 rounded-full border border-emerald-400/30 bg-emerald-500/15 flex items-center justify-center">

                <CheckCircle2
                  size={28}
                  className="text-emerald-400"
                  strokeWidth={2.5}
                />

              </div>
            </div>
          </motion.div>

          {/* heading */}
          <motion.h1
            initial={{
              opacity: 0,
              y: 12,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 0.25,
            }}

            className="text-4xl md:text-5xl font-black tracking-tight text-white"
          >
            Interview Complete!
          </motion.h1>

          {/* subtitle */}
          <motion.div
            initial={{
              opacity: 0,
              y: 14,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 0.35,
            }}

            className="mt-3 max-w-[520px]"
          >

            <p className="text-white/65 text-sm md:text-base leading-7">

              Thank you,{" "}

              <span className="text-violet-300 font-semibold">
                {candidateName}
              </span>

              !

            </p>

            <p className="mt-2 text-white/45 text-sm md:text-[15px] leading-7">

              Your interview for the{" "}

              <span className="text-white/80 font-semibold">
                {driveName}
              </span>{" "}

              position has been successfully recorded.
              Our hiring team will review your responses
              and get back to you within a few business days.

            </p>
          </motion.div>

          {/* stats */}
          <motion.div
            initial={{
              opacity: 0,
              y: 14,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 0.45,
            }}

            className="mt-7 flex items-center justify-center gap-8 md:gap-12"
          >

            <div className="text-center">

              <h3 className="text-4xl font-black text-white">
                {questionCount}
              </h3>

              <p className="mt-1 text-xs tracking-wide text-white/30 uppercase">
               Interview Questions
              </p>

            </div>

            <div className="w-px h-14 bg-white/[0.08]" />

            <div className="text-center">

              <h3 className="text-4xl font-black text-white">
                {minutes}m {seconds}s
              </h3>

              <p className="mt-1 text-xs tracking-wide text-white/30 uppercase">
                Duration
              </p>

            </div>
          </motion.div>

          {/* next steps */}
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              delay: 0.65,
            }}

            className="w-full mt-7 rounded-3xl border border-white/[0.06] p-6 text-left backdrop-blur-xl"
            style={{
              background:
                "rgba(255,255,255,0.035)",
            }}
          >

            <div className="flex items-center gap-2 mb-6">

              <FileText
                size={16}
                className="text-violet-300"
              />

              <h2 className="text-sm font-extrabold tracking-[0.18em] uppercase text-white/75">
                What Happens Next?
              </h2>

            </div>

            <div className="space-y-5">

              {steps.map((item, i) => (

                <motion.div
                  key={i}

                  initial={{
                    opacity: 0,
                    x: -12,
                  }}

                  animate={{
                    opacity: 1,
                    x: 0,
                  }}

                  transition={{
                    delay:
                      0.75 + i * 0.08,
                  }}

                  className="flex items-start gap-4"
                >

                  <div className="w-7 h-7 shrink-0 rounded-full bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-[11px] font-bold text-violet-300">
                    {i + 1}
                  </div>

                  <p className="text-sm text-white/60 leading-6">
                    {item}
                  </p>

                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* footer */}
          <motion.div
            initial={{
              opacity: 0,
            }}

            animate={{
              opacity: 1,
            }}

            transition={{
              delay: 0.9,
            }}

            className="mt-5 flex flex-col items-center gap-2"
          >

            <div className="flex items-center gap-2 text-white/25 text-xs">

              <Mail size={13} />

              Check your email for confirmation

            </div>

            <div className="text-[11px] font-semibold text-amber-400">

              Redirecting to drives in{" "}

              <span className="text-white">
                {redirectTimer}s
              </span>

            </div>

          </motion.div>

          {/* button */}
          <motion.button
            whileHover={{
              scale: 1.02,
            }}

            whileTap={{
              scale: 0.97,
            }}

            onClick={() =>
              navigate("/drive")
            }

            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white border border-indigo-500/20 hover:border-indigo-400/30 transition-all"

            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))",
            }}
          >

            Back to Drive

            <ArrowRight size={16} />

          </motion.button>

        </motion.div>
      </div>
    </>
  );
};

export default InterviewComplete;