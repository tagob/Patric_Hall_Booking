import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useBookingActions } from '../hooks/useBookingActions';
import type { Booking } from '../types';

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const { cancelBooking, isLoading } = useBookingActions();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{booking.hallName}</h3>
          <span className={`px-2 py-1 rounded-full text-sm ${
            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {booking.status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(booking.date), 'MMMM d, yyyy')}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {booking.startTime} - {booking.endTime}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {booking.hallLocation}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Purpose: {booking.purpose}
        </p>

        {booking.status !== 'cancelled' && (
          <button
            onClick={() => cancelBooking(booking.id)}
            disabled={isLoading}
            className="btn-secondary w-full"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  );
}