import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Rating,
  Box
} from "@mui/material";

interface CreatePostProps {
  open: boolean;
  onClose: () => void;
  newPost: {
    title: string;
    content: string;
    rank: number;
  };
  onNewPostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRankChange: (event: React.SyntheticEvent, newValue: number | null) => void;
  onCreatePost: () => void;
  creatingPost: boolean;
}

const CreatePost: React.FC<CreatePostProps> = ({
  open,
  onClose,
  newPost,
  onNewPostChange,
  onRankChange,
  onCreatePost,
  creatingPost
}) => {
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
      {/* Fix: Don't use Typography with variant="h6" inside DialogTitle */}
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
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 500 }}>
          Cancel
        </Button>
        <Button 
          onClick={onCreatePost} 
          color="primary"
          variant="contained"
          disabled={creatingPost || !newPost.title.trim() || !newPost.content.trim()}
          sx={{ 
            fontWeight: 500,
            borderRadius: 1.5,
            px: 2
          }}
        >
          {creatingPost ? "Posting..." : "Post Review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePost;