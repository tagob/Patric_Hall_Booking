import React, { useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';

interface HallAvailabilityProps {
  hallId: string;
}

export function HallAvailability({ hallId }: HallAvailabilityProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 bg-gray-50">Time</th>
            {weekDays.map((day) => (
              <th key={day.toString()} className="px-4 py-2 bg-gray-50">
                {format(day, 'EEE dd/MM')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {timeSlots.map((hour) => (
            <tr key={hour}>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                {format(new Date().setHours(hour), 'h:mm a')}
              </td>
              {weekDays.map((day) => (
                <td
                  key={`${day}-${hour}`}
                  className="px-4 py-2 text-center"
                >
                  <div className="w-full h-8 bg-green-100 rounded cursor-pointer hover:bg-green-200" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}