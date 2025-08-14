import { redirect, json } from "react-router-dom";

export async function authAction({ request }) {
  const formData = await request.formData();
  const mode = formData.get("mode"); // "login" or "signup"
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role"); // Only for signup

  try {
    if (mode === "login") {
      const response = await fetch("http://localhost:3000/auth/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return json(
          { error: errorData.message || "Login failed" },
          { status: 401 }
        );
      }

      // Extract the auth token from response data and store in a local storage
      const data = await response.json();
      const token = data.token;
      const role = data.role;
      localStorage.setItem("token", data.token);

      // Redirect based on role after successful login
      if (token) {
        if (role === "public") {
          return redirect("/tourist");
        } else if (role === "operator") {
          return redirect("/manager");
        } else {
          return redirect("/admin");
        }
      }
      return null;
    } else {
      const response = await fetch("http://localhost:3000/auth/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return json(
          { error: errorData.message || "Signup failed" },
          { status: 401 }
        );
      }

      const data = await response.json();

      // Redirect to auth page after successful signup
      if (response.status === 201) {
        return redirect("/auth");
      }

      return null;
    }
  } catch (error) {
    return json(
      { error: "Could not connect to auth service" },
      { status: 500 }
    );
  }
}
