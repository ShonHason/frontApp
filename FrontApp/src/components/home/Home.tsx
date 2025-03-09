import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./Post";
import Spinner from '../Spinner';
import Paging from "../Paging/Paging"; // Import the new Paging component
import {
  Box,
  Typography,
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

interface NewPost {
  title: string;
  content: string;
  rank: number;
}

const loadingMessages = ["Fetching posts...", "Almost there...", "Loading content..."];
const postingMessages = [
  "Creating your post...", 
  "Saving your review...", 
  "Uploading content...", 
  "Almost done..."
];

const POSTS_PER_PAGE = 5; // Exactly 5 posts per page

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingPost, setCreatingPost] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<NewPost>({
    title: "",
    content: "",
    rank: 0,
  });
  const [filterByUser, setFilterByUser] = useState<boolean>(false);
  
  // Paging state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [displayedPosts, setDisplayedPosts] = useState<PostType[]>([]);

  const currentUsername: string = localStorage.getItem("username") || "";

  useEffect(() => {
    fetchPosts();
  }, [filterByUser, currentUsername]);

  // Update displayed posts when posts array or current page changes
  useEffect(() => {
    if (posts.length === 0) {
      setDisplayedPosts([]);
      return;
    }

    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = Math.min(startIndex + POSTS_PER_PAGE, posts.length);
    
    // Ensure we're not trying to access beyond the array bounds
    if (startIndex >= posts.length) {
      // If current page would be empty, adjust to the last valid page
      const lastValidPage = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
      setCurrentPage(lastValidPage);
      return;
    }
    
    setDisplayedPosts(posts.slice(startIndex, endIndex));
  }, [posts, currentPage]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterByUser]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = filterByUser
        ? `http://localhost:4000/Posts?owner=${currentUsername}`
        : "http://localhost:4000/Posts";
      const response = await axios.get<PostType[]>(url);
      setPosts(response.data);
      setCurrentPage(1); // Reset to first page when new data is loaded
    } catch (err) {
      setError("Failed to fetch posts");
      console.error("Error fetching posts:", err);
    }
    setLoading(false);
  };

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

    setCreatingPost(true); // Show spinner while posting

    const postData = {
      ...newPost,
      owner: currentUsername,
      imgUrl: "",
    };

    try {
      const response = await Promise.race([
        addPost(postData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Post creation timed out")), 40000)
        )
      ]) as PostType;

      if (response && response._id) {
        setPosts((prevPosts) => [response, ...prevPosts]);
        setOpenDialog(false);
        setNewPost({ title: "", content: "", rank: 0 });
        
        // Fetch latest posts to ensure UI updates
        await fetchPosts();
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create post";
      setError(errorMessage);
      console.error("Post creation error:", err);
      alert(errorMessage + ". Please try again.");
    } finally {
      setCreatingPost(false);
    }
  };

  // Handle page change from Paging component
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

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

      {loading && <Spinner messages={loadingMessages} interval={1500} />}
      {creatingPost && <Spinner messages={postingMessages} interval={1500} overlay={true} color="secondary" />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {displayedPosts.map((post) => (
          <Post
            key={post._id}
            _id={post._id}
            title={post.title}
            content={post.content}
            owner={post.owner}
            createdAt={post.createdAt}
            rank={post.rank}
            likes={post.likes}
            imageUrl={post.imageUrl || ""}
            onClick={() => navigate(`/post/${post._id}`)}
            hasLiked={false}
          />
        ))}
      </Box>

      {/* Centered Paging Component at bottom */}
      {!loading && posts.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          width: '100%',
          marginTop: 4,
          marginBottom: 2
        }}>
          <Paging
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </Box>
      )}

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
          <Button 
            onClick={handleCreatePost} 
            color="primary"
            disabled={creatingPost}
          >
            {creatingPost ? "Posting..." : "Post"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;