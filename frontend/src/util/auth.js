// Get the auth token from local storage and return it
export function getAuthToken() {
  const token = localStorage.getItem("token");
  return token ? token : null;
}

// Call getAuthToken and return it's value
export function tokenLoader() {
  return getAuthToken();
}
