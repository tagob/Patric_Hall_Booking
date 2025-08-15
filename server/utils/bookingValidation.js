import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Booking from '../models/Booking.js';

export const validateBookingTime = (startTime, endTime) => {
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);

  if (startHour < 8 || endHour > 20) {
    throw new Error('Bookings are only allowed between 8 AM and 8 PM');
  }

  if (startHour >= endHour) {
    throw new Error('End time must be after start time');
  }
};

export const checkOverlappingBookings = async (hallId, date, startTime, endTime, excludeBookingId = null) => {
  const dayStart = startOfDay(parseISO(date));
  const dayEnd = endOfDay(parseISO(date));

  const query = {
    hallId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: 'cancelled' },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlapping = await Booking.findOne(query);
  
  if (overlapping) {
    throw new Error('This time slot is already booked');
  }
};

export const validateBookingCapacity = async (hallId, attendees) => {
  const hall = await Hall.findById(hallId);
  
  if (!hall) {
    throw new Error('Hall not found');
  }

  if (attendees > hall.capacity) {
    throw new Error(`Maximum capacity for this hall is ${hall.capacity} people`);
  }
};