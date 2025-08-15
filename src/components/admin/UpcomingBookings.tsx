import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import type { Booking } from '../../types';

interface UpcomingBookingsProps {
  bookings: Booking[];
}

export function UpcomingBookings({ bookings }: UpcomingBookingsProps) {
  return (
    <div className="divide-y divide-gray-200">
      {bookings.map((booking) => (
        <div key={booking.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{booking.hallName}</h3>
              <p className="text-sm text-gray-500">{booking.purpose}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {booking.status}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(booking.date), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {booking.startTime} - {booking.endTime}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}