import { useEffect, useRef, useState } from "react";

/* ─── Particle Canvas ─────────────────────────────────────── */
function StarCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 180;
    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    // Nebula blobs
    const nebulas = [
      { x: 0.15, y: 0.3, r: 180, color: "88,28,135" },
      { x: 0.85, y: 0.7, r: 140, color: "67,20,120" },
      { x: 0.5, y: 0.1, r: 120, color: "109,40,217" },
    ];

    let t = 0;
    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Nebula
      nebulas.forEach((n) => {
        const grad = ctx.createRadialGradient(
          n.x * canvas.width, n.y * canvas.height, 0,
          n.x * canvas.width, n.y * canvas.height, n.r
        );
        grad.addColorStop(0, `rgba(${n.color},0.12)`);
        grad.addColorStop(1, `rgba(${n.color},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x * canvas.width, n.y * canvas.height, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Stars
      stars.forEach((s) => {
        const pulse = 0.3 + 0.7 * ((Math.sin(t * s.speed * 60 + s.phase) + 1) / 2);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,210,255,${s.alpha * pulse})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}

/* ─── Shooting Meteors ────────────────────────────────────── */
function Meteors() {
  const meteors = [
    { top: "8%", left: "55%", delay: "0s", duration: "3s", rotate: "-30deg", width: "90px" },
    { top: "18%", left: "70%", delay: "2.4s", duration: "2.5s", rotate: "-40deg", width: "60px" },
    { top: "5%", left: "40%", delay: "5s", duration: "3.2s", rotate: "-25deg", width: "75px" },
  ];
  return (
    <>
      {meteors.map((m, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{ top: m.top, left: m.left, animation: `meteor ${m.duration} ease-in ${m.delay} infinite` }}
        >
          <div
            style={{
              width: m.width,
              height: "1.5px",
              borderRadius: "9999px",
              background: "linear-gradient(90deg, transparent 0%, rgba(196,181,253,0.8) 60%, white 100%)",
              transform: `rotate(${m.rotate})`,
              boxShadow: "0 0 8px rgba(167,139,250,0.6)",
            }}
          />
        </div>
      ))}
    </>
  );
}

/* ─── Space Scene SVG ─────────────────────────────────────── */
function SpaceScene() {
  return (
    <div className="relative w-full flex items-end justify-center" style={{ height: "420px" }}>
      {/* Orbit rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          width: "290px", height: "290px", borderRadius: "50%",
          border: "1px dashed rgba(139,92,246,0.2)",
          animation: "spinSlow 40s linear infinite",
        }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          width: "360px", height: "180px", borderRadius: "50%",
          border: "1px solid rgba(139,92,246,0.1)",
          transform: "rotateX(75deg)",
        }} />
      </div>

      {/* Orbiting dot */}
      <div
        className="absolute"
        style={{
          top: "50%", left: "50%",
          width: 0, height: 0,
          animation: "orbit 10s linear infinite",
        }}
      >
        <div style={{
          position: "absolute",
          transform: "translate(-50%,-50%) translateX(145px)",
          width: "7px", height: "7px", borderRadius: "50%",
          background: "radial-gradient(circle, #c4b5fd, #7c3aed)",
          boxShadow: "0 0 10px 3px rgba(167,139,250,0.5)",
        }} />
      </div>

      {/* Saturn planet */}
      <div
        className="absolute"
        style={{ top: "2%", left: "4%", animation: "floatPlanet 7s ease-in-out infinite" }}
      >
        <svg width="70" height="55" viewBox="0 0 70 55" fill="none">
          <defs>
            <radialGradient id="pg" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#3b0764" />
            </radialGradient>
          </defs>
          <ellipse cx="35" cy="28" rx="36" ry="9" fill="none" stroke="rgba(139,92,246,0.35)" strokeWidth="2.5" />
          <ellipse cx="35" cy="28" rx="18" ry="18" fill="url(#pg)" />
          <ellipse cx="35" cy="28" rx="18" ry="18" fill="none" stroke="rgba(196,181,253,0.15)" strokeWidth="1" />
          {/* Ring over planet */}
          <ellipse cx="35" cy="28" rx="24" ry="6" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="2" />
        </svg>
      </div>

      {/* Small planet top right */}
      <div
        className="absolute"
        style={{ top: "12%", right: "8%", animation: "floatPlanet 9s ease-in-out 2s infinite" }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <defs>
            <radialGradient id="pg2" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#4c1d95" />
            </radialGradient>
          </defs>
          <circle cx="14" cy="14" r="12" fill="url(#pg2)" />
        </svg>
      </div>

      {/* Satellite */}
      <div
        className="absolute"
        style={{ top: "50%", left: "50%", animation: "orbitReverse 18s linear infinite" }}
      >
        <div style={{ position: "absolute", transform: "translate(-50%,-50%) translateX(165px)" }}>
          <svg width="26" height="20" viewBox="0 0 26 20" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="1.3">
            <rect x="0" y="6" width="5" height="8" rx="1" fill="rgba(109,40,217,0.4)" />
            <rect x="21" y="6" width="5" height="8" rx="1" fill="rgba(109,40,217,0.4)" />
            <line x1="5" y1="10" x2="10" y2="10" />
            <line x1="16" y1="10" x2="21" y2="10" />
            <rect x="10" y="7" width="6" height="6" rx="1" fill="rgba(109,40,217,0.6)" />
            <line x1="13" y1="4" x2="13" y2="7" />
            <circle cx="13" cy="3" r="1.5" fill="rgba(167,139,250,0.5)" />
          </svg>
        </div>
      </div>

      {/* Moon surface */}
      <div className="absolute bottom-0 left-1/2" style={{ transform: "translateX(-50%)", width: "320px" }}>
        <svg viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="moonGlow" cx="50%" cy="0%">
              <stop offset="0%" stopColor="rgba(109,40,217,0.4)" />
              <stop offset="100%" stopColor="rgba(59,7,100,0)" />
            </radialGradient>
            <radialGradient id="moonSurface" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#5b21b6" />
              <stop offset="100%" stopColor="#2e1065" />
            </radialGradient>
          </defs>
          {/* Glow underneath */}
          <ellipse cx="160" cy="95" rx="150" ry="40" fill="url(#moonGlow)" />
          {/* Moon body */}
          <ellipse cx="160" cy="100" rx="148" ry="38" fill="url(#moonSurface)" />
          {/* Craters */}
          <circle cx="80" cy="100" r="16" fill="#3b0764" opacity="0.7" />
          <circle cx="80" cy="100" r="12" fill="#2e1065" opacity="0.5" />
          <circle cx="200" cy="108" r="10" fill="#3b0764" opacity="0.6" />
          <circle cx="240" cy="95" r="7" fill="#2e1065" opacity="0.5" />
          <circle cx="120" cy="112" r="6" fill="#3b0764" opacity="0.4" />
          {/* Highlight edge */}
          <ellipse cx="160" cy="62" rx="148" ry="8" fill="rgba(139,92,246,0.15)" />
        </svg>
      </div>

      {/* Astronaut */}
      <div
        className="absolute z-10"
        style={{
          bottom: "52px",
          left: "50%",
          transform: "translateX(-54%)",
          animation: "float 5s ease-in-out infinite",
        }}
      >
        <svg width="200" height="220" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="suitGrad" cx="40%" cy="30%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#5b21b6" />
            </radialGradient>
            <radialGradient id="helmetGrad" cx="35%" cy="25%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="60%" stopColor="#0f0b2e" />
              <stop offset="100%" stopColor="#060412" />
            </radialGradient>
            <radialGradient id="visorShine" cx="25%" cy="20%">
              <stop offset="0%" stopColor="rgba(167,139,250,0.35)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Shadow on moon */}
          <ellipse cx="100" cy="215" rx="52" ry="8" fill="rgba(0,0,0,0.4)" />

          {/* Legs */}
          <rect x="68" y="158" width="24" height="38" rx="12" fill="url(#suitGrad)" />
          <rect x="108" y="158" width="24" height="38" rx="12" fill="url(#suitGrad)" />
          {/* Boots */}
          <rect x="60" y="188" width="38" height="16" rx="8" fill="#4c1d95" />
          <rect x="102" y="188" width="38" height="16" rx="8" fill="#4c1d95" />

          {/* Body */}
          <rect x="52" y="108" width="96" height="58" rx="22" fill="url(#suitGrad)" />

          {/* Arms */}
          <rect x="16" y="112" width="42" height="22" rx="11" fill="url(#suitGrad)" />
          <rect x="142" y="112" width="42" height="22" rx="11" fill="url(#suitGrad)" />
          {/* Gloves */}
          <circle cx="20" cy="123" r="12" fill="#4c1d95" />
          <circle cx="180" cy="123" r="12" fill="#4c1d95" />

          {/* Chest panel */}
          <rect x="76" y="124" width="48" height="30" rx="6" fill="#4c1d95" />
          <rect x="82" y="130" width="14" height="6" rx="2" fill="#7c3aed" />
          <rect x="100" y="130" width="6" height="6" rx="2" fill="#a78bfa" />
          <rect x="110" y="130" width="6" height="6" rx="2" fill="#6d28d9" />
          <circle cx="90" cy="144" r="4" fill="#7c3aed" />
          <circle cx="100" cy="144" r="4" fill="#4c1d95" />
          <circle cx="110" cy="144" r="4" fill="#7c3aed" />

          {/* Neck */}
          <rect x="82" y="96" width="36" height="16" rx="6" fill="#5b21b6" />

          {/* Helmet outer */}
          <ellipse cx="100" cy="70" rx="50" ry="52" fill="url(#suitGrad)" />
          {/* Helmet visor */}
          <ellipse cx="100" cy="68" rx="36" ry="36" fill="url(#helmetGrad)" />
          <ellipse cx="100" cy="68" rx="36" ry="36" fill="url(#visorShine)" />
          {/* Visor rim */}
          <ellipse cx="100" cy="68" rx="36" ry="36" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
          {/* Reflection dots */}
          <ellipse cx="83" cy="55" rx="9" ry="6" fill="rgba(196,181,253,0.15)" />
          <circle cx="116" cy="52" r="3" fill="rgba(196,181,253,0.1)" />

          {/* Helmet top detail */}
          <ellipse cx="100" cy="20" rx="14" ry="7" fill="#6d28d9" />
          <rect x="93" y="16" width="14" height="6" rx="3" fill="#5b21b6" />

          {/* 404 sign (held, tilted slightly) */}
          <g transform="rotate(-5, 30, 130)">
            <rect x="10" y="116" width="80" height="42" rx="8" fill="#0f0b2e" stroke="rgba(124,58,237,0.6)" strokeWidth="1.5" />
            <rect x="10" y="116" width="80" height="42" rx="8" fill="rgba(124,58,237,0.08)" />
            <text x="50" y="144" textAnchor="middle" fontSize="22" fontWeight="900" fill="#a78bfa"
              fontFamily="'Courier New', monospace" letterSpacing="2">
              404
            </text>
            {/* Screen glow line */}
            <rect x="18" y="150" width="64" height="1.5" rx="1" fill="rgba(124,58,237,0.3)" />
          </g>

          {/* Question bubble */}
          <rect x="134" y="30" width="44" height="36" rx="8" fill="#0f0b2e" stroke="rgba(124,58,237,0.5)" strokeWidth="1.2" />
          <polygon points="134,52 122,58 138,58" fill="#0f0b2e" />
          <text x="156" y="54" textAnchor="middle" fontSize="18" fontWeight="700" fill="#a78bfa"
            fontFamily="'Courier New', monospace">?</text>
        </svg>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export default function NotFound() {
  const [hoverDash, setHoverDash] = useState(false);
  const [hoverBack, setHoverBack] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes float {
          0%, 100% { transform: translateX(-54%) translateY(0px); }
          50%       { transform: translateX(-54%) translateY(-18px); }
        }
        @keyframes floatPlanet {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes orbit {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes orbitReverse {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes meteor {
          0%   { transform: translateX(0) translateY(0); opacity: 0; }
          5%   { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(260px) translateY(130px); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px 4px rgba(124,58,237,0.3); }
          50%       { box-shadow: 0 0 32px 8px rgba(124,58,237,0.55); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(124,58,237,0.25); }
          50%       { border-color: rgba(167,139,250,0.5); }
        }

        .reveal-1 { animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .reveal-2 { animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both; }
        .reveal-3 { animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.45s both; }
        .reveal-4 { animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.6s both; }
        .reveal-5 { animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.75s both; }

        .error-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a78bfa;
          background: rgba(109,40,217,0.18);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 4px;
          padding: 4px 10px;
          display: inline-block;
          animation: borderGlow 3s ease-in-out infinite;
        }

        .headline {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2.6rem, 5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: #f5f3ff;
        }
        .headline em {
          font-style: normal;
          background: linear-gradient(135deg, #c4b5fd 0%, #7c3aed 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtext {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 300;
          line-height: 1.7;
          color: rgba(196,181,253,0.6);
        }

        .info-card {
          position: relative;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid rgba(124,58,237,0.2);
          background: rgba(15,11,46,0.6);
          backdrop-filter: blur(16px);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: border-color 0.3s, background 0.3s;
        }
        .info-card:hover {
          border-color: rgba(167,139,250,0.4);
          background: rgba(15,11,46,0.8);
        }
        .info-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(124,58,237,0.06), transparent);
          pointer-events: none;
        }
        .info-card .scanline {
          position: absolute;
          left: 0; right: 0;
          height: 30%;
          background: linear-gradient(to bottom, transparent, rgba(167,139,250,0.04), transparent);
          animation: scanline 4s linear infinite;
        }

        .icon-wrap {
          flex-shrink: 0;
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(109,40,217,0.25);
          border: 1px solid rgba(124,58,237,0.3);
          display: flex; align-items: center; justify-content: center;
          animation: glowPulse 3s ease-in-out infinite;
        }

        .btn-primary {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          color: #fff;
          transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(109,40,217,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(109,40,217,0.6); }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:active { transform: translateY(-1px) scale(0.98); }
        .btn-primary span { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; }

        .btn-secondary {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 50px;
          cursor: pointer;
          color: rgba(221,214,254,0.85);
          border: 1px solid rgba(124,58,237,0.35);
          background: rgba(15,11,46,0.5);
          backdrop-filter: blur(8px);
          transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), background 0.2s, border-color 0.2s;
        }
        .btn-secondary:hover {
          transform: translateY(-3px);
          background: rgba(109,40,217,0.15);
          border-color: rgba(167,139,250,0.5);
        }
        .btn-secondary:active { transform: translateY(-1px) scale(0.98); }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent);
        }

        .support-text {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          color: rgba(167,139,250,0.45);
        }
        .support-link {
          color: rgba(167,139,250,0.75);
          text-decoration: none;
          border-bottom: 1px solid rgba(167,139,250,0.3);
          transition: color 0.2s, border-color 0.2s;
        }
        .support-link:hover { color: #c4b5fd; border-color: rgba(196,181,253,0.6); }

        .grid-bg {
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 0 3px rgba(167,139,250,0.2);
          animation: glowPulse 2s ease-in-out infinite;
        }
      `}</style>

      <div
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden grid-bg"
        style={{ background: "radial-gradient(ellipse at 25% 40%, #16073a 0%, #0b0520 45%, #060312 100%)" }}
      >
        {/* Canvas stars + nebula */}
        <StarCanvas />

        {/* Meteors */}
        <Meteors />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(4,2,20,0.7) 100%)" }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT — Illustration */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div style={{ width: "100%", maxWidth: "480px" }}>
                <SpaceScene />
              </div>
            </div>

            {/* RIGHT — Content */}
            <div className="order-1 lg:order-2 flex flex-col gap-6">

              {/* Status badge */}
              <div className="reveal-1 flex items-center gap-3">
                <div className="status-dot" />
                <span className="error-tag">Error 404 · Page Not Found</span>
              </div>

              {/* Headline */}
              <div className="reveal-2">
                <h1 className="headline">
                  Lost in<br />
                  <em>Deep Space</em>
                </h1>
              </div>

              {/* Subtext */}
              <p className="subtext reveal-3" style={{ maxWidth: "420px" }}>
                The page you're navigating to has drifted into an unknown sector of the universe.
                It may have been moved, deleted, or never existed.
              </p>

              <div className="divider reveal-3" />

              {/* Info card */}
              <div className="info-card reveal-4">
                <div className="scanline" />
                <div className="icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(196,181,253,0.9)" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: "14px", color: "#e9d5ff", marginBottom: "3px" }}>
                    Mission recovery options
                  </p>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: "13px", color: "rgba(196,181,253,0.55)", lineHeight: 1.5 }}>
                    Return to base, check your coordinates, or contact ground control.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="reveal-4 flex flex-wrap gap-3">
                <button
                  className="btn-primary"
                  onClick={() => (window.location.href = "/")}
                >
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                    Return to Dashboard
                  </span>
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => window.history.back()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12,19 5,12 12,5" />
                  </svg>
                  Go Back
                </button>
              </div>

              {/* Support */}
              <p className="support-text reveal-5">
                Think this is a mistake?{" "}
                <a href="codearena2k26@gmail.com" className="support-link">
                  Contact mission control
                </a>
                {" "}and we'll investigate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}