import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Tabs, Tab, Paper, Divider, Typography } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, googleSignIn } from '../../services/user_api';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (element: HTMLElement | null, options: { theme: string; size: string; text: string; width: string }) => void;
        };
      };
    }
  }
}

interface GoogleCredentialResponse {
  credential: string;
}

const AuthBox = () => {
  const [tab, setTab] = useState(0);
  const [formValues, setFormValues] = useState({
    usernameOrEmail: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [formErrors, setFormErrors] = useState({
    usernameOrEmail: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadGoogleSignInButton = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "323396859646-f21h2qhltd3ni9ssc9snstsiusuvlouc.apps.googleusercontent.com",
          callback: handleGoogleCallback,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            text: "continue_with",
            width: "100%",
          }
        );
      } else {
        console.error("Google Identity Services SDK not loaded.");
      }
    };

    if (window.google && window.google.accounts) {
      loadGoogleSignInButton();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = loadGoogleSignInButton;
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleCallback = async (response: GoogleCredentialResponse) => {
    try {
      jwtDecode(response.credential);

      await googleSignIn(response.credential);
      alert("Signed in with Google successfully!");
      navigate("/feed");
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      alert("Failed to sign in with Google.");
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setFormValues({
      usernameOrEmail: "",
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    });
    setFormErrors({
      usernameOrEmail: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = {
      usernameOrEmail: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Sign-In: Allow username or email
    if (tab === 0 && formValues.usernameOrEmail.trim() === "") {
      errors.usernameOrEmail = "Username or email is required.";
    }

    if (tab === 1 && !validateEmail(formValues.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!validatePassword(formValues.password)) {
      errors.password = "Password must be at least 6 characters long and contain at least one letter and one number.";
    }

    if (tab === 1 && formValues.password !== formValues.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFormErrors(errors);

    if (Object.values(errors).every((error) => error === "")) {
      try {
        const userData = {
          usernameOrEmail: formValues.usernameOrEmail,
          email: formValues.email,
          password: formValues.password,
          username: tab === 1 ? formValues.email.split('@')[0] : "",
        };

        if (tab === 1) {
          console.log("Registering user:", userData);
          await registerUser(userData);
          alert("Registered Successfully! Please login.");
          setTab(0);
          setFormValues({
            usernameOrEmail: "",
            email: "",
            password: "",
            confirmPassword: "",
            username: "",
          });
        } else {
          console.log("Logging in user:", userData);
          await loginUser(userData);
          alert("Signed In Successfully!");
          navigate("/feed");
        }
      } catch {
        alert("Authentication failed. Please try again.");
      }
    }
  };

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      flexDirection: "row", // Change to row for side-by-side layout
    }}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 3,
          borderRadius: 2,
          textAlign: "center",
          marginRight: "20px", // Space between the boxes
        }}
      >
        <Box sx={{ 
          width: "100%",
          height: "60px",
          backgroundColor: "#f2e1c1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "bold",
          color: "#4f4f4f",
          borderRadius: "5px 5px 0 0",
          marginBottom: "20px",
        }}>
          <Typography>Welcome to FireFilm</Typography>
        </Box>

        <Tabs
          value={tab}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>
        <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
          {tab === 0 ? (
            <TextField
              fullWidth
              label="Username or Email"
              variant="outlined"
              margin="normal"
              required
              name="usernameOrEmail"
              value={formValues.usernameOrEmail}
              onChange={handleInputChange}
              error={!!formErrors.usernameOrEmail}
              helperText={formErrors.usernameOrEmail}
            />
          ) : (
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              required
              name="username"
              value={formValues.username}
              onChange={handleInputChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
            />
          )}

          {tab === 1 && (
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              required
              name="email"
              value={formValues.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
          )}

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            required
            name="password"
            value={formValues.password}
            onChange={handleInputChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          {tab === 1 && (
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              variant="outlined"
              margin="normal"
              required
              name="confirmPassword"
              value={formValues.confirmPassword}
              onChange={handleInputChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
            />
          )}
          <Button variant="contained" fullWidth sx={{ mt: 2, py: 1.5 }} color="primary" type="submit">
            {tab === 0 ? "Sign In" : "Sign Up"}
          </Button>
        </Box>
        <Divider sx={{ my: 2 }}>OR</Divider>
        <Box id="google-signin-button" sx={{ textAlign: "center" }}></Box>
      </Paper>

      <Box sx={{
        width: "300px", // Adjusted width
        height: "400px", // Adjusted height
        backgroundColor: "#F0B27A", // Lighter brown color
        padding: "20px",
        borderRadius: "8px",
        color: "white",
        marginTop: "20px", // Positioned below the Paper box
      }}>
        <Typography variant="h5" gutterBottom>
          Why Register?
        </Typography>
        <Typography variant="body1">
          Join us to unlock exclusive features, connect with friends, and get personalized recommendations!
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ marginTop: "20px" }}>
          The best movie rating app in the world!
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthBox;
