import { StrictMode } from "react"; // Importing StrictMode for highlighting potential problems in an application
import { createRoot } from "react-dom/client"; // Importing createRoot for rendering React components in the DOM

import App from "./App"; // Importing the main App component

const rootElement = document.getElementById("root"); // Getting the root element from the HTML document
const root = createRoot(rootElement); // Creating a root for the React application

// Render the application using StrictMode to help identify potential issues
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
