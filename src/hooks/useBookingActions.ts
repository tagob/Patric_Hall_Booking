import { useState } from 'react';
import { api } from '../utils/api';

export function useBookingActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBooking = async (bookingId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete(`/bookings/${bookingId}`);
    } catch (err) {
      setError('Failed to cancel booking. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    cancelBooking, 
    isLoading,
    error 
  };
}