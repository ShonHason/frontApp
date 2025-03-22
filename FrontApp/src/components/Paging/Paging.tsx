import React, { useContext, createContext, useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  styled, 
  useTheme, 
  alpha,
  Fade,
  Chip
} from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

// Create context to store pagination state across renders
interface PaginationContextType {
  cachedPages: Record<number, any[]>; // Store data for each page
  setCachedPage: (page: number, data: any[]) => void;
  viewHistory: number[]; // Tracks visited pages
  addToHistory: (page: number) => void;
}

const PaginationContext = createContext<PaginationContextType>({
  cachedPages: {},
  setCachedPage: () => {},
  viewHistory: [],
  addToHistory: () => {}
});

// Provider component to wrap your app with
export const PaginationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cachedPages, setCachedPages] = useState<Record<number, any[]>>({});
  const [viewHistory, setViewHistory] = useState<number[]>([]);

  const setCachedPage = (page: number, data: any[]) => {
    setCachedPages(prev => ({
      ...prev,
      [page]: data
    }));
  };

  const addToHistory = (page: number) => {
    setViewHistory(prev => {
      if (prev[prev.length - 1] === page) return prev;
      return [...prev, page];
    });
  };

  return (
    <PaginationContext.Provider value={{
      cachedPages,
      setCachedPage,
      viewHistory,
      addToHistory
    }}>
      {children}
    </PaginationContext.Provider>
  );
};

// Hook to use the pagination context
export const usePagination = () => useContext(PaginationContext);

interface PagingProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

// Styled components with enhanced visuals
const PagingButton = styled(Button)(({ theme }) => ({
  fontWeight: 'bold',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.7s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.12)',
    '&::before': {
      left: '100%',
    }
  },
  '&.MuiButton-containedPrimary': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    },
  },
  '&.Mui-disabled': {
    background: theme.palette.mode === 'dark' ? '#444' : '#e0e0e0',
    color: theme.palette.mode === 'dark' ? '#777' : '#a0a0a0',
    boxShadow: 'none'
  }
}));

const NavButton = styled(PagingButton)(({ }) => ({
  padding: '8px 16px',
  borderRadius: '12px',
  textTransform: 'none',
  letterSpacing: '0.5px',
  fontSize: '0.875rem',
  fontWeight: 600
}));

const PageButton = styled(PagingButton)(({ theme }) => ({
  minWidth: '40px',
  height: '40px',
  borderRadius: '50%',
  padding: '0px',
  fontSize: '0.875rem',
  '&.Mui-selected': {
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
  }
}));

const PageInfo = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  padding: '0 5px',
  borderRadius: '16px',
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.primary.main, 0.15) 
    : alpha(theme.palette.primary.light, 0.2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
  boxShadow: `0 2px 5px ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.primary.main, 0.25) 
      : alpha(theme.palette.primary.light, 0.3),
  }
}));

// Ellipsis component for pagination
const Ellipsis = styled(Typography)(({ theme }) => ({
  margin: '0 4px',
  color: theme.palette.text.secondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24
}));

const Paging: React.FC<PagingProps> = ({ currentPage, totalPages, onPageChange }) => {
  const theme = useTheme();
  // Get pagination context for caching
  const { viewHistory, addToHistory } = usePagination();
  
  // Add to history when page changes
  useEffect(() => {
    addToHistory(currentPage);
  }, [currentPage, addToHistory]);

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  // Go to specific page
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  // First page
  const goToFirstPage = () => {
    onPageChange(1);
  };

  // Last page
  const goToLastPage = () => {
    onPageChange(totalPages);
  };

  // Create array of page numbers to display with improved logic
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // If fewer pages than max visible, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page
      pageNumbers.push(1);
      
      // Middle pages with ellipsis handling
      if (currentPage <= 3) {
        // Near start
        for (let i = 2; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pageNumbers.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages - 1; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Middle
        pageNumbers.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  // Check if a page has been visited
  const hasVisited = (page: number) => viewHistory.includes(page);

  return (
    <Fade in={true} timeout={300}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: { xs: 1, sm: 2 },
        padding: 2,
        flexWrap: 'wrap',
        '& > *': {
          marginBottom: { xs: 1, sm: 0 }
        }
      }}>
        {/* First page button (on larger screens) */}
        <NavButton 
          variant="outlined"
          onClick={goToFirstPage} 
          disabled={currentPage === 1}
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          <KeyboardDoubleArrowLeftIcon fontSize="small" />
        </NavButton>
        
        {/* Previous button */}
        <NavButton 
          variant="contained"
          onClick={prevPage} 
          disabled={currentPage === 1}
          startIcon={<NavigateBeforeIcon />}
          color="primary"
        >
          Previous
        </NavButton>
        
        {/* Page numbers */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          mx: { xs: 0, sm: 2 },
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {pageNumbers.map((pageNum, index) => 
            pageNum === 'ellipsis' ? (
              <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>
            ) : (
              <PageButton
                key={pageNum}
                onClick={() => goToPage(pageNum as number)}
                variant={currentPage === pageNum ? "contained" : "outlined"}
                color="primary"
                // Show visual indicator for pages already visited
                sx={{
                  position: 'relative',
                  '&::after': hasVisited(pageNum as number) && currentPage !== pageNum ? {
                    content: '""',
                    position: 'absolute',
                    bottom: '4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    opacity: 0.6
                  } : {}
                }}
              >
                {pageNum}
              </PageButton>
            )
          )}
        </Box>
        
        {/* Next button */}
        <NavButton 
          variant="contained"
          onClick={nextPage} 
          disabled={currentPage === totalPages}
          endIcon={<NavigateNextIcon />}
          color="primary"
        >
          Next
        </NavButton>
        
        {/* Last page button (on larger screens) */}
        <NavButton 
          variant="outlined"
          onClick={goToLastPage} 
          disabled={currentPage === totalPages}
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          <KeyboardDoubleArrowRightIcon fontSize="small" />
        </NavButton>
        
        {/* Page info */}
        <PageInfo 
          label={`Page ${currentPage} of ${totalPages}`}
          variant="filled"
        />
      </Box>
    </Fade>
  );
};

// Export both the component and the provider
export default Paging;