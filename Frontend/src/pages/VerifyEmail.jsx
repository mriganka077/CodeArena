import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    fetch(`http://localhost:4000/api/auth/verify-email/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          // Route through AuthCallback so login + redirect logic is in one place
          setTimeout(() => {
            const isNew = data.isNewUser ? "&new=true" : "";
            window.location.href = `/auth/callback?token=${data.token}${isNew}`;
          }, 2000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#050816", color: "#fff",
      flexDirection: "column", gap: 12, fontFamily: "DM Sans, sans-serif"
    }}>
      {status === "verifying" && <p>Verifying your email...</p>}
      {status === "success"   && <p>Email verified! Redirecting...</p>}
      {status === "error"     && <p>Link is invalid or expired. Please sign up again.</p>}
    </div>
  );
}