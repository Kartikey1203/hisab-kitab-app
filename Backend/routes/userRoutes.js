import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import { upload, cloudinary } from '../config/cloudinary.js';

const router = express.Router();
router.get('/me', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select('-password');
    if (!me) return res.status(404).json({ message: 'User not found' });
    res.json({ id: me._id, name: me.name, email: me.email, photoUrl: me.photoUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users by name (case-insensitive). Excludes self.
router.get('/search', auth, async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const results = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      $or: [
        { name: regex },
        { email: regex }
      ]
    })
      .select('name email')
      .limit(10);

    res.json(results.map(u => ({ id: u._id, name: u.name, email: u.email })));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Update profile (Name only)
router.put('/me', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ id: updated._id, name: updated.name, email: updated.email, photoUrl: updated.photoUrl });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload Profile Photo
router.post('/me/photo', auth, (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Upload failed: ${err.message}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('User:', req.user._id);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old photo from Cloudinary if exists
    const user = await User.findById(req.user._id);
    if (user.photoUrl && user.photoUrl.includes('cloudinary.com')) {
      try {
        // Extract public_id from URL
        const urlParts = user.photoUrl.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        const publicId = `hisab-kitab/profile-photos/${filename}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Failed to delete old photo:', error);
      }
    }

    // Get Cloudinary URL
    const photoUrl = req.file.path;
    console.log('Cloudinary URL:', photoUrl);

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { photoUrl: photoUrl },
      { new: true }
    ).select('-password');

    res.json({ id: updated._id, name: updated.name, email: updated.email, photoUrl: updated.photoUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete account
router.delete('/me', auth, async (req, res) => {
  try {
    // TODO: Consider cascading deletes for persons, transactions, requests, notifications
    await User.findByIdAndDelete(req.user._id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;


