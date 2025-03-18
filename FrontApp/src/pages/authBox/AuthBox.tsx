import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, Button, Tabs, Tab, Paper, Divider, Typography, Avatar, IconButton, Grid } from "@mui/material";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, googleSignIn } from '../../services/user_api';
import { UserUploadImage } from "../../services/file_api";
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
    avatar: "",
    username: "",
  });
  // Remove unused state variable
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const decoded = jwtDecode(response.credential);
      
      // Save user data from Google response
      if (decoded && typeof decoded === 'object' && 'picture' in decoded) {
        localStorage.setItem("imageUrl", decoded.picture as string);
      }

      await googleSignIn(response.credential);
      console.log("Signed in with Google successfully!");
      navigate("/feed");
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      alert("Failed to sign in with Google.");
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
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
      avatar: "",
      username: "",
    });
    setAvatarPreview(null);
    setImageUrl(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setFormErrors({...formErrors, avatar: "Please select an image file"});
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({...formErrors, avatar: "Image must be less than 5MB"});
        return;
      }

      setFormErrors({...formErrors, avatar: ""});
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const result = e.target.result as string;
          setAvatarPreview(result);
        }
      };
      reader.readAsDataURL(file);

      // Upload the image immediately
      try {
        setIsUploading(true);
        const uploadedImageUrl = await UserUploadImage(file);
        setImageUrl(uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        setFormErrors({...formErrors, avatar: "Error uploading image. Please try again."});
      } finally {
        setIsUploading(false);
      }
    }
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
      avatar: "",
      username: "",
    };

    // Sign-In: Allow username or email
    if (tab === 0 && formValues.usernameOrEmail.trim() === "") {
      errors.usernameOrEmail = "Username or email is required.";
    }

    if (tab === 1) {
      if (formValues.username.trim() === "") {
        errors.username = "Username is required.";
      }
      
      if (!validateEmail(formValues.email)) {
        errors.email = "Please enter a valid email address.";
      }
      
      if (formValues.password !== formValues.confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }
    }

    if (!validatePassword(formValues.password)) {
      errors.password = "Password must be at least 6 characters long and contain at least one letter and one number.";
    }

    setFormErrors(errors);

    if (Object.values(errors).every((error) => error === "")) {
      try {
        if (tab === 1) {
          // Register user with the correct format
          const userData = {
            username: formValues.username,
            email: formValues.email,
            password: formValues.password,
            imgUrl: imageUrl || "", // Use the uploaded image URL
          };
          
          await registerUser(userData);
          
          // Store username in localStorage for logged-in state
          localStorage.setItem("username", formValues.username);
          
          // If we have an image URL, store it
          if (imageUrl) {
            localStorage.setItem("imageUrl", imageUrl);
          }
          
          alert("Registered Successfully! Please login.");
          setTab(0);
          setFormValues({
            usernameOrEmail: "",
            email: "",
            password: "",
            confirmPassword: "",
            username: "",
          });
          setAvatarPreview(null);
          setImageUrl(null);
        } else {
          // Login
          const userData = {
            usernameOrEmail: formValues.usernameOrEmail,
            password: formValues.password,
          };
          
          const response = await loginUser(userData);
          
          if (response && response.user) {
            if (response.user.imageUrl) {
              localStorage.setItem("imageUrl", response.user.imageUrl);
            }
            if (response.user.username) {
              localStorage.setItem("username", response.user.username);
            }
          }
          
          alert("Signed In Successfully!");
          navigate("/feed");
        }
      } catch (error) {
        console.error("Authentication error:", error);
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
      flexDirection: { xs: "column", md: "row" },
      padding: 2,
    }}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 450,
          borderRadius: 2,
          textAlign: "center",
          marginRight: { md: "20px" },
          marginBottom: { xs: "20px", md: 0 },
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Box sx={{ 
          width: "100%",
          height: "50px",
          backgroundColor: "#f2e1c1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#4f4f4f",
          borderRadius: "5px 5px 0 0",
        }}>
          <Typography variant="h6">Welcome to FireFilm</Typography>
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
        
        <Box component="form" sx={{ p: 2 }} onSubmit={handleSubmit}>
          {tab === 0 ? (
            // Sign In Form
            <TextField
              fullWidth
              label="Username or Email"
              variant="outlined"
              size="small"
              margin="dense"
              required
              name="usernameOrEmail"
              value={formValues.usernameOrEmail}
              onChange={handleInputChange}
              error={!!formErrors.usernameOrEmail}
              helperText={formErrors.usernameOrEmail}
            />
          ) : (
            // Sign Up Form
            <>
              <Grid container spacing={2} alignItems="center">
                {/* Username and Avatar in one row */}
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    size="small"
                    required
                    name="username"
                    value={formValues.username}
                    onChange={handleInputChange}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <IconButton 
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                      sx={{ 
                        width: 60,
                        height: 60,
                        border: '1px dashed #ccc',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {isUploading && (
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          zIndex: 2,
                        }}>
                          <Typography variant="caption">Uploading...</Typography>
                        </Box>
                      )}
                      {avatarPreview ? (
                        <Avatar 
                          src={avatarPreview} 
                          sx={{ 
                            width: 60, 
                            height: 60,
                          }} 
                        />
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <AddAPhotoIcon fontSize="small" />
                          <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Avatar</Typography>
                        </Box>
                      )}
                    </IconButton>
                  </Box>
                  {formErrors.avatar && (
                    <Typography color="error" variant="caption">
                      {formErrors.avatar}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                size="small"
                margin="dense"
                required
                name="email"
                value={formValues.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </>
          )}

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            size="small"
            margin="dense"
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
              size="small"
              margin="dense"
              required
              name="confirmPassword"
              value={formValues.confirmPassword}
              onChange={handleInputChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
            />
          )}
          
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ mt: 2, py: 1 }} 
            color="primary" 
            type="submit"
            disabled={isUploading}
          >
            {tab === 0 ? "Sign In" : "Sign Up"}
          </Button>
        </Box>
        
        <Divider sx={{ my: 1 }}>OR</Divider>
        <Box id="google-signin-button" sx={{ textAlign: "center", p: 2 }}></Box>
      </Paper>

      <Box sx={{
        width: { xs: "100%", md: "300px" },
        backgroundColor: "#F0B27A",
        padding: "15px",
        borderRadius: "8px",
        color: "white",
        height: { xs: "auto", md: "350px" },
      }}>
        <Typography variant="h6" gutterBottom>
          Why Register?
        </Typography>
        <Typography variant="body2">
          Join us to unlock exclusive features, connect with friends, and get personalized recommendations!
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ marginTop: "10px" }}>
          The best movie rating app in the world!
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthBox;