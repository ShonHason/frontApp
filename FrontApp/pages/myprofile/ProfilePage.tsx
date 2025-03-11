import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Avatar,
  IconButton,
  Grid,
  CardContent,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Collapse,
  Alert,
  Snackbar
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from 'axios';
import {changePassword,deleteAccount,updateUser} from '../../src/services/user_api';
import {uploadImage,saveImg} from '../../src/services/file_api';
import { AlertColor } from '@mui/material';

const ProfilePage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: AlertColor }>({ open: false, message: '', type: 'info' });

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
      const response = await axios.get(`http://localhost:4000/auth/myuser/${username}`,{
        headers: {
          Authorization: "jwt " + accessToken, // Attach the accessToken in the header
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
      showNotification('שגיאה בטעינת פרטי המשתמש', 'error');
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));

      try {
        // Upload the image via the API
        const imageUrl : string  = await uploadImage(file);
        console.log("img:" + imageUrl);
        // Update the image preview with the new URL from the backend
        setImagePreview(imageUrl);
        showNotification('התמונה עודכנה בהצלחה', 'success');
        saveImg(imageUrl);
      } catch (error) {
        showNotification('שגיאה בהעלאת התמונה', 'error');
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (username.length <= 3) {
      showNotification('שם המשתמש חייב להיות באורך של יותר מ-3 תו', 'error');
      return;
    }
  
    // בדיקה שאין רווחים בשם המשתמש
    if (/\s/.test(username)) {
      showNotification('שם המשתמש לא יכול לכלול רווחים', 'error');
      return;
    }
    try {

      const oldUsername = localStorage.getItem('username');
      if (username !== oldUsername && oldUsername !== null) {
        await updateUser(oldUsername, username); // קריאה לפונקציה updateUser לשינוי שם המשתמש
        showNotification('השם המשתמש שונה בהצלחה', 'success');
        localStorage.setItem('username', username); 

      } else {
        showNotification('לא שינית את השם המשתמש', 'info'); // הודעה למשתמש אם הוא לא שינה את השם
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('שגיאה בעדכון הפרופיל', 'error');
    }
  };
  
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showNotification('הסיסמאות אינן תואמות', 'error');
      return;
    }
    
    try {
      // Call the API function to change the password
       await changePassword(username, password, newPassword);
      
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      
      showNotification('הסיסמה שונתה בהצלחה', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification('שגיאה בשינוי הסיסמה', 'error');
    }
  };


  const handleDeleteAccount = async () => {
  try {
    // Call the API function to delete the account
    await deleteAccount();
    
    // Remove username and token from localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    
    showNotification('החשבון נמחק בהצלחה', 'info');
    
    // Redirect to login page after successful deletion
    window.location.href = '/login';
  } catch (error) {
    console.error('Error deleting account:', error);
    showNotification('שגיאה במחיקת החשבון', 'error');
  }
  setDeleteDialogOpen(false);
};


  const showNotification = (message: string, type: AlertColor = 'info') => {
    setNotification({ open: true, message, type });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      bgcolor: '#f4f6f9',
      p: 3 
    }}>
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleCloseNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
        {notification.message}
      </Alert>
    </Snackbar>
  
    <Paper 
      elevation={6} 
      sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        background: 'linear-gradient(to right bottom, #ffffff, #e8eaf6)', 
        maxWidth: 800,
        width: '100%',
      }}
    >
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          p: 3,
          textAlign: 'center',
          boxShadow: 3
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" dir="rtl">
          הגדרות פרופיל
        </Typography>
      </Box>
  
      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3} dir="rtl">
          <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                alt={username}
                src={imagePreview || '/default-avatar.png'}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  border: '4px solid white', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)', 
                  transition: 'all 0.3s ease' 
                }}
              />
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
                    bottom: 0, 
                    right: 0, 
                    bgcolor: 'white',
                    '&:hover': { bgcolor: 'grey.100' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)' 
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
          </Grid>
  
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="שם משתמש"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              InputLabelProps={{ dir: 'rtl' }}
              sx={{ mb: 2 }}
            />
          </Grid>
  
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="אימייל"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputLabelProps={{ dir: 'rtl' }}
              sx={{ mb: 2 }}
              disabled
            />
          </Grid>
  
          <Grid item xs={12}>
            <Button 
              variant="outlined" 
              startIcon={<LockResetIcon />}
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              fullWidth
              sx={{ mb: 3, textTransform: 'none', fontSize: '1.1rem' }}
            >
              {showPasswordChange ? 'בטל שינוי סיסמה' : 'שנה סיסמה'}
            </Button>
          </Grid>
  
          <Grid item xs={12}>
            <Collapse in={showPasswordChange}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="סיסמה נוכחית"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ dir: 'rtl' }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="סיסמה חדשה"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ dir: 'rtl' }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="אימות סיסמה חדשה"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ dir: 'rtl' }}
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handlePasswordChange}
                  fullWidth
                >
                  עדכן סיסמה
                </Button>
              </Box>
            </Collapse>
          </Grid>
  
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="contained" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              מחק חשבון
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmit}
              sx={{ textTransform: 'none' }}
            >
              עדכן פרופיל
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Paper>
  
    {/* Dialog for account deletion confirmation */}
    <Dialog
      open={deleteDialogOpen}
      onClose={() => setDeleteDialogOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      dir="rtl"
    >
      <DialogTitle id="alert-dialog-title">
        {"האם אתה בטוח שברצונך למחוק את החשבון?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          פעולה זו תמחק את כל המידע שלך מהמערכת, כולל כל הנתונים במסד הנתונים.
          פעולה זו אינה ניתנת לביטול ולא תוכל לשחזר את המידע לאחר המחיקה.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
          ביטול
        </Button>
        <Button onClick={handleDeleteAccount} color="error" autoFocus>
          מחק חשבון
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
  
  );
};

export default ProfilePage;