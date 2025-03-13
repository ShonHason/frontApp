import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "../components/Post";
import Spinner from '../components/Spinner';
import Paging from "../components/Paging/Paging";
import CreatePost from "../components/CreatePost";
import {
  Box,
  Typography,
  Alert,
  Button,
  Fab,
  Container,
  Paper,
  Chip,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import { addPost } from "../services/post_api";

interface PostType {
  _id: string;
  title: string;
  content: string;
  owner: string;
  likes: number;
  imageUrl?: string;
  createdAt: string;
  rank: number;
  numOfComments: number;
}

interface NewPostType {
  title: string;
  content: string;
  rank: number;
  imageUrl: string;
  file?: File | null;
}

const loadingMessages = ["Fetching posts...", "Almost there...", "Loading content..."];
const postingMessages = [
  "Creating your post...", 
  "Saving your review...", 
  "Uploading content...", 
  "Almost done..."
];

const POSTS_PER_PAGE = 5;

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingPost, setCreatingPost] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<NewPostType>({
    title: "",
    content: "",
    rank: 0,
    imageUrl: "",
    file: null
  });
  const [filterByUser, setFilterByUser] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [displayedPosts, setDisplayedPosts] = useState<PostType[]>([]);

  const currentUsername: string = localStorage.getItem("username") || "";

  useEffect(() => {
    fetchPosts();
  }, [filterByUser, currentUsername]);

  useEffect(() => {
    if (posts.length === 0) {
      setDisplayedPosts([]);
      return;
    }

    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = Math.min(startIndex + POSTS_PER_PAGE, posts.length);
    
    if (startIndex >= posts.length) {
      const lastValidPage = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
      setCurrentPage(lastValidPage);
      return;
    }
    
    setDisplayedPosts(posts.slice(startIndex, endIndex));
  }, [posts, currentPage]);

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
      setCurrentPage(1);
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

  const handleFileChange = (file: File | null) => {
    setNewPost({ ...newPost, file });
  };

  const handleImageUrlChange = (url: string) => {
    console.log("Image URL updated:", url);
    setNewPost({ ...newPost, imageUrl: url });
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Both title and content are required.");
      return;
    }

    setCreatingPost(true);

    // Create a post data object with the necessary fields
    const postData = {
      title: newPost.title,
      content: newPost.content,
      rank: newPost.rank,
      imageUrl: newPost.imageUrl, // Use the stored image URL
      owner: currentUsername,
    };

    console.log("Submitting post with data:", postData);

    try {
      const response = await Promise.race([
        addPost(postData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Post creation timed out")), 60000)
        )
      ]) as PostType;

      if (response && response._id) {
        setPosts((prevPosts) => [response, ...prevPosts]);
        setOpenDialog(false);
        setNewPost({ title: "", content: "", rank: 0, imageUrl: "", file: null });
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

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewPost({ title: "", content: "", rank: 0, imageUrl: "", file: null });
  };

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  return (
    <Container maxWidth="md" sx={{ pb: 10, pt: 2 }}>
      {/* PROMINENT HEADER SECTION */}
      <Box 
        sx={{ 
          width: '100%',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          py: 3,
          px: 4,
          borderRadius: 2,
          mb: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            right: -20,
            top: -20,
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            zIndex: 1
          }} 
        />
        
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ marginTop : "40px",display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <MovieFilterIcon sx={{ fontSize: 40 }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              {filterByUser ? "My Reviews" : "Movie Reviews"}
            </Typography>
          </Box>
          
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            {filterByUser 
              ? "Browse and manage your personal movie reviews" 
              : "Discover and share opinions about your favorite films"}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {posts.length > 0 && (
              <Chip 
                label={`${posts.length} ${posts.length === 1 ? 'review' : 'reviews'} found`} 
                color="default"
                variant="filled"
                size="medium"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 500
                }}
              />
            )}
            
            <Button 
              variant="contained" 
              onClick={handleToggleFilter}
              startIcon={<FilterListIcon />}
              color="secondary"
              sx={{ 
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'white',
                }
              }}
            >
              {filterByUser ? "Show All Reviews" : "My Reviews Only"}
            </Button>
          </Box>
        </Box>
      </Box>

      {loading && <Spinner messages={loadingMessages} interval={1500} />}
      {creatingPost && <Spinner messages={postingMessages} interval={1500} overlay={true} color="secondary" />}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Inline empty state when no posts are present */}
      {!loading && displayedPosts.length === 0 && (
        <Paper elevation={0} sx={{ 
          p: 4, 
          borderRadius: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '200px',
          backgroundColor: 'rgba(0,0,0,0.02)',
          border: '1px dashed rgba(0,0,0,0.1)'
        }}>
          <MovieFilterIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2, opacity: 0.7 }} />
          
          <Typography variant="h6" gutterBottom>
            {filterByUser ? "You haven't created any reviews yet" : "No reviews found"}
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Share your thoughts on your favorite movies with the community.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {filterByUser ? "Create Your First Review" : "Be the First to Write a Review"}
          </Button>
        </Paper>
      )}

      {/* Display posts */}
      {!loading && displayedPosts.length > 0 && (
        <Box sx={{width: '100%',display: "flex", flexDirection: "column", gap: 3 }}>
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
                numOfComments={post.numOfComments}
                onClick={() => navigate(`/post/${post._id}`)}
                hasLiked={false}
              />
            ))}
        </Box>
      )}

      {!loading && posts.length > POSTS_PER_PAGE && (
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
        sx={{ 
          position: "fixed", 
          bottom: 20, 
          right: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          '&:hover': {
            transform: 'scale(1.05)'
          },
          transition: 'transform 0.2s'
        }}
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Use the CreatePost component with proper props */}
      <CreatePost
        open={openDialog}
        onClose={handleCloseDialog}
        newPost={newPost}
        onNewPostChange={handleNewPostChange}
        onRankChange={handleRankChange}
        onCreatePost={handleCreatePost}
        creatingPost={creatingPost}
        onFileChange={handleFileChange}
        onImageUrlChange={handleImageUrlChange}
      />
    </Container>
  );
};

export default Home;