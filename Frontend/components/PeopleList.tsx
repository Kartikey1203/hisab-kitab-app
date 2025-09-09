import React, { useState } from 'react';
import { Person, TransactionType } from '../types';
import { TrashIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

interface PeopleListProps {
  people: Person[];
  onSelectPerson: (id: string) => void;
  onDeletePerson: (id: string) => void;
  onConvertToFriend?: (person: Person) => void;
}

const calculateBalance = (person: Person): number => {
  return person.transactions.reduce((acc, tx) => {
    if (tx.type === TransactionType.I_PAID) {
      return acc + tx.amount;
    }
    return acc - tx.amount;
  }, 0);
};

const BalanceDisplay: React.FC<{ balance: number }> = ({ balance }) => {
  const formattedBalance = Math.abs(balance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  if (balance > 0) {
    return <div className="text-right"><p className="text-lg font-semibold text-emerald-400">{formattedBalance}</p><p className="text-xs text-slate-400">They owe you</p></div>;
  }
  if (balance < 0) {
    return <div className="text-right"><p className="text-lg font-semibold text-rose-400">{formattedBalance}</p><p className="text-xs text-slate-400">You owe them</p></div>;
  }
  return <div className="text-right"><p className="text-lg font-semibold text-slate-300">{formattedBalance}</p><p className="text-xs text-slate-400">Settled up</p></div>;
};

const PeopleList: React.FC<PeopleListProps> = ({ people, onSelectPerson, onDeletePerson, onConvertToFriend }) => {
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, person: Person) => {
    e.stopPropagation(); // Prevent onSelectPerson from firing
    setPersonToDelete(person);
  };

  const confirmDelete = () => {
    if (personToDelete) {
      onDeletePerson(personToDelete.id);
      setPersonToDelete(null);
    }
  };

  if (people.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-slate-800/50 ring-1 ring-slate-700 rounded-lg">
        <h3 className="text-lg font-medium text-white">No one to track yet!</h3>
        <p className="mt-1 text-sm text-slate-400">Tap the button below to add a person and start tracking IOUs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">Everyone</h2>
      {people.map(person => {
        const balance = calculateBalance(person);
        return (
          <div
            key={person.id}
            className="group bg-slate-800/50 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ring-1 ring-slate-700 hover:ring-amber-500 hover:scale-[1.02] focus-within:ring-amber-500"
          >
            <div 
                className="p-5 flex justify-between items-center cursor-pointer"
                onClick={() => onSelectPerson(person.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && onSelectPerson(person.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-white flex items-center gap-2">
                  {person.name}
                  {person.isFriend && (
                    <span className="inline-flex items-center gap-1 text-amber-400 text-xs bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Friend
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-400">{person.transactions.length} transaction(s)</p>
              </div>
              <div className="flex items-center gap-4">
                <BalanceDisplay balance={balance} />
                {!person.isFriend && onConvertToFriend && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onConvertToFriend(person); }}
                    className="px-2 py-1 rounded text-xs bg-amber-600/20 text-amber-400 hover:bg-amber-600/30"
                  >Add as Friend</button>
                )}
                <button
                  onClick={(e) => handleDeleteClick(e, person)}
                  className="p-2 rounded-full text-slate-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-rose-500/10 hover:text-rose-400 focus:opacity-100 focus:text-rose-400 transition-opacity"
                  aria-label={`Delete ${person.name}`}
                >
                  <TrashIcon className="w-5 h-5"/>
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <ConfirmationModal
        isOpen={!!personToDelete}
        onClose={() => setPersonToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Person"
        message={`Are you sure you want to delete ${personToDelete?.name}? All associated transactions will be permanently removed. This action cannot be undone.`}
      />
    </div>
  );
};

export default PeopleList;