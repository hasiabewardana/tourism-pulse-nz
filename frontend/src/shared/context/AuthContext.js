import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// AuthProvider component to wrap around the app
export function AuthProvider({ children }) {
  // State to hold authentication status and user role
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [role, setRole] = useState(localStorage.getItem("role") || "public");

  // Effect to sync state with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
      setRole(localStorage.getItem("role") || "public");
    };

    // Listen for storage events to handle changes in other tabs
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = { isAuthenticated, role, setIsAuthenticated, setRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  // Ensure the hook is used within an AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
