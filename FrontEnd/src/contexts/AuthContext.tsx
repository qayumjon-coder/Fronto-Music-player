import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => { success: boolean; message: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const AUTH_KEY = 'music_admin_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage and sessionStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    const sessionStore = sessionStorage.getItem(AUTH_KEY);
    if (stored === 'true' && sessionStore === 'true') {
      setIsAuthenticated(true);
    } else {
      // If session is wiped but local remains (or vice versa), fail auth
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_KEY);
    }
  }, []);

  const login = (password: string) => {
    if (!ADMIN_PASSWORD) {
        console.error("ADMIN_PASSWORD is not set in environment.");
        return { success: false, message: "System Error: VITE_ADMIN_PASSWORD is not configured in .env" };
    }
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      sessionStorage.setItem(AUTH_KEY, 'true');
      return { success: true, message: "Access Granted" };
    }
    return { success: false, message: "Access Denied: Invalid Credentials" };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
