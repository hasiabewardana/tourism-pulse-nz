import { Box, Button, Typography } from "@mui/material";
import classes from "./Pagination.module.css";

function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <Box className={classes.pagination}>
      <Button
        variant="outlined"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={classes.navButton}
      >
        Previous
      </Button>

      <Box className={classes.pageNumbers}>
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <Typography key={`ellipsis-${index}`} className={classes.ellipsis}>
              ...
            </Typography>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "contained" : "outlined"}
              onClick={() => handlePageClick(page)}
              className={
                currentPage === page
                  ? classes.activePageButton
                  : classes.pageButton
              }
            >
              {page}
            </Button>
          )
        )}
      </Box>

      <Button
        variant="outlined"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={classes.navButton}
      >
        Next
      </Button>
    </Box>
  );
}

export default Pagination;
