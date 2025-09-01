import { redirect } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Logout action to clear auth token and update context
export function action() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  const { setIsAuthenticated, setRole } = useAuth();
  setIsAuthenticated(false);
  setRole("public");
  return redirect("/");
}
