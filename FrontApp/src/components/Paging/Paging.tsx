import React from 'react';
import { Box, Button, Typography, styled } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

interface PagingProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

// Styled components for better visuals
const PagingButton = styled(Button)(() => ({
  fontWeight: 'bold',
  boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
  '&.MuiButton-containedPrimary': {
    background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
    '&:hover': {
      background: 'linear-gradient(45deg, #2196f3, #3f51b5)',
    },
  },
  '&.Mui-disabled': {
    background: '#e0e0e0',
    color: '#a0a0a0',
  }
}));

const NavButton = styled(PagingButton)(() => ({
  padding: '8px 16px',
  borderRadius: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const PageButton = styled(PagingButton)(() => ({
  minWidth: '40px',
  height: '40px',
  borderRadius: '50%',
  padding: '0px',
}));

const PageInfo = styled(Typography)(() => ({
  fontWeight: 'bold',
  padding: '6px 12px',
  borderRadius: '20px',
  backgroundColor: '#f0f7ff',
  border: '1px solid #d0e7ff',
  color: '#333',
  marginLeft: '16px',
}));

const Paging: React.FC<PagingProps> = ({ currentPage, totalPages, onPageChange }) => {
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

  // Create array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // If fewer pages than max visible, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Otherwise show a subset with ellipsis
      if (currentPage <= 3) {
        // If near start
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // If near end
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // If in middle
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      gap: 2,
      padding: 2,
      flexWrap: 'wrap'
    }}>
      <NavButton 
        variant="contained"
        onClick={prevPage} 
        disabled={currentPage === 1}
        startIcon={<NavigateBeforeIcon />}
        color="primary"
      >
        Previous
      </NavButton>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        {pageNumbers.map((pageNum) => (
          <PageButton
            key={pageNum}
            onClick={() => goToPage(pageNum)}
            variant={currentPage === pageNum ? "contained" : "outlined"}
            color="primary"
          >
            {pageNum}
          </PageButton>
        ))}
      </Box>
      
      <NavButton 
        variant="contained"
        onClick={nextPage} 
        disabled={currentPage === totalPages}
        endIcon={<NavigateNextIcon />}
        color="primary"
      >
        Next
      </NavButton>
      
      <PageInfo variant="body2">
        Page {currentPage} of {totalPages}
      </PageInfo>
    </Box>
  );
};

export default Paging;