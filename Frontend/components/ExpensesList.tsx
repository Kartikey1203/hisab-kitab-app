import React, { useState } from 'react';
import { PersonalExpense } from '../types';

interface ExpenseListProps {
  expenses: PersonalExpense[];
  onEditExpense: (expense: PersonalExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const ExpensesList: React.FC<ExpenseListProps> = ({ expenses, onEditExpense, onDeleteExpense }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(expense => {
    return searchTerm === '' || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Group expenses by date
  const groupedExpenses = filteredExpenses.reduce((groups: Record<string, PersonalExpense[]>, expense) => {
    const date = new Date(expense.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, PersonalExpense[]>);

  // Sort dates in reverse chronological order
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700/70 border border-slate-600/50 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        

      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700/50">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-400">No expenses found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="bg-slate-800/70 px-4 py-2 border-b border-slate-700/50 flex justify-between items-center">
                <h3 className="text-white text-sm font-medium">{date}</h3>
                <div className="text-xs text-slate-300 font-medium">
                  Total: ₹{groupedExpenses[date].reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                </div>
              </div>
              <ul className="divide-y divide-slate-700/50">
                {groupedExpenses[date].map(expense => (
                  <li key={expense.id} className="px-4 py-2 hover:bg-slate-700/30 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex-grow truncate mr-2">
                        <p className="text-white text-sm font-medium truncate">{expense.description}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-white text-sm font-medium mr-3">₹{expense.amount.toFixed(2)}</span>
                        <div className="flex">
                          <button 
                            onClick={() => onEditExpense(expense)} 
                            className="text-primary-400 hover:text-primary-300 transition-colors p-1"
                            aria-label="Edit expense"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => onDeleteExpense(expense.id)}
                            className="text-danger-400 hover:text-danger-300 transition-colors p-1"
                            aria-label="Delete expense"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensesList;