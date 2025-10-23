import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AnalyticsProvider } from "./shared/context/AnalyticsContext";
import RootLayout from "./shared/pages/common/root/Root";
import Home from "./shared/pages/common/home/Home";
import Destinations from "./shared/pages/destinations/Destinations";
import Map from "./shared/pages/map/Map";
import About from "./shared/pages/common/about/About";
import Contact from "./shared/pages/common/contact/Contact";
import Authentication from "./shared/pages/authentication/Authentication";
import { authAction } from "./shared/components/authentication/AuthAction";
import { action as logoutAction } from "./shared/components/authentication/Logout";
import "./styles.css";
import { checkAuthLoader } from "./util/auth";
import TouristLayout from "./tourist/pages/common/TouristLayout";
import TouristHome from "./tourist/pages/common/TouristHome";
import OffersPage from "./tourist/pages/offers/OffersPage";
import BookingsPage from "./tourist/pages/bookings/BookingsPage";
import PendingPaymentsPage from "./tourist/pages/bookings/PendingPaymentsPage";
import CheckoutPage from "./tourist/pages/CheckoutPage";
import PaymentConfirmationPage from "./tourist/pages/PaymentConfirmationPage";
import ManagerLayout from "./manager/pages/common/ManagerLayout";
import ManagerHome from "./manager/pages/common/ManagerHome";
import OperatorDestinations from "./manager/pages/destinations/OperatorDestinations";
import OperatorDestinationAnalytics from "./manager/pages/destinations/OperatorDestinationAnalytics";
import OfferManagement from "./manager/pages/offers/OfferManagement";
import ManagerBookingsPage from "./manager/pages/bookings/ManagerBookingsPage";
import AdminLayout from "./admin/pages/common/AdminLayout";
import AdminHome from "./admin/pages/common/AdminHome";
import UserManagement from "./admin/pages/users/UserManagement";
import DestinationManagement from "./admin/pages/destinations/DestinationManagement";
import DestinationAnalytics from "./admin/pages/destinations/DestinationAnalytics";
import BookingManagement from "./admin/pages/bookings/BookingManagement";
import ManagerAnalytics from "./manager/pages/analytics/ManagerAnalytics";
import AdminAnalytics from "./admin/pages/analytics/AdminAnalytics";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
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
        element: <Authentication />,
        action: authAction,
      },
      { path: "logout", element: <Home />, action: logoutAction },
      {
        path: "tourist",
        element: <TouristLayout />,
        loader: checkAuthLoader,
        children: [
          {
            index: true,
            element: <TouristHome />,
            loader: checkAuthLoader,
          },
          {
            path: "offers/:destinationId?",
            element: <OffersPage />,
            loader: checkAuthLoader,
          },
          {
            path: "bookings",
            element: <BookingsPage />,
            loader: checkAuthLoader,
          },
          {
            path: "pending-payments",
            element: <PendingPaymentsPage />,
            loader: checkAuthLoader,
          },
          {
            path: "checkout/:bookingId",
            element: <CheckoutPage />,
            loader: checkAuthLoader,
          },
          {
            path: "bookings/:bookingId/checkout",
            element: <CheckoutPage />,
            loader: checkAuthLoader,
          },
          {
            path: "bookings/:bookingId/confirmation",
            element: <PaymentConfirmationPage />,
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
            path: "destinations/:destinationId/analytics",
            element: <OperatorDestinationAnalytics />,
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
            path: "destinations/:destinationId/analytics",
            element: <DestinationAnalytics />,
            loader: checkAuthLoader, // Protect the route
          },
          {
            path: "booking-management",
            element: <BookingManagement />,
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
