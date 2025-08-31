// src/shared/components/authentication/Logout.js
import { redirect } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function action() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  const { setIsAuthenticated, setRole } = useAuth();
  setIsAuthenticated(false);
  setRole("user");
  return redirect("/");
}
