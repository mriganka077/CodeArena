import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;


export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // logged in user object
  const [loading, setLoading] = useState(true);   // true while checking token

  // On every app load — check if token exists and is valid
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          // Token invalid/expired — clean up
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this anywhere in your app
export const useAuth = () => useContext(AuthContext);