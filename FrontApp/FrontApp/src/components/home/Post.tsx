import React from "react";
import { Card, CardContent, Typography, ButtonBase } from "@mui/material";

interface PostProps {
  title: string;
  content: string;
  owner: string; // Changed to match your input field naming
  createdAt: string;
  onClick: () => void;
}

const Post: React.FC<PostProps> = ({
  title,
  content,
  owner,
  createdAt,
  onClick,
}) => {
  return (
    <Card
      sx={{
        margin: "20px 0", // Add vertical spacing between posts
        boxShadow: 3, // Default shadow
        "&:hover": {
          boxShadow: 6, // Hover shadow effect
        },
      }}
    >
      <ButtonBase
        onClick={onClick}
        sx={{
          display: "block",
          textAlign: "inherit",
          width: "100%", // Button spans the entire card width
        }}
      >
        <CardContent>
          {/* Title */}
          <Typography variant="h5" component="div" gutterBottom>
            {title}
          </Typography>

          {/* Owner */}
          <Typography variant="subtitle2" color="text.secondary">
            By {owner}
          </Typography>

          {/* Content */}
          <Typography variant="body1" sx={{ marginTop: 1 }}>
            {content}
          </Typography>

          {/* Date */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ marginTop: 2 }}
          >
            {new Date(createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </ButtonBase>
    </Card>
  );
};

export default Post;
