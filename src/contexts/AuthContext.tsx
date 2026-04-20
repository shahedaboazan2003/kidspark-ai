import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export type UserType = "parent" | "child";

interface AuthState {
  accessToken: string | null;
  userType: UserType | null;
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, userType: UserType, username?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "accessToken";
const USERTYPE_KEY = "userType";
const USERNAME_KEY = "username";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    userType: null,
    username: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restore session on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userType = localStorage.getItem(USERTYPE_KEY) as UserType | null;
      const username = localStorage.getItem(USERNAME_KEY);
      if (token && (userType === "parent" || userType === "child")) {
        setState({
          accessToken: token,
          userType,
          username: username,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === USERTYPE_KEY) {
        const token = localStorage.getItem(TOKEN_KEY);
        const userType = localStorage.getItem(USERTYPE_KEY) as UserType | null;
        const username = localStorage.getItem(USERNAME_KEY);
        if (token && (userType === "parent" || userType === "child")) {
          setState({
            accessToken: token,
            userType,
            username,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            accessToken: null,
            userType: null,
            username: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = useCallback((token: string, userType: UserType, username?: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERTYPE_KEY, userType);
    if (username) localStorage.setItem(USERNAME_KEY, username);
    setState({
      accessToken: token,
      userType,
      username: username ?? null,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERTYPE_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setState({
      accessToken: null,
      userType: null,
      username: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
