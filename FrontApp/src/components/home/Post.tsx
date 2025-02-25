import React, { useState } from "react";
import { Card, CardContent, Typography, ButtonBase, IconButton } from "@mui/material";
import { ThumbUp, ThumbUpOffAlt } from "@mui/icons-material"; // Icons for like

// פונקציה שמבצעת קריאה לפונקציות ה-API (הנחה שיש לך את ה-post_api עם addLike ו-unlike)
import { addLike, unlike } from "../../services/post_api"; 

interface PostProps {
  _id: string;
  title: string;
  content: string;
  owner: string;  
  createdAt: string;
  imgUrl: string; 
  likes: number;
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
  onClick,
}) => {
  const [liked, setLiked] = useState(false); // אם הפוסט כבר נמצא בלייק

  // פונקציה שנקראת כשנלחץ על הלייק
  const handleLikeClick = async () => {
    if (liked) {
   
      await unlike(_id);
    } else {
      await addLike(_id); 
    }
    setLiked(!liked); // משנה את מצב הלייק
  };

  return (
    <Card
      sx={{
        margin: "3.5px 0", 
        boxShadow: 3, 
        "&:hover": { boxShadow: 6 },
      }}
    >
      <ButtonBase
        onClick={onClick}
        sx={{
          display: "block",
          textAlign: "inherit",
          width: "100%",
        }}
      >
        {/* Movie Image */}
        <img
          src={imgUrl}
          alt={title}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
          }}
        />

        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {title}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary">
            By {owner}
          </Typography>

          <Typography variant="body1" sx={{ marginTop: 1 }}>
            {content}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
            {new Date(createdAt).toLocaleDateString()}
          </Typography>

          {/* Like Button */}
          <div style={{ marginTop: 10, display: "flex", alignItems: "center" }}>
            <IconButton onClick={handleLikeClick} sx={{ padding: 0 }}>
              {liked ? <ThumbUp /> : <ThumbUpOffAlt />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {likes} Likes
            </Typography>
          </div>
        </CardContent>
      </ButtonBase>
    </Card>
  );
};

export default Post;
