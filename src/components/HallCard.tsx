import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import type { Hall } from '../types';

interface HallCardProps {
  hall: Hall;
}

export function HallCard({ hall }: HallCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:scale-[1.02]">
      <img
        src={hall.image_url || "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800&h=600"}
        alt={hall.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{hall.name}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{hall.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{hall.capacity} people</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {hall.amenities && Array.isArray(hall.amenities) && hall.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {hall.amenities && Array.isArray(hall.amenities) && hall.amenities.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-full">
                +{hall.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/halls/${hall.id}`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View Details
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}