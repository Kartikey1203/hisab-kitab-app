import React, { useState, useEffect } from 'react';
import { PersonalExpense, NewPersonalExpense } from '../types';

interface PersonalExpenseFormProps {
  onSubmit: (expense: NewPersonalExpense) => void;
  onCancel?: () => void;
  editingExpense?: PersonalExpense | null;
}

const PersonalExpenseForm: React.FC<PersonalExpenseFormProps> = ({
  onSubmit,
  onCancel,
  editingExpense,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editingExpense) {
      setAmount(String(editingExpense.amount));
      setDescription(editingExpense.description);
      setDate(new Date(editingExpense.date).toISOString().split('T')[0]);
    } else {
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid description and a positive amount.');
      return;
    }

    onSubmit({
      description: description.trim(),
      amount: numericAmount,
      date: new Date(date).toISOString(),
    });

    if (!editingExpense) {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-800/50 backdrop-blur-sm ring-1 ring-white/10 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">
        {editingExpense ? 'Edit Expense' : 'Add New Expense'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Lunch at restaurant"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">
            Amount (₹)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>


      </div>

      <div className="mt-6 flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          {editingExpense ? 'Save Changes' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};

export default PersonalExpenseForm;