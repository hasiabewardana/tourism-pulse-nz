// src/shared/pages/common/Contact.js
import { Typography, Container, TextField, Button, Box } from "@mui/material";
import { useState } from "react";
import classes from "./Contact.module.css"; // Import the new CSS module for styling

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for form submission (e.g., API call to backend)
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We will get back to you soon.");
    setFormData({ name: "", email: "", message: "" }); // Reset form
  };

  return (
    <Container maxWidth="lg" className={classes.contactContainer}>
      <Typography variant="h2" align="center" className={classes.title}>
        Contact Us
      </Typography>
      <Box className={classes.section}>
        <Typography variant="h4" className={classes.sectionTitle}>
          Get in Touch
        </Typography>
        <Typography className={classes.content}>
          We’re here to assist you with any questions or feedback about
          TourismPulseNZ. Our team operates from 9:00 AM to 5:00 PM NZST, Monday
          to Friday.
        </Typography>
        <Typography className={classes.content}>
          Email:{" "}
          <a href="mailto:support@tourismpulsenz.com">
            support@tourismpulsenz.com
          </a>
        </Typography>
      </Box>
      <Box className={classes.section}>
        <Typography variant="h4" className={classes.sectionTitle}>
          Send Us a Message
        </Typography>
        <form onSubmit={handleSubmit} className={classes.form}>
          <TextField
            fullWidth
            name="name"
            label="Your Name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
            className={classes.input}
          />
          <TextField
            fullWidth
            name="email"
            label="Your Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            className={classes.input}
          />
          <TextField
            fullWidth
            name="message"
            label="Your Message"
            multiline
            rows={4}
            value={formData.message}
            onChange={handleChange}
            margin="normal"
            required
            className={classes.input}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className={classes.submitButton}
          >
            Send Message
          </Button>
        </form>
      </Box>
      <Box className={classes.footer}>
        <Typography className={classes.footerText}>
          © 2025 TourismPulseNZ. All rights reserved.
        </Typography>
      </Box>
      {/* Future: Add a map, FAQ section, or live chat integration */}
    </Container>
  );
}

export default Contact;
