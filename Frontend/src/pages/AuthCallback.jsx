import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthCallback() {
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const isNew = params.get("new") === "true";

    if (token) {
      // Decode user info from token to pass into AuthContext
      const base64 = token.split(".")[1];
      const payload = JSON.parse(atob(base64));
      login({ id: payload.id }, token);

      window.location.href = isNew ? "/registration" : "/dashboard";
    } else {
      window.location.href = "/login?error=google_failed";
    }
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#050816", color: "#fff" }}>
      <p>Signing you in...</p>
    </div>
  );
}