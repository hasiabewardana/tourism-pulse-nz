import { redirect } from "react-router-dom";

// Logout action to clear auth token and update context
export function action() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  // FIX: Also clear expiration for consistency, even if not currently validated.
  localStorage.removeItem("expiration");

  // FIX: Dispatch a synthetic storage event to trigger the AuthContext handler in the same tab,
  // updating isAuthenticated to false and role to "public" immediately without refresh.
  // Removed invalid useAuth() hook call, as it's not allowed in non-component functions.
  window.dispatchEvent(new StorageEvent("storage", { key: "auth-update" }));

  return redirect("/");
}
