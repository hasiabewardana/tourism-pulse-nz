// admin-panel/pages/AdminLayout.js
import { Outlet } from "react-router-dom";
import AdminNavigation from "../../components/navigation/AdminNavigation";

function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      <AdminNavigation />
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
