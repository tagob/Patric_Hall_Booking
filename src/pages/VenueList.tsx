import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { api } from '../utils/api';
import { HallCard } from '../components/HallCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Hall } from '../types';

export function VenueList() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHalls = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await api.get('/venues');

        if (isMounted) {
          setHalls(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching halls:', err);
          setError('Failed to load venues. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHalls();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHalls = halls.filter(hall =>
    hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hall.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Our Venues</h1>
          <p className="mt-2 text-gray-600">Discover the perfect space for your next event</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredHalls.map((hall) => (
          <HallCard key={hall.id} hall={hall} />
        ))}
      </div>

      {filteredHalls.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}