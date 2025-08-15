import React from 'react';
import { BarChart3, Users, Calendar, Building2 } from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { BookingChart } from '../components/admin/BookingChart';
import { StatsCard } from '../components/admin/StatsCard';
import { PopularHalls } from '../components/admin/PopularHalls';
import { UpcomingBookings } from '../components/admin/UpcomingBookings';

export function AdminDashboard() {
  const { stats, isLoading, error } = useStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          trend={stats.bookingTrend}
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Users}
          trend={stats.userTrend}
        />
        <StatsCard
          title="Total Halls"
          value={stats.totalHalls}
          icon={Building2}
        />
        <StatsCard
          title="Booking Rate"
          value={`${stats.bookingRate}%`}
          icon={BarChart3}
          trend={stats.bookingRateTrend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Booking Trends</h2>
          <BookingChart data={stats.bookingTrends} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Popular Halls</h2>
          <PopularHalls halls={stats.popularHalls} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Bookings</h2>
          <UpcomingBookings bookings={stats.upcomingBookings} />
        </div>
      </div>
    </div>
  );
}