import React, {
    useState,
    useEffect,
  } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, Video, Calendar, Zap, Mail,
  User, Folder, Clock, MapPin, Link2, Send,
  CheckCircle2, ChevronDown, Hash,
} from "lucide-react";

import { CalendarDays } from "lucide-react";



const DARK_INPUT_STYLE = `
  .dark-input, .dark-select {
    color-scheme: dark;
  }

  .dark-select option {
    background: #0f0d1f;
    color: rgba(255,255,255,0.8);
  }

  .dark-input {
    background: rgba(8, 6, 18, 0.85);
    color: rgba(255,255,255,0.85);
    color-scheme: dark;
  }

  .dark-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    right: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`;


const TInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    error,
    icon: Icon,
    ...rest
}) => {
    const isDate = type === "datetime-local";

    return (
        <div className="relative">

            {!isDate && Icon && (
                <Icon
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none z-10"
                />
            )}

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`dark-input w-full ${Icon && !isDate
                        ? "pl-10"
                        : "pl-3"
                    } ${isDate
                        ? "pr-10"
                        : "pr-3"
                    } py-2.5 rounded-xl text-xs text-white/80 placeholder-white/20 outline-none transition border ${error
                        ? "border-rose-500/50 focus:border-rose-500/70"
                        : "border-white/8 focus:border-indigo-500/50"
                    }`}
                {...rest}
            />

            {isDate && (
                <CalendarDays
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none"
                />
            )}
        </div>
    );
};

// ── Constants ─────────────────────────────────────────────────────────────────


const AVATAR_COLORS = ["#6366f1","#8b5cf6","#a855f7","#ec4899","#f59e0b","#10b981","#0ea5e9","#f43f5e"];
const avatarColor = (s) => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];

const STEPS = [
  { key: "drive",      label: "Drive",      Icon: Folder },
  { key: "schedule",   label: "Schedule",   Icon: Calendar },
  { key: "difficulty", label: "Difficulty", Icon: Zap },
  { key: "email",      label: "Email",      Icon: Mail },
];

const DIFFICULTY_OPTIONS = [
  { key: "easy",   label: "Easy",   color: "#4ade80", bg: "rgba(74,222,128,0.12)",   border: "rgba(74,222,128,0.35)"   },
  { key: "medium", label: "Medium", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",   border: "rgba(251,191,36,0.35)"   },
  { key: "hard",   label: "Hard",   color: "#f87171", bg: "rgba(248,113,113,0.12)",  border: "rgba(248,113,113,0.35)"  },
  { key: "expert", label: "Expert", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.35)" },
];

const FOCUS_AREAS = ["Data Structures", "Algorithms", "System Design", "OOP", "Behavioural", "SQL / DB", "APIs", "Cloud"];

const PLATFORMS = ["Google Meet", "Zoom", "Microsoft Teams", "Office (In-Person)"];
const DURATIONS = ["30", "45", "60", "90", "120"];
const TYPES     = ["Technical", "HR", "Design"];

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ initials, size = 32 }) => {
  const color = avatarColor(initials);
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.32,
        background: `${color}22`, border: `1.5px solid ${color}50`, color,
      }}
    >
      {initials}
    </div>
  );
};

