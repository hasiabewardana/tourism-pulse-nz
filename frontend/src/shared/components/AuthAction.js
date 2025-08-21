import { redirect, json } from "react-router-dom";

export async function authAction({ request }) {
  const formData = await request.formData();
  const mode = formData.get("mode"); // "login" or "signup"
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role"); // Only for signup

  try {
    if (mode === "login") {
      const response = await fetch("http://localhost:3000/auth/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Check and return validation errors
      if (response.status === 404) {
        const errorData = await response.json().catch(() => ({}));
        return json(
          {
            errors: { form: errorData.message || "Invalid user" },
          },
          { status: response.status }
        );
      } else if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        return json(
          {
            errors: { form: errorData.message || "Invalid credentials" },
          },
          { status: response.status }
        );
      }

      if (!response.ok) {
        throw json(
          { errors: { form: "Could not authenticate user." } },
          { status: 500 }
        );
      }

      // Extract the auth token from response data and store in a local storage with expiration
      const data = await response.json();
      const token = data.token;
      const role = data.role;
      localStorage.setItem("token", token);
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 1);
      localStorage.setItem("expiration", expiration.toISOString());

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
      const response = await fetch(
        "http://localhost:3000/auth/api/v1/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            role,
          }),
        }
      );

      // Check and return validation errors
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        return json(
          {
            errors: errorData.errors || {
              form: errorData.message || "Invalid role",
            },
          },
          { status: 400 }
        );
      }

      if (!response.ok) {
        throw json(
          { errors: { form: "Could not create user." } },
          { status: 500 }
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
