import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage
}: PaginationControlsProps) {
  // Safe totalPages to prevent negative or zero
  const safeTotalPages = Math.max(1, totalPages || 1);
  
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    
    if (safeTotalPages <= 5) {
      // Show all pages if 5 or less
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first, last, and pages around current
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(safeTotalPages - 1, currentPage + 1);
      
      // Adjust if at the very beginning
      if (currentPage <= 2) {
        end = 4;
      }
      
      // Adjust if at the very end
      if (currentPage >= safeTotalPages - 1) {
        start = safeTotalPages - 3;
      }
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < safeTotalPages - 1) {
        pages.push('...');
      }
      
      pages.push(safeTotalPages);
    }
    
    return pages;
  };

  const pages = getPageNumbers();
  const canGoPrevious = hasPreviousPage !== undefined ? hasPreviousPage : currentPage > 1;
  const canGoNext = hasNextPage !== undefined ? hasNextPage : currentPage < safeTotalPages;

  if (safeTotalPages <= 1) {
    return null; // Don't show pagination if only 1 page
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 w-full text-sm">
      <div className="text-violet-500 font-medium">
        Página {currentPage} de {safeTotalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className="h-8 w-8 text-violet-700 border-violet-200 hover:bg-violet-50"
        >
          <span className="sr-only">Anterior</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-1">
          {pages.map((page, i) => {
            if (page === '...') {
              return (
                <div key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-violet-400">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }
            
            return (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(page as number)}
                className={`h-8 w-8 ${
                  currentPage === page 
                    ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm" 
                    : "text-violet-700 border-violet-200 hover:bg-violet-50"
                }`}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="h-8 w-8 text-violet-700 border-violet-200 hover:bg-violet-50"
        >
          <span className="sr-only">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
