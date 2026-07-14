import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ledgersplit_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("ledgersplit_token"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("unauthorizedRedirect", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorizedRedirect", handleUnauthorized);
    };
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("ledgersplit_token", res.data.token);
    setUser(res.data.user);
    return res.data;
  }

  async function register(name, email, password) {
    const res = await api.post("/auth/register", { name, email, password });
    if (res.data.token) {
      localStorage.setItem("ledgersplit_token", res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  }

  async function verifyEmail(email, otp) {
    const res = await api.post("/auth/verify-email", { email, otp });
    localStorage.setItem("ledgersplit_token", res.data.token);
    setUser(res.data.user);
    return res.data;
  }

  async function loginWithGoogle(credential) {
    const res = await api.post("/auth/google", { credential });
    localStorage.setItem("ledgersplit_token", res.data.token);
    setUser(res.data.user);
    return res.data;
  }

  function logout() {
    localStorage.removeItem("ledgersplit_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
