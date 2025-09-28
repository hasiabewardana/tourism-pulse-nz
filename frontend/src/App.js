import { RouterProvider, createBrowserRouter } from "react-router-dom"; // Importing RouterProvider and createBrowserRouter for routing functionality
import { AnalyticsProvider } from "./shared/context/AnalyticsContext";
import RootLayout from "./shared/pages/common/root/Root"; // Importing the RootLayout component for shared layout structure
import Home from "./shared/pages/common/home/Home"; // Importing the Home component for the main content
import Destinations from "./shared/pages/destinations/Destinations";
import Map from "./shared/pages/map/Map";
import About from "./shared/pages/common/about/About";
import Contact from "./shared/pages/common/contact/Contact";
import Authentication from "./shared/pages/authentication/Authentication"; // Importing the Authentication page for user login/signup
import { authAction } from "./shared/components/authentication/AuthAction";
import { action as logoutAction } from "./shared/components/authentication/Logout";
import "./styles.css"; // Importing global styles
import { checkAuthLoader } from "./util/auth";
import TouristLayout from "./tourist/pages/common/TouristLayout";
import TouristHome from "./tourist/pages/common/TouristHome";
import OffersPage from "./tourist/pages/offers/OffersPage";
import BookingsPage from "./tourist/pages/bookings/BookingsPage";
import ManagerLayout from "./manager/pages/common/ManagerLayout";
import ManagerHome from "./manager/pages/common/ManagerHome";
import OperatorDestinations from "./manager/pages/destinations/OperatorDestinations";
import OfferManagement from "./manager/pages/offers/OfferManagement";
import ManagerBookingsPage from "./manager/pages/bookings/ManagerBookingsPage";
import AdminLayout from "./admin/pages/common/AdminLayout";
import AdminHome from "./admin/pages/common/AdminHome";
import UserManagement from "./admin/pages/users/UserManagement";
import DestinationManagement from "./admin/pages/destinations/DestinationManagement";
import BookingManagement from "./admin/pages/bookings/BookingManagement";
import Reports from "./admin/pages/reports/Reports";
import ManagerAnalytics from "./manager/pages/analytics/ManagerAnalytics";
import AdminAnalytics from "./admin/pages/analytics/AdminAnalytics";

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
        path: "map",
        element: <Map />,
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
          {
            path: "offers/:destinationId?",
            element: <OffersPage />,
            loader: checkAuthLoader, // Protect the route
          },
          {
            path: "bookings", // Added bookings route
            element: <BookingsPage />,
            loader: checkAuthLoader,
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
          {
            path: "bookings", // Added bookings route
            element: <ManagerBookingsPage />,
            loader: checkAuthLoader,
          },
          {
            path: "analytics", // Added analytics route
            element: <ManagerAnalytics />,
            loader: checkAuthLoader,
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
          {
            path: "analytics", // Added analytics route
            element: <AdminAnalytics />,
            loader: checkAuthLoader, // Protect the route
          },
        ],
      },
    ],
  },
]);

// Main App component that renders the application
export default function App() {
  return (
    <AnalyticsProvider>
      <RouterProvider router={router} />
    </AnalyticsProvider>
  );
}
