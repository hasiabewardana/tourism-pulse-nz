import express from "express"; // Import Express
import cors from "cors"; // Enable CORS
import helmet from "helmet"; // Add security headers
import healthRoutes from "./routes/healthRoutes"; // Import health check routes
import destinationRoutes from "./routes/destinationRoutes"; // Import destination routes
import bookingRoutes from "./routes/bookingRoutes"; // Import booking routes
import operatorDestinationRoutes from "./routes/operatorDestinationRoutes"; // Import operator destination routes

const app = express(); // Create Express application

app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for cross-origin requests
app.use(helmet()); // Add security middleware

app.use("/dest-service/api", healthRoutes); // Mount health check routes under /api
app.use("/dest-service/api", destinationRoutes); // Mount destination routes under /api
app.use("/dest-service/api", bookingRoutes); // Mount booking routes under /api
app.use("/dest-service/api", operatorDestinationRoutes); // Mount operator destination routes under /api

const PORT = process.env.PORT || 3002; // Use PORT from .env or default to 3002
app.listen(PORT, () =>
  console.log(`Destination service running on port ${PORT}`)
); // Start server
