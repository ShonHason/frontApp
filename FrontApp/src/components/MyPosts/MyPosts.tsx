// src/components/myPosts/MyPosts.tsx (example path)

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Post from "../home/Post.tsx"; // Adjust path to your Post component

interface PostType {
  _id: string;
  title: string;
  content: string;
  owner: string; // This will store the username
  likes: number;
  imageUrl?: string;
  createdAt: string;
  rank: number;
}

const MyPosts: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Get the username from local storage
  const username: string = localStorage.getItem("username") || "";

  useEffect(() => {
    const fetchMyPosts = async () => {
      setLoading(true);
      try {
        // Filter by the username stored in localStorage
        // GET /Posts?owner=<username>
        const url = `http://localhost:4000/Posts?owner=${username}`;
        const response = await axios.get<PostType[]>(url);
        setPosts(response.data);
      } catch (err) {
        setError("You dont have any posts yet");
      }
      setLoading(false);
    };

    // Only call if username is set
    if (username) {
      fetchMyPosts();
    } else {
      setError("No username found in localStorage");
      setLoading(false);
    }
  }, [username]);

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
        My Posts
      </Typography>

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
            imageUrl={post.imageUrl}
            onClick={() => navigate(`/post/${post._id}`)} hasLiked={false}          />
        ))}
      </Box>
    </Box>
  );
};

export default MyPosts;
