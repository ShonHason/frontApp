import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Avatar,
  IconButton,
  Stack,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Collapse,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import {changePassword,deleteAccount,updateUser} from '../../services/user_api';  
import {uploadImage,saveImg} from '../../services/file_api';
import { AlertColor } from '@mui/material';

const ProfilePage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<{ 
    open: boolean; 
    message: string; 
    title: string;
    type: AlertColor 
  }>({ 
    open: false, 
    message: '', 
    title: '',
    type: 'info' 
  });

  useEffect(() => {
    // Fetch user profile when the component mounts
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchUserProfile(storedUsername);
    }
  }, []);

  const fetchUserProfile = async (username: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`https://node03.cs.colman.ac.il/auth/myuser/${username}`,{
        headers: {
          Authorization: "jwt " + accessToken,
        },
      });
      const userProfile = response.data;
      if (userProfile) {
        setEmail(userProfile.email);
        if (userProfile.imagePath) {
          setImagePreview(userProfile.imagePath);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showNotification('Error', 'Could not load profile data', 'error');
    }
  };

  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImageLoading(true);

      try {
        // Upload the image via the API
        uploadImage(file).then((imageUrl: string) => {
          setImagePreview(imageUrl);
          setImageLoading(false);
          showNotification('Profile Picture Updated', 'Your profile picture has been saved', 'success');
          saveImg(imageUrl);
        }).catch(error => {
          console.error("Error uploading image:", error);
          setImageLoading(false);
          showNotification('Upload Failed', 'Could not upload the image', 'error');
        });
      } catch (error) {
        setImageLoading(false);
        showNotification('Error', 'An unexpected error occurred'+ error);
      }
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (username.length <= 3) {
      showNotification('Username Too Short', 'Username must be longer than 3 characters', 'error');
      return;
    }
  
    if (/\s/.test(username)) {
      showNotification('Invalid Username', 'Username cannot contain spaces', 'error');
      return;
    }
    
    const oldUsername = localStorage.getItem('username');
    if (username !== oldUsername && oldUsername !== null) {
      updateUser(oldUsername, username)
        .then(() => {
          showNotification('Username Updated', 'Your username has been changed successfully', 'success');
          localStorage.setItem('username', username);
        })
        .catch(error => {
          console.error('Error updating profile:', error);
          showNotification('Update Failed', 'Could not update your profile', 'error');
        });
    } else {
      showNotification('No Changes', 'No changes were made to the username', 'info');
    }
  };
  
  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      showNotification('Passwords Do Not Match', 'Please make sure passwords match', 'error');
      return;
    }
    
    // Call the API function to change the password
    changePassword(username, password, newPassword)
      .then(() => {
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
        showNotification('Password Changed', 'Your password has been updated', 'success');
      })
      .catch(error => {
        console.error('Error changing password:', error);
        showNotification('Password Change Failed', 'Please verify your current password', 'error');
      });
  };

  const handleDeleteAccount = () => {
    // Call the API function to delete the account
    deleteAccount()
      .then(() => {
        // Remove username and token from localStorage
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        showNotification('Account Deleted', 'Your account has been deleted successfully', 'info');
        // Redirect to login page after successful deletion
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      })
      .catch(error => {
        console.error('Error deleting account:', error);
        showNotification('Delete Failed', 'Could not delete your account', 'error');
      });
    
    setDeleteDialogOpen(false);
  };

  const showNotification = (title: string, message: string, type: AlertColor = 'info') => {
    setNotification({ open: true, title, message, type });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: 6,
      px: 3
    }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          <Typography fontWeight="bold" variant="subtitle2">{notification.title}</Typography>
          <Typography variant="body2">{notification.message}</Typography>
        </Alert>
      </Snackbar>

      {/* Header */}
      <Typography 
        variant="h4" 
        marginTop={'35px'}
        fontWeight="bold" 
        align="center" 
        sx={{ 
          mb: 5
        }}
      >
        My Profile
      </Typography>

      {/* Profile Content */}
      <Stack
        spacing={6}
        alignItems="center"
        sx={{ maxWidth: 600, mx: 'auto' }}
      >
        {/* Avatar Section */}
        <Box sx={{ position: 'relative' }}>
          <Avatar
            alt={username}
            src={imagePreview || '/default-avatar.png'}
            sx={{ 
              width: 140, 
              height: 140, 
              opacity: imageLoading ? 0.6 : 1
            }}
          />
          {imageLoading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}>
              <Typography sx={{ color: 'black', fontWeight: 'bold', bgcolor: 'rgba(255,255,255,0.7)', px: 2, py: 0.5, borderRadius: 1 }}>
                Uploading...
              </Typography>
            </Box>
          )}
          <label htmlFor="icon-button-file">
            <input
              accept="image/*"
              id="icon-button-file"
              type="file"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <IconButton 
              color="primary" 
              component="span" 
              sx={{ 
                position: 'absolute', 
                bottom: 5, 
                right: 5
              }}
            >
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>

        {/* Form Fields */}
        <Stack spacing={3} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            variant="outlined"
            disabled
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />

          <Button 
            variant={showPasswordChange ? "outlined" : "contained"} 
            startIcon={<LockResetIcon />}
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            fullWidth
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            {showPasswordChange ? 'Cancel Password Change' : 'Change Password'}
          </Button>

          <Collapse in={showPasswordChange}>
            <Stack 
              spacing={3} 
              sx={{ 
                p: 3, 
                mt: 2,
                borderRadius: 3
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Change Your Password
              </Typography>
              
              <Divider />
              
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handlePasswordChange}
                sx={{ 
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none'
                }}
              >
                Update Password
              </Button>
            </Stack>
          </Collapse>
        </Stack>

        {/* Action Buttons */}
        <Stack 
          direction="row" 
          spacing={3} 
          justifyContent="space-between" 
          sx={{ width: '100%', mt: 3 }}
        >
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              px: 3,
              textTransform: 'none',
              borderWidth: 2
            }}
          >
            Delete Account
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              px: 3,
              textTransform: 'none'
            }}
          >
            Save Changes
          </Button>
        </Stack>
      </Stack>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 480
          }
        }}
      >
        <DialogTitle sx={{ pt: 3, pb: 1, fontWeight: 'bold' }}>
          Are you sure you want to delete your account?
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action will delete all your information from the system, including all data in the database.
          </DialogContentText>
          <DialogContentText sx={{ fontWeight: 500 }}>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              px: 3
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;