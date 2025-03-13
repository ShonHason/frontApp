import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Rating,
  Box,
  IconButton,
  Paper,
  Stack,
  LinearProgress,
  Alert,
  Snackbar
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { UserUploadImage } from "../services/file_api";

interface CreatePostProps {
  open: boolean;
  onClose: () => void;
  newPost: {
    title: string;
    content: string;
    rank: number;
    file?: File | null;
    imageUrl?: string;
  };
  onNewPostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRankChange: (event: React.SyntheticEvent, newValue: number | null) => void;
  onFileChange: (file: File | null) => void;
  onImageUrlChange: (url: string) => void;
  onCreatePost: () => void;
  creatingPost: boolean;
}

const CreatePost: React.FC<CreatePostProps> = ({
  open,
  onClose,
  newPost,
  onNewPostChange,
  onRankChange,
  onFileChange,
  onImageUrlChange,
  onCreatePost,
  creatingPost
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert File to FormData
  const createFileFormData = async (file: File): Promise<FormData> => {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  };

  const uploadFile = async (file: File) => {
    try {
      // Show feedback that upload is starting
      setIsUploading(true);
      setUploadProgress(10);
      setError(null);
      onFileChange(file);

      // Log the file being uploaded for debugging
      console.log("File being prepared for upload:", file);
      console.log("File type:", file.type);
      console.log("File size:", file.size);
      setUploadProgress(30);
      
      // Create a new File object to ensure it's properly formatted
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file - this approach should work better with the server
      setUploadProgress(50);
      
      // Method 1: Try using the File object directly
      console.log("Attempting upload with File object directly");
      const imageUrl = await UserUploadImage(file);
      
      // Log the response
      console.log("Upload successful! Response URL:", imageUrl);
      
      // Update parent component with the image URL
      setUploadProgress(100);
      onImageUrlChange(imageUrl);
      
      // Reset upload state
      setIsUploading(false);
      return true;
    } catch (error) {
      // Handle errors
      console.error("Error during file upload:", error);
      setIsUploading(false);
      setUploadProgress(0);
      setError(error instanceof Error ? error.message : 'Error uploading image');
      return false;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    onImageUrlChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleCloseError = () => {
    setError(null);
  };
  
  const renderFilePreview = () => {
    if (!newPost.file) return null;
    
    const isImage = newPost.file.type.startsWith('image/');
    const fileSize = (newPost.file.size / 1024 / 1024).toFixed(2);
    
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mt: 2,
          mb: 3,
          borderRadius: 1,
          position: 'relative',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {isImage ? (
            <Box
              component="img"
              src={newPost.imageUrl || URL.createObjectURL(newPost.file)}
              alt="Preview"
              sx={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 1
              }}
            />
          ) : (
            <Box
              sx={{
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                borderRadius: 1
              }}
            >
              <ImageIcon color="action" />
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" noWrap component="div">
              {newPost.file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" component="div">
              {fileSize} MB
            </Typography>
            <LinearProgress
              variant="determinate"
              value={isUploading ? uploadProgress : 100}
              sx={{ mt: 1, height: 4, borderRadius: 1 }}
            />
            {isUploading && (
              <Typography variant="caption" color="primary" component="div">
                Uploading image... {uploadProgress}%
              </Typography>
            )}
            {newPost.imageUrl && !isUploading && (
              <Typography variant="caption" color="success.main" component="div">
                Image uploaded successfully
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={handleRemoveFile}
            disabled={isUploading}
            sx={{ ml: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle>
        Create Movie Review
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Share your thoughts about a movie with the community
          </Typography>
        </Box>

        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="Movie Title"
          type="text"
          fullWidth
          variant="outlined"
          value={newPost.title}
          onChange={onNewPostChange}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          name="content"
          label="Your Review"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={newPost.content}
          onChange={onNewPostChange}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography component="legend" sx={{ mr: 2 }}>
            Your Rating:
          </Typography>
          <Rating
            name="rank"
            value={newPost.rank}
            onChange={onRankChange}
            precision={0.5}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {newPost.rank > 0 ? `${newPost.rank}/5` : "No rating"}
          </Typography>
        </Box>

        {renderFilePreview()}
        
        <Box
          onDragEnter={handleDrag}
          sx={{
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'divider',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            transition: 'all 0.2s',
            bgcolor: dragActive ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
          }}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <CloudUploadIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            {dragActive ? 'Drop your file here' : 'Upload a movie poster or screenshot'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isUploading ? 'Uploading image...' : 'Drag and drop a file here, or click to select a file'}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 500 }}>
          Cancel
        </Button>
        <Button 
          onClick={onCreatePost} 
          color="primary"
          variant="contained"
          disabled={creatingPost || !newPost.title.trim() || !newPost.content.trim() || isUploading}
          sx={{ 
            fontWeight: 500,
            borderRadius: 1.5,
            px: 2
          }}
        >
          {creatingPost ? "Posting..." : "Post Review"}
        </Button>
      </DialogActions>

      {dragActive && (
        <Box
          position="absolute"
          width="100%"
          height="100%"
          top={0}
          right={0}
          bottom={0}
          left={0}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        />
      )}
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CreatePost;