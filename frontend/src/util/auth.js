import { redirect } from "react-router-dom";

// Get auth duration
export function getAuthDuration() {
  const storedExpirationDate = localStorage.getItem("expiration");
  const expirationDate = new Date(storedExpirationDate);
  const now = new Date();
  const duration = expirationDate.getTime() - now.getTime();
  return duration;
}

// Get the auth token from local storage and return it
export function getAuthToken() {
  const token = localStorage.getItem("token");

  const tokenDuration = getAuthDuration();
  if (tokenDuration < 0) {
    return "EXPIRED";
  }

  return token ? token : null;
}

// Call getAuthToken and return it's value
export function tokenLoader() {
  return getAuthToken();
}

// Check auth token to protect some routes
export function checkAuthLoader() {
  const token = getAuthToken();
  if (!token) {
    // If the token is null then redirect to auth page
    return redirect("/auth");
  }
  return null;
}
