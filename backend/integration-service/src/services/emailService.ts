import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface ContactFormData {
  name: string;
  email: string;
  organization?: string;
  contactType: string;
  subject: string;
  message: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("⚠️  EMAIL CONFIGURATION ERROR:");
      console.error("EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "MISSING");
      console.error(
        "EMAIL_PASSWORD:",
        process.env.EMAIL_PASSWORD ? "Set" : "MISSING"
      );
      throw new Error(
        "Email credentials are not properly configured in .env file"
      );
    }

    console.log("📧 Email Service Configuration:");
    console.log("   Service:", process.env.EMAIL_SERVICE || "gmail");
    console.log("   User:", process.env.EMAIL_USER);
    console.log("   Password Length:", process.env.EMAIL_PASSWORD.length);

    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Email Service Connection Error:", error.message);
      } else {
        console.log("✅ Email Service is ready to send messages");
      }
    });
  }

  /**
   * Send a contact form submission via email.
   * Creates a formatted HTML email with the contact details and message.
   */
  async sendContactEmail(formData: ContactFormData): Promise<boolean> {
    try {
      const contactTypeLabels: { [key: string]: string } = {
        general: "General Inquiry",
        technical: "Technical Support",
        partnership: "Partnership Opportunity",
        research: "Research Collaboration",
        feedback: "Platform Feedback",
        media: "Media & Press",
      };

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .field {
              margin-bottom: 20px;
              padding: 15px;
              background: white;
              border-radius: 5px;
              border-left: 4px solid #667eea;
            }
            .field-label {
              font-weight: bold;
              color: #667eea;
              margin-bottom: 5px;
            }
            .field-value {
              color: #555;
            }
            .message-box {
              background: white;
              padding: 20px;
              border-radius: 5px;
              border: 1px solid #ddd;
              margin-top: 10px;
              white-space: pre-wrap;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌏 New Contact Form Submission</h1>
            <p>TourismPulseNZ Contact Portal</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">👤 Name:</div>
              <div class="field-value">${formData.name}</div>
            </div>
            
            <div class="field">
              <div class="field-label">📧 Email:</div>
              <div class="field-value">${formData.email}</div>
            </div>
            
            ${
              formData.organization
                ? `
            <div class="field">
              <div class="field-label">🏢 Organization:</div>
              <div class="field-value">${formData.organization}</div>
            </div>
            `
                : ""
            }
            
            <div class="field">
              <div class="field-label">📋 Inquiry Type:</div>
              <div class="field-value">${
                contactTypeLabels[formData.contactType] || formData.contactType
              }</div>
            </div>
            
            <div class="field">
              <div class="field-label">📌 Subject:</div>
              <div class="field-value">${formData.subject}</div>
            </div>
            
            <div class="field">
              <div class="field-label">💬 Message:</div>
              <div class="message-box">${formData.message}</div>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from the TourismPulseNZ contact form</p>
            <p>Received: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"TourismPulseNZ Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || "tourism.pulse.nz@gmail.com",
        replyTo: formData.email,
        subject: `[${
          contactTypeLabels[formData.contactType] || "Contact Form"
        }] ${formData.subject}`,
        html: emailHtml,
        text: `
New Contact Form Submission - TourismPulseNZ

Name: ${formData.name}
Email: ${formData.email}
Organization: ${formData.organization || "N/A"}
Inquiry Type: ${contactTypeLabels[formData.contactType] || formData.contactType}
Subject: ${formData.subject}

Message:
${formData.message}

---
Received: ${new Date().toLocaleString()}
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✓ Contact email sent successfully:", info.messageId);
      return true;
    } catch (error: any) {
      console.error("✗ Error sending contact email:", error.message);
      throw new Error("Failed to send contact email");
    }
  }

  async sendConfirmationEmail(
    recipientEmail: string,
    recipientName: string
  ): Promise<boolean> {
    try {
      const confirmationHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Thank You for Contacting Us!</h1>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>
            
            <p>Thank you for reaching out to TourismPulseNZ. We have received your message and will get back to you within 24-48 hours.</p>
            
            <p>Our team is reviewing your inquiry and will respond to you at <strong>${recipientEmail}</strong> as soon as possible.</p>
            
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Explore our platform at <a href="http://localhost:3000">TourismPulseNZ</a></li>
              <li>Check out our GitHub repository for technical documentation</li>
              <li>Learn more about the project on our About page</li>
            </ul>
            
            <p>If you have any urgent matters, please don't hesitate to contact us directly at tourism.pulse.nz@gmail.com</p>
            
            <p>Best regards,<br>
            <strong>The TourismPulseNZ Team</strong><br>
            University of Waikato<br>
            School of Computing & Mathematical Sciences</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"TourismPulseNZ" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: "Thank you for contacting TourismPulseNZ",
        html: confirmationHtml,
        text: `
Dear ${recipientName},

Thank you for reaching out to TourismPulseNZ. We have received your message and will get back to you within 24-48 hours.

Our team is reviewing your inquiry and will respond to you at ${recipientEmail} as soon as possible.

Best regards,
The TourismPulseNZ Team
University of Waikato
School of Computing & Mathematical Sciences
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log("✓ Confirmation email sent to:", recipientEmail);
      return true;
    } catch (error: any) {
      console.error("✗ Error sending confirmation email:", error.message);
      // Don't throw error for confirmation email failure
      return false;
    }
  }
}

export default new EmailService();
