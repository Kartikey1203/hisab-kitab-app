import express from 'express';
import { auth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200);
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/read', auth, async (req, res) => {
  try {
    const { ids } = req.body; // optional list of ids; if omitted, mark all
    if (Array.isArray(ids) && ids.length > 0) {
      await Notification.updateMany({ user: req.user._id, _id: { $in: ids } }, { $set: { read: true } });
    } else {
      await Notification.updateMany({ user: req.user._id }, { $set: { read: true } });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;


