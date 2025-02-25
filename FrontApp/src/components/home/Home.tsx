import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./Post";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { addPost } from "../../services/post_api";  // Adjust the path to match your file structure


const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:4000/Posts");
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch posts");
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostClick = (id: string) => {
    
    console.log(`Post clicked: ${id}`);
    navigate(`/post/${id}`);

  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewPost({ title: "", content: "" }); // Reset form fields
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Both title and content are required.");
      return;
    }
  
    // Add default values for imgUrl and owner
    const postData = {
      ...newPost,
      imgUrl: " ",  // Default empty string for imgUrl
      owner: "",  // We'll set owner in the API call
    };
  
    try {
      // Use addPost instead of directly calling axios.post
      const response = await addPost(postData);
      setPosts([response, ...posts]); // Add new post to list
      handleCloseDialog(); // Close dialog after successful post creation
    } catch (error) {
      alert("Failed to create post. Please try again.");
    }
  };
  
  return (
    <Box
      sx={{
        width: "100%",
        position: "absolute",
        top: "64px",
        left: 0,
        right: 0,
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h4" component="h1" sx={{ textAlign: "center", marginBottom: 3 }}>
        All Movie Reviews
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginY: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: "flex", flexDirection: "column", margin: 0, padding: 0 }}>
        {posts.map((post) => (
          <Post
            key={post._id}
            title={post.title}
            imageUrl={post.imageUrl} 
            content={post.content}
            owner={post.owner}
            createdAt={post.createdAt}
            onClick={() => handlePostClick(post._id)}
            sx={{ margin: 0, padding: 0 }} // Remove any margins or padding in Post component
          />
        ))}
      
      </Box>
      

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 20, right: 20 }}
        onClick={handleOpenDialog}
      >
        <AddIcon />
      </Fab>

      {/* Create Post Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Create a New Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            name="title"
            fullWidth
            variant="outlined"
            value={newPost.title}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Content"
            name="content"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newPost.content}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreatePost} color="primary">
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;
