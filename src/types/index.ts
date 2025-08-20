export interface Hall {
  id: string;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  department_code?: string;
  role: 'admin' | 'hod';
}

export interface Booking {
  id: string;
  hall_id: number;
  user_id: number;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  attendees: number;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
  hall_name?: string;
  hall_location?: string;
  requester_name?: string;
  requester_email?: string;
  department_name?: string;
  approved_by_name?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface BookingRequest extends Booking {
  // Additional fields for admin view
}