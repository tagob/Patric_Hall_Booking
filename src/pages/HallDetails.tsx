import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { api } from '../utils/api';
import { HallGallery } from '../components/HallGallery';
import { HallAvailability } from '../components/HallAvailability';
import { BookingForm } from '../components/BookingForm';
import type { Hall } from '../types';

export function HallDetails() {
  const { id } = useParams();
  const [hall, setHall] = useState<Hall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHall = async () => {
      try {
        const data = await api.get(`/venues/${id}`);
        setHall(data);
      } catch (err) {
        setError('Failed to load hall details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchHall();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !hall) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <p className="text-red-700">{error || 'Hall not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <HallGallery 
          imageUrl={hall.image_url || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800&h=600"} 
          name={hall.name} 
        />
        
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{hall.name}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2" />
              {hall.location}
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2" />
              {hall.capacity} people
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {hall.amenities && Array.isArray(hall.amenities) && hall.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{hall.description || 'No description available.'}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              <Calendar className="h-5 w-5 inline mr-2" />
              Availability
            </h2>
            <HallAvailability hallId={hall.id} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Book This Hall</h2>
            <BookingForm hallId={hall.id} />
          </div>
        </div>
      </div>
    </div>
  );
}