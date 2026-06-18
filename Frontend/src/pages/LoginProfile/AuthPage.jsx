import { useState } from "react";
// import { login, signup, loginWithGoogle, validate2FA } from "../../hooks/useAuth.js";
import { login as loginRequest, signup, loginWithGoogle, validate2FA } from "../../hooks/useAuth.js";
// At the top of AuthPage.jsx — add this import
import { useAuth } from "../../context/AuthContext.jsx";

import SoftBackdrop from "../../components/SoftBackdrop";

const API_URL = import.meta.env.VITE_API_URL;


const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

// ─── Reusable Components ───────────────────────────────────────────────────────

// NOW accepts value + onChange so it's actually controlled
function InputField({ label, type = "text", placeholder, id, rightSlot, value, onChange }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-widest uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-zinc-600
            bg-[#050816cc] border border-[#2A1454] outline-none
            focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF22]
            transition-all duration-200 font-[DM_Sans]"
        />
        {rightSlot}
      </div>
    </div>
  );
}

function Checkbox({ checked, onToggle, children }) {
  return (
    <div className="flex items-start gap-2 cursor-pointer" onClick={onToggle}>
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
          transition-all duration-200
          ${checked ? "bg-[#6C63FF] border-[#6C63FF]" : "bg-[#050816] border-[#2A1454]"}`}
      >
        {checked && <CheckIcon />}
      </div>
      <span className="text-xs text-zinc-400 leading-relaxed cursor-pointer">{children}</span>
    </div>
  );
}

function GoogleButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm
        text-white bg-[#1F2937] border border-[#2A1454]
        hover:border-[#6C63FF55] hover:bg-[#2A1454aa]
        transition-all duration-200 font-[DM_Sans] cursor-pointer"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

function Divider({ text }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2A1454] to-transparent" />
      <span className="text-xs text-zinc-500 whitespace-nowrap">{text}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2A1454] to-transparent" />
    </div>
  );
}

function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#6C63FF]
        transition-colors duration-200 bg-transparent border-none cursor-pointer p-0"
    >
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <EyeIcon />
      )}
    </button>
  );
}

// ─── Strength Meter ────────────────────────────────────────────────────────────

function StrengthMeter({ password }) {
  const getScore = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const score = getScore(password);
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-400", "bg-green-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const labelColors = ["text-red-400", "text-orange-400", "text-yellow-400", "text-green-400"];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300
              ${i < score ? colors[score - 1] : "bg-[#2A1454]"}`}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-[11px] mt-1 ${labelColors[score - 1]}`}>
          {labels[score - 1]}
        </p>
      )}
    </div>
  );
}

// ─── Alert Component ───────────────────────────────────────────────────────────

function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    error:   "bg-red-500/10 border-red-500/30 text-red-400",
    success: "bg-green-500/10 border-green-500/30 text-green-400",
  };
  return (
    <div className={`text-xs px-3.5 py-2.5 rounded-xl border ${styles[type]}`}>
      {message}
    </div>
  );
}

// ─── Login Form ────────────────────────────────────────────────────────────────

function LoginForm() {
  const [showPass, setShowPass]     = useState(false);
  const [remember, setRemember]     = useState(false);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  // 2FA
  const [show2FA, setShow2FA]           = useState(false);
  const [preAuthToken, setPreAuthToken] = useState("");
  const [totpCode, setTotpCode]         = useState("");
  const { login } = useAuth(); 



  const handleLogin = async () => {
    if (!email || !password) return setError("Please fill in all fields.");
    setError(""); setLoading(true);
    try {
      const data = await loginRequest({ email, password }); 
      if (data.twoFactorRequired) {
        setPreAuthToken(data.preAuthToken);
        setEmail(data.email); 
        setShow2FA(true);
      } else {
        login(data.user, data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async () => {
    try {
      setLoading(true);
  
      const res = await fetch(
        `${API_URL}/auth/verify-otp`,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: totpCode,
        }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        login(data.user, data.token); // ✅ FIXED
        window.location.href = "/dashboard";
      } else {
        setError(data.message);
      }
  
    } catch (err) {
      console.log(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── 2FA Step UI ──
  if (show2FA) {
    return (
      <div className="animate-[fadeSlideIn_0.3s_ease]">
        <h2 className="text-xl font-bold text-white mb-1 font-[Syne]">
          Two-Factor Auth
        </h2>
  
        <p className="text-zinc-400 text-[13px] mb-6">
          Enter the 6-digit code sent to your email.
        </p>
  
        <div className="flex flex-col gap-3.5">
  
          {/* ✅ INPUT HERE */}
          <InputField
            label="OTP Code"
            type="text"
            placeholder="000000"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
          />
  
          {/* Error */}
          <Alert type="error" message={error} />
  
          {/* ✅ BUTTON HERE */}
          <button
            onClick={handle2FASubmit}
            disabled={loading || !totpCode}
            className="w-full py-3 rounded-xl text-[15px] font-semibold text-white mt-1
              bg-gradient-to-br from-[#6C63FF] to-[#4f46e5]
              shadow-[0_4px_24px_#6C63FF44]
              hover:-translate-y-0.5 hover:shadow-[0_8px_32px_#6C63FF55]
              active:scale-[0.98] transition-all duration-150
              border-none cursor-pointer font-[Syne] tracking-wide
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? "Verifying..." : "Verify →"}
          </button>
  
          {/* Back button */}
          <button
            onClick={() => {
              setShow2FA(false);
              setError("");
              setTotpCode("");
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            ← Back to login
          </button>
  
        </div>
      </div>
    );
  }

  return (
    <div className="animate-[fadeSlideIn_0.3s_ease]">
      <h2 className="text-xl font-bold text-white mb-1 font-[Syne]">Welcome back</h2>
      <p className="text-zinc-400 text-[13px] mb-6">Sign in to your account</p>

      <div className="flex flex-col gap-3.5">
        {/* ── Email ── */}
        <InputField
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* ── Password ── */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-zinc-400 tracking-widest uppercase">
              Password
            </label>

            <a
              href="/forgot"
              className="text-xs text-[#6C63FF] font-medium hover:text-[#8b85ff] transition-colors no-underline"
            >
              Forgot?
            </a>
          </div>
          <InputField
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightSlot={
              <EyeToggle show={showPass} onToggle={() => setShowPass(!showPass)} />
            }
          />
        </div>

        <Checkbox checked={remember} onToggle={() => setRemember(!remember)}>
          Remember me
        </Checkbox>

        {/* ── Error ── */}
        <Alert type="error" message={error} />

        {/* ── Submit ── */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl text-[15px] font-semibold text-white mt-1
            bg-gradient-to-br from-[#6C63FF] to-[#4f46e5]
            shadow-[0_4px_24px_#6C63FF44]
            hover:-translate-y-0.5 hover:shadow-[0_8px_32px_#6C63FF55]
            active:scale-[0.98] transition-all duration-150
            border-none cursor-pointer font-[Syne] tracking-wide
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <Divider text="or continue with" />
        <GoogleButton label="Continue with Google" onClick={loginWithGoogle} />

        {/* ── 2FA Hint ── */}
        <div className="flex items-center gap-2.5 bg-[#6C63FF0d] border border-[#6C63FF22] rounded-xl p-3">
          <LockIcon />
          <div>
            <p className="text-xs font-medium text-[#6C63FF] mb-0.5">Two-factor authentication</p>
            <p className="text-[11px] text-zinc-400">
              You'll be prompted for your authenticator code after sign-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Signup Form ───────────────────────────────────────────────────────────────

function SignupForm() {
  const [showPass, setShowPass]   = useState(false);
  const [terms, setTerms]         = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [loading, setLoading]     = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password)
      return setError("Please fill in all fields.");
    if (!terms)
      return setError("Please accept the Terms of Service to continue.");
    setError(""); setSuccess(""); setLoading(true);
    try {
      const data = await signup({ firstName, lastName, email, password });
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-[fadeSlideIn_0.3s_ease]">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold text-white font-[Syne]">Create account</h2>
        <span className="text-[10px] font-semibold text-[#6C63FF] tracking-widest
          px-2 py-0.5 rounded-full border border-[#6C63FF44] bg-[#6C63FF22] font-[Syne]">
          FREE
        </span>
      </div>
      <p className="text-zinc-400 text-[13px] mb-6">Join thousands of users today</p>

      <div className="flex flex-col gap-3.5">
        {/* ── Name Row ── */}
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="First Name"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <InputField
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        {/* ── Email ── */}
        <InputField
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* ── Password + Strength ── */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-widest uppercase">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm text-white placeholder-zinc-600
                bg-[#050816cc] border border-[#2A1454] outline-none
                focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF22]
                transition-all duration-200"
            />
            <EyeToggle show={showPass} onToggle={() => setShowPass(!showPass)} />
          </div>
          <StrengthMeter password={password} />
        </div>

        {/* ── 2FA Banner ── */}
        <div className="bg-[#22C55E0d] border border-[#22C55E22] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldIcon />
              <span className="text-xs font-semibold text-[#22C55E] font-[Syne]">
                Two-Factor Auth (2FA)
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#22C55E] bg-[#22C55E22] rounded-full px-2 py-0.5">
              RECOMMENDED
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Enable Google Authenticator after signup to protect your account with a
            time-based one-time password (TOTP).
          </p>
        </div>

        {/* ── Terms ── */}
        <Checkbox checked={terms} onToggle={() => setTerms(!terms)}>
          I agree to the{" "}
          <a href="#" className="text-[#6C63FF] no-underline hover:text-[#8b85ff]"
            onClick={(e) => e.stopPropagation()}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#6C63FF] no-underline hover:text-[#8b85ff]"
            onClick={(e) => e.stopPropagation()}>
            Privacy Policy
          </a>
        </Checkbox>

        {/* ── Error / Success ── */}
        <Alert type="error"   message={error} />
        <Alert type="success" message={success} />

        {/* ── Submit ── */}
        <button
          onClick={handleSignup}
          disabled={loading || !!success}
          className="w-full py-3 rounded-xl text-[15px] font-semibold text-white mt-1
            bg-gradient-to-br from-[#6C63FF] to-[#4f46e5]
            shadow-[0_4px_24px_#6C63FF44]
            hover:-translate-y-0.5 hover:shadow-[0_8px_32px_#6C63FF55]
            active:scale-[0.98] transition-all duration-150
            border-none cursor-pointer font-[Syne] tracking-wide
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? "Creating account..." : success ? "Check your email ✓" : "Create Account →"}
        </button>

        <Divider text="or sign up with" />
        <GoogleButton label="Continue with Google" onClick={loginWithGoogle} />
      </div>
    </div>
  );
}

// ─── Main Auth Page ────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [tab, setTab] = useState("login");

  return (
    <>

      <div
        className="relative min-h-screen flex items-center justify-center px-6 py-8 overflow-x-hidden"
        style={{ background: "#050816", fontFamily: "'DM Sans', sans-serif" }}
      >
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

        {/* Background Orbs */}
        <div className="fixed rounded-full pointer-events-none z-0"
        style={{ width: 420, height: 420, background: "#2A1454", top: -80, left: -100, opacity: 0.7, filter: "blur(80px)" }} />
      <div className="fixed rounded-full pointer-events-none z-0"
        style={{ width: 300, height: 300, background: "#6C63FF22", bottom: 40, right: -60, opacity: 0.5, filter: "blur(80px)" }} />
      <div className="fixed rounded-full pointer-events-none z-0"
        style={{ width: 200, height: 200, background: "#6C63FF18", top: "40%", left: "50%", opacity: 0.4, filter: "blur(80px)" }} />  
          <SoftBackdrop />


        <div className="relative z-10 w-full max-w-[440px]">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-2">
              <a
                href="/"
                className="
                  text-4xl
                  font-black
                  tracking-[-0.03em]
                  text-slate-200
                  transition-all duration-300
                  cursor-pointer
                  select-none
                "
              >
                Code<span className="text-violet-400">Arena</span>
              </a>
            </div>
            <p className="text-zinc-400 text-[13px]">Your secure gateway to everything</p>
          </div>

          {/* Card */}
          <div className="rounded-[20px] p-8 border border-[#6C63FF33]"
            style={{
              background: "linear-gradient(135deg, #1F2937ee 0%, #1A0B2E99 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}>
            {/* Tab Switcher */}
            <div className="flex gap-1.5 rounded-xl p-1 mb-7 border border-[#2A1454]"
              style={{ background: "#05081699" }}>
              {["login", "signup"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-[9px] text-sm font-semibold border-none cursor-pointer
                  transition-all duration-200
                  ${tab === t ? "text-white shadow-[0_0_20px_#6C63FF55]" : "text-zinc-400 bg-transparent"}`}
                  style={{ fontFamily: "'Syne', sans-serif", background: tab === t ? "#6C63FF" : "transparent" }}
                >
                  {t === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {tab === "login" ? <LoginForm /> : <SignupForm />}
          </div>
        </div>
      </div>
    </>
  );

}