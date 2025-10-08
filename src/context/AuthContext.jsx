import React, { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";

const STORAGE_KEY = "travooz-auth-session";

const readStoredSession = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
    };
  } catch (error) {
    console.warn("Failed to parse stored auth session", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredSession()?.user ?? null);
  const [token, setToken] = useState(() => readStoredSession()?.token ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    try {
      if (user && token) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user, token })
        );
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn("Failed to persist auth session", error);
    }

    return undefined;
  }, [user, token]);

  const login = (nextUser, nextToken) => {
    setUser(nextUser ?? null);
    setToken(nextToken ?? null);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
