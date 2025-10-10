import mongoose from 'mongoose';

const personalExpenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Other',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add indices for faster queries
personalExpenseSchema.index({ user: 1, date: -1 });
personalExpenseSchema.index({ user: 1, category: 1 });

const PersonalExpense = mongoose.model('PersonalExpense', personalExpenseSchema);
export default PersonalExpense;