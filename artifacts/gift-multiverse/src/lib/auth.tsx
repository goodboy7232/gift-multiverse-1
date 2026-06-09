import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("gm_token"));

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("gm_token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("gm_token", newToken);
    setToken(newToken);
    window.dispatchEvent(new Event("storage"));
  };

  const logout = () => {
    localStorage.removeItem("gm_token");
    setToken(null);
    window.dispatchEvent(new Event("storage"));
  };

  return { token, login, logout };
}

export function ProtectedRoute({ children, requireAdmin = false, user }: { children: React.ReactNode, requireAdmin?: boolean, user?: any }) {
  const [, setLocation] = useLocation();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setLocation("/login");
    } else if (requireAdmin && user && user.role !== "admin") {
      setLocation("/");
    }
  }, [token, user, requireAdmin, setLocation]);

  if (!token) return null;
  if (requireAdmin && (!user || user.role !== "admin")) return null;

  return <>{children}</>;
}
