import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  Rating,
  useTheme
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MovieIcon from '@mui/icons-material/Movie';
import { formatDistanceToNow } from 'date-fns';
import { getImg } from '../services/file_api'; // Update this path to match your project structure

interface PostProps {
  _id: string;
  title: string;
  content: string;
  owner: string;
  createdAt: string;
  rank: number;
  likes: number;
  imageUrl: string;
  numOfComments: number;
  hasLiked: boolean;
  onClick: () => void;
}

const Post: React.FC<PostProps> = (props) => {
  const theme = useTheme();
  const {
    title,
    content,
    owner,
    createdAt,
    rank,
    likes,
    imageUrl,
    numOfComments,
    hasLiked,
    onClick
  } = props;

  // State for storing the avatar URL
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarLoading, setAvatarLoading] = useState<boolean>(true);
  const [avatarError, setAvatarError] = useState<boolean>(false);

  // Fetch user avatar when component mounts or owner changes
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!owner) return;
      
      setAvatarLoading(true);
      setAvatarError(false);
      
      try {
        const response = await getImg(owner);
        console.log(response);
        if (response) {

          setAvatarUrl(response);
        } else {
          setAvatarError(true);
        }
      } catch (error) {
        console.error('Error fetching user avatar:', error);
        setAvatarError(true);
      } finally {
        setAvatarLoading(false);
      }
    };

    fetchAvatar();
  }, [owner]);

  // Format the date
  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  // Get owner initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Check if post has image
  const hasImage = imageUrl && imageUrl.trim() !== '';

  return (
    <Paper
      elevation={2}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        height: '100%', // Take full height of parent container
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* Image section - on left side */}
      {hasImage ? (
        <Box 
          sx={{
            width: '30%',
            minWidth: '120px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'rgba(0,0,0,0.03)'
          }}
        >
          <img 
            src={imageUrl} 
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            loading="lazy"
          />
        </Box>
      ) : (
        <Box 
          sx={{
            width: '30%',
            minWidth: '120px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
            opacity: 0.8
          }}
        >
          <MovieIcon sx={{ fontSize: 50, opacity: 0.8 }} />
        </Box>
      )}

      {/* Content container */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        p: 2.5,
        width: '70%'
      }}>
        {/* Header section with avatar, username and rating */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Use the fetched avatar or fall back to initials */}
            <Avatar 
              src={!avatarLoading && !avatarError ? avatarUrl : undefined}
              alt={owner}
              sx={{ 
                bgcolor: theme.palette.primary.main,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
              }}
            >
              {getInitials(owner)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                {owner}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {formattedDate}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Rating value={rank} readOnly precision={0.5} size="small" />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {rank.toFixed(1)}/5
            </Typography>
          </Box>
        </Box>

        {/* Title section */}
        <Typography 
          variant="h6" 
          sx={{
            fontWeight: 700,
            mb: 1,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            color: theme.palette.text.primary
          }}
        >
          {title}
        </Typography>

        {/* Content section */}
        <Typography 
          variant="body2" 
          sx={{
            mb: 1.5,
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: theme.palette.text.secondary,
            lineHeight: 1.6
          }}
        >
          {content}
        </Typography>

        {/* Footer section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mt: 'auto',
          pt: 1.5,
          borderTop: '1px solid rgba(0,0,0,0.06)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {hasLiked ? 
                <FavoriteIcon color="error" fontSize="small" sx={{ mr: 0.5 }} /> : 
                <FavoriteBorderIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              }
              <Typography variant="body2" color="text.secondary">
                {likes}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ChatBubbleOutlineIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {numOfComments}
              </Typography>
            </Box>
          </Box>
          
          <Chip 
            label="Read more" 
            size="small" 
            color="primary" 
            sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
              px: 0.5,
              '& .MuiChip-label': {
                px: 1,
              },
              borderRadius: '12px',
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.dark
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default Post;