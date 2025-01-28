import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./Post";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";

const Home = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

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
  };

  return (
    <Box
      sx={{
        width: "100%",
        position: "absolute", // Ensure the container is right under the header
        top: "64px", // Adjust based on your header height
        left: 0,
        right: 0,
        padding: "20px", // Spacing inside the container
        boxSizing: "border-box", // Prevent content overflow
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          textAlign: "center",
          marginBottom: 3,
        }}
      >
        All Movie Reviews
      </Typography>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginY: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2, // Spacing between posts
        }}
      >
        {posts.map((post) => (
          <Post
            key={post._id}
            title={post.title}
            content={post.content}
            owner={post.owner}
            createdAt={post.createdAt}
            onClick={() => handlePostClick(post._id)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Home;
