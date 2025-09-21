import express from "express";
import cors from "cors";
import helmet from "helmet";
import openWeatherMapRoutes from "./routes/openWeatherMapRoutes";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/integration-service/api", openWeatherMapRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () =>
  console.log(`Integration service running on port ${PORT}`)
);
