import express from "express";
import {
  submitContactForm,
  healthCheck,
} from "../controllers/contactController";

const router = express.Router();

// POST /integration-service/api/contact - Submit contact form
router.post("/contact", submitContactForm);

// GET /integration-service/api/contact/health - Health check
router.get("/contact/health", healthCheck);

export default router;
