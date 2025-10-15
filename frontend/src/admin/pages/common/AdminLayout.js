import { Outlet } from "react-router-dom";

/**
 * Layout wrapper for admin pages.
 * Provides a consistent structure for all admin routes.
 */
function AdminLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}

export default AdminLayout;
