import express from 'express';
import { auth } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Person from '../models/Person.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Add bulk transaction to multiple people
router.post('/bulk', auth, async (req, res) => {
  try {
    const { amount, description, date, type, personIds } = req.body;

    if (!personIds || !Array.isArray(personIds) || personIds.length === 0) {
      return res.status(400).json({ message: 'At least one person must be selected' });
    }

    // Verify all persons belong to the user
    const persons = await Person.find({ _id: { $in: personIds }, user: req.user._id });
    if (persons.length !== personIds.length) {
      return res.status(401).json({ message: 'Some persons not found or unauthorized' });
    }

    const createdTransactions = [];

    // Create transaction for each person
    for (const personId of personIds) {
      const transaction = await Transaction.create({
        amount,
        description,
        date,
        type,
        person: personId,
        addedBy: req.user._id // Set ownership
      });

      // Handle counterpart mirroring if person has linked friend
      const person = await Person.findById(personId);
      if (person.counterpartPerson) {
        const counterpartType = type === 'credit' ? 'debit' : 'credit';
        const twin = await Transaction.create({
          amount,
          description,
          date,
          type: counterpartType,
          person: person.counterpartPerson,
          counterpartTransaction: transaction._id,
          addedBy: req.user._id // Set ownership for twin too
        });

        transaction.counterpartTransaction = twin._id;
        await transaction.save();

        // Notify counterpart owner if mirrored
        const counterpart = await Person.findById(person.counterpartPerson).populate('user');
        if (counterpart && counterpart.user) {
          await Notification.create({
            user: counterpart.user._id,
            type: 'tx_added',
            message: `${req.user.name} added a transaction with you`,
            metadata: { person: counterpart._id, amount, description }
          });
        }
      }

      createdTransactions.push(transaction);
    }

    res.status(201).json({
      message: `${createdTransactions.length} transactions created successfully`,
      transactions: createdTransactions
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get transactions for a person
router.get('/:personId', auth, async (req, res) => {
  try {
    const person = await Person.findById(req.params.personId);
    if (!person || person.user.toString() !== req.user._id.toString()) {
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
    if (!person || person.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { amount, description, date, type } = req.body;
    const transaction = await Transaction.create({
      amount,
      description,
      date,
      type,
      person: req.params.personId,
      addedBy: req.user._id // Set ownership
    });

    // Mirror to counterpart if linked
    if (person.counterpartPerson) {
      const counterpartType = type === 'credit' ? 'debit' : 'credit';
      const twin = await Transaction.create({
        amount,
        description,
        date,
        type: counterpartType,
        person: person.counterpartPerson,
        counterpartTransaction: transaction._id,
        addedBy: req.user._id // Set ownership
      });
      transaction.counterpartTransaction = twin._id;
      await transaction.save();
    }

    // Notify counterpart owner if mirrored
    if (person.counterpartPerson) {
      const counterpart = await Person.findById(person.counterpartPerson).populate('user');
      if (counterpart && counterpart.user) {
        await Notification.create({ user: counterpart.user._id, type: 'tx_added', message: `${req.user.name} added a transaction with you`, metadata: { person: counterpart._id, amount, description } });
      }
    }
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
    if (!person || person.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check ownership: Only allow edit if user added it OR if it's a legacy transaction (no addedBy)
    if (transaction.addedBy && transaction.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit transactions you added' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (updatedTransaction.counterpartTransaction) {
      const counterpartUpdates = { ...req.body };
      if (typeof req.body.type === 'string') {
        counterpartUpdates.type = req.body.type === 'credit' ? 'debit' : 'credit';
      }
      await Transaction.findByIdAndUpdate(updatedTransaction.counterpartTransaction, counterpartUpdates);
      // Notify counterpart owner
      const twin = await Transaction.findById(updatedTransaction.counterpartTransaction);
      if (twin) {
        const counterpart = await Person.findById(twin.person).populate('user');
        if (counterpart && counterpart.user) {
          await Notification.create({ user: counterpart.user._id, type: 'tx_updated', message: `${req.user.name} updated a transaction with you`, metadata: { person: counterpart._id, amount: updatedTransaction.amount, description: updatedTransaction.description } });
        }
      }
    }
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
    if (!person || person.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check ownership: Only allow delete if user added it OR if it's a legacy transaction (no addedBy)
    if (transaction.addedBy && transaction.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete transactions you added' });
    }

    if (transaction.counterpartTransaction) {
      const twin = await Transaction.findById(transaction.counterpartTransaction);
      await Transaction.findByIdAndDelete(transaction.counterpartTransaction);
      if (twin) {
        const counterpart = await Person.findById(twin.person).populate('user');
        if (counterpart && counterpart.user) {
          await Notification.create({ user: counterpart.user._id, type: 'tx_deleted', message: `${req.user.name} deleted a transaction with you`, metadata: { person: counterpart._id } });
        }
      }
    }
    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;