import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
  Users, 
  Calendar, 
  Building2, 
  Plus, 
  Check, 
  X, 
  FileText,
  BarChart3,
  Clock,
  MapPin
} from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { User, Booking, Department } from '../types';

const hodSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department_id: z.number().min(1, 'Please select a department'),
});

type HODFormData = z.infer<typeof hodSchema>;

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'hods' | 'pending' | 'logs'>('overview');
  const [hods, setHods] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [logs, setLogs] = useState<Booking[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHODForm, setShowHODForm] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HODFormData>({
    resolver: zodResolver(hodSchema),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [hodsData, pendingData, logsData, deptData, reportsData] = await Promise.all([
        api.get('/admin/manage-hod'),
        api.get('/admin/pending-requests'),
        api.get('/admin/logs'),
        api.get('/departments'),
        api.get('/admin/reports'),
      ]);
      setHods(hodsData);
      setPendingRequests(pendingData);
      setLogs(logsData);
      setDepartments(deptData);
      setReports(reportsData);
    } catch (error) {
      showToast('error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/admin/approve/${id}`, {});
      showToast('success', 'Booking approved successfully');
      fetchData();
    } catch (error) {
      showToast('error', 'Failed to approve booking');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await api.post(`/admin/reject/${id}`, { reason });
      showToast('success', 'Booking rejected successfully');
      fetchData();
    } catch (error) {
      showToast('error', 'Failed to reject booking');
    }
  };

  const onSubmitHOD = async (data: HODFormData) => {
    try {
      await api.post('/admin/create-hod', data);
      showToast('success', 'HOD created successfully');
      reset();
      setShowHODForm(false);
      fetchData();
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to create HOD');
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
      <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'hods', name: 'Manage HODs', icon: Users },
            { id: 'pending', name: 'Pending Requests', icon: Clock },
            { id: 'logs', name: 'Booking History', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && reports && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{reports.totalBookings}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{reports.pendingBookings}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">{reports.approvedBookings}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <X className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rejected</p>
                  <p className="text-2xl font-semibold text-gray-900">{reports.rejectedBookings}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Halls</h3>
              <div className="space-y-3">
                {reports.popularHalls.map((hall: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{hall.name}</p>
                      <p className="text-sm text-gray-500">{hall.location}</p>
                    </div>
                    <span className="text-lg font-semibold text-indigo-600">
                      {hall.booking_count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Department Statistics</h3>
              <div className="space-y-3">
                {reports.departmentStats.map((dept: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <p className="font-medium">{dept.department || 'No Department'}</p>
                    <span className="text-lg font-semibold text-indigo-600">
                      {dept.booking_count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage HODs Tab */}
      {activeTab === 'hods' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage HODs</h2>
            <button
              onClick={() => setShowHODForm(!showHODForm)}
              className="btn flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add HOD</span>
            </button>
          </div>

          {showHODForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Create New HOD</h3>
              <form onSubmit={handleSubmit(onSubmitHOD)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      {...register('name')}
                      className="mt-1 input"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      {...register('email')}
                      className="mt-1 input"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      {...register('password')}
                      className="mt-1 input"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      {...register('department_id', { valueAsNumber: true })}
                      className="mt-1 input"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {errors.department_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowHODForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn"
                  >
                    {isSubmitting ? <LoadingSpinner size="sm" /> : 'Create HOD'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hods.map((hod) => (
                  <tr key={hod.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{hod.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{hod.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{hod.department || 'Not Assigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Pending Booking Requests</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requester
                  </th>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.requester_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.department_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.hall_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.hall_location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {format(new Date(request.date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.start_time} - {request.end_time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.purpose}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pendingRequests.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-500">All booking requests have been processed.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Booking History & Logs</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hall
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.requester_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.department_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.hall_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.hall_location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {format(new Date(log.date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.start_time} - {log.end_time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.approved_by_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.updated_at ? format(new Date(log.updated_at), 'MMM d, yyyy') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}