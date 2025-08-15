import React from 'react';
import { BookingCard } from './BookingCard';
import type { Booking } from '../types';

interface BookingListProps {
  bookings: Booking[];
  onSelect: (booking: Booking) => void;
  onUpdate: () => void;
}

export function BookingList({ bookings, onSelect, onUpdate }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p className="text-gray-500">You haven't made any bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <BookingCard 
          key={booking.id} 
          booking={booking}
          onClick={() => onSelect(booking)}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}