import { Outlet } from "react-router-dom"; // Importing Outlet to render child routes in the layout
import Header from "../components/Header"; // Importing the Header component for shared navigation
import Footer from "../components/Footer"; // Importing the Footer component for shared footer content

function RootLayout() {
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
