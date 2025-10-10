import express from 'express';
import { auth } from '../middleware/auth.js';
import PersonalExpense from '../models/PersonalExpense.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all personal expenses for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const { start, end, category } = req.query;
    
    const query = { user: req.user.id };
    
    // Add date filters if provided
    if (start || end) {
      query.date = {};
      if (start) query.date.$gte = new Date(start);
      if (end) query.date.$lte = new Date(end);
    }
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    const expenses = await PersonalExpense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get categories summary (for analytics)
router.get('/categories/summary', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const matchStage = { user: new mongoose.Types.ObjectId(req.user.id) };
    
    // Add date filters if provided
    if (start || end) {
      matchStage.date = {};
      if (start) matchStage.date.$gte = new Date(start);
      if (end) matchStage.date.$lte = new Date(end);
    }

    const categorySummary = await PersonalExpense.aggregate([
      { $match: matchStage },
      { $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $project: {
          category: "$_id",
          total: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(categorySummary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get time-based summary (daily, weekly, monthly)
router.get('/time/summary', auth, async (req, res) => {
  try {
    const { period, start, end } = req.query;
    
    // Validate period
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ message: 'Invalid period. Use daily, weekly, or monthly.' });
    }
    
    const matchStage = { user: new mongoose.Types.ObjectId(req.user.id) };
    
    // Add date filters if provided
    if (start || end) {
      matchStage.date = {};
      if (start) matchStage.date.$gte = new Date(start);
      if (end) matchStage.date.$lte = new Date(end);
    }

    // Determine grouping format based on period
    let dateFormat;
    if (period === 'daily') {
      dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
    } else if (period === 'weekly') {
      // Group by week (MongoDB week starts on Sunday, so adjust if needed)
      dateFormat = { 
        $dateToString: { 
          format: "%Y-W%U", 
          date: "$date" 
        } 
      };
    } else {
      // Monthly
      dateFormat = { $dateToString: { format: "%Y-%m", date: "$date" } };
    }

    const timeSummary = await PersonalExpense.aggregate([
      { $match: matchStage },
      { $group: {
          _id: dateFormat,
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: {
          period: "$_id",
          total: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(timeSummary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new personal expense
router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;
    
    const expense = await PersonalExpense.create({
      amount,
      description,
      category,
      date: date || new Date(),
      user: req.user.id
    });
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a single personal expense
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await PersonalExpense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if expense belongs to the logged-in user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a personal expense
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await PersonalExpense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if expense belongs to the logged-in user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedExpense = await PersonalExpense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a personal expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await PersonalExpense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if expense belongs to the logged-in user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all available categories used by the user
router.get('/categories/list', auth, async (req, res) => {
  try {
    const categories = await PersonalExpense.distinct('category', { user: req.user.id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;