import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiRegister } from "./api.js";
import { getMe } from "../employees/api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "paylink.session";

// Assign a consistent avatar colour from a palette based on userId
const AVATAR_COLORS = ["#7c3aed", "#b45309", "#0369a1", "#065f46", "#9f1239"];
const avatarColor = (id) => AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length];

const fallbackFirstName = (userLike) => {
  const fromUsername = userLike?.username?.trim();
  if (fromUsername) return fromUsername;

  const fromEmail = userLike?.email?.split("@")[0]?.trim();
  return fromEmail || "there";
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.token) return;

    const needsProfileHydration =
      !user.firstName || !user.lastName || !user.employeeNumber;

    if (!needsProfileHydration) return;

    getMe()
      .then((employeeProfile) => {
        setUser((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            firstName: employeeProfile?.firstName ?? prev.firstName,
            lastName: employeeProfile?.lastName ?? prev.lastName,
            employeeNumber:
              employeeProfile?.employeeNumber ?? prev.employeeNumber,
            position: employeeProfile?.position ?? prev.position,
            department: employeeProfile?.department ?? prev.department,
          };
        });
      })
      .catch(() => {
        // Some admin accounts may not have an employee profile.
      });
  }, [user?.token, user?.firstName, user?.lastName, user?.employeeNumber]);

  const login = async (username, password) => {
    const authData = await apiLogin(username, password);
    // token must be stored before we fetch the protected /employees/me endpoint
    const partial = { token: authData.token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partial));

    let employeeProfile = null;
    try {
      employeeProfile = await getMe();
    } catch {
      // ADMIN accounts created directly in DB may not have an employee record
    }

    const sessionUser = {
      token: authData.token,
      id: authData.userId,
      username: authData.username,
      email: authData.email,
      role: authData.role,
      firstName: employeeProfile?.firstName ?? fallbackFirstName(authData),
      lastName: employeeProfile?.lastName ?? "",
      employeeNumber: employeeProfile?.employeeNumber ?? "",
      position: employeeProfile?.position ?? "",
      department: employeeProfile?.department ?? "",
      avatarColor: avatarColor(authData.userId),
    };

    setUser(sessionUser);
    return sessionUser;
  };

  const register = async (formValues) => {
    const authData = await apiRegister(formValues);
    const partial = { token: authData.token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partial));

    let employeeProfile = null;
    try {
      employeeProfile = await getMe();
    } catch {
      // ignore
    }

    const sessionUser = {
      token: authData.token,
      id: authData.userId,
      username: authData.username,
      email: authData.email,
      role: authData.role,
      firstName:
        employeeProfile?.firstName ??
        formValues.firstName?.trim() ??
        fallbackFirstName(authData),
      lastName: employeeProfile?.lastName ?? formValues.lastName,
      employeeNumber: employeeProfile?.employeeNumber ?? "",
      position: employeeProfile?.position ?? "",
      department: employeeProfile?.department ?? "",
      avatarColor: avatarColor(authData.userId),
    };

    setUser(sessionUser);
    return sessionUser;
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, login, logout, register }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
