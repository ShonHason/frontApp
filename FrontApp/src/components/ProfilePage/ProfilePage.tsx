import  { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const ProfilePage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    // Fetch user profile when the component mounts
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchUserProfile(storedUsername);
    }
  }, []);

  const fetchUserProfile = async (username) => {
    try {
      const response = await axios.get(`//${username}`); // Adjust the API endpoint accordingly
      const userProfile = response.data;

      // Assuming the response contains email and other fields
      if (userProfile) {
        setEmail(userProfile.email);
        // You can also set other fields here if needed
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Handle error (e.g., show a message to the user)
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Add your update logic here (e.g., API call)
    console.log('Updated profile:', { username, email, password, image });
  };

  interface UserProfile {
    email: string;
    password: string;
    image: string;
  }
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardHeader
          title="Profile Settings"
          titleTypographyProps={{ variant: 'h4', align: 'center' }}
          sx={{ bgcolor: 'primary.main', color: 'white', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
        />
        <CardContent>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={12} display="flex" justifyContent="center">
              <Avatar
                alt={username}
                src={imagePreview || 'https://via.placeholder.com/150'}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <label htmlFor="icon-button-file">
                <input
                  accept="image/*"
                  id="icon-button-file"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <IconButton color="primary" component="span" sx={{ marginLeft: 1 }}>
                  <PhotoCamera />
                </IconButton>
              </label>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
                disabled // Disable editing for the email field if required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Update Profile
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
