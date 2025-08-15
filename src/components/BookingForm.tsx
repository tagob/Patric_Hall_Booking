import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAvailability } from '../hooks/useAvailability';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from './LoadingSpinner';
import { api } from '../utils/api';

const bookingSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  purpose: z.string().min(10, 'Please provide a detailed purpose for the booking'),
  attendees: z.number().min(1, 'Number of attendees is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  hallId: string;
  onSuccess?: () => void;
}

export function BookingForm({ hallId, onSuccess }: BookingFormProps) {
  const { checkAvailability, isChecking } = useAvailability();
  const { showToast } = useToast();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      attendees: 1
    }
  });

  const date = watch('date');
  const startTime = watch('startTime');
  const endTime = watch('endTime');

  useEffect(() => {
    if (date && startTime && endTime) {
      checkAvailability({ hallId, date, startTime, endTime });
    }
  }, [date, startTime, endTime, hallId, checkAvailability]);

  const onSubmit = async (data: BookingFormData) => {
    try {
      const isAvailable = await checkAvailability({
        hallId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
      });

      if (!isAvailable) {
        showToast('error', 'This time slot is not available');
        return;
      }

      const response = await api.post('/bookings', {
        hallId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose,
        attendees: data.attendees,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      showToast('success', 'Booking created successfully');
      reset();
      onSuccess?.();
    } catch (error) {
      showToast('error', 'Failed to create booking');
      console.error('Booking error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          min={new Date().toISOString().split('T')[0]}
          {...register('date')}
          className="mt-1 input"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            min="08:00"
            max="20:00"
            {...register('startTime')}
            className="mt-1 input"
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            min="08:00"
            max="20:00"
            {...register('endTime')}
            className="mt-1 input"
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="attendees" className="block text-sm font-medium text-gray-700">
          Number of Attendees
        </label>
        <input
          type="number"
          id="attendees"
          min="1"
          {...register('attendees', { valueAsNumber: true })}
          className="mt-1 input"
        />
        {errors.attendees && (
          <p className="mt-1 text-sm text-red-600">{errors.attendees.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
          Purpose of Booking
        </label>
        <textarea
          id="purpose"
          rows={4}
          {...register('purpose')}
          className="mt-1 input"
          placeholder="Please describe the purpose of your booking..."
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
        )}
      </div>

      {isChecking && (
        <div className="text-sm text-gray-500 flex items-center">
          <LoadingSpinner size="sm" />
          <span className="ml-2">Checking availability...</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isChecking}
        className="btn w-full"
      >
        {isSubmitting ? (
          <LoadingSpinner size="sm" />
        ) : (
          'Book Hall'
        )}
      </button>
    </form>
  );
}