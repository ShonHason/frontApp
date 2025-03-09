import React from 'react';
import { Box, Button, Typography } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

interface PagingProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

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
      gap: 1
    }}>
      <Button 
        variant="outlined"
        onClick={prevPage} 
        disabled={currentPage === 1}
        startIcon={<NavigateBeforeIcon />}
        size="small"
      >
        Previous
      </Button>
      
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            onClick={() => goToPage(pageNum)}
            variant={currentPage === pageNum ? "contained" : "outlined"}
            size="small"
            sx={{ 
              minWidth: '36px',
              height: '36px'
            }}
          >
            {pageNum}
          </Button>
        ))}
      </Box>
      
      <Button 
        variant="outlined"
        onClick={nextPage} 
        disabled={currentPage === totalPages}
        endIcon={<NavigateNextIcon />}
        size="small"
      >
        Next
      </Button>
      
      <Typography variant="body2" sx={{ ml: 2 }}>
        Page {currentPage} of {totalPages}
      </Typography>
    </Box>
  );
};

export default Paging;