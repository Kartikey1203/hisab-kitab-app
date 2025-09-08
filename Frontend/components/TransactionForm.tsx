import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, NewTransaction } from '../types';

interface TransactionFormProps {
  onSubmit: (transaction: NewTransaction) => void;
  onCancel?: () => void;
  editingTransaction?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, editingTransaction }) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.I_PAID);

  useEffect(() => {
    if (editingTransaction) {
      setAmount(String(editingTransaction.amount));
      setPurpose(editingTransaction.purpose);
      setType(editingTransaction.type);
    } else {
      setAmount('');
      setPurpose('');
      setType(TransactionType.I_PAID);
    }
  }, [editingTransaction]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!purpose.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid purpose and a positive amount.");
      return;
    }
    onSubmit({
      amount: numericAmount,
      purpose: purpose.trim(),
      type,
    });
    if (!editingTransaction) {
        setAmount('');
        setPurpose('');
        setType(TransactionType.I_PAID);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-800/50 backdrop-blur-sm ring-1 ring-white/10 rounded-lg shadow-lg mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="purpose" className="block text-sm font-medium text-slate-300 mb-1">Purpose</label>
          <input
            id="purpose"
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g., Dinner, Movie tickets"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-1">Who Paid?</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 h-[42px] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value={TransactionType.I_PAID}>I Paid</option>
            <option value={TransactionType.THEY_PAID}>They Paid</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        {onCancel && editingTransaction && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="bg-amber-600 text-white font-bold py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
        >
          {editingTransaction ? 'Save Changes' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;