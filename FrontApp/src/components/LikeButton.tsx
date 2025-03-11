import React, { useState } from "react";
import { IconButton, Typography } from "@mui/material";
import { ThumbUp, ThumbUpOffAlt } from "@mui/icons-material";
import { addLike, unlike } from "../services/post_api";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, initialLiked, initialLikeCount }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  // Handle like click
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click
  
    if (liked) {
      try {
        await unlike(postId); // Remove like
        setLikeCount((prev) => prev - 1);
        setLiked(false);
      } catch (error) {
        console.error("Error removing like:", error);
      }
    } else {
      try {
        await addLike(postId); // Add like
        setLikeCount((prev) => prev + 1);
        setLiked(true);
      } catch (error) {
        console.error("Error adding like:", error);
      }
    }
  };

  return (
    <div>
      <IconButton onClick={handleLikeClick} size="small" sx={{ p: 0.5 }}>
        {liked ? <ThumbUp color="primary" /> : <ThumbUpOffAlt />}
      </IconButton>
      <Typography variant="body2" color="text.secondary">
        {likeCount} Likes
      </Typography>
    </div>
  );
};

export default LikeButton;
