import { RouterProvider, createBrowserRouter } from "react-router-dom"; // Importing RouterProvider and createBrowserRouter for routing functionality
import RootLayout from "./shared/pages/common/root/Root"; // Importing the RootLayout component for shared layout structure
import Home from "./shared/pages/common/home/Home"; // Importing the Home component for the main content
import Destinations from "./shared/pages/destinations/Destinations";
import About from "./shared/pages/common/about/About";
import Contact from "./shared/pages/common/contact/Contact";
import Authentication from "./shared/pages/authentication/Authentication"; // Importing the Authentication page for user login/signup
import { authAction } from "./shared/components/authentication/AuthAction";
import { action as logoutAction } from "./shared/components/authentication/Logout";
import "./styles.css"; // Importing global styles
import { checkAuthLoader } from "./util/auth";
import TouristLayout from "./tourist/pages/common/TouristLayout";
import TouristHome from "./tourist/pages/common/TouristHome";
import ManagerLayout from "./manager/pages/common/ManagerLayout";
import ManagerHome from "./manager/pages/common/ManagerHome";
import OperatorDestinations from "./manager/pages/destinations/OperatorDestinations";
import OfferManagement from "./manager/pages/offers/OfferManagement";
import AdminLayout from "./admin/pages/common/AdminLayout";
import AdminHome from "./admin/pages/common/AdminHome";
import UserManagement from "./admin/pages/users/UserManagement";
import DestinationManagement from "./admin/pages/destinations/DestinationManagement";
import BookingManagement from "./admin/pages/bookings/BookingManagement"; // Added import for BookingManagement
import Reports from "./admin/pages/reports/Reports"; // Added import for Reports

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
        path: "contact",
        element: <Contact />,
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
        path: "operator",
        element: <ManagerLayout />, // route for manager page
        loader: checkAuthLoader, // Protect the route
        children: [
          {
            index: true,
            element: <ManagerHome />,
            loader: checkAuthLoader, // Protect the route
          },
          {
            path: "destinations",
            element: <OperatorDestinations />,
            loader: checkAuthLoader, // Protect the route
          },
          {
            path: "offers",
            element: <OfferManagement />,
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
