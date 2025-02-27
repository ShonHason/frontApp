import React, { useState } from "react";
import { 
  Card, 
  Typography, 
  Box, 
  IconButton, 
  Rating,
  Chip
} from "@mui/material";
import { ThumbUp, ThumbUpOffAlt } from "@mui/icons-material";
import { addLike, unlike } from "../../services/post_api";

interface PostProps {
  _id: string;
  title: string;
  content: string;
  owner: string;
  createdAt: string;
  imgUrl: string;
  likes: number;
  hasLiked: boolean; // New prop to indicate if the post has been liked
  rank: number; // Ensure this is required for rating
  onClick: () => void;
}

const Post: React.FC<PostProps> = ({
  _id,
  title,
  content,
  owner,
  createdAt,
  imgUrl,
  likes,
  hasLiked,
  rank,
  onClick,
}) => {
  const [liked, setLiked] = useState(hasLiked);
  const [likeCount, setLikeCount] = useState(likes);

  // Extract username from email (without @ and domain)
  const displayName = owner ? owner.split('@')[0] : "Anonymous";
  
  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString();
  
  // Truncate content if too long
  const truncatedContent = content.length > 120 
    ? content.substring(0, 120) + "..." 
    : content;

  // Handle like click without propagating to post click
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    if (liked) return; // Do nothing if already liked

    try {
      await addLike(_id);
      setLikeCount(prev => prev + 1);
      setLiked(true);
    } catch (error) {
      console.error("Error adding like:", error);
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        margin: "10px 0",
        height: "auto", // Adjust height for content
        boxShadow: 3,
        overflow: "hidden",
        "&:hover": { 
          boxShadow: 6,
          transform: "translateY(-3px)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out"
        },
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {/* Left side - Image */}
      <Box
        sx={{
          width: "30%",
          maxWidth: "180px",
          position: "relative",
        }}
      >
        <Box 
          component="img"
          src={imgUrl || "https://via.placeholder.com/180x180"}
          alt={title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      {/* Right side - Content */}
      <Box sx={{ display: "flex", flexDirection: "column", width: "70%", padding: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Title */}
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontWeight: "bold",
              lineHeight: 1.2, 
              mb: 0.5,
              width: "70%" // Prevent overlap with rating 
            }}
          >
            {title}
          </Typography>
          
          {/* Rating */}
          <Rating 
            value={rank} 
            readOnly 
            precision={0.5}
            size="small"
            sx={{ marginTop: 1 }} // Adjust position of rating
          />
        </Box>
        
        {/* Author + Date */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
          <Chip 
            label={displayName} 
            size="small" 
            sx={{ 
              mr: 1,
              height: "22px",
              fontSize: "0.7rem",
              bgcolor: "#f0f0f0"
            }} 
          />
          <Typography variant="caption" color="text.secondary" sx={{ marginLeft: 0.5 }}>
            {formattedDate}
          </Typography>
        </Box>
        
        {/* Content Preview */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {truncatedContent}
        </Typography>
        
        {/* Like Button */}
        <Box 
          sx={{ 
            mt: "auto", 
            display: "flex", 
            alignItems: "center" 
          }}
        >
          <IconButton 
            onClick={handleLikeClick} 
            size="small"
            sx={{ p: 0.5, mr: 0.5 }}
          >
            {liked ? <ThumbUp color="primary" /> : <ThumbUpOffAlt />}
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {likeCount} Likes
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default Post;
