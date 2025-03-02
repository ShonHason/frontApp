  import React, { useEffect, useState } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import {
    Card, CardContent, Typography, Box, IconButton, Divider, List,
    ListItem, TextField, Button, Rating, Container, Paper, Avatar,
    Chip, Dialog, DialogTitle, DialogContent, DialogActions
  } from "@mui/material";
  import { 
    ThumbUp, ThumbUpOffAlt, ArrowBack, Edit, Delete, 
    CalendarMonth, Comment as CommentIcon 
  } from "@mui/icons-material";
  import { singlePost, getComments, addLike, unlike, addComment, deleteComment, updateComment } from "../../services/post_api";

  // Types
  type PostType = {
    id: string;
    title: string;
    content: string;
    owner: string;
    likes: number;
    imgUrl: string;
    createdAt: string;
    rank: number;
  };

  type CommentType = {
    _id: string;
    comment: string;
    owner: string;
    createdAt: string;
  };

  const SinglePostPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<PostType | null>(null);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [liked, setLiked] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [editCommentId, setEditCommentId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const currentUser = localStorage.getItem("username") || "Anonymous";

    useEffect(() => {
      if (id) {
        fetchPost(id);
        fetchComments(id);
      }
    }, [id]);

    const fetchPost = async (postId: string) => {
      try {
        const data = await singlePost(postId);
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    const fetchComments = async (postId: string) => {
      try {
        const data = await getComments(postId);
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    const handleLike = async () => {
      if (!post || !id) return;
      try {
        if (liked) {
          await unlike(id);
          setPost({ ...post, likes: post.likes - 1 });
        } else {
          await addLike(id);
          setPost({ ...post, likes: post.likes + 1 });
        }
        setLiked(!liked);
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    };

    const handleCommentSubmit = async () => {
      if (!newComment.trim() || !post || !id) return;
      try {
        const addedComment = await addComment({
          comment: newComment,
          owner: currentUser,
          postId: id,
        });

        setComments(prev => [...prev, {
          _id: addedComment._id,
          comment: addedComment.comment,
          owner: currentUser,
          createdAt: new Date().toISOString(),
        }]);
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    };

    const handleEditComment = (commentId: string, commentText: string) => {
      setEditCommentId(commentId);
      setEditedComment(commentText);
    };

    const handleUpdateComment = async () => {
      if (!editCommentId || !editedComment.trim()) return;
      try {
        await updateComment(editCommentId, { 
          comment: editedComment, 
          owner: currentUser 
        });
        
        setComments(prev => prev.map(comment => 
          comment._id === editCommentId 
            ? { ...comment, comment: editedComment } 
            : comment
        ));
        
        setEditCommentId(null);
        setEditedComment("");
      } catch (error) {
        console.error("Error updating comment:", error);
      }
    };

    const confirmDeleteComment = (commentId: string) => {
      console.log("Comment ID to delete:", commentId); // Log the comment ID
      setCommentToDelete(commentId);
      setDeleteDialogOpen(true);
    };
    
    const handleDeleteComment = async () => {
      
      if (!commentToDelete) return;
      try {
        console.log("Deleting comment with ID:", commentToDelete); // Log the comment ID before sending the delete request
        await deleteComment(commentToDelete);
        setComments(prev => prev.filter(comment => comment._id !== commentToDelete));
        setDeleteDialogOpen(false);
        setCommentToDelete(null);
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    };

    // Helper functions
    const getDisplayName = (email: string) => email ? email.split('@')[0] : "Anonymous";
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    };

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Back to reviews
        </Button>
        
        {post && (
          <Card sx={{ mb: 4, overflow: "hidden", borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>
              {/* Movie Image */}
              <Box sx={{ width: { xs: "100%", md: "300px" }, height: { xs: "400px", md: "450px" }, position: "relative" }}>
                <Box
                  component="img"
                  src={post.imgUrl || "https://via.placeholder.com/300x450"}
                  alt={post.title}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <Box sx={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                  p: 2, display: { xs: "block", md: "none" }
                }}>
                  <Typography variant="h5" component="h1" fontWeight="bold" color="white">
                    {post.title}
                  </Typography>
                  <Rating value={post.rank || 0} readOnly precision={0.5} size="medium" sx={{ color: "white" }} />
                </Box>
              </Box>
              
              {/* Content */}
              <CardContent sx={{ flex: 1, p: 4 }}>
                <Box sx={{ 
                  display: { xs: "none", md: "flex" },
                  justifyContent: "space-between", alignItems: "flex-start", mb: 3
                }}>
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    {post.title}
                  </Typography>
                  <Rating value={post.rank || 0} readOnly precision={0.5} size="large" />
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar sx={{ bgcolor: "#3f51b5", mr: 2, width: 42, height: 42 }}>
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
                
                <Paper elevation={0} sx={{ 
                  p: 3, mb: 3, backgroundColor: "#f8f9fa",
                  borderRadius: 2, borderLeft: "4px solid #3f51b5"
                }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {post.content}
                  </Typography>
                </Paper>
                
                <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ mt: 2 }}>
                  <IconButton 
                    onClick={handleLike} 
                    sx={{ mr: 1, color: liked ? "primary.main" : "text.secondary" }}
                  >
                    {liked ? <ThumbUp /> : <ThumbUpOffAlt />}
                  </IconButton>
                  <Chip 
                    label={`${post.likes} ${post.likes === 1 ? "like" : "likes"}`} 
                    variant={liked ? "filled" : "outlined"}
                    sx={{ mr: 1 }}
                  />
                </Box>
              </CardContent>
            </Box>
          </Card>
        )}

        <Typography variant="h5" sx={{ mb: 2 }}>Comments</Typography>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Add a comment"
            variant="outlined"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button 
            variant="contained" 
            onClick={handleCommentSubmit} 
            sx={{ mt: 1 }}
          >
            Submit
          </Button>
        </Box>
        
        <List>
          {comments.map(comment => (
            <ListItem key={comment._id} sx={{ borderBottom: "1px solid #ccc", py: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1">
                  <strong>{getDisplayName(comment.owner)}</strong> {comment.comment}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(comment.createdAt)}
                </Typography>
              </Box>
              {currentUser === comment.owner && (
                <Box>
                  <IconButton onClick={() => handleEditComment(comment._id, comment.comment)}>
                    <Typography></Typography>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => confirmDeleteComment(comment._id)}>
                    <Delete />
                  </IconButton>
                </Box>
              )}
            </ListItem>
          ))}
        </List>

        {/* Edit Comment Dialog */}
        <Dialog open={editCommentId !== null} onClose={() => setEditCommentId(null)}>
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogContent>
            <TextField 
              fullWidth 
              variant="outlined" 
              value={editedComment} 
              onChange={(e) => setEditedComment(e.target.value)} 
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditCommentId(null)}>Cancel</Button>
            <Button onClick={handleUpdateComment}>Update</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Comment Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          c
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this comment?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteComment} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  };

  export default SinglePostPage;
