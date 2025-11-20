import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      required: true,
      enum: ['credit', 'debit'],
    },
    person: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Person',
    },
    // If transaction is mirrored to a friend's ledger, keep a pointer to the twin
    counterpartTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    // Track who created the transaction
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
transactionSchema.index({ person: 1, date: -1 }); // For finding transactions by person, sorted by date
transactionSchema.index({ counterpartTransaction: 1 }); // For finding linked transactions

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;