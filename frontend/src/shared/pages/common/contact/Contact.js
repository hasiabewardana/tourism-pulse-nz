import React, { useState } from "react";
import {
  Typography,
  Container,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import classes from "./Contact.module.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    contactType: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const contactTypes = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Support" },
    { value: "partnership", label: "Partnership Opportunity" },
    { value: "research", label: "Research Collaboration" },
    { value: "feedback", label: "Platform Feedback" },
    { value: "media", label: "Media & Press" },
  ];

  const contactMethods = [
    {
      icon: "📧",
      title: "Project Email",
      value: "info@tourismpulsenz.com",
      description: "General inquiries and project information",
      available: "24/7 (Response within 24-48 hours)",
    },
    {
      icon: "🏫",
      title: "Academic Institution",
      value: "University of Waikato",
      description: "School of Computing & Mathematical Sciences",
      available: "Hamilton, Waikato, New Zealand",
    },
    {
      icon: "💻",
      title: "Technical Repository",
      value: "github.com/tourismPulseNZ",
      description: "Open source code and technical documentation",
      available: "Public access for developers",
    },
    {
      icon: "🎓",
      title: "Student Researcher",
      value: "Hasitha P. A. H. Mudiyanselage",
      description: "Master of IT Candidate - Student ID: 1664022",
      available: "COMPX576-25B Programming Project",
    },
  ];

  const projectInfo = [
    {
      title: "Project Duration",
      value: "12 weeks (July - October 2025)",
      icon: "📅",
    },
    {
      title: "Development Status",
      value: "Active Development Phase",
      icon: "🚧",
    },
    {
      title: "Platform Focus",
      value: "New Zealand Tourism Management",
      icon: "🇳🇿",
    },
    {
      title: "Technology Stack",
      value: "React.js, Node.js, PostgreSQL",
      icon: "⚡",
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(
        "http://localhost:3004/integration-service/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus({
          type: "success",
          message:
            data.message ||
            "Thank you for your message! We will get back to you within 24-48 hours.",
        });

        setFormData({
          name: "",
          email: "",
          organization: "",
          contactType: "",
          subject: "",
          message: "",
        });
      } else {
        // Log detailed validation errors
        if (data.details) {
          console.error("Validation errors:", data.details);
        }
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus({
        type: "error",
        message:
          "Sorry, there was an error sending your message. Please try again or contact us directly via email at info@tourismpulsenz.com",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" className={classes.contactContainer}>
      {/* Header Section */}
      <Box className={classes.header}>
        <Typography variant="h2" align="center" className={classes.title}>
          Contact TourismPulseNZ
        </Typography>
        <Typography variant="h5" align="center" className={classes.subtitle}>
          Get in touch with our development team
        </Typography>
        <Box className={classes.tags}>
          <Chip label="Academic Project" className={classes.tag} />
          <Chip label="Open for Collaboration" className={classes.tag} />
          <Chip label="Research Focused" className={classes.tag} />
        </Box>
      </Box>

      {/* Contact Methods Grid */}
      <Box className={classes.section}>
        <Typography
          variant="h3"
          align="center"
          className={classes.sectionTitle}
        >
          Contact Information
        </Typography>
        <Grid container spacing={3}>
          {contactMethods.map((method, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card className={classes.contactCard}>
                <CardContent>
                  <Box className={classes.contactIcon}>{method.icon}</Box>
                  <Typography variant="h6" className={classes.contactTitle}>
                    {method.title}
                  </Typography>
                  <Typography className={classes.contactValue}>
                    {method.value}
                  </Typography>
                  <Typography className={classes.contactDescription}>
                    {method.description}
                  </Typography>
                  <Typography className={classes.contactAvailability}>
                    {method.available}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Contact Form - Centered */}
      <Box className={classes.section}>
        <Card className={classes.formCard}>
          <CardContent>
            <Typography
              variant="h4"
              className={classes.sectionTitle}
              align="center"
            >
              Send Us a Message
            </Typography>
            <Typography className={classes.formDescription}>
              Whether you're interested in collaboration, have technical
              questions, or want to provide feedback, we'd love to hear from
              you.
            </Typography>

            {submitStatus && (
              <Alert
                severity={submitStatus.type}
                className={classes.alert}
                onClose={() => setSubmitStatus(null)}
              >
                {submitStatus.message}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className={classes.form}>
              {/* Form fields arranged in vertical stack - Updated */}
              <Grid container spacing={2} sx={{ width: "100%" }}>
                <Grid item xs={12} style={{ width: "100%", maxWidth: "100%" }}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Full Name **"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={classes.input}
                    disabled={isSubmitting}
                    sx={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={12} style={{ width: "100%", maxWidth: "100%" }}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email Address **"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={classes.input}
                    disabled={isSubmitting}
                    sx={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={12} style={{ width: "100%", maxWidth: "100%" }}>
                  <TextField
                    fullWidth
                    name="organization"
                    label="Organization (Optional)"
                    value={formData.organization}
                    onChange={handleChange}
                    className={classes.input}
                    disabled={isSubmitting}
                    sx={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={12} style={{ width: "100%", maxWidth: "100%" }}>
                  <TextField
                    fullWidth
                    select
                    name="contactType"
                    label="Inquiry Type **"
                    value={formData.contactType}
                    onChange={handleChange}
                    required
                    className={classes.input}
                    disabled={isSubmitting}
                    sx={{ width: "100%" }}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">Select inquiry type</option>
                    {contactTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} style={{ width: "100%", maxWidth: "100%" }}>
                  <TextField
                    fullWidth
                    name="subject"
                    label="Subject **"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={classes.input}
                    disabled={isSubmitting}
                    sx={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={12} style={{ width: "100%", maxWidth: "100%" }}>
                  <TextField
                    fullWidth
                    name="message"
                    label="Message **"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className={classes.input}
                    disabled={isSubmitting}
                    sx={{ width: "100%" }}
                    placeholder="Please provide details about your inquiry..."
                  />
                </Grid>
              </Grid>

              <Box className={classes.submitSection}>
                <Button
                  variant="contained"
                  type="submit"
                  className={classes.submitButton}
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? <CircularProgress size={20} /> : null
                  }
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
                <Typography className={classes.submitNote}>
                  * Required fields. We typically respond within 24-48 hours.
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>

      {/* Project Information - Centered */}
      <Box className={classes.section}>
        <Typography
          variant="h3"
          align="center"
          className={classes.sectionTitle}
        >
          Project Information
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card className={classes.infoCard}>
              <CardContent>
                <Typography className={classes.content} align="center">
                  TourismPulseNZ is an active academic research project focused
                  on sustainable tourism management in New Zealand.
                </Typography>

                <Box className={classes.projectInfoGrid}>
                  <Grid container spacing={3}>
                    {projectInfo.map((info, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box className={classes.projectInfoItem}>
                          <Box className={classes.projectIcon}>{info.icon}</Box>
                          <Box>
                            <Typography className={classes.projectInfoTitle}>
                              {info.title}
                            </Typography>
                            <Typography className={classes.projectInfoValue}>
                              {info.value}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Divider className={classes.divider} />

                <Typography
                  variant="h6"
                  className={classes.sectionTitle}
                  align="center"
                >
                  Research Interests
                </Typography>
                <Box className={classes.interestsList}>
                  <Typography className={classes.interestItem}>
                    • Sustainable tourism technology solutions
                  </Typography>
                  <Typography className={classes.interestItem}>
                    • Real-time data analytics for tourism management
                  </Typography>
                  <Typography className={classes.interestItem}>
                    • Web-based platforms for capacity monitoring
                  </Typography>
                  <Typography className={classes.interestItem}>
                    • Collaboration with tourism operators and researchers
                  </Typography>
                  <Typography className={classes.interestItem}>
                    • Open source development and knowledge sharing
                  </Typography>
                </Box>

                <Divider className={classes.divider} />

                <Typography
                  variant="h6"
                  className={classes.sectionTitle}
                  align="center"
                >
                  Collaboration Opportunities
                </Typography>
                <Typography className={classes.content} align="center">
                  We welcome partnerships with:
                </Typography>
                <Box className={classes.collaborationList}>
                  <Chip
                    label="Tourism Operators"
                    className={classes.collaborationChip}
                  />
                  <Chip
                    label="Research Institutions"
                    className={classes.collaborationChip}
                  />
                  <Chip
                    label="Government Agencies"
                    className={classes.collaborationChip}
                  />
                  <Chip
                    label="Technology Partners"
                    className={classes.collaborationChip}
                  />
                  <Chip
                    label="Conservation Groups"
                    className={classes.collaborationChip}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* FAQ Section */}
      <Box className={classes.section}>
        <Typography
          variant="h3"
          align="center"
          className={classes.sectionTitle}
        >
          Frequently Asked Questions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className={classes.faqCard}>
              <CardContent>
                <Typography variant="h6" className={classes.faqQuestion}>
                  Q: Is TourismPulseNZ available for public use?
                </Typography>
                <Typography className={classes.faqAnswer}>
                  A: Currently in development as an academic project. A beta
                  version will be available for stakeholder testing, with plans
                  for public release upon project completion.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className={classes.faqCard}>
              <CardContent>
                <Typography variant="h6" className={classes.faqQuestion}>
                  Q: Can tourism operators participate in testing?
                </Typography>
                <Typography className={classes.faqAnswer}>
                  A: Yes! We're seeking tourism operators for beta testing and
                  feedback. Contact us to learn about participation
                  opportunities and requirements.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className={classes.faqCard}>
              <CardContent>
                <Typography variant="h6" className={classes.faqQuestion}>
                  Q: Is the platform open source?
                </Typography>
                <Typography className={classes.faqAnswer}>
                  A: Yes, TourismPulseNZ will be available as open source
                  software to support the broader tourism technology community
                  and encourage collaborative development.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className={classes.faqCard}>
              <CardContent>
                <Typography variant="h6" className={classes.faqQuestion}>
                  Q: How can I stay updated on project progress?
                </Typography>
                <Typography className={classes.faqAnswer}>
                  A: Follow our GitHub repository for code updates, or contact
                  us to join our mailing list for major milestone announcements
                  and beta testing opportunities.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Contact;
