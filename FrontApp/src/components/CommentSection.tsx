import React, { useState } from "react";
import { 
  Box, Typography, Divider, TextField, Button, List, Paper,
  ListItem, Avatar, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions
} from "@mui/material";
import { Comment as CommentIcon, Edit, Delete } from "@mui/icons-material";
import { addComment, updateComment, deleteComment } from "../services/post_api";

type CommentType = {
  _id: string;
  id?: string;
  comment: string;
  owner: string;
  createdAt: string;
};

type CommentSectionProps = {
  comments: CommentType[];
  postId: string;
  currentUser: string;
  userAvatars: {[key: string]: string};
  onCommentsUpdate: (comments: CommentType[]) => void;
};

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  postId,
  currentUser,
  userAvatars,
  onCommentsUpdate
}) => {
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const getDisplayName = (email: string) => email ? email.split("@")[0] : "Anonymous";
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };
  
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !postId) return;
    try {
      const addedComment = await addComment({
        comment: newComment,
        owner: currentUser,
        postId: postId,
      });
      
      const newCommentObj = {
        _id: addedComment.id || addedComment._id,
        comment: addedComment.comment,
        owner: currentUser,
        createdAt: new Date().toISOString(),
      };
      
      onCommentsUpdate([...comments, newCommentObj]);
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
        owner: currentUser,
      });
      
      const updatedComments = comments.map((comment) =>
        (comment._id === editCommentId || comment.id === editCommentId)
          ? { ...comment, comment: editedComment }
          : comment
      );
      
      onCommentsUpdate(updatedComments);
      setEditCommentId(null);
      setEditedComment("");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const confirmDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await deleteComment(commentToDelete);
      
      const filteredComments = comments.filter(comment => 
        comment._id !== commentToDelete && comment.id !== commentToDelete
      );
      
      onCommentsUpdate(filteredComments);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          borderRadius: "16px", 
          backgroundColor: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <CommentIcon sx={{ mr: 1.5, color: "primary.main" }} />
          <Typography 
            variant="h5" 
            fontWeight="medium"
            sx={{
              background: "linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.light"
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  borderWidth: "2px"
                }
              }
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              disableElevation
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()}
              sx={{ 
                borderRadius: "8px", 
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: "bold",
                background: "linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)"
                },
                "&:disabled": {
                  background: "#e0e0e0"
                }
              }}
            >
              Submit Comment
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
              borderRadius: "12px",
              border: "1px dashed #e0e0e0"
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        ) : (
          <List sx={{ mt: 2 }}>
            {comments.map((comment) => {
              const commentId = comment._id || comment.id || "";
              const isEditing = editCommentId === commentId;
              const isCommentOwner = comment.owner === currentUser;
              
              return (
                <ListItem
                  key={commentId}
                  sx={{
                    px: 2,
                    py: 2,
                    display: "block",
                    borderBottom: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    mb: 2,
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.01)"
                    },
                    transition: "background-color 0.2s ease"
                  }}
                >
                  <Box sx={{ display: "flex", width: "100%" }}>
                    <Avatar
                      sx={{
                        mr: 2,
                        bgcolor: isCommentOwner ? "primary.main" : "#9e9e9e",
                        width: 40,
                        height: 40,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                      }}
                      src={userAvatars[comment.owner] || ''}
                    >
                      {getDisplayName(comment.owner).charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {getDisplayName(comment.owner)}
                          {isCommentOwner && (
                            <Chip
                              label="You"
                              size="small"
                              sx={{ 
                                ml: 1, 
                                height: 20, 
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                backgroundColor: "primary.light",
                                color: "white"
                              }}
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(comment.createdAt)}
                        </Typography>
                      </Box>

                      {isEditing ? (
                        <Box sx={{ mt: 1, mb: 1 }}>
                          <TextField
                            fullWidth
                            value={editedComment}
                            onChange={(e) => setEditedComment(e.target.value)}
                            variant="outlined"
                            size="small"
                            multiline
                            rows={2}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "8px"
                              }
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "flex-end",
                              mt: 1
                            }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setEditCommentId(null)}
                              sx={{
                                borderRadius: "6px",
                                textTransform: "none"
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              disableElevation
                              onClick={handleUpdateComment}
                              disabled={!editedComment.trim()}
                              sx={{
                                borderRadius: "6px",
                                textTransform: "none",
                                background: "linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)"
                              }}
                            >
                              Save
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ 
                            mt: 1, 
                            lineHeight: 1.6,
                            color: "text.primary" 
                          }}
                        >
                          {comment.comment}
                        </Typography>
                      )}
                    </Box>

                    {isCommentOwner && !isEditing && (
                      <Box sx={{ display: "flex", ml: 1 }}>
                        <IconButton
                          onClick={() => handleEditComment(commentId, comment.comment)}
                          size="small"
                          sx={{ 
                            color: "#616161", 
                            "&:hover": { color: "primary.main" }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => confirmDeleteComment(commentId)}
                          size="small"
                          sx={{ 
                            color: "#f44336",
                            "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Delete Comment Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "8px"
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ textTransform: "none", borderRadius: "6px" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteComment} 
            color="error"
            variant="contained"
            sx={{ 
              textTransform: "none", 
              borderRadius: "6px",
              fontWeight: "bold"
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommentSection;