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
  role: 'admin' | 'staff';
}

export interface Booking {
  id: string;
  hall_id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  attendees: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
  halls?: {
    name: string;
  };
}