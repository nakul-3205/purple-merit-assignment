import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async (silent = false) => {
    try {
      await authApi.logout();
    } catch (_) { /* ignore */ }
    localStorage.removeItem("accessToken");
    setUser(null);
    if (!silent) toast.success("Logged out");
  }, []);

  // Listen for token expiry from interceptor
  useEffect(() => {
    const handler = () => logout(true);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  // Bootstrap: restore session
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(({ data }) => setUser(data.data.user))
      .catch(() => localStorage.removeItem("accessToken"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem("accessToken", data.data.accessToken);
    setUser(data.data.user);
    toast.success(`Welcome back, ${data.data.user.name}!`);
    return data.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
