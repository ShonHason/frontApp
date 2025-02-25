import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider,
  List,
  ListItem,
  TextField,
  Button,
} from "@mui/material";
import { ThumbUp } from "@mui/icons-material";
import { singlePost, getComments, addLike, unlike, addComment } from "../../services/post_api";

// Post type
type PostType = {
  id: string;
  title: string;
  content: string;
  owner: string;
  likes: number;
  imgUrl: string;
  createdAt: string;
};

// Comment type
type CommentType = {
  id: string;
  content: string;
  owner: string;
  createdAt: string;
};

const SinglePostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get post ID from URL
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState("");

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
    if (!newComment.trim() || !post) return;
    try {
      const addedComment = await addComment(post.id, newComment);
      setComments([...comments, addedComment]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      {post && (
        <Card sx={{ width: 600, mb: 4 }}>
          <CardContent>
            <Typography variant="h5">{post.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {post.content}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Typography variant="caption" color="text.secondary">
                By {post.owner} on {new Date(post.createdAt).toLocaleDateString()}
              </Typography>
              <Box display="flex" alignItems="center">
                <IconButton onClick={handleLike} color={liked ? "primary" : "default"}>
                  <ThumbUp />
                </IconButton>
                <Typography variant="body2">{post.likes}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box width={600}>
        <Typography variant="h6">Comments</Typography>
        <Divider sx={{ my: 2 }} />
        <List>
          {comments.map((comment) => (
            <ListItem key={comment.id} alignItems="flex-start">
              <Box>
                <Typography variant="subtitle2">{comment.owner}</Typography>
                <Typography variant="body2">{comment.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            label="Add a comment"
            variant="outlined"
            fullWidth
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleCommentSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SinglePostPage;
