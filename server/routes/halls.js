import express from 'express';
import Hall from '../models/Hall.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all halls
router.get('/', auth, async (req, res) => {
  try {
    const halls = await Hall.find();
    res.json(halls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching halls' });
  }
});

// Get single hall
router.get('/:id', auth, async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }
    res.json(hall);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hall' });
  }
});

// Create hall (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const hall = new Hall(req.body);
    await hall.save();
    res.status(201).json(hall);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update hall (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const hall = await Hall.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }
    res.json(hall);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete hall (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }
    res.json({ message: 'Hall deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hall' });
  }
});

export default router;