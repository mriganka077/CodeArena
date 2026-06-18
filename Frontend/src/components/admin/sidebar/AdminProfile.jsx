import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import axios from "axios";
import {
    User, Lock, Shield, Phone, Mail, Camera, Eye, EyeOff,
    CheckCircle2, AlertCircle, Smartphone, Key, Upload,
    Save, X, ChevronRight, Zap, QrCode, RefreshCw, Check,
    Bell, Fingerprint, Copy
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
const FIELD_STYLE = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
};

const INPUT_CLS =
    "w-full px-4 py-3 rounded-xl text-sm text-white/80 placeholder-white/20 outline-none transition border border-white/8 focus:border-indigo-500/50 bg-transparent";

const SectionCard = ({ children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border border-white/[0.06] p-6 ${className}`}
        style={{ background: "rgba(255,255,255,0.025)" }}
    >
        {children}
    </motion.div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, color = "#818cf8" }) => (
    <div className="flex items-center gap-3 mb-6">
        <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}35` }}
        >
            <Icon size={16} style={{ color }} />
        </div>
        <div>
            <p className="text-white font-bold text-sm">{title}</p>
            {subtitle && <p className="text-white/30 text-[11px] mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

const Label = ({ children }) => (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5">
        {children}
    </p>
);

const Toast = ({ msg, type }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl"
        style={{
            background: type === "success" ? "rgba(16,28,20,0.97)" : "rgba(28,12,16,0.97)",
            borderColor: type === "success" ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)",
        }}
    >
        {type === "success"
            ? <CheckCircle2 size={15} className="text-emerald-400" />
            : <AlertCircle size={15} className="text-rose-400" />}
        <p className="text-white/80 text-xs font-medium">{msg}</p>
    </motion.div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AdminProfile = () => {
    // Profile state
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneCountry, setPhoneCountry] = useState("+91");


    // Password state
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
    const [pwdError, setPwdError] = useState("");

    // 2FA state
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef([]);
    const FAKE_QR_SECRET = "JBSWY3DPEHPK3PXP";



    // Toast
    const [toast, setToast] = useState(null);
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Saving states
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);



    const fileRef = useRef();
    const [admin, setAdmin] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const BASE_URL = API_URL.replace("/api", "");

    useEffect(() => {
        const fetchAdmin = async () => {
            
            try {
    
                const token = localStorage.getItem("adminToken");

    
                if (!token) {
                    console.log("No admin token found");
                    return;
                }
    
                const res = await fetch(
                    `${API_URL}/admin/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
    
                const data = await res.json();
    
                if (data.success) {
    
                    setAdmin(data.admin);
    
                    setEmail(data.admin.email || "");

                    setPhone(data.admin.phone || "");
                    setPhoneCountry(data.admin.phoneCountry || "+91");
    
                    const parts = (data.admin.name || "").split(" ");
    
                    setFirstName(parts[0] || "");
                    setLastName(parts.slice(1).join(" ") || "");
    
                } else {
                    console.log(data.message);
                }
    
            } catch (error) {
                console.error("Failed to fetch admin:", error);
            }
        };
    
        fetchAdmin();
    }, []);

    const handleAvatarChange = async (e) => {
        try {
    
            const file = e.target.files[0];
    
            if (!file) return;
    
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
    
            const token = localStorage.getItem("adminToken");
    
            const formData = new FormData();
    
            formData.append("photo", file);
    
            const res = await axios.put(
                `${API_URL}/admin/upload-photo`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
    
            if (res.data.success) {
    
                setAdmin((prev) => ({
                    ...prev,
                    photo: res.data.photo,
                  }));
    
                showToast("Photo uploaded successfully");
    
            }
    
        } catch (error) {
            console.error(error);
            showToast("Photo upload failed", "error");
        }
    };

    const handleSaveProfile = async () => {
        try {
    
            setSavingProfile(true);
    
            const token = localStorage.getItem("adminToken");
    
            const res = await axios.put(
                `${API_URL}/admin/update-profile`,
                {
                    firstName,
                    lastName,
                    phone,
                    phoneCountry,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            if (res.data.success) {
    
                setAdmin(res.data.admin);
    
                showToast("Profile updated successfully");
    
            }
    
        } catch (error) {
    
            console.error(error);
    
            showToast("Failed to update profile", "error");
    
        } finally {
    
            setSavingProfile(false);
    
        }
    };

    const handleSavePwd = async () => {

        if (!currentPwd || !newPwd || !confirmPwd) {
            setPwdError("All fields are required.");
            return;
        }
    
        if (newPwd !== confirmPwd) {
            setPwdError("New passwords don't match.");
            return;
        }
    
        if (newPwd.length < 8) {
            setPwdError("Password must be at least 8 characters.");
            return;
        }
    
        try {
    
            setPwdError("");
    
            setSavingPwd(true);
    
            const token = localStorage.getItem("adminToken");
    
            const res = await axios.put(
                `${API_URL}/admin/change-password`,
                {
                    currentPassword: currentPwd,
                    newPassword: newPwd,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            if (res.data.success) {
    
                setCurrentPwd("");
                setNewPwd("");
                setConfirmPwd("");
    
                showToast("Password changed successfully");
    
            }
    
        } catch (error) {
    
            console.error(error);
    
            setPwdError(
                error.response?.data?.message ||
                "Failed to change password"
            );
    
        } finally {
    
            setSavingPwd(false);
    
        }
    };

    const pwdStrength = () => {
        if (!newPwd) return null;
        const checks = [newPwd.length >= 8, /[A-Z]/.test(newPwd), /[0-9]/.test(newPwd), /[^A-Za-z0-9]/.test(newPwd)];
        const count = checks.filter(Boolean).length;
        if (count <= 1) return { label: "Weak", color: "#f87171", pct: 25 };
        if (count === 2) return { label: "Fair", color: "#fbbf24", pct: 50 };
        if (count === 3) return { label: "Good", color: "#4ade80", pct: 75 };
        return { label: "Strong", color: "#818cf8", pct: 100 };
    };
    const strength = pwdStrength();

    const handleOtpChange = (i, val) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[i] = val;
        setOtp(next);
        if (val && i < 5) otpRefs.current[i + 1]?.focus();
    };
    const handleOtpKey = (i, e) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    };


    const initials = admin?.name
        ? admin.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "A";

    return (
        <div className="w-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <User size={15} className="text-indigo-400" />
                        <p className="text-white/45 font-semibold text-[11px] uppercase tracking-widest">
                            Admin
                        </p>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">
                        Profile Settings
                    </h2>
                    <p className="text-white/35 text-xs mt-0.5">
                        Manage your account, security and preferences
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">

                {/* LEFT COLUMN */}
                <div className="xl:col-span-1">
                    <div className="xl:sticky xl:top-4 flex flex-col gap-4">

                        {/* Avatar Card */}
                        <SectionCard>
                            <div className="flex flex-col items-center text-center gap-4">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div
                                        className="w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center text-2xl font-black text-white border-2 border-indigo-500/30"
                                        style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))" }}
                                    >
                                        {admin?.photo || avatarPreview ? (
                                            <img
                                                src={
                                                    avatarPreview ||
                                                    (
                                                        admin?.photo?.startsWith("http")
                                                            ? admin.photo
                                                            : `${BASE_URL}${admin.photo}`
                                                    )
                                                }
                                                alt="avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="absolute inset-0 rounded-3xl bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Camera size={18} className="text-white" />
                                        <span className="text-white text-[10px] font-semibold">Change</span>
                                    </button>
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

                                    {/* online dot */}
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0a0816] flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-white font-bold text-base">
                                        {admin?.name || `${firstName} ${lastName}`}
                                    </p>

                                    <p className="text-white/35 text-xs mt-0.5">
                                        {admin?.email}
                                    </p>

                                    <div
                                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border"
                                        style={{
                                            background: "rgba(99,102,241,0.1)",
                                            borderColor: "rgba(99,102,241,0.25)",
                                            color: "#a5b4fc"
                                        }}
                                    >
                                        <Zap size={9} />
                                        Administrator
                                    </div>
                                </div>

                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/10 transition"
                                >
                                    <Upload size={12} /> Upload New Photo
                                </button>
                                <p className="text-white/20 text-[10px]">JPG, PNG or WebP · Max 5MB</p>
                            </div>
                        </SectionCard>

                        {/* Quick Info */}
                        <SectionCard>
                            <SectionHeader icon={Bell} title="Account Info" subtitle="Your account details" color="#4ade80" />
                            <div className="space-y-3">
                                {[
                                    { label: "Role", value: "Administrator" },
                                    { label: "Plan", value: "Pro" },
                                    {
                                        label: "Member since",
                                        value: admin?.createdAt
                                            ? new Date(admin.createdAt).toLocaleDateString("en-GB")
                                            : "—",
                                    },
                                    {
                                        label: "Admin ID",
                                        value: admin?._id || "—",
                                    },
                                ].map(({ label, value }) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                                    >
                                        <p className="text-white/35 text-xs">{label}</p>
                                        <p className="text-white/70 text-xs font-semibold">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="xl:col-span-2 flex flex-col gap-4">

                    {/* Profile Info */}
                    <SectionCard>
                        <SectionHeader icon={User} title="Personal Information" subtitle="Update your name and contact details" color="#818cf8" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>First Name</Label>
                                <input
                                    className={INPUT_CLS}
                                    style={FIELD_STYLE}
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    placeholder="First name"
                                />
                            </div>
                            <div>
                                <Label>Last Name</Label>
                                <input
                                    className={INPUT_CLS}
                                    style={FIELD_STYLE}
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    placeholder="Last name"
                                />
                            </div>

                            {/* Email – read-only */}
                            <div className="sm:col-span-2">
                                <Label>Email Address</Label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                                    <input
                                        className={`${INPUT_CLS} pl-10 cursor-not-allowed opacity-50`}
                                        style={FIELD_STYLE}
                                        value={email}
                                        readOnly
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-emerald-400" />
                                        <span className="text-[10px] text-emerald-400 font-semibold">Verified</span>
                                    </div>
                                </div>
                                <p className="text-white/20 text-[10px] mt-1.5">Email cannot be changed. Contact support to update.</p>
                            </div>

                            {/* Phone */}
                            <div className="sm:col-span-2">
                                <Label>Phone Number</Label>
                                <div className="flex gap-2">
                                    <select
                                        value={phoneCountry}
                                        onChange={e => setPhoneCountry(e.target.value)}
                                        className="appearance-none px-3 py-3 rounded-xl text-xs text-white/70 border border-white/8 outline-none cursor-pointer shrink-0 w-24"
                                        style={{ background: "rgba(255,255,255,0.04)", colorScheme: "dark" }}
                                    >
                                        {["+91", "+1", "+44", "+61", "+49", "+33", "+81"].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <div className="relative flex-1">
                                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                                        <input
                                            className={`${INPUT_CLS} pl-10`}
                                            style={FIELD_STYLE}
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="Enter phone number"
                                            type="tel"
                                        />
                                    </div>
                                </div>
                                <p className="text-white/20 text-[10px] mt-1.5">Used for SMS alerts and 2FA verification.</p>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handleSaveProfile}
                                disabled={savingProfile}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60 transition"
                                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                            >
                                {savingProfile
                                    ? <><RefreshCw size={12} className="animate-spin" /> Saving...</>
                                    : <><Save size={12} /> Save Changes</>}
                            </motion.button>
                        </div>
                    </SectionCard>

                    {/* Password */}
                    <SectionCard>
                        <SectionHeader icon={Lock} title="Change Password" subtitle="Use a strong, unique password" color="#f87171" />
                        <div className="space-y-4">
                            {[
                                { label: "Current Password", val: currentPwd, set: setCurrentPwd, key: "current" },
                                { label: "New Password", val: newPwd, set: setNewPwd, key: "new" },
                                { label: "Confirm New Password", val: confirmPwd, set: setConfirmPwd, key: "confirm" },
                            ].map(({ label, val, set, key }) => (
                                <div key={key}>
                                    <Label>{label}</Label>
                                    <div className="relative">
                                        <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                                        <input
                                            type={showPwd[key] ? "text" : "password"}
                                            className={`${INPUT_CLS} pl-10 pr-11`}
                                            style={FIELD_STYLE}
                                            value={val}
                                            onChange={e => set(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            onClick={() => setShowPwd(p => ({ ...p, [key]: !p[key] }))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition"
                                        >
                                            {showPwd[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Strength bar */}
                            {strength && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-white/30 text-[10px]">Password strength</p>
                                        <p className="text-[10px] font-semibold" style={{ color: strength.color }}>{strength.label}</p>
                                    </div>
                                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: `${strength.pct}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full rounded-full"
                                            style={{ background: strength.color }}
                                        />
                                    </div>
                                    <div className="flex gap-3 text-[10px] text-white/25">
                                        {["8+ chars", "Uppercase", "Number", "Symbol"].map((c, i) => {
                                            const checks = [newPwd.length >= 8, /[A-Z]/.test(newPwd), /[0-9]/.test(newPwd), /[^A-Za-z0-9]/.test(newPwd)];
                                            return (
                                                <span key={c} className="flex items-center gap-1" style={{ color: checks[i] ? "#4ade80" : undefined }}>
                                                    {checks[i] ? <Check size={9} /> : null}{c}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {pwdError && (
                                <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-500/20" style={{ background: "rgba(248,113,113,0.07)" }}>
                                    <AlertCircle size={13} className="text-rose-400 shrink-0" />
                                    <p className="text-rose-300 text-xs">{pwdError}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handleSavePwd}
                                disabled={savingPwd}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60 transition"
                                style={{ background: "linear-gradient(135deg,#ef4444,#f43f5e)" }}
                            >
                                {savingPwd
                                    ? <><RefreshCw size={12} className="animate-spin" /> Updating...</>
                                    : <><Lock size={12} /> Update Password</>}
                            </motion.button>
                        </div>
                    </SectionCard>

                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast msg={toast.msg} type={toast.type} />}
            </AnimatePresence>
        </div>
    );
};

export default AdminProfile;