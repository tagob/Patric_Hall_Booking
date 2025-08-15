import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import type { Booking } from '../types';

interface UseBookingsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useBookings(options: UseBookingsOptions = {}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(options.page || 1);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: (options.limit || 9).toString(),
        ...(options.search && { search: options.search }),
        ...(options.status && options.status !== 'all' && { status: options.status }),
      });

      const response = await api.get(`/bookings?${queryParams}`);
      setBookings(response.data);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, options.limit, options.search, options.status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const changePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return { 
    bookings, 
    isLoading, 
    error,
    refreshBookings: fetchBookings,
    pagination: {
      currentPage,
      totalPages,
      changePage,
    }
  };
}