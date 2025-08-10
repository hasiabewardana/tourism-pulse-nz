import { RouterProvider, createBrowserRouter } from "react-router-dom"; // Importing RouterProvider and createBrowserRouter for routing functionality
import RootLayout from "./shared/pages/Root"; // Importing the RootLayout component for shared layout structure
import Home from "./shared/pages/Home"; // Importing the Home component for the main content
import Authentication from "./shared/pages/Authentication"; // Importing the Authentication page for user login/signup
import { authAction } from "./shared/components/AuthAction";
import Manager from "./manager-dashboard/pages/Manager"; // Importing the Manager page for management functionality
import "./styles.css"; // Importing global styles

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
        path: "manager",
        element: <Manager />, // route for manager page
      },
    ],
  },
]);

// Main App component that renders the application
export default function App() {
  return <RouterProvider router={router} />;
}
