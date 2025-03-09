import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface SpinnerProps {
  messages?: string[];
  interval?: number;
  size?: number;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit";
  overlay?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  messages = ["Loading..."],
  interval = 2000,
  size = 40, 
  color = "primary",
  overlay = false 
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Only set up the interval if there are multiple messages
    if (messages.length <= 1) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, interval);

    return () => clearInterval(messageInterval);
  }, [messages, interval]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...(overlay ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          zIndex: 9999,
        } : {
          marginY: 3,
        }),
      }}
    >
      <CircularProgress size={size} color={color} />
      {messages.length > 0 && (
        <Typography variant="body1" sx={{ marginTop: 1, fontWeight: "medium" }}>
          {messages[currentMessageIndex]}
        </Typography>
      )}
    </Box>
  );
};

export default Spinner; 