// admin-panel/pages/AdminLayout.js
import { Outlet } from "react-router-dom";
import AdminNavigation from "../../components/navigation/AdminNavigation";

function AdminLayout() {
  return (
    <>
      <AdminNavigation /> {/* Navigation for admin panel */}
      <main>
        <Outlet /> {/* Render admin panel child routes */}
      </main>
    </>
  );
}

export default AdminLayout;
