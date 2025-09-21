import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import classes from "./AuthForm.module.css";

function AuthForm() {
  const data = useActionData();
  const navigation = useNavigation();

  const [isLogin, setIsLogin] = useState(true);
  const isSubmitting = navigation.state === "submitting";

  function switchAuthHandler() {
    setIsLogin((isCurrentlyLogin) => !isCurrentlyLogin);
  }

  return (
    <Container maxWidth="sm" className={classes.formContainer}>
      <Box className={classes.formBox}>
        <Typography variant="h4" className={classes.formTitle}>
          {isLogin ? "Log in to TourismPulseNZ" : "Create a New Account"}
        </Typography>
        {data && data.errors && (
          <ul className={classes.errorList}>
            {Object.values(data.errors).map((err) => (
              <li key={err} className={classes.errorItem}>
                {err}
              </li>
            ))}
          </ul>
        )}
        {data && data.message && (
          <Typography color="textSecondary" className={classes.message}>
            {data.message}
          </Typography>
        )}
        <Form method="post" className={classes.form}>
          <input
            type="hidden"
            name="mode"
            value={isLogin ? "login" : "signup"}
          />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                label="Email"
                type="email"
                name="email"
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="password"
                label="Password"
                type="password"
                name="password"
                required
                variant="outlined"
              />
            </Grid>
            {!isLogin && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="firstName"
                    label="First Name"
                    type="text"
                    name="firstName"
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    type="text"
                    name="lastName"
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="role"
                    label="Role"
                    type="text"
                    name="role"
                    required
                    variant="outlined"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} className={classes.actions}>
              <Button
                variant="text"
                onClick={switchAuthHandler}
                className={classes.switchButton}
              >
                {isLogin ? "Create new account" : "Back to Login"}
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                className={classes.submitButton}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} />
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Register"
                )}
              </Button>
            </Grid>
          </Grid>
        </Form>
      </Box>
    </Container>
  );
}

export default AuthForm;
