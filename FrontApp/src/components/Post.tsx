import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  Rating,
  useTheme,
  Skeleton,
  alpha
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TheatersIcon from '@mui/icons-material/Theaters';
import { formatDistanceToNow } from 'date-fns';
import { getImg } from '../services/file_api';

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
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Fetch user avatar when component mounts or owner changes
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!owner) return;
      
      setAvatarLoading(true);
      setAvatarError(false);
      
      try {
        const response = await getImg(owner);
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

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <Paper
      elevation={2}
      onClick={onClick}
      sx={{
        borderRadius: { xs: 3, md: 4 },
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        overflow: 'hidden',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.08)' 
          : 'rgba(0,0,0,0.05)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 32px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)',
        }
      }}
    >
      {/* Premium ribbon for high-rated posts */}
      {rank >= 4.5 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #FFD700, #FFA500)',
            zIndex: 2
          }}
        />
      )}
      
      {/* Image section */}
      <Box 
        sx={{
          width: { xs: '100%', sm: '35%' },
          height: { xs: '200px', sm: 'auto' },
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          '&::after': hasImage ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%)',
            zIndex: 1
          } : {}
        }}
      >
        {hasImage ? (
          <>
            <img 
              src={imageUrl} 
              alt={title}
              onLoad={handleImageLoad}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
                transform: imageLoaded ? 'scale(1.01)' : 'scale(1.15)',
                opacity: imageLoaded ? 1 : 0
              }}
              loading="lazy"
            />
            {!imageLoaded && (
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height="100%" 
                animation="wave" 
                sx={{ position: 'absolute', top: 0, left: 0 }}
              />
            )}
          </>
        ) : (
          <Box 
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              color: theme.palette.primary.contrastText,
            }}
          >
            <TheatersIcon sx={{ fontSize: 64, opacity: 0.9 }} />
          </Box>
        )}
      </Box>

      {/* Content container */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        p: { xs: 2.5, md: 3 },
        width: { xs: '100%', sm: '65%' }
      }}>
        {/* Header section with avatar, username and rating */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Avatar with loading state */}
            {avatarLoading ? (
              <Skeleton variant="circular" width={44} height={44} />
            ) : (
              <Avatar 
                src={!avatarError ? avatarUrl : undefined}
                alt={owner}
                sx={{ 
                  width: 44,
                  height: 44,
                  bgcolor: theme.palette.primary.main,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  border: '2px solid',
                  borderColor: theme.palette.background.paper
                }}
              >
                {getInitials(owner)}
              </Avatar>
            )}
            <Box>
              {avatarLoading ? (
                <>
                  <Skeleton width={100} height={24} />
                  <Skeleton width={80} height={16} />
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                    {owner}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {formattedDate}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Rating 
              value={rank} 
              readOnly 
              precision={0.5} 
              size="small"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: theme.palette.mode === 'dark' ? '#FFD700' : '#FF8C00',
                }
              }}
            />
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mt: 0.5 }}
            >
              {rank.toFixed(1)}/5
            </Typography>
          </Box>
        </Box>

        {/* Title section */}
        <Typography 
          variant="h6" 
          sx={{
            fontWeight: 700,
            mb: 1.5,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: theme.palette.text.primary,
            letterSpacing: '-0.01em'
          }}
        >
          {title}
        </Typography>

        {/* Content section */}
        <Typography 
          variant="body2" 
          sx={{
            mb: 2,
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            color: alpha(theme.palette.text.primary, 0.8),
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
          borderTop: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {hasLiked ? 
                <FavoriteIcon color="error" fontSize="small" sx={{ mr: 0.5 }} /> : 
                <FavoriteBorderIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              }
              <Typography variant="body2" color={hasLiked ? 'error' : 'text.secondary'} fontWeight={hasLiked ? 600 : 400}>
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
            label="Read Review" 
            size="small" 
            color="primary" 
            sx={{ 
              fontSize: '0.75rem',
              fontWeight: 600,
              px: 0.5,
              '& .MuiChip-label': {
                px: 1.2,
              },
              borderRadius: '14px',
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: '#fff',
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.6)}`
              }
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default Post;