// ── Step Indicator ────────────────────────────────────────────────────────────
const StepBar = ({ current }) => (
  <div className="flex items-center gap-0 px-6 py-4 border-b border-white/[0.06]">
    {STEPS.map((step, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <React.Fragment key={step.key}>
          <div className="flex items-center gap-1.5">
            <div
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300"
              style={{
                background: done
                  ? "#6366f1"
                  : active
                  ? "rgba(99,102,241,0.25)"
                  : "rgba(255,255,255,0.06)",
                border: done
                  ? "none"
                  : active
                  ? "1px solid rgba(99,102,241,0.5)"
                  : "1px solid rgba(255,255,255,0.08)",
                color: done ? "#fff" : active ? "#a5b4fc" : "rgba(255,255,255,0.2)",
              }}
            >
              {done ? <CheckCircle2 size={11} /> : i + 1}
            </div>
            <span
              className="text-[10px] font-semibold transition-colors duration-300 whitespace-nowrap"
              style={{ color: done || active ? "#a5b4fc" : "rgba(255,255,255,0.2)" }}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="flex-1 h-px mx-2 transition-all duration-500"
              style={{ background: done ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)" }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ Icon, title, subtitle }) => (
  <div
    className="flex items-center gap-3 p-3.5 rounded-xl mb-5"
    style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}
    >
      <Icon size={16} className="text-indigo-400" />
    </div>
    <div>
      <p className="text-white font-bold text-sm">{title}</p>
      <p className="text-white/35 text-[10px] mt-0.5">{subtitle}</p>
    </div>
  </div>
);

// ── Field Label ───────────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">{children}</p>
);

// ── Styled Select ─────────────────────────────────────────────────────────────
const StyledSelect = ({ value, onChange, children, placeholder }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-3 pr-8 py-2.5 rounded-xl text-xs outline-none appearance-none cursor-pointer transition-all"
        style={{
          background: "#000000",
          border: "1px solid rgba(255,255,255,0.07)",
          color: value
            ? "rgba(255,255,255,0.75)"
            : "rgba(255,255,255,0.25)",
        }}
        onFocus={(e) => (
          e.target.style.borderColor =
            "rgba(99,102,241,0.4)"
        )}
        onBlur={(e) => (
          e.target.style.borderColor =
            "rgba(255,255,255,0.07)"
        )}
      >
        {placeholder && (
          <option
            value=""
            style={{
              background: "#000",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {placeholder}
          </option>
        )}
  
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            style: {
              background: "#000000",
              color: "#ffffff",
            },
          })
        )}
      </select>
  
      <ChevronDown
        size={11}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
      />
    </div>
  );

// ── Styled Input ──────────────────────────────────────────────────────────────
const StyledInput = ({ type = "text", value, onChange, placeholder }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all placeholder-white/20"
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      color: "rgba(255,255,255,0.8)",
    }}
    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
    onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
  />
);

