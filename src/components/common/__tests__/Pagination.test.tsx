import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';
import type { PaginationMeta } from '../../../types';

describe('Pagination Component', () => {
  const mockMeta: PaginationMeta = {
    total: 25,
    page: 2,
    limit: 10,
    totalPages: 3,
    hasNext: true,
    hasPrev: true,
  };

  it('should not render anything when totalPages <= 1', () => {
    const { container } = render(
      <Pagination
        meta={{ total: 5, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false }}
        onPageChange={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render anything when meta is undefined', () => {
    const { container } = render(<Pagination onPageChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render page information correctly', () => {
    render(<Pagination meta={mockMeta} onPageChange={() => {}} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/Total 25 records/i)).toBeInTheDocument();
  });

  it('should call onPageChange with page + 1 when Next button is clicked', () => {
    const handlePageChange = vi.fn();
    render(<Pagination meta={mockMeta} onPageChange={handlePageChange} />);

    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).not.toBeDisabled();
    fireEvent.click(nextBtn);

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange with page - 1 when Previous button is clicked', () => {
    const handlePageChange = vi.fn();
    render(<Pagination meta={mockMeta} onPageChange={handlePageChange} />);

    const prevBtn = screen.getByRole('button', { name: /previous/i });
    expect(prevBtn).not.toBeDisabled();
    fireEvent.click(prevBtn);

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  it('should disable Previous button when hasPrev is false', () => {
    const firstPageMeta: PaginationMeta = {
      ...mockMeta,
      page: 1,
      hasPrev: false,
    };
    render(<Pagination meta={firstPageMeta} onPageChange={() => {}} />);

    const prevBtn = screen.getByRole('button', { name: /previous/i });
    expect(prevBtn).toBeDisabled();
  });

  it('should disable Next button when hasNext is false', () => {
    const lastPageMeta: PaginationMeta = {
      ...mockMeta,
      page: 3,
      hasNext: false,
    };
    render(<Pagination meta={lastPageMeta} onPageChange={() => {}} />);

    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).toBeDisabled();
  });
});
