const API_URL = import.meta.env.VITE_API_URL;


// ── Signup (now returns a message, not a token) ───────────────────────────────
export const signup = async ({ firstName, lastName, email, password }) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");
  return data; // { success, message }
};

// ── Login ─────────────────────────────────────────────────────────────────────
// Returns { token, user } OR { twoFactorRequired: true, preAuthToken }
export const login = async ({ email, password }) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");

  if (data.twoFactorRequired) return data; // caller handles 2FA step

  localStorage.setItem("token", data.token);
  return data;
};

// ── 2FA: validate TOTP code after login ───────────────────────────────────────
export const validate2FA = async ({ preAuthToken, token }) => {
  const res = await fetch(`${API_URL}/2fa/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preAuthToken, token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Invalid code");
  localStorage.setItem("token", data.token);
  return data;
};

// ── 2FA: setup (get QR code) ──────────────────────────────────────────────────
export const setup2FA = async () => {
  const res = await fetch(`${API_URL}/2fa/setup`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { qrCode, secret }
};

// ── 2FA: confirm setup with first TOTP code ───────────────────────────────────
export const verifySetup2FA = async (token) => {
  const res = await fetch(`${API_URL}/2fa/verify-setup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

// ── Google OAuth: redirect browser to backend ─────────────────────────────────
export const loginWithGoogle = () => {
  window.location.href = `${API_URL}/auth/google`;
};

// ── Handle Google OAuth callback (call on /auth/callback page) ───────────────
export const handleGoogleCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    localStorage.setItem("token", token);
    return token;
  }
  return null;
};

// ── Get current user ──────────────────────────────────────────────────────────
export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.user;
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};