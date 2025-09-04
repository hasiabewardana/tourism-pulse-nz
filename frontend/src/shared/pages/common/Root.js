// src/shared/pages/common/RootLayout.js
import { Outlet } from "react-router-dom";
import Navigation from "../../components/navigation/Navigation";

function RootLayout() {
  return (
    <>
      <Navigation />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default RootLayout;
