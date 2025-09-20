// src/shared/pages/common/Authentication.js
import { Container } from "@mui/material";
import AuthForm from "../../components/authentication/AuthForm"; // Importing styles for the authentication form
import classes from "./Authentication.module.css"; // Import CSS module

// Authentication component that renders the authentication form
function Authentication() {
  return (
    <Container maxWidth="lg" className={classes.authContainer}>
      <AuthForm />
    </Container>
  );
}

export default Authentication; // Exporting the Authentication component for use in routing
