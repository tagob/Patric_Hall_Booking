import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Plus, FileText } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Hall, Booking } from '../types';

const bookingSchema = z.object({
  hall_id: z.number().min(1, 'Please select a hall'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  purpose: z.string().min(10, 'Please provide a detailed purpose'),
  attendees: z.number().min(1, 'Number of attendees is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export function HODDashboard() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [hallsData, bookingsData] = await Promise.all([
        api.get('/halls'),
        api.get('/hod/my-requests'),
      ]);
      setHalls(hallsData);
      setBookings(bookingsData);
    } catch (error) {
      showToast('error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      await api.post('/hod/request-booking', data);
      showToast('success', 'Booking request submitted successfully');
      reset();
      setShowForm(false);
      fetchData();
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to submit booking request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HOD Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your hall booking requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Booking Request</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Request Hall Booking</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hall</label>
                <select
                  {...register('hall_id', { valueAsNumber: true })}
                  className="mt-1 input"
                >
                  <option value="">Select a hall</option>
                  {halls.map((hall) => (
                    <option key={hall.id} value={hall.id}>
                      {hall.name} - {hall.location} (Capacity: {hall.capacity})
                    </option>
                  ))}
                </select>
                {errors.hall_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.hall_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('date')}
                  className="mt-1 input"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  {...register('start_time')}
                  className="mt-1 input"
                />
                {errors.start_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  {...register('end_time')}
                  className="mt-1 input"
                />
                {errors.end_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Attendees</label>
                <input
                  type="number"
                  min="1"
                  {...register('attendees', { valueAsNumber: true })}
                  className="mt-1 input"
                />
                {errors.attendees && (
                  <p className="mt-1 text-sm text-red-600">{errors.attendees.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <textarea
                rows={4}
                {...register('purpose')}
                className="mt-1 input"
                placeholder="Please describe the purpose of your booking..."
              />
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            My Booking Requests
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hall
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.hall_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.hall_location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {format(new Date(booking.date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {booking.start_time} - {booking.end_time}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {booking.purpose}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      {booking.attendees}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    {booking.status === 'rejected' && booking.rejection_reason && (
                      <div className="text-xs text-red-600 mt-1">
                        Reason: {booking.rejection_reason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(booking.created_at!), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No booking requests</h3>
              <p className="text-gray-500">You haven't submitted any booking requests yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}