import express from "express";
import { healthCheck } from "./healthController";
import { register, login } from "./authController";
import cors from "cors";
import helmet from "helmet";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.get("/api/health", healthCheck);
app.post("/api/register", register);
app.post("/api/login", login);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
