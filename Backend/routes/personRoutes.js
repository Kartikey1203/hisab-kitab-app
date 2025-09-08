import express from 'express';
import { auth } from '../middleware/auth.js';
import Person from '../models/Person.js';

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
    await person.deleteOne();
    res.json({ message: 'Person removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;