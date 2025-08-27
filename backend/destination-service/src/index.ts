import express from "express"; // Import Express
import cors from "cors"; // Enable CORS
import helmet from "helmet"; // Add security headers

const app = express(); // Create Express application

app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for cross-origin requests
app.use(helmet()); // Add security middleware

const PORT = process.env.PORT || 3002; // Use PORT from .env or default to 3002
app.listen(PORT, () =>
  console.log(`Destination service running on port ${PORT}`)
); // Start server
