import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Building2 } from 'lucide-react';
import { api } from '../utils/api';
import type { Hall } from '../types';

export function VenueDropdown() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const data = await api.get('/venues');
        setHalls(data);
      } catch (error) {
        console.error('Error fetching halls:', error);
      }
    };

    fetchHalls();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
      >
        <Building2 className="h-5 w-5" />
        <span>Multiple Venues</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg py-1">
          {halls.map((hall) => (
            <Link
              key={hall.id}
              to={`/halls/${hall.id}`}
              className="block px-4 py-2 hover:bg-indigo-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="font-medium">{hall.name}</div>
              <div className="text-sm text-gray-500">{hall.location}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}