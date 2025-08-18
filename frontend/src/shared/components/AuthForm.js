import { useState } from "react"; // Importing useState for managing state in functional components
import { Form, useActionData } from "react-router-dom"; // Importing Form from react-router-dom for form handling
import classes from "./AuthForm.module.css"; // Importing styles for the authentication form

// AuthForm component that handles user authentication (login/signup)
function AuthForm() {
  const data = useActionData(); // Get data from route action
  const [isLogin, setIsLogin] = useState(true);

  function switchAuthHandler() {
    setIsLogin((isCurrentlyLogin) => !isCurrentlyLogin);
  }

  return (
    <>
      <Form method="post" className={classes.form}>
        <h1>{isLogin ? "Log in" : "Create a new user"}</h1>
        {
          // Input validation errors
          data && data.errors && (
            <ul>
              {Object.values(data.errors).map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )
        }
        {
          // Input validation messages
          data && data.message && <p>{data.message}</p>
        }
        <input type="hidden" name="mode" value={isLogin ? "login" : "signup"} />
        <p>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" required />
        </p>
        <p>
          <label htmlFor="image">Password</label>
          <input id="password" type="password" name="password" required />
        </p>
        {!isLogin && (
          <p>
            <label htmlFor="role">Role</label>
            <input id="role" type="text" name="role" required />
          </p>
        )}
        <div className={classes.actions}>
          <button onClick={switchAuthHandler} type="button">
            {isLogin ? "Create new user" : "Login"}
          </button>
          <button type="submit"> {!isLogin ? "Register" : "Login"}</button>
        </div>
      </Form>
    </>
  );
}

export default AuthForm;
