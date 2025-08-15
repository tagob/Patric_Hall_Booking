import React from 'react';
import { Building2 } from 'lucide-react';

interface PopularHallsProps {
  halls: Array<{
    hall: {
      name: string;
      location: string;
    };
    bookings: number;
  }>;
}

export function PopularHalls({ halls }: PopularHallsProps) {
  return (
    <div className="space-y-4">
      {halls.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-medium">{item.hall.name}</p>
              <p className="text-sm text-gray-500">{item.hall.location}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{item.bookings}</p>
            <p className="text-sm text-gray-500">bookings</p>
          </div>
        </div>
      ))}
    </div>
  );
}