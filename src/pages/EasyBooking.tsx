import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { api } from '../utils/api';
import { BookingForm } from '../components/BookingForm';
import type { Hall } from '../types';

export function EasyBooking() {
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const data = await api.get('/venues');
        setHalls(data);
      } catch (err) {
        setError('Failed to load venues');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHalls();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Easy Booking</h1>
        <p className="mt-2 text-gray-600">Book your venue in just a few simple steps</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Select a Venue</h2>
            <div className="space-y-4">
              {halls.map((hall) => (
                <button
                  key={hall.id}
                  onClick={() => setSelectedHall(hall)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedHall?.id === hall.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{hall.name}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      {hall.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      Capacity: {hall.capacity}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedHall ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Book {selectedHall.name}</h2>
              <BookingForm hallId={selectedHall.id} />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Venue to Start Booking
              </h3>
              <p className="text-gray-500">
                Choose from the available venues on the left to proceed with your booking
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}