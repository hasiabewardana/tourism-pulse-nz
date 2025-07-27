import express from "express";
import mongoose from "mongoose";
import analyticsRoutes from "./routes/analytics.routes";

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/tourismpulsenz_analytics");

app.use("/api", analyticsRoutes);

app.listen(3002, () => {
  console.log("Analytics service running on port 3002");
});
