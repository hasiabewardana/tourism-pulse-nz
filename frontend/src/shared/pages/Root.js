import { Outlet, useLoaderData, useSubmit } from "react-router-dom"; // Importing Outlet to render child routes in the layout
import Header from "../components/Header"; // Importing the Header component for shared navigation
import Footer from "../components/Footer"; // Importing the Footer component for shared footer content
import { useEffect } from "react";
import { getAuthDuration } from "../../util/auth";

function RootLayout() {
  // const token = useLoaderData();
  // const submit = useSubmit();

  // useEffect(() => {
  //   if (!token) {
  //     return null;
  //   }

  //   if (token === "EXPIRED") {
  //     submit(null, { action: "/logout", method: "POST" });
  //   }

  //   const tokenDuration = getAuthDuration();
  //   console.log(tokenDuration);

  //   setTimeout(() => {
  //     submit(null, { action: "/logout", method: "POST" });
  //   }, tokenDuration);
  // }, [token, submit]);

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
