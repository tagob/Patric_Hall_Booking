import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, X, AlertTriangle } from 'lucide-react';
import { useBookingActions } from '../hooks/useBookingActions';
import type { Booking } from '../types';

interface BookingDetailsProps {
  booking: Booking;
  onClose: () => void;
  onUpdate: () => void;
}

export function BookingDetails({ booking, onClose, onUpdate }: BookingDetailsProps) {
  const { cancelBooking, isLoading } = useBookingActions();

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await cancelBooking(booking.id);
      onUpdate();
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-900">{booking.hallName}</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {booking.status}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-3" />
            <span>{format(new Date(booking.date), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-3" />
            <span>{booking.startTime} - {booking.endTime}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-3" />
            <span>{booking.hallLocation}</span>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Purpose</h4>
          <p className="text-gray-600">{booking.purpose}</p>
        </div>

        {booking.status === 'pending' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This booking is pending approval from the administrator.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {booking.status !== 'cancelled' && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="btn-secondary w-full"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      )}
    </div>
  );
}