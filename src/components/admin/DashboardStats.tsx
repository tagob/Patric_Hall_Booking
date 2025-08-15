import React from 'react';
import { BarChart3, Users, Calendar, Building2 } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: Icon, trend }: StatsCardProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <Icon className="h-8 w-8 text-indigo-600" />
      {trend && (
        <span className={`text-sm font-medium ${
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </span>
      )}
    </div>
    <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-2 text-3xl font-semibold">{value}</p>
  </div>
);

export function DashboardStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Bookings"
        value={stats.totalBookings}
        icon={Calendar}
        trend={{ value: 12.5, isPositive: true }}
      />
      <StatsCard
        title="Active Users"
        value={stats.activeUsers}
        icon={Users}
        trend={{ value: 8.1, isPositive: true }}
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
        trend={{ value: 5.2, isPositive: true }}
      />
    </div>
  );
}