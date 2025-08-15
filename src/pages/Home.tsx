import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';
import { BookingCalendar } from '../components/BookingCalendar';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="text-center py-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to Patrician College Hall Booking System</h1>
        <p className="text-xl max-w-2xl mx-auto mb-8">
          Efficiently manage and book halls for your academic and administrative needs
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/book"
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
          >
            <Calendar className="h-5 w-5" />
            <span>Easy Booking</span>
          </Link>
          {!user ? (
            <Link
              to="/login"
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-700 text-white rounded-lg shadow hover:bg-indigo-800"
            >
              <Users className="h-5 w-5" />
              <span>Staff Portal</span>
            </Link>
          ) : (
            <Link
              to="/bookings"
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-700 text-white rounded-lg shadow hover:bg-indigo-800"
            >
              <Users className="h-5 w-5" />
              <span>My Bookings</span>
            </Link>
          )}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Venue Availability Calendar</h2>
        <BookingCalendar />
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Calendar className="h-12 w-12 text-indigo-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Easy Booking</h2>
          <p className="text-gray-600 mb-4">
            Simple and quick booking process with real-time availability
          </p>
          <Link
            to="/book"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Book Now →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <Users className="h-12 w-12 text-indigo-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Staff Portal</h2>
          <p className="text-gray-600 mb-4">
            Dedicated portal for staff to manage bookings and preferences
          </p>
          {!user ? (
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Staff Login →
            </Link>
          ) : (
            <Link
              to="/bookings"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              My Bookings →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}