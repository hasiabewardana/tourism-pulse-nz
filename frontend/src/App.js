import { RouterProvider, createBrowserRouter } from "react-router-dom"; // Importing RouterProvider and createBrowserRouter for routing functionality
import RootLayout from "./shared/pages/common/Root"; // Importing the RootLayout component for shared layout structure
import Home from "./shared/pages/common/Home"; // Importing the Home component for the main content
import Authentication from "./shared/pages/authentication/Authentication"; // Importing the Authentication page for user login/signup
import { authAction } from "./shared/components/authentication/AuthAction";
import Manager from "./manager-dashboard/pages/Manager"; // Importing the Manager page for management functionality
import Tourist from "./tourist-interface/pages/Tourist"; // Importing the Tourist page for destination browsing
import { action as logoutAction } from "./shared/pages/authentication/Logout";
import "./styles.css"; // Importing global styles
import { checkAuthLoader } from "./util/auth";
import UserManagement from "./admin-panel/pages/user-management/UserManagement";
import AdminLayout from "./admin-panel/pages/common/AdminLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, // layout with header/footer
    children: [
      {
        index: true, // default child route for "/"
        element: <Home />,
      },
      {
        path: "auth",
        element: <Authentication />, // route for authentication page
        action: authAction,
      },
      {
        path: "tourist",
        element: <Tourist />, // route for tourist page
        loader: checkAuthLoader, // Protect the route
      },
      {
        path: "manager",
        element: <Manager />, // route for manager page
        loader: checkAuthLoader, // Protect the route
      },
      {
        path: "admin",
        element: <AdminLayout />, // route for admin page
        loader: checkAuthLoader, // Protect the route
        children: [
          {
            index: true,
            element: <p>Welcome to the Admin Panel Overview</p>, // or another component
          },
          {
            path: "user-management",
            element: <UserManagement />,
            loader: checkAuthLoader, // Protect the route
          },
        ],
      },
      { path: "logout", action: logoutAction },
    ],
  },
]);

// Main App component that renders the application
export default function App() {
  return <RouterProvider router={router} />;
}
