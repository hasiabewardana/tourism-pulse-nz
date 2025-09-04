import { RouterProvider, createBrowserRouter } from "react-router-dom"; // Importing RouterProvider and createBrowserRouter for routing functionality
import RootLayout from "./shared/pages/common/Root"; // Importing the RootLayout component for shared layout structure
import Home from "./shared/pages/common/home/Home"; // Importing the Home component for the main content
import Destinations from "./shared/pages/destinations/Destinations";
import About from "./shared/pages/common/about/About";
import Authentication from "./shared/pages/authentication/Authentication"; // Importing the Authentication page for user login/signup
import { authAction } from "./shared/components/authentication/AuthAction";
import { action as logoutAction } from "./shared/components/authentication/Logout";
import "./styles.css"; // Importing global styles
import { checkAuthLoader } from "./util/auth";
import TouristLayout from "./tourist-interface/pages/common/TouristLayout";
import TouristHome from "./tourist-interface/pages/common/TouristHome";
import ManagerLayout from "./manager-dashboard/pages/common/ManagerLayout";
import ManagerHome from "./manager-dashboard/pages/common/ManagerHome";
import AdminLayout from "./admin-panel/pages/common/AdminLayout";
import AdminHome from "./admin-panel/pages/common/AdminHome";
import UserManagement from "./admin-panel/pages/user-management/UserManagement";
import DestinationManagement from "./admin-panel/pages/destination-management/DestinationManagement";
import BookingManagement from "./admin-panel/pages/booking-management/BookingManagement"; // Added import for BookingManagement
import Reports from "./admin-panel/pages/reports/Reports"; // Added import for Reports

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
        path: "destinations",
        element: <Destinations />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "auth",
        element: <Authentication />, // route for authentication page
        action: authAction,
      },
      { path: "logout", element: <Home />, action: logoutAction },
      {
        path: "tourist",
        element: <TouristLayout />, // route for tourist page
        loader: checkAuthLoader, // Protect the route
        children: [
          {
            index: true,
            element: <TouristHome />,
            loader: checkAuthLoader, // Protect the route
          },
        ],
      },
      {
        path: "manager",
        element: <ManagerLayout />, // route for manager page
        loader: checkAuthLoader, // Protect the route
        children: [
          {
            index: true,
            element: <ManagerHome />,
            loader: checkAuthLoader, // Protect the route
          },
        ],
      },
      {
        path: "admin",
        element: <AdminLayout />, // route for admin page
        loader: checkAuthLoader, // Protect the route
        children: [
          {
            index: true,
            element: <AdminHome />,
            loader: checkAuthLoader, // Protect the route
          },
          {
            path: "user-management",
            element: <UserManagement />,
            loader: checkAuthLoader, // Protect the route
          },
          {
            path: "destination-management",
            element: <DestinationManagement />,
            loader: checkAuthLoader, // Protect the route
          },
          {
            path: "booking-management",
            element: <BookingManagement />,
            loader: checkAuthLoader, // Protect the route
          },
          {
            path: "reports",
            element: <Reports />,
            loader: checkAuthLoader, // Protect the route
          },
        ],
      },
    ],
  },
]);

// Main App component that renders the application
export default function App() {
  return <RouterProvider router={router} />;
}
