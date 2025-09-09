import express from 'express';
import { auth } from '../middleware/auth.js';
import Person from '../models/Person.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all people for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const people = await Person.find({ user: req.user.id });
    res.json(people);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new person
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const person = await Person.create({
      name,
      user: req.user.id,
    });
    res.status(201).json(person);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update person (e.g., paymentAddress)
router.put('/:id', auth, async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).json({ message: 'Person not found' });
    if (person.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const updates = {};
    if (typeof req.body.name === 'string') updates.name = req.body.name;
    if (typeof req.body.nickname === 'string') updates.nickname = req.body.nickname;

    const updated = await Person.findByIdAndUpdate(person._id, updates, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send reminder to friend's user linked via counterpart
router.post('/:id/remind', auth, async (req, res) => {
  try {
    const person = await Person.findById(req.params.id).populate('user');
    if (!person) return res.status(404).json({ message: 'Person not found' });
    if (person.user._id.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    if (!person.counterpartPerson) return res.status(400).json({ message: 'No linked friend to remind' });

    const counterpart = await Person.findById(person.counterpartPerson).populate('user');
    if (!counterpart || !counterpart.user) return res.status(404).json({ message: 'Friend link invalid' });

    await Notification.create({
      user: counterpart.user._id,
      type: 'reminder',
      message: `${req.user.name} sent you a payment reminder`,
      metadata: { person: counterpart._id },
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete person and their transactions
router.delete('/:id', auth, async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    if (person.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    // Cascade delete transactions and then delete person
    const { default: Transaction } = await import('../models/Transaction.js');
    await Transaction.deleteMany({ person: person._id });

    // If linked with a friend, remove both sides and unlink friendship
    if (person.counterpartPerson) {
      const counterpart = await Person.findById(person.counterpartPerson);
      if (counterpart) {
        // Delete counterpart transactions and person
        await Transaction.deleteMany({ person: counterpart._id });
        await counterpart.deleteOne();
        // Remove friendship from both users
        try {
          await User.findByIdAndUpdate(person.user, { $pull: { friends: counterpart.user } });
          await User.findByIdAndUpdate(counterpart.user, { $pull: { friends: person.user } });
        } catch {}
      }
    }

    await person.deleteOne();
    res.json({ message: 'Person removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;