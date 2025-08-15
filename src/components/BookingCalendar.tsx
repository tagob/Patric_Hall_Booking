import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { api } from '../utils/api';
import type { Booking } from '../types';

interface BookingWithHall extends Booking {
  halls: {
    name: string;
  };
}

export function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<BookingWithHall[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithHall | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      try {
        const data = await api.get(`/bookings?start=${start.toISOString()}&end=${end.toISOString()}`);
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [currentDate]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getBookingsForDay = (date: Date) => 
    bookings.filter(booking => isSameDay(new Date(booking.date), date));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const dayBookings = getBookingsForDay(day);
          const hasBookings = dayBookings.length > 0;
          
          return (
            <div
              key={day.toString()}
              className={`
                relative p-2 min-h-[80px] border rounded-lg
                ${isSameMonth(day, currentDate) ? 'bg-white' : 'bg-gray-50'}
                ${hasBookings ? 'hover:bg-gray-50' : ''}
              `}
              onMouseEnter={() => hasBookings && setSelectedBooking(dayBookings[0])}
              onMouseLeave={() => setSelectedBooking(null)}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              {hasBookings && (
                <div className="mt-1">
                  {dayBookings.map(booking => (
                    <div
                      key={booking.id}
                      className="text-xs px-1 py-0.5 rounded bg-indigo-100 text-indigo-800 mb-1"
                    >
                      {booking.halls?.name || 'Hall'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedBooking && (
        <div className="absolute bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
          <h3 className="font-medium">{selectedBooking.halls?.name || 'Hall'}</h3>
          <p className="text-sm text-gray-600">{selectedBooking.purpose}</p>
          <p className="text-sm text-gray-500">
            {selectedBooking.start_time} - {selectedBooking.end_time}
          </p>
        </div>
      )}
    </div>
  );
}