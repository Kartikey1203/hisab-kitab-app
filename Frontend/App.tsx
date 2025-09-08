import React, { useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Person, NewTransaction, User, TransactionType } from './types';
import Header from './components/Header';
import PeopleList from './components/PeopleList';
import AddPersonForm from './components/AddPersonForm';
import PersonDetail from './components/PersonDetail';
import AuthPage from './components/AuthPage';
import { UserPlusIcon, CloseIcon } from './components/icons';
import { api } from './api';

// Modal Component for adding a new person
const AddPersonModal: React.FC<{
  onAddPerson: (name: string) => void;
  onClose: () => void;
}> = ({ onAddPerson, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-sm m-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Add a New Person</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-6">
          <AddPersonForm onAddPerson={onAddPerson} />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('hisab-kitab-user', null);
  const [people, setPeople] = useLocalStorage<Person[]>(`hisab-kitab-people-${currentUser?.id || ''}`, []);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loadingPeople, setLoadingPeople] = useState(false);

  useEffect(() => {
    // When currentUser changes, reset the selected person and load people
    setSelectedPersonId(null);
    const load = async () => {
      if (currentUser?.token) {
        setLoadingPeople(true);
        setGlobalError(null);
        try {
          const list = await api.getPeople();
          setPeople(list);
        } catch (err: any) {
          setGlobalError(err?.message || 'Failed to load data');
        } finally {
          setLoadingPeople(false);
        }
      } else {
        setPeople([]);
      }
    };
    void load();
  }, [currentUser, setPeople]);

  const handleLogin = async (email: string, pass: string) => {
    setGlobalError(null);
    const u = await api.login(email, pass);
    const user: User = { id: u.id, name: u.name, email: u.email, token: u.token };
    setCurrentUser(user);
  };

  const handleSignUp = async (name: string, email: string, pass: string) => {
    setGlobalError(null);
    const u = await api.register(name, email, pass);
    const user: User = { id: u.id, name: u.name, email: u.email, token: u.token };
    setCurrentUser(user);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };

  const addPerson = async (name: string) => {
    try {
      setGlobalError(null);
      const newPerson = await api.addPerson(name);
      setPeople(prevPeople => [...prevPeople, newPerson].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to add person');
    }
  };

  const deletePerson = async (personId: string) => {
    try {
      setGlobalError(null);
      await api.deletePerson(personId);
      setPeople(prevPeople => prevPeople.filter(p => p.id !== personId));
      if (selectedPersonId === personId) {
        setSelectedPersonId(null);
      }
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to delete person');
    }
  };

  const handleAddPerson = (name: string) => {
    addPerson(name);
    setIsAddPersonModalOpen(false);
  };

  const addTransaction = async (personId: string, transaction: NewTransaction) => {
    try {
      setGlobalError(null);
      const created = await api.addTransaction(personId, transaction);
      setPeople(prevPeople =>
        prevPeople.map(p =>
          p.id === personId
            ? {
                ...p,
                transactions: [
                  ...p.transactions,
                  created,
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
              }
            : p
        )
      );
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to add transaction');
    }
  };
  
  const updateTransaction = async (personId: string, transactionId: string, updatedTransaction: NewTransaction) => {
    try {
      setGlobalError(null);
      const updated = await api.updateTransaction(transactionId, updatedTransaction);
      setPeople(prevPeople =>
        prevPeople.map(p =>
          p.id === personId
            ? {
                ...p,
                transactions: p.transactions.map(tx => (tx.id === transactionId ? updated : tx)),
              }
            : p
        )
      );
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to update transaction');
    }
  };

  const deleteTransaction = async (personId: string, transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        setGlobalError(null);
        await api.deleteTransaction(transactionId);
        setPeople(prevPeople =>
          prevPeople.map(p =>
            p.id === personId
              ? {
                  ...p,
                  transactions: p.transactions.filter(tx => tx.id !== transactionId),
                }
              : p
          )
        );
      } catch (err: any) {
        setGlobalError(err?.message || 'Failed to delete transaction');
      }
    }
  };

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  const selectedPerson = people.find(p => p.id === selectedPersonId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Header userName={currentUser.name} onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {globalError && (
          <div className="mb-4 bg-rose-500/10 text-rose-300 border border-rose-700 rounded-md p-3 flex justify-between items-start">
            <span className="pr-4">{globalError}</span>
            <button onClick={() => setGlobalError(null)} className="text-rose-300/80 hover:text-rose-200">Dismiss</button>
          </div>
        )}
        {loadingPeople && (
          <div className="mb-4 bg-slate-800/50 ring-1 ring-slate-700 rounded-md p-3 text-slate-300">Loading data…</div>
        )}
        {selectedPerson ? (
          <PersonDetail
            person={selectedPerson}
            onBack={() => setSelectedPersonId(null)}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        ) : (
          <div>
            <PeopleList 
                people={people} 
                onSelectPerson={setSelectedPersonId}
                onDeletePerson={deletePerson}
            />
            <button
                onClick={() => setIsAddPersonModalOpen(true)}
                className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                aria-label="Add new person"
            >
                <UserPlusIcon className="h-8 w-8" />
            </button>
            {isAddPersonModalOpen && (
                <AddPersonModal 
                    onAddPerson={handleAddPerson} 
                    onClose={() => setIsAddPersonModalOpen(false)}
                />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;