// ── Panel 1: Drive & Candidate ────────────────────────────────────────────────
const DrivePanel = ({
    form,
    setForm,
    drives,
  }) => {
    const selectedDrive = drives.find(
        (d) => d._id === form.drive
      );
      
      const candidates =
        selectedDrive?.assignedCandidates || [];
  

  const toggleCandidate = (id) => {
    setForm((f) => ({
      ...f,
      selectedCandidates: f.selectedCandidates.includes(id)
        ? f.selectedCandidates.filter((c) => c !== id)
        : [...f.selectedCandidates, id],
    }));
  };
  

  return (
    <div className="space-y-4">
      <SectionHeader Icon={Folder} title="Drive & Candidate" subtitle="Select the hiring drive and shortlisted candidates." />

      <div>
        <FieldLabel>Hiring Drive</FieldLabel>
        <StyledSelect
          value={form.drive}
          onChange={(v) => setForm((f) => ({ ...f, drive: v, selectedCandidates: [] }))}
          placeholder="— Choose a drive —"
        >
          {drives.map((d) => (
            <option key={d._id} value={d._id}>{d.hiringPositionName}</option>
          ))}
        </StyledSelect>
      </div>

      <div>
        <FieldLabel>Interview Type</FieldLabel>
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className="flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all"
              style={{
                background: form.type === t ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
                border: form.type === t ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
                color: form.type === t ? "#a5b4fc" : "rgba(255,255,255,0.35)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate picker */}
      <div>
        <div className="flex items-center justify-between mb-2">
            <FieldLabel>Select Candidates</FieldLabel>

            {candidates.length > 0 && (
                <button
                    onClick={() => {
                        const allSelected =
                            form.selectedCandidates.length ===
                            candidates.length;

                        setForm((f) => ({
                            ...f,
                            selectedCandidates: allSelected
                                ? []
                                : candidates.map((c) => c._id),
                        }));
                    }}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        color: "#c7d2fe",
                    }}
                >
                    {form.selectedCandidates.length ===
                        candidates.length
                        ? "Unselect All"
                        : "Select All"}
                </button>
            )}
        </div>
        {form.drive ? (
          <div className="space-y-1.5">
            {candidates.map((c) => {
              const selected = form.selectedCandidates.includes(c._id);
              const color =
                AVATAR_COLORS[
                candidates.findIndex(
                  (candidate) => candidate._id === c._id
                ) % AVATAR_COLORS.length
                ];
              return (
                <button
                  key={c._id}
                  onClick={() => toggleCandidate(c._id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                  style={{
                    background: selected
                      ? `linear-gradient(135deg, ${color}18, rgba(99,102,241,0.08))`
                      : "rgba(255,255,255,0.025)",
                  
                    border: selected
                      ? `1px solid ${color}55`
                      : "1px solid rgba(255,255,255,0.06)",
                  
                    boxShadow: selected
                      ? `0 0 0 1px ${color}20, 0 8px 24px ${color}15`
                      : "none",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/10"
                    style={{
                      background: selected
                        ? `linear-gradient(135deg, ${color}, ${color}aa)`
                        : `${color}18`,
                    }}
                  >
                    {c?.picture ? (
                      <img
                        src={
                          c.picture.startsWith("http")
                            ? c.picture
                            : `http://localhost:4000${c.picture}`
                        }
                        alt={`${c.firstName} ${c.lastName}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Avatar
                        initials={`${c.firstName?.[0] || ""}${c.lastName?.[0] || ""}`}
                        size={28}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                          <p
                              className="text-xs font-semibold"
                              style={{
                                color: selected
                                  ? "#ffffff"
                                  : "rgba(255,255,255,0.7)",
                              }}
                          >
                              {c.firstName} {c.lastName}
                          </p>
                          <p className="text-[10px] text-white/30">
                              {c.email}
                          </p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: selected ? color : "transparent",
                      borderColor: selected ? color : "rgba(255,255,255,0.15)",
                    }}
                  >
                    {selected && <CheckCircle2 size={10} color="#fff" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-xl p-4 text-center text-white/20 text-xs"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}
          >
            Select a drive to view shortlisted candidates
          </div>
        )}
      </div>
    </div>
  );
};

// ── Panel 2: Schedule ─────────────────────────────────────────────────────────
const SchedulePanel = ({ form, setForm }) => (
  <div className="space-y-4">
    <SectionHeader Icon={Calendar} title="Interview Schedule" subtitle="Set the date, time window, round, and platform." />

    <div className="grid grid-cols-2 gap-3">
        <FieldLabel label="Start Date & Time" icon={Calendar} >
          <TInput
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          />
        </FieldLabel>

        <FieldLabel label="End Date & Time" icon={Calendar} >
          <TInput
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          />
        </FieldLabel>
    </div>



  </div>
);

// ── Panel 3: Difficulty ───────────────────────────────────────────────────────
const DifficultyPanel = ({ form, setForm }) => {
  const toggleFocus = (area) => {
    setForm((f) => ({
      ...f,
      focusAreas: f.focusAreas.includes(area)
        ? f.focusAreas.filter((a) => a !== area)
        : [...f.focusAreas, area],
    }));
  };

  return (
    <div className="space-y-5">
      <SectionHeader Icon={Zap} title="Interview Difficulty" subtitle="Choose question difficulty and focus areas." />

      <div>
        <FieldLabel>Difficulty Level</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d.key}
              onClick={() => setForm((f) => ({ ...f, difficulty: d.key }))}
              className="py-3 rounded-xl text-xs font-bold transition-all"
              style={{
                background: form.difficulty === d.key ? d.bg : "rgba(255,255,255,0.04)",
                border: form.difficulty === d.key ? `1px solid ${d.border}` : "1px solid rgba(255,255,255,0.07)",
                color: form.difficulty === d.key ? d.color : "rgba(255,255,255,0.35)",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Question Focus Areas</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.map((area) => {
            const sel = form.focusAreas.includes(area);
            return (
              <button
                key={area}
                onClick={() => toggleFocus(area)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: sel ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                  border: sel ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  color: sel ? "#a5b4fc" : "rgba(255,255,255,0.35)",
                }}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel>Special Instructions (Optional)</FieldLabel>
        <textarea
          value={form.instructions}
          onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
          placeholder="Any specific instructions for the interviewer or candidate…"
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none placeholder-white/20 transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
          onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
        />
      </div>
    </div>
  );
};

// ── Panel 4: Email ────────────────────────────────────────────────────────────
const EmailPanel = ({ form, setForm }) => {
  const autoFill = () => {
    setForm((f) => ({
      ...f,
      emailSubject: "Interview Invitation — We'd love to meet you!",
      emailBody: `Dear Candidate,

We are pleased to invite you to an interview for the position you applied for. Please find the details below:

📅 Date & Time: As per your scheduled slot


Please confirm your availability by replying to this email. If you have any questions, feel free to reach out.

Best regards,
The Hiring Team`,
    }));
  };

  return (
    <div className="space-y-4">
      <SectionHeader Icon={Mail} title="Candidate Email" subtitle="Configure the invitation email candidates will receive." />

      <div>
        <FieldLabel>Email Subject</FieldLabel>
        <StyledInput
          value={form.emailSubject}
          onChange={(v) => setForm((f) => ({ ...f, emailSubject: v }))}
          placeholder="e.g. Invitation for Frontend Assessment Drive"
        />
      </div>

      <div>
        <FieldLabel>Email Body</FieldLabel>
        <textarea
          value={form.emailBody}
          onChange={(e) => setForm((f) => ({ ...f, emailBody: e.target.value }))}
          placeholder="Write candidate invitation email…"
          rows={8}
          className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none placeholder-white/20 transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
          onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
        />
      </div>

      <button
        onClick={autoFill}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.14)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; }}
      >
        <Zap size={13} /> Auto AI Fill — Generate Email
      </button>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
const ScheduleInterviewModal = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    drive: "", interviewer: "", type: "Technical", selectedCandidates: [],
    startDate: "", endDate: "",
    platform: "Google Meet", meetLink: "",
    difficulty: "medium", focusAreas: ["Data Structures", "Algorithms"],
    instructions: "",
    emailSubject: "", emailBody: "",
  });
  const [drives, setDrives] = useState([]);

  useEffect(() => {

    const fetchDrives = async () => {
  
      try {
  
        const res = await fetch(
          "http://localhost:4000/api/drives"
        );
  
        const data = await res.json();
  
        setDrives(data.drives || []);
  
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchDrives();
  
  }, []);

  const panels = [
      <DrivePanel
          key="drive"
          form={form}
          setForm={setForm}
          drives={drives}
      />,
    <SchedulePanel key="schedule"   form={form} setForm={setForm} />,
    <DifficultyPanel key="diff"     form={form} setForm={setForm} />,
    <EmailPanel    key="email"      form={form} setForm={setForm} />,
  ];

  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >

        <style>{DARK_INPUT_STYLE}</style>


        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative w-full max-w-[500px] rounded-2xl flex flex-col overflow-hidden"
          style={{ background: "#0f0d1e", border: "1px solid rgba(255,255,255,0.09)", maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* top gradient line */}
          <div className="h-[3px] shrink-0" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7,transparent)" }} />

          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                <Video size={16} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-bold text-[15px] leading-tight">Schedule Interview</p>
                <p className="text-white/35 text-[11px] mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:text-white hover:bg-white/6 transition shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          {/* Step bar */}
          <StepBar current={step} />

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                {panels[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div
            className="flex gap-2.5 px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,8,22,0.95)" }}
          >
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/45 transition hover:text-white/70 hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={async () => {
                if (isLast) {

                    try {
                  
                      await fetch(
                        "http://localhost:4000/api/drives/schedule-interview",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                          },
                  
                          body: JSON.stringify({
                            drive: form.drive,
                            candidates: form.selectedCandidates,
                            interviewType: form.type,
                            startDate: form.startDate,
                            endDate: form.endDate,
                            difficulty: form.difficulty,
                            focusAreas: form.focusAreas,
                            instructions: form.instructions,
                            emailSubject: form.emailSubject,
                            emailBody: form.emailBody,
                          }),
                        }
                      );
                  
                      onClose?.();
                  
                    } catch (err) {
                      console.error(err);
                    }
                  
                    return;
                  }
                setStep((s) => s + 1);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              {isLast ? (
                <><Send size={13} /> Create Interview</>
              ) : (
                <>Next <ChevronRight size={13} /></>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScheduleInterviewModal;
