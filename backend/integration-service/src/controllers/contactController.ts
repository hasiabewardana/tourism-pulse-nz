import { Request, Response } from "express";
import emailService from "../services/emailService";
import { z } from "zod";

// Input validation schema for contact form submissions
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  organization: z.string().max(100).optional().or(z.literal("")),
  contactType: z.enum([
    "general",
    "technical",
    "partnership",
    "research",
    "feedback",
    "media",
  ]),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

/**
 * Process and send contact form submissions.
 * Validates input, sends email to admin, and confirms to user.
 */
export const submitContactForm = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationResult = contactFormSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid form data",
        details: validationResult.error.errors,
      });
      return;
    }

    const formData = validationResult.data;

    console.log("[CONTACT] New contact form submission:", {
      name: formData.name,
      email: formData.email,
      contactType: formData.contactType,
      subject: formData.subject,
    });

    await emailService.sendContactEmail(formData);

    emailService
      .sendConfirmationEmail(formData.email, formData.name)
      .catch((err) => {
        console.error(
          "[CONTACT] Failed to send confirmation email:",
          err.message
        );
      });

    res.status(200).json({
      success: true,
      message:
        "Thank you for your message! We will get back to you within 24-48 hours.",
    });
  } catch (error: any) {
    console.error("[CONTACT] Error processing contact form:", error.message);
    res.status(500).json({
      success: false,
      error:
        "Failed to send your message. Please try again or contact us directly via email.",
    });
  }
};

/**
 * Health check endpoint for contact service.
 */
export const healthCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json({
    success: true,
    service: "Contact Service",
    status: "operational",
  });
};
