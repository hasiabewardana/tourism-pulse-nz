// src/shared/pages/common/RootLayout.js
import { Outlet } from "react-router-dom";
import Navigation from "../../../components/navigation/Navigation";
import Header from "../../../components/common/header/Header";
import Footer from "../../../components/common/footer/Footer";
import classes from "./RootLayout.module.css"; // Import CSS module

function RootLayout() {
  return (
    <>
      <Header />
      <Navigation />
      <main className={classes.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default RootLayout;
