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

// Full-screen loading overlay with enhanced animation
const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading…' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-6 animate-fade-in">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-primary-200/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 border-r-accent-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent-400 border-l-primary-400 animate-spin animate-reverse"></div>
      </div>
      <p className="text-slate-200 text-sm tracking-wider font-medium">{message}</p>
    </div>
  </div>
);

// Enhanced Modal Component
const AddPersonModal: React.FC<{
  onAddPerson: (name: string) => void;
  onClose: () => void;
}> = ({ onAddPerson, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="card-gradient rounded-2xl shadow-2xl w-full max-w-md border border-white/10 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Add New Person</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
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
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [friendQuery, setFriendQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setSelectedPersonId(null);
    const load = async () => {
      if (currentUser?.token) {
        setLoadingPeople(true);
        setGlobalError(null);
        try {
          const list = await api.getPeople();
          setPeople(list);
          const reqs = await api.getFriendRequests();
          setIncomingRequests(reqs.incoming);
          setOutgoingRequests(reqs.outgoing);
          const notifs = await api.getNotifications();
          setNotifications(notifs);
        } catch (err: any) {
          setGlobalError(err?.message || 'Failed to load data');
        } finally {
          setLoadingPeople(false);
        }
      } else {
        setPeople([]);
        setIncomingRequests([]);
        setOutgoingRequests([]);
        setNotifications([]);
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

  const openProfile = async () => {
    try {
      const me = await api.getMe();
      setProfileName(me.name || '');
      setProfilePhotoUrl(me.photoUrl || '');
      setIsProfileOpen(true);
    } catch (e) {
      setProfileName(currentUser?.name || '');
      setProfilePhotoUrl(currentUser?.photoUrl || '');
      setIsProfileOpen(true);
    }
  };

  const saveProfile = async () => {
    try {
      const updated = await api.updateProfile(profileName, profilePhotoUrl || null);
      setCurrentUser(prev => prev ? { ...prev, name: updated.name, photoUrl: updated.photoUrl || undefined } : prev);
      setIsProfileOpen(false);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to update profile');
    }
  };

  const respondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setGlobalError(null);
      await api.respondFriendRequest(requestId, action);
      const [reqs, peopleList] = await Promise.all([api.getFriendRequests(), api.getPeople()]);
      setIncomingRequests(reqs.incoming);
      setOutgoingRequests(reqs.outgoing);
      setPeople(peopleList);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to respond');
    }
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
    <div className="min-h-screen gradient-bg text-slate-200 font-sans">
      <Header 
        userName={currentUser.name} 
        onLogout={handleLogout} 
        onOpenNotifications={() => setShowNotifications(v => !v)} 
        unreadCount={notifications.filter(n => !n.read).length} 
      />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loadingPeople && <LoadingScreen message="Loading your data" />}
        
        {globalError && (
          <div className="mb-6 card-gradient border border-danger-500/20 rounded-xl p-4 flex justify-between items-start animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-danger-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-danger-200 font-medium">{globalError}</span>
            </div>
            <button 
              onClick={() => setGlobalError(null)} 
              className="text-danger-300/80 hover:text-danger-200 transition-colors p-1 rounded-lg hover:bg-danger-500/10"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
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
          <div className="space-y-8">
            {/* Friends Section */}
            <div data-section="friends" className="card-gradient border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 sm:p-8 border-b border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <svg className="h-8 w-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Find Friends
                </h3>
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name or email address..."
                      value={friendQuery}
                      onChange={(e) => setFriendQuery(e.target.value)}
                      className="w-full bg-slate-800/70 border border-slate-600/50 text-white rounded-xl pl-12 pr-32 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all backdrop-blur-sm placeholder-slate-400"
                    />
                    <button
                      onClick={async () => {
                        try {
                          setSearchLoading(true);
                          const query = friendQuery.trim();
                          if (!query) return;
                          
                          const results = await api.searchUsersByName(query);
                          setSearchResults(results);
                        } catch (e: any) {
                          setGlobalError(e?.message || 'Search failed');
                          setSearchResults([]);
                        } finally {
                          setSearchLoading(false);
                        }
                      }}
                      disabled={!friendQuery.trim() || searchLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                    >
                      {searchLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Searching...
                        </div>
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>

                  {searchLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="relative">
                        <div className="h-10 w-10 border-4 border-slate-600/30 rounded-full"></div>
                        <div className="absolute top-0 left-0 h-10 w-10 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
                      </div>
                    </div>
                  )}

                  {(!searchLoading && searchResults.length > 0) && (
                    <div className="bg-slate-900/40 rounded-xl overflow-hidden border border-white/5 backdrop-blur-sm">
                      <ul className="divide-y divide-white/5">
                        {searchResults.map(u => (
                          <li key={u.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                            <div className="flex items-center space-x-4 min-w-0">
                              <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-lg border-2 border-primary-500/20">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-semibold truncate">{u.name}</p>
                                <p className="text-slate-400 text-sm truncate">{u.email}</p>
                              </div>
                            </div>
                            <button 
                              onClick={async () => {
                                try {
                                  await api.sendFriendRequest(u.email);
                                  const reqs = await api.getFriendRequests();
                                  setIncomingRequests(reqs.incoming);
                                  setOutgoingRequests(reqs.outgoing);
                                } catch (e: any) {
                                  setGlobalError(e?.message || 'Failed to send request');
                                }
                              }}
                              className="ml-4 flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 transition-all border border-primary-500/20 font-medium hover:scale-105"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                              </svg>
                              <span className="hidden sm:inline">Send Request</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(!searchLoading && searchResults.length === 0 && friendQuery) && (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
                        <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-400">No users found matching "{friendQuery}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Friend Requests */}
              {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
                <div className="border-t border-white/10">
                  <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-success-400"></span>
                        Incoming Requests
                      </h4>
                      {incomingRequests.length === 0 ? (
                        <p className="text-slate-400 text-sm">No incoming requests</p>
                      ) : (
                        <ul className="space-y-3">
                          {incomingRequests.map((r) => (
                            <li key={r._id} className="flex items-center justify-between bg-slate-900/30 rounded-xl p-4 border border-white/5">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-success-500 to-primary-500 flex items-center justify-center text-white font-semibold">
                                  {typeof r.fromUser === 'object' ? r.fromUser.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{typeof r.fromUser === 'object' ? r.fromUser.name : ''}</p>
                                  <p className="text-slate-400 text-sm">{typeof r.fromUser === 'object' ? r.fromUser.email : ''}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => respondToRequest(r._id, 'accept')} 
                                  className="px-3 py-1.5 rounded-lg bg-success-600/20 text-success-400 hover:bg-success-600/30 transition-colors border border-success-500/20 font-medium"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => respondToRequest(r._id, 'decline')} 
                                  className="px-3 py-1.5 rounded-lg bg-danger-600/20 text-danger-400 hover:bg-danger-600/30 transition-colors border border-danger-500/20 font-medium"
                                >
                                  Decline
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent-400"></span>
                        Outgoing Requests
                      </h4>
                      {outgoingRequests.length === 0 ? (
                        <p className="text-slate-400 text-sm">No outgoing requests</p>
                      ) : (
                        <ul className="space-y-3">
                          {outgoingRequests.map((r) => (
                            <li key={r._id} className="flex items-center justify-between bg-slate-900/30 rounded-xl p-4 border border-white/5">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center text-white font-semibold">
                                  {typeof r.toUser === 'object' ? r.toUser.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{typeof r.toUser === 'object' ? r.toUser.name : ''}</p>
                                  <p className="text-slate-400 text-sm">{typeof r.toUser === 'object' ? r.toUser.email : ''}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-accent-400 text-sm font-medium">Pending</span>
                                <button 
                                  onClick={async () => {
                                    try {
                                      await api.cancelFriendRequest(r._id);
                                      const reqs = await api.getFriendRequests();
                                      setOutgoingRequests(reqs.outgoing);
                                      setIncomingRequests(reqs.incoming);
                                    } catch (e: any) {
                                      setGlobalError(e?.message || 'Failed to cancel request');
                                    }
                                  }} 
                                  className="px-3 py-1.5 rounded-lg bg-danger-600/20 text-danger-400 hover:bg-danger-600/30 transition-colors border border-danger-500/20 font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* People List */}
            <PeopleList 
              people={people} 
              onSelectPerson={setSelectedPersonId}
              onDeletePerson={deletePerson}
              onConvertToFriend={async (p) => {
                const email = window.prompt(`Enter ${p.name}'s email to send a friend request`);
                if (!email) return;
                try {
                  await api.sendFriendRequest(email.trim(), p.id);
                  const reqs = await api.getFriendRequests();
                  setIncomingRequests(reqs.incoming);
                  setOutgoingRequests(reqs.outgoing);
                } catch (err: any) {
                  setGlobalError(err?.message || 'Failed to send request');
                }
              }}
            />

            {/* Enhanced FAB */}
            <div className="fixed bottom-6 right-6 z-40">
              <div className="relative">
                <button
                  onClick={() => setIsFabMenuOpen(v => !v)}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-500/30 border border-primary-500/20"
                  aria-label="Actions"
                >
                  <div className={`transition-transform duration-200 ${isFabMenuOpen ? 'rotate-45' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </button>
                
                {isFabMenuOpen && (
                  <div className="absolute bottom-16 right-0 card-gradient rounded-2xl shadow-2xl p-3 w-64 border border-white/10 animate-slide-up">
                    <button 
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 text-white font-medium transition-colors flex items-center gap-3 group" 
                      onClick={() => { setIsAddPersonModalOpen(true); setIsFabMenuOpen(false); }}
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                        <svg className="h-5 w-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span>Add Person</span>
                    </button>
                    <button 
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 text-white font-medium transition-colors flex items-center gap-3 group" 
                      onClick={() => { setIsFabMenuOpen(false); const el = document.querySelector('[data-section="friends"]'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                    >
                      <div className="h-8 w-8 rounded-lg bg-accent-500/20 flex items-center justify-center group-hover:bg-accent-500/30 transition-colors">
                        <svg className="h-5 w-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <span>Add Friend</span>
                    </button>
                    <button 
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 text-white font-medium transition-colors flex items-center gap-3 group" 
                      onClick={() => { setIsFabMenuOpen(false); openProfile(); }}
                    >
<div className="h-8 w-8 rounded-lg bg-success-500/20 flex items-center justify-center group-hover:bg-success-500/30 transition-colors">
                        <svg className="h-5 w-5 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span>Edit Profile</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isAddPersonModalOpen && (
              <AddPersonModal 
                onAddPerson={handleAddPerson} 
                onClose={() => setIsAddPersonModalOpen(false)}
              />
            )}
          </div>
        )}
      </main>

      {/* Enhanced Notifications */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowNotifications(false)}>
          <div className="absolute right-4 top-20 w-96 max-w-[90vw] card-gradient rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h4 className="text-white font-semibold text-lg">Notifications</h4>
              <div className="flex items-center gap-3">
                <button 
                  className="text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors" 
                  onClick={async () => { 
                    await api.markNotificationsRead(); 
                    const list = await api.getNotifications(); 
                    setNotifications(list); 
                  }}
                >
                  Mark all read
                </button>
                <button 
                  className="text-danger-400 hover:text-danger-300 font-medium text-sm transition-colors" 
                  onClick={async () => { 
                    await api.clearNotifications(); 
                    setNotifications([]); 
                  }}
                >
                  Clear all
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 0110.5-10.5H18" />
                    </svg>
                  </div>
                  <p className="text-slate-400">No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {notifications.map(n => (
                    <li key={n._id} className={`p-4 transition-colors ${n.read ? 'bg-slate-800/20' : 'bg-primary-600/10'}`}>
                      <div className="flex items-start space-x-3">
                        <div className={`h-2 w-2 rounded-full mt-2 ${n.read ? 'bg-slate-500' : 'bg-primary-400'}`}></div>
                        <div className="flex-1">
                          <p className="text-slate-200 font-medium">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Profile Modal */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4"
          onClick={() => setIsProfileOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div className="card-gradient rounded-2xl shadow-2xl w-full max-w-md border border-white/10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
              <button 
                onClick={() => setIsProfileOpen(false)} 
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10" 
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-slate-300 mb-2 font-medium">Name</label>
                <input 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2 font-medium">Photo URL</label>
                <input 
                  value={profilePhotoUrl} 
                  onChange={(e) => setProfilePhotoUrl(e.target.value)} 
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" 
                  placeholder="https://example.com/photo.jpg" 
                />
                <p className="text-xs text-slate-400 mt-2">Paste a public image URL</p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsProfileOpen(false)} 
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-700/50 text-slate-200 hover:bg-slate-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveProfile} 
                    className="flex-1 px-4 py-3 rounded-xl button-gradient text-white hover:shadow-lg transition-all font-medium"
                  >
                    Save Changes
                  </button>
                </div>
                <button 
                  onClick={async () => {
                    if (!window.confirm('This will permanently delete your account and all data. This action cannot be undone. Continue?')) return;
                    try {
                      await api.deleteAccount();
                      setCurrentUser(null);
                    } catch (e: any) {
                      setGlobalError(e?.message || 'Failed to delete account');
                    }
                  }} 
                  className="w-full px-4 py-3 rounded-xl bg-danger-700/50 text-danger-200 hover:bg-danger-700 transition-colors font-medium border border-danger-600/30"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;