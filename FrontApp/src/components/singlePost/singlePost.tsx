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
import { 
  singlePost, getComments, addLike, unlike, addComment, 
  deleteComment, updateComment, updatePost, deletePost 
} from "../../services/post_api";

// Types
type PostType = {
  _id: string;
  id?: string;
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
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
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
    }
  }, [id]);

  // Fetch the post data and prepopulate edit fields.
  const fetchPost = async (postId: string) => {
    try {
      const data = await singlePost(postId);
      setPost(data);
      setEditedTitle(data.title);
      setEditedContent(data.content);
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  // Fetch comments.
  const fetchComments = async (postId: string) => {
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
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
      setComments((prev) => [
        ...prev,
        {
          _id: addedComment.id || addedComment._id,
          comment: addedComment.comment,
          owner: currentUser,
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
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

  const handleEditComment = (commentId: string, commentText: string) => {
    setEditCommentId(commentId);
    setEditedComment(commentText);
  };

  const handleUpdateComment = async () => {
    if (!editCommentId || !editedComment.trim()) return;
    try {
      await updateComment(editCommentId, {
        comment: editedComment,
        owner: currentUser,
      });
      setComments((prev) =>
        prev.map((comment) =>
          (comment._id === editCommentId || comment.id === editCommentId)
            ? { ...comment, comment: editedComment }
            : comment
        )
      );
      setEditCommentId(null);
      setEditedComment("");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const confirmDeleteComment = (commentId: string) => {
    console.log("Comment ID to delete:", commentId);
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      console.log("Deleting comment with ID:", commentToDelete);
      await deleteComment(commentToDelete);
      setComments(prev => prev.filter(comment => 
        comment._id !== commentToDelete && comment.id !== commentToDelete
      ));
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
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
        <>
          <Card sx={{ mb: 4, overflow: "hidden", borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>
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
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 2,
                    borderLeft: "4px solid #3f51b5",
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {post.content}
                  </Typography>
                </Paper>

                <Box
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="center"
                  sx={{ mt: 2 }}
                >
                  <IconButton
                    onClick={handleLike}
                    sx={{
                      mr: 1,
                      color: liked ? "primary.main" : "text.secondary",
                    }}
                  >
                    {liked ? <ThumbUp /> : <ThumbUpOffAlt />}
                  </IconButton>
                  <Chip
                    label={`${post.likes} ${post.likes === 1 ? "like" : "likes"}`}
                    variant={liked ? "filled" : "outlined"}
                    color={liked ? "primary" : "default"}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Box>

                {/* Edit and Delete buttons (only for post owner) */}
                {currentUser === getDisplayName(post.owner) && (
                  <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                    <Button variant="outlined" onClick={() => setEditPostOpen(true)}>
                      Edit Post
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleDeletePost}>
                      Delete Post
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Box>
          </Card>

          {/* Comments Section */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2, backgroundColor: "white" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <CommentIcon sx={{ mr: 1.5, color: "primary.main" }} />
              <Typography variant="h5" fontWeight="medium">
                Comments
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* Add comment section */}
            <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Add a comment"
                variant="outlined"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                multiline
                rows={2}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  sx={{ borderRadius: 6, px: 3 }}
                >
                  Submit
                </Button>
              </Box>
            </Box>

            {/* Comments list */}
            {comments.length === 0 ? (
              <Box
                sx={{
                  py: 5,
                  textAlign: "center",
                  backgroundColor: "#f9f9f9",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No comments yet. Be the first to comment!
                </Typography>
              </Box>
            ) : (
              <List sx={{ mt: 2 }}>
                {comments.map((comment) => (
                  <ListItem
                    key={comment._id || comment.id}
                    sx={{
                      px: 0,
                      py: 2,
                      display: "block",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Box sx={{ display: "flex", width: "100%" }}>
                      <Avatar
                        sx={{
                          mr: 2,
                          bgcolor:
                            comment.owner === currentUser ? "#3f51b5" : "#9e9e9e",
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getDisplayName(comment.owner).charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{ display: "flex", justifyContent: "space-between" }}
                        >
                          <Typography variant="subtitle2" fontWeight="bold">
                            {getDisplayName(comment.owner)}
                            {comment.owner === currentUser && (
                              <Chip
                                label="You"
                                size="small"
                                sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                                color="primary"
                              />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </Box>

                        {editCommentId === (comment._id || comment.id) ? (
                          <Box sx={{ mt: 1, mb: 1 }}>
                            <TextField
                              fullWidth
                              value={editedComment}
                              onChange={(e) => setEditedComment(e.target.value)}
                              variant="outlined"
                              size="small"
                              multiline
                              rows={2}
                              sx={{ mb: 1 }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setEditCommentId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                disableElevation
                                onClick={handleUpdateComment}
                                disabled={!editedComment.trim()}
                              >
                                Save
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, lineHeight: 1.6 }}
                          >
                            {comment.comment}
                          </Typography>
                        )}
                      </Box>

                      {comment.owner === currentUser &&
                        editCommentId !== (comment._id || comment.id) && (
                          <Box sx={{ display: "flex", ml: 1 }}>
                            <IconButton
                              onClick={() =>
                                handleEditComment(comment._id || comment.id || "", comment.comment)
                              }
                              size="small"
                              sx={{ color: "#616161" }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => confirmDeleteComment(comment._id || comment.id || "")}
                              size="small"
                              sx={{ color: "#f44336" }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </>
      )}

      {/* Delete Comment Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteComment} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={editPostOpen} onClose={() => setEditPostOpen(false)}>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPostOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdatePost} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SinglePostPage;