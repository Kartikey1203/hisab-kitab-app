import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get current profile
router.get('/me', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select('-password');
    if (!me) return res.status(404).json({ message: 'User not found' });
    res.json({ id: me._id, name: me.name, email: me.email, photoUrl: me.photoUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, photoUrl } = req.body;
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof photoUrl === 'string') updates.photoUrl = photoUrl.trim() || null;

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ id: updated._id, name: updated.name, email: updated.email, photoUrl: updated.photoUrl });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;


