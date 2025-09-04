import express from "express"; // Import Express
import healthRoutes from "./routes/healthRoutes"; // Import health routes
import authRoutes from "./routes/authRoutes"; // Import auth routes
import userRoutes from "./routes/userRoutes"; // Import user routes
import cors from "cors"; // Enable CORS
import helmet from "helmet"; // Add security headers

const app = express(); // Create Express application

app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for cross-origin requests
app.use(helmet()); // Add security middleware

app.use("/auth-service/api", healthRoutes); // Mount health routes under /api
app.use("/auth-service/api", authRoutes); // Mount auth routes under /api
app.use("/auth-service/api", userRoutes); // Mount user routes under /api

const PORT = process.env.PORT || 3001; // Use PORT from .env or default to 3001
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`)); // Start server
