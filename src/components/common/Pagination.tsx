import React from 'react';
import type { PaginationMeta } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="pagination-bar">
      <div>
        Showing page <strong style={{ color: '#fff' }}>{meta.page}</strong> of{' '}
        <strong style={{ color: '#fff' }}>{meta.totalPages}</strong> (Total {meta.total} records)
      </div>

      <div className="pagination-controls">
        <button
          className="btn btn-secondary btn-sm"
          disabled={!meta.hasPrev}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <button
          className="btn btn-secondary btn-sm"
          disabled={!meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
