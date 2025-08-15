import { z } from 'zod';

// Simple in-memory rate limiter
const requestCounts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

// Rate limiting middleware
export const limiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Clean up old entries
  for (const [key, data] of requestCounts.entries()) {
    if (data.timestamp < windowStart) {
      requestCounts.delete(key);
    }
  }

  // Get or create counter for this IP
  const counter = requestCounts.get(ip) || { count: 0, timestamp: now };

  // Reset if outside window
  if (counter.timestamp < windowStart) {
    counter.count = 0;
    counter.timestamp = now;
  }

  // Increment counter
  counter.count++;
  requestCounts.set(ip, counter);

  if (counter.count > MAX_REQUESTS) {
    return res.status(429).json({
      message: 'Too many requests from this IP, please try again later'
    });
  }

  next();
};

// Request validation schemas
export const bookingSchema = z.object({
  hallId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  purpose: z.string().min(10),
  attendees: z.number().min(1)
});

// Validation middleware
export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};

// Sanitize middleware
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    const clean = {};
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        clean[key] = obj[key].trim().replace(/[<>]/g, '');
      } else if (typeof obj[key] === 'object') {
        clean[key] = sanitize(obj[key]);
      } else {
        clean[key] = obj[key];
      }
    }
    return clean;
  };
  
  req.body = sanitize(req.body);
  next();
};