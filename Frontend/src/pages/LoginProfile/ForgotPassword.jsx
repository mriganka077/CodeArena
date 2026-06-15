import React, { useState, useRef, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";

const ForgotPassword = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState(
    "Start typing to check strength"
  );
  const [strengthScore, setStrengthScore] = useState(0);

  const otpRefs = useRef([]);

  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const showScreen = (n) => setCurrentScreen(n);

  const goBack = () => {
    window.location.href = "/login";
  };

  const goToOTP = async (e) => {
    e.preventDefault();
  
    if (!email || !email.includes("@")) return;
  
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message);
  
      setCurrentScreen(2);
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      alert(err.message);
    }
  };

  const goToReset = (e) => {
    e.preventDefault();
  
    const code = otp.join("");
  
    if (!code || code.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }
  
    if (!/^\d{6}$/.test(code)) {
      alert("Invalid OTP format");
      return;
    }
  
    setCurrentScreen(3);
  };

  const goToSuccess = async (e) => {
    e.preventDefault();
  
    if (newPass.length < 8) return alert("Password too short");
    if (newPass !== confirmPass) return alert("Passwords do not match");
  
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
          newPassword: newPass,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message);
  
      setCurrentScreen(4);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    const updated = ["", "", "", "", "", ""];
    paste.split("").forEach((char, i) => {
      updated[i] = char;
    });

    setOtp(updated);
    otpRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const startResendTimer = async () => {
    try {
      await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
  
      setResendTimer(30);
    } catch (err) {
      console.error(err);
    }
  };

  const checkStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const labels = ["Too weak", "Fair", "Good", "Strong"];
    setStrengthScore(score);
    setStrengthLabel(
      score > 0 ? labels[score - 1] : "Start typing to check strength"
    );
  };

  const strengthColors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] flex items-center justify-center relative px-4">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(108,99,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(42,20,84,0.18),transparent_35%)]" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(108,99,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Card */}
      <div className="relative w-full max-w-[440px] rounded-3xl border border-[#6C63FF]/20 bg-white/5 p-10 backdrop-blur-2xl shadow-2xl z-10">
        {/* Screen 1 */}
        {currentScreen === 1 && (
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">
              Forgot your password?
            </h1>
            <p className="text-sm text-zinc-400 mb-8">
              Enter your email and we'll send a reset code.
            </p>

            <form onSubmit={goToOTP}>
              <label className="block text-xs text-zinc-400 uppercase mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#6C63FF]/20 bg-[#1A0B2E]/50 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#6C63FF]/30 mb-5"
              />

              <button className="w-full rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#2A1454] py-3 text-white font-bold">
                Send Reset Code →
              </button>
            </form>

            <button
              onClick={goBack}
              className="mt-5 w-full text-sm text-zinc-400 hover:text-[#6C63FF]"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* Screen 2 */}
        {currentScreen === 2 && (
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">
              Enter the code
            </h1>

            <p className="text-sm text-zinc-400 mb-8">
              We've sent a code to{" "}
              <span className="text-[#6C63FF]">{email}</span>
            </p>

            <form onSubmit={goToReset}>
              <label className="block text-xs text-zinc-400 uppercase mb-2">
                Verification Code
              </label>

              <div className="flex gap-2 mb-5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(index, e.target.value)
                    }
                    onKeyDown={(e) =>
                      handleOtpKeyDown(index, e)
                    }
                    onPaste={handleOtpPaste}
                    maxLength={1}
                    className="w-12 h-12 rounded-xl bg-[#1A0B2E]/50 border border-[#6C63FF]/20 text-center text-white text-xl font-bold outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
                  />
                ))}
              </div>

              <div className="flex justify-between items-center mb-5 text-sm">
                <span className="text-zinc-400">
                  Didn't receive it?
                </span>

                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={startResendTimer}
                  className="text-[#6C63FF] disabled:text-zinc-500"
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend Code"}
                </button>
              </div>

              <button className="w-full rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#2A1454] py-3 text-white font-bold">
                Verify Code →
              </button>
            </form>
          </div>
        )}

        {/* Screen 3 */}
        {currentScreen === 3 && (
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">
              New Password
            </h1>

            <p className="text-sm text-zinc-400 mb-8">
              Use at least 8 characters.
            </p>

            <form onSubmit={goToSuccess}>
              <label className="block text-xs text-zinc-400 uppercase mb-2">
                New Password
              </label>

              <input
                type="password"
                value={newPass}
                onChange={(e) => {
                  setNewPass(e.target.value);
                  checkStrength(e.target.value);
                }}
                className="w-full rounded-xl border border-[#6C63FF]/20 bg-[#1A0B2E]/50 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#6C63FF]/30 mb-2"
              />

              <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded"
                    style={{
                      background:
                        i < strengthScore
                          ? strengthColors[strengthScore - 1]
                          : "rgba(255,255,255,.08)",
                    }}
                  />
                ))}
              </div>

              <p
                className="text-xs mb-4"
                style={{
                  color:
                    strengthScore > 0
                      ? strengthColors[strengthScore - 1]
                      : "#aaa",
                }}
              >
                {strengthLabel}
              </p>

              <label className="block text-xs text-zinc-400 uppercase mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPass}
                onChange={(e) =>
                  setConfirmPass(e.target.value)
                }
                className="w-full rounded-xl border border-[#6C63FF]/20 bg-[#1A0B2E]/50 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#6C63FF]/30 mb-5"
              />

              <button className="w-full rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#2A1454] py-3 text-white font-bold">
                Reset Password →
              </button>
            </form>
          </div>
        )}

        {/* Screen 4 */}
        {currentScreen === 4 && (
          <div className="text-center">
            {/* Icon */}
            <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-5" />

            <h1 className="text-white text-3xl font-bold mb-2">
              All Done!
            </h1>

            <p className="text-sm text-zinc-400 mb-8">
              Password reset successful.
            </p>

            <button
              onClick={goBack}
              className="w-full rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#2A1454] py-3 text-white font-bold"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;