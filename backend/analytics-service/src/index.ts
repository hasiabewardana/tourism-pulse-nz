import express from "express"; // Import Express framework
import mongoose from "mongoose"; // Import Mongoose for MongoDB
import analyticsRoutes from "./routes/analyticsRoutes"; // Import analytics routes

const app = express(); // Create Express application instance
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB (use .env variable if available, fallback to hardcoded)
mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb://localhost:27017/tourismpulsenz_analytics"
  )
  .then(() => console.log("Connected to MongoDB")) // Log successful connection
  .catch((err) => console.error("MongoDB connection error:", err)); // Log connection errors

app.use("/api", analyticsRoutes); // Mount analytics routes under /api prefix

const PORT = 3002; // Set port for the analytics service
app.listen(PORT, () => {
  // Start the server
  console.log(`Analytics service running on port ${PORT}`);
});
