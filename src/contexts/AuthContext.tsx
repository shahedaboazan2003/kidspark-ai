import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type UserType = "parent" | "child";
const USER_KEY = "USER_KEY";
interface AuthState {
  accessToken: string | null;
  userType: UserType | null;
  username: string | null;
  user: AuthUser | null;
  firstName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
}

interface AuthContextValue extends AuthState {
  login: (
    token: string,
    userType: UserType,
    username: string,
    user?: AuthUser,
    firstName?: string,
  ) => void;
  logout: () => void;
}

type AuthUser = {
  id:number
  username:string
  type: UserType
  firstName?: string
  lastName?: string
  email?: string | null
  
  readingLevel?: string
  responseLength?: string
  learningStyle?: string
  interests?: string[]
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "accessToken";
const USERTYPE_KEY = "userType";
const USERNAME_KEY = "username";
const FIRSTNAME_KEY = "firstName";
const READING_LEVEL_KEY = "readingLevel";
const RESPONSE_LENGTH_KEY = "responseLength";
const LEARNING_STYLE_KEY = "learningStyle";
const INTERESTS_KEY = "interests";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    userType: null,
    username: null,
    user: null,
    firstName: null,
    isAuthenticated: false,
    isLoading: true,

    
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userType = localStorage.getItem(USERTYPE_KEY) as UserType | null;
    const username = localStorage.getItem(USERNAME_KEY);
    const firstName = localStorage.getItem(FIRSTNAME_KEY);


    const storedUser = localStorage.getItem(USER_KEY);
    const user = storedUser ? JSON.parse(storedUser) : null;

    const readingLevel = localStorage.getItem(READING_LEVEL_KEY);
    const responseLength = localStorage.getItem(RESPONSE_LENGTH_KEY);
    const learningStyle = localStorage.getItem(LEARNING_STYLE_KEY);

    const interests =
      JSON.parse(localStorage.getItem(INTERESTS_KEY) || "[]");

    if (token && (userType === "parent" || userType === "child")) {
      setState({
        accessToken: token,
        userType,
        username,
        firstName,
        user,
        isAuthenticated: true,
        isLoading: false,

      });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(
    (
      token: string,
      userType: UserType,
      username: string,
      user?: AuthUser,
      firstName?: string,
    ) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USERTYPE_KEY, userType);
      localStorage.setItem(USERNAME_KEY, username);

      if (firstName) localStorage.setItem(FIRSTNAME_KEY, firstName);
      else localStorage.removeItem(FIRSTNAME_KEY);

      setState({
        accessToken: token,
        userType,
        username,
        user: user ?? null,
        firstName: firstName ?? null,
        isAuthenticated: true,
        isLoading: false,
      });
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.clear();
    setState({
      accessToken: null,
      userType: null,
      username: null,
      firstName: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
