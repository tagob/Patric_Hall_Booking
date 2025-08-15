import { useState, useCallback } from 'react';
import { api } from '../utils/api';

interface CheckAvailabilityParams {
  hallId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export function useAvailability() {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async ({
    hallId,
    date,
    startTime,
    endTime,
  }: CheckAvailabilityParams) => {
    try {
      setIsChecking(true);
      setError(null);
      
      const data = await api.get(`/venues/${hallId}/availability?date=${date}&startTime=${startTime}&endTime=${endTime}`);
      return data.available;
    } catch (err) {
      setError('Failed to check availability');
      console.error('Availability check error:', err);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    checkAvailability,
    isChecking,
    error,
  };
}