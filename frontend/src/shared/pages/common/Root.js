import { Outlet, useLoaderData, useSubmit } from "react-router-dom"; // Importing Outlet to render child routes in the layout
import Header from "../../components/common/Header"; // Importing the Header component for shared navigation
import Footer from "../../components/common/Footer"; // Importing the Footer component for shared footer content
import { useEffect } from "react";
import { getAuthDuration } from "../../../util/auth";

function RootLayout() {
  const token = useLoaderData();
  const submit = useSubmit();

  // Allow functional components to perform side effects
  useEffect(() => {
    if (!token) {
      return;
    }

    if (token === "EXPIRED") {
      submit(null, { action: "/logout", method: "post" });
      return;
    }

    const tokenDuration = getAuthDuration();
    console.log(tokenDuration);

    // schedule auto-logout
    const timer = setTimeout(() => {
      submit(null, { action: "/logout", method: "post" });
    }, tokenDuration);

    // Cleanup
    return () => clearTimeout(timer);
  }, [token, submit]);

  return (
    <>
      <Header /> {/* Rendering the Header component for navigation */}
      <main>
        <Outlet /> {/* This renders the matched child route element */}
      </main>
      <Footer />{" "}
      {/* Rendering the Footer component for shared footer content */}
    </>
  );
}

export default RootLayout;
