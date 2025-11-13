import React, { useState } from 'react';
import { Person, TransactionType, NewTransaction } from '../types';

interface BulkTransactionFormProps {
  people: Person[];
  onSubmit: (personIds: string[], transaction: NewTransaction) => void;
  onCancel: () => void;
}

const BulkTransactionForm: React.FC<BulkTransactionFormProps> = ({ people, onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.I_PAID);
  const [selectedPersons, setSelectedPersons] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePersonToggle = (personId: string) => {
    const newSelected = new Set(selectedPersons);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedPersons(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPersons.size === filteredPeople.length) {
      setSelectedPersons(new Set());
    } else {
      setSelectedPersons(new Set(filteredPeople.map(p => p.id)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    
    if (!purpose.trim()) {
      alert("Please enter a purpose for the transaction.");
      return;
    }
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }
    
    if (selectedPersons.size === 0) {
      alert("Please select at least one person.");
      return;
    }

    // Confirm bulk transaction
    const selectedCount = selectedPersons.size;
    const selectedNames = people
      .filter(p => selectedPersons.has(p.id))
      .map(p => p.name)
      .join(', ');
    
    const confirmMessage = `Add "${purpose.trim()}" for ₹${numericAmount} to ${selectedCount} ${selectedCount === 1 ? 'person' : 'people'}?\n\nSelected: ${selectedNames}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    onSubmit(Array.from(selectedPersons), {
      amount: numericAmount,
      purpose: purpose.trim(),
      type,
    });

    // Reset form
    setAmount('');
    setPurpose('');
    setType(TransactionType.I_PAID);
    setSelectedPersons(new Set());
    setSearchQuery('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-semibold text-white">Add Bulk Transaction</h2>
          <p className="text-slate-400 mt-1">Add the same transaction to multiple people at once</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Transaction Details */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label htmlFor="bulk-purpose" className="block text-sm font-medium text-slate-300 mb-1">Purpose</label>
                <input
                  id="bulk-purpose"
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Burger, Movie tickets"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="bulk-amount" className="block text-sm font-medium text-slate-300 mb-1">Amount (₹)</label>
                <input
                  id="bulk-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="30.00"
                  min="0.01"
                  step="0.01"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="bulk-type" className="block text-sm font-medium text-slate-300 mb-1">Who Paid?</label>
                <select
                  id="bulk-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as TransactionType)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 h-[42px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value={TransactionType.I_PAID}>I Paid</option>
                  <option value={TransactionType.THEY_PAID}>They Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Person Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-300">Select People</label>
              <span className="text-xs text-slate-400">
                {selectedPersons.size} of {people.length} selected
              </span>
            </div>
            
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            {/* Select All Button */}
            {filteredPeople.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="mb-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                {selectedPersons.size === filteredPeople.length ? 'Deselect All' : 'Select All'}
              </button>
            )}

            {/* People List */}
            <div className="max-h-48 overflow-y-auto bg-slate-700/50 rounded-md border border-slate-600">
              {filteredPeople.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  {searchQuery ? 'No people found matching your search' : 'No people available'}
                </div>
              ) : (
                filteredPeople.map((person) => (
                  <label
                    key={person.id}
                    className="flex items-center p-3 hover:bg-slate-600/50 transition-colors cursor-pointer border-b border-slate-600 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPersons.has(person.id)}
                      onChange={() => handlePersonToggle(person.id)}
                      className="mr-3 h-4 w-4 text-amber-600 bg-slate-700 border-slate-600 rounded focus:ring-amber-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{person.name}</div>
                      {person.nickname && (
                        <div className="text-sm text-slate-400">"{person.nickname}"</div>
                      )}
                    </div>
                    {person.isFriend && (
                      <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                        Friend
                      </span>
                    )}
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedPersons.size === 0}
              className="bg-amber-600 text-white font-bold py-2 px-4 rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to {selectedPersons.size} {selectedPersons.size === 1 ? 'Person' : 'People'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkTransactionForm;