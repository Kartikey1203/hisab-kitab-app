import express from 'express';
import { auth } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Person from '../models/Person.js';

const router = express.Router();

// Get transactions for a person
router.get('/:personId', auth, async (req, res) => {
  try {
    const person = await Person.findById(req.params.personId);
    if (!person || person.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const transactions = await Transaction.find({ person: req.params.personId });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new transaction
router.post('/:personId', auth, async (req, res) => {
  try {
    const person = await Person.findById(req.params.personId);
    if (!person || person.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { amount, description, date, type } = req.body;
    const transaction = await Transaction.create({
      amount,
      description,
      date,
      type,
      person: req.params.personId
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const person = await Person.findById(transaction.person);
    if (!person || person.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const person = await Person.findById(transaction.person);
    if (!person || person.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;