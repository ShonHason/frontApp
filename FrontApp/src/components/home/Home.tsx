import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./Post"; // Your Post component
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { addPost } from "../../services/post_api";

// Define a TypeScript interface for your post
interface PostType {
  _id: string;
  title: string;
  content: string;
  owner: string;
  likes: number;
  imageUrl?: string;
  createdAt: string;
  rank: number;
}

// Define an interface for the new post state
interface NewPost {
  title: string;
  content: string;
  rank: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<NewPost>({
    title: "",
    content: "",
    rank: 0,
  });
  const [filterByUser, setFilterByUser] = useState<boolean>(false);

  // Assume the logged-in user's ID is stored in localStorage as "userId"
  const currentUsername: string = localStorage.getItem("username") || "";

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const url = filterByUser
          ? `http://localhost:4000/Posts?owner=${currentUsername}`
          : "http://localhost:4000/Posts";
        const response = await axios.get<PostType[]>(url);
        setPosts(response.data);
      } catch (err) {
        setError("Failed to fetch posts");
      }
      setLoading(false);
    };

    fetchPosts();
  }, [filterByUser, currentUsername]);

  // Toggle between showing all posts and just your posts
  const handleToggleFilter = () => {
    setFilterByUser((prev) => !prev);
  };

  const handleNewPostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleRankChange = (
    event: React.SyntheticEvent,
    newValue: number | null
  ) => {
    setNewPost({ ...newPost, rank: newValue || 0 });
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Both title and content are required.");
      return;
    }

    const postData = {
      ...newPost,
      owner: currentUsername,
      imageUrl: " ", // Adjust as needed
    };

    try {
      const response = await addPost(postData);
      // Assuming response is of type PostType
      setPosts([response, ...posts]);
      setOpenDialog(false);
      setNewPost({ title: "", content: "", rank: 0 });
    } catch (err) {
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
      <Typography
        variant="h4"
        component="h1"
        sx={{ textAlign: "center", marginBottom: 3 }}
      >
        {filterByUser ? "My Posts" : "All Movie Reviews"}
      </Typography>

      <Button variant="contained" onClick={handleToggleFilter} sx={{ mb: 2 }}>
        {filterByUser ? "Show All Posts" : "Show My Posts"}
      </Button>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginY: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {posts.map((post) => (
          <Post
            key={post._id}
            _id={post._id}
            title={post.title}
            content={post.content}
            owner={post.owner}
            createdAt={post.createdAt}
            rank={post.rank}
            likes={post.likes}
            imgUrl={post.imageUrl}
            onClick={() => navigate(`/post/${post._id}`)}
          />
        ))}
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 20, right: 20 }}
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
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
            onChange={handleNewPostChange}
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
            onChange={handleNewPostChange}
          />
          <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
            <Typography sx={{ marginRight: 1 }}>Rating:</Typography>
            <Rating
              name="rank"
              value={newPost.rank}
              onChange={handleRankChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
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
