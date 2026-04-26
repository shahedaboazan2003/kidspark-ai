import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export type UserType = "parent" | "child";

interface AuthState {
  accessToken: string | null;
  userType: UserType | null;
  username: string | null;
  firstName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, userType: UserType, username: string, firstName?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "accessToken";
const USERTYPE_KEY = "userType";
const USERNAME_KEY = "username";
const FIRSTNAME_KEY = "firstName";


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    userType: null,
    username: null,
    firstName: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userType = localStorage.getItem(USERTYPE_KEY) as UserType | null;
      const username = localStorage.getItem(USERNAME_KEY);
      const firstName = localStorage.getItem(FIRSTNAME_KEY);
      if (token && (userType === "parent" || userType === "child")) {
        setState({
          accessToken: token,
          userType,
          username,
          firstName,
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

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (
        e.key === TOKEN_KEY ||
        e.key === USERTYPE_KEY ||
        e.key === USERNAME_KEY ||
        e.key === FIRSTNAME_KEY
      ) {
        const token = localStorage.getItem(TOKEN_KEY);
        const userType = localStorage.getItem(USERTYPE_KEY) as UserType | null;
        const username = localStorage.getItem(USERNAME_KEY);
        const firstName = localStorage.getItem(FIRSTNAME_KEY);
        if (token && (userType === "parent" || userType === "child")) {
          setState({
            accessToken: token,
            userType,
            username,
            firstName,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            accessToken: null,
            userType: null,
            username: null,
            firstName: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = useCallback(
    (token: string, userType: UserType, username: string, firstName?: string) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USERTYPE_KEY, userType);
      localStorage.setItem(USERNAME_KEY, username);
      if (firstName) localStorage.setItem(FIRSTNAME_KEY, firstName);
      else localStorage.removeItem(FIRSTNAME_KEY);
      setState({
        accessToken: token,
        userType,
        username,
        firstName: firstName ?? null,
        isAuthenticated: true,
        isLoading: false,
      });
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERTYPE_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(FIRSTNAME_KEY);
    setState({
      accessToken: null,
      userType: null,
      username: null,
      firstName: null,
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
