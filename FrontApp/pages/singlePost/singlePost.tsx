import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, CardContent, Typography, Box, Divider, List,
  ListItem, TextField, Button, Rating, Container, Paper, Avatar,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton
} from "@mui/material";
import { 
  ArrowBack, Edit, Delete, 
  CalendarMonth, Comment as CommentIcon 
} from "@mui/icons-material";
import { 
  singlePost, getComments, isLiked
  , updatePost, deletePost 
} from "../../src/services/post_api";
import { getImg } from "../../src/services/file_api";
import LikeButton from "../../src/components/LikeButton"; 
import CommentSection from "../../src/components/CommentSection"; // Import your existing CommentSection

// Types
type PostType = {
  _id: string;
  id?: string;
  title: string;
  content: string;
  owner: string;
  likes: number;
  imageUrl?: string;
  createdAt: string;
  rank: number;
};

type CommentType = {
  _id: string;
  id?: string;
  comment: string;
  owner: string;
  createdAt: string;
};

const SinglePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [initialLiked, setInitialLiked] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [userAvatars, setUserAvatars] = useState<{[key: string]: string}>({});
  const [isLikeLoading, setIsLikeLoading] = useState(true);

  // States for editing the post
  const [editPostOpen, setEditPostOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  // Get the current username from localStorage
  const currentUser = localStorage.getItem("username") || "Anonymous";

  useEffect(() => {
    if (id) {
      fetchPost(id);
      fetchComments(id);
      checkIfLiked(id);
    }
  }, [id]);

  // Check if post is liked by current user - this will prevent duplicate likes
  const checkIfLiked = async (postId: string) => {
    setIsLikeLoading(true);
    try {
      const likedState = await isLiked(postId);
      setInitialLiked(likedState);
      console.log("Post liked status:", likedState);
    } catch (error) {
      console.error("Error checking if post is liked:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Fetch the post data and prepopulate edit fields.
  const fetchPost = async (postId: string) => {
    try {
      const data = await singlePost(postId);
      setPost(data);
      setEditedTitle(data.title);
      setEditedContent(data.content);
      const avatarUrl : string = await getImg(data.owner);
      setAvatarUrl(avatarUrl); // Set the state with the avatar URL

      // Add the post owner's avatar to userAvatars state as well for consistency
      setUserAvatars(prev => ({
        ...prev,
        [data.owner]: avatarUrl
      }));
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  // Fetch comments and their user avatars
  const fetchComments = async (postId: string) => {
    try {
      const data = await getComments(postId);
      setComments(data);
      
      // Get unique users to fetch their avatars
      const uniqueUsers = Array.from(new Set(data.map((comment: { owner: string; }) => comment.owner)));
      
      // Fetch avatar for each unique user
      const avatarPromises = uniqueUsers.map(async (username) => {
        try {
          const avatarUrl = await getImg(username);
          return { username, avatarUrl };
        } catch (error) {
          console.error(`Error fetching avatar for ${username}:`, error);
          return { username, avatarUrl: '' };
        }
      });
      
      const avatarResults = await Promise.all(avatarPromises);
      const avatarMap = avatarResults.reduce((map, { username, avatarUrl }) => {
        map[username] = avatarUrl;
        return map;
      }, {} as {[key: string]: string});
      
      setUserAvatars(prev => ({...prev, ...avatarMap}));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleUpdatePost = async () => {
    if (!post) return;
    try {
      const updatedPost = await updatePost(post._id, {
        title: editedTitle,
        content: editedContent,
      });
      setPost(updatedPost);
      setEditPostOpen(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    try {
      await deletePost(post._id);
      navigate("/feed");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const getDisplayName = (email: string) => email ? email.split("@")[0] : "Anonymous";
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // Function to update post likes count if needed
  const handleCommentsUpdate = (updatedComments: CommentType[]) => {
    setComments(updatedComments);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)}
        variant="outlined"
        sx={{
          mb: 4,
          mt:4,
          fontSize: "0.875rem",
          borderRadius: "8px",
          padding: "8px 16px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          textTransform: "none",
          borderColor: "primary.light",
          "&:hover": {
            backgroundColor: "primary.light",
            color: "white",
            borderColor: "primary.light"
          },
          transition: "all 0.3s ease"
        }}
      >
        Return to feed
      </Button>

      {post && (
        <>
          <Card sx={{ 
            mb: 5, 
            overflow: "hidden", 
            borderRadius: "16px", 
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.12)"
            }
          }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "stretch" }}>
              <Box sx={{ 
                width: { xs: "100%", md: "400px" }, 
                height: { xs: "350px", md: "500px" }, 
                position: "relative",
                overflow: "hidden"
              }}>
                <Box
                  component="img"
                  src={post.imageUrl || " "}
                  alt={post.title}
                  sx={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                    "&:hover": {
                      transform: "scale(1.05)"
                    }
                  }}
                />
                <Box sx={{
                  position: "absolute", 
                  bottom: 0, 
                  left: 0, 
                  right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                  p: 3, 
                  display: { xs: "block", md: "none" }
                }}>
                  <Typography variant="h5" component="h1" fontWeight="bold" color="white">
                    {post.title}
                  </Typography>
                  <Rating 
                    value={post.rank || 0} 
                    readOnly 
                    precision={0.5} 
                    size="medium" 
                    sx={{ color: "white", mt: 1 }} 
                  />
                </Box>
              </Box>
              
              <CardContent sx={{ 
                flex: 1, 
                p: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <Box>
                  <Box sx={{ 
                    display: { xs: "none", md: "flex" },
                    justifyContent: "space-between", 
                    alignItems: "flex-start", 
                    mb: 3
                  }}>
                    <Typography 
                      variant="h4" 
                      component="h1" 
                      fontWeight="bold"
                      sx={{
                        background: "linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 1
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Rating 
                      value={post.rank || 0} 
                      readOnly 
                      precision={0.5} 
                      size="large" 
                      sx={{ color: "primary.main" }} 
                    />
                  </Box>
                  
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    mb: 3,
                    pb: 2,
                    borderBottom: "1px solid rgba(0,0,0,0.08)"
                  }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        width: 48, 
                        height: 48,
                        boxShadow: "0 3px 8px rgba(0,0,0,0.1)"
                      }} 
                      src={avatarUrl}
                    >
                      {getDisplayName(post.owner).charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {getDisplayName(post.owner)}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CalendarMonth sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(post.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      backgroundColor: "#f8f9fa",
                      borderRadius: "12px",
                      borderLeft: "4px solid #3f51b5",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "4px",
                        background: "linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)"
                      }
                    }}
                  >
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {post.content}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  mt: 2 
                }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {/* Use the LikeButton component - only show when not loading */}
                    {!isLikeLoading && (
                      <LikeButton 
                        postId={post._id} 
                        initialLiked={initialLiked} 
                        initialLikeCount={post.likes} 
                      />
                    )}
                  </Box>

                  {/* Edit and Delete buttons (only for post owner) */}
                  {currentUser === getDisplayName(post.owner) && (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<Edit />}
                        onClick={() => setEditPostOpen(true)}
                        sx={{
                          borderRadius: "8px",
                          textTransform: "none",
                          transition: "all 0.2s ease"
                        }}
                      >
                        Edit Post
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<Delete />}
                        onClick={handleDeletePost}
                        sx={{
                          borderRadius: "8px",
                          textTransform: "none",
                          transition: "all 0.2s ease"
                        }}
                      >
                        Delete Post
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Box>
          </Card>

          {/* Use the CommentSection component */}
          {id && (
            <CommentSection 
              comments={comments} 
              postId={id} 
              currentUser={currentUser}
              userAvatars={userAvatars}
              onCommentsUpdate={handleCommentsUpdate}
            />
          )}
        </>
      )}

      {/* Edit Post Dialog */}
      <Dialog 
        open={editPostOpen} 
        onClose={() => setEditPostOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "8px"
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            fontWeight: "bold",
            background: "linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Edit Post
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px"
              }
            }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px"
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditPostOpen(false)} 
            color="secondary"
            sx={{ 
              textTransform: "none", 
              borderRadius: "6px",
              fontWeight: "medium"
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePost} 
            color="primary"
            variant="contained"
            sx={{ 
              textTransform: "none", 
              borderRadius: "6px",
              fontWeight: "bold",
              background: "linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)"
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SinglePostPage;