import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { BookingList } from '../components/BookingList';
import { BookingDetails } from '../components/BookingDetails';
import { Pagination } from '../components/Pagination';
import { useBookings } from '../hooks/useBookings';
import type { Booking } from '../types';

export function BookingManagement() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const { 
    bookings, 
    isLoading, 
    error, 
    refreshBookings,
    pagination 
  } = useBookings({
    page: 1,
    limit: 9,
    search,
    status,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refreshBookings();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 pr-4 py-2 w-full sm:w-64"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </form>

          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {selectedBooking ? (
        <BookingDetails 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)}
          onUpdate={refreshBookings}
        />
      ) : (
        <>
          <BookingList 
            bookings={bookings} 
            onSelect={setSelectedBooking}
            onUpdate={refreshBookings}
          />
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.changePage}
          />
        </>
      )}
    </div>
  );
}