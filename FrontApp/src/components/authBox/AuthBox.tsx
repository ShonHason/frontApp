import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Tabs, Tab, Paper, Divider } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, googleSignIn } from "./api"; // Your backend API functions

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (element: HTMLElement | null, options: { theme: string; size: string; text: string; width: string }) => void;
        };
      };
    };
  }
}

interface GoogleCredentialResponse {
  credential: string;
}

const AuthBox = () => {
  const [tab, setTab] = useState(0);
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadGoogleSignInButton = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with your actual client ID
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
      const decoded: any = jwtDecode(response.credential);
      console.log("Google User:", decoded);

      await googleSignIn(response.credential);
      alert("Signed in with Google successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      alert("Failed to sign in with Google.");
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setFormValues({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({
      username: "",
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (formValues.username.trim() === "") {
      errors.username = "Username is required.";
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
          username: formValues.username,
          email: formValues.email,
          password: formValues.password,
        };

        if (tab === 1) {
          console.log("Registering user:", userData);
          await registerUser(userData);
          alert("Registered Successfully!");
        } else {
          await loginUser(userData);
          alert("Signed In Successfully!");
        }

        navigate("/home");
      } catch {
        alert("Authentication failed. Please try again.");
      }
    }
  };

  return (
    <Box className="auth-container">
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 3,
          borderRadius: 2,
          textAlign: "center",
        }}
      >
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
    </Box>
  );
};

export default AuthBox;
