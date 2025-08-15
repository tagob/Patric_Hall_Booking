import express from 'express';
import Booking from '../models/Booking.js';
import Hall from '../models/Hall.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { sendBookingConfirmation, sendBookingCancellation } from '../utils/emailService.js';

const router = express.Router();

// Check for overlapping bookings
const checkOverlappingBookings = async (hallId, date, startTime, endTime, excludeBookingId = null) => {
  const query = {
    hallId,
    date,
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
  return overlapping;
};

// Get all bookings (admin sees all, users see their own)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;

    const query = req.user.role === 'admin' ? {} : { userId: req.user.userId };

    if (search) {
      query.$or = [
        { hallName: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('hallId', 'name location')
      .populate('userId', 'name email')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { hallId, date, startTime, endTime, purpose } = req.body;

    // Check hall capacity and availability
    const hall = await Hall.findById(hallId);
    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    // Check for overlapping bookings
    const overlapping = await checkOverlappingBookings(hallId, date, startTime, endTime);
    if (overlapping) {
      return res.status(400).json({ message: 'Hall is already booked for this time slot' });
    }

    const booking = new Booking({
      hallId,
      userId: req.user.userId,
      date,
      startTime,
      endTime,
      purpose,
      status: 'pending'
    });

    await booking.save();
    
    // Send confirmation email
    await sendBookingConfirmation(booking, req.user);
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update booking
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check for overlapping bookings if date/time is being updated
    if (req.body.date || req.body.startTime || req.body.endTime) {
      const overlapping = await checkOverlappingBookings(
        booking.hallId,
        req.body.date || booking.date,
        req.body.startTime || booking.startTime,
        req.body.endTime || booking.endTime,
        booking._id
      );

      if (overlapping) {
        return res.status(400).json({ message: 'Hall is already booked for this time slot' });
      }
    }

    Object.assign(booking, req.body);
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();
    
    // Send cancellation email
    await sendBookingCancellation(booking, req.user);
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// Admin approve/reject booking
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status' });
  }
});

export default router;