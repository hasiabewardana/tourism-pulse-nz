import express from "express";
import {
  submitContactForm,
  healthCheck,
} from "../controllers/contactController";

const router = express.Router();

router.post("/contact", submitContactForm);
router.get("/contact/health", healthCheck);

export default router;
