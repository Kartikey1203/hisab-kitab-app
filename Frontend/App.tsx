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
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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
      // ignore, rely on currentUser fallback
      setProfileName(currentUser?.name || '');
      setProfilePhotoUrl(currentUser?.photoUrl || '');
      setIsProfileOpen(true);
    }
  };

  const saveProfile = async () => {
    try {
      const updated = await api.updateProfile(profileName, profilePhotoUrl || null);
      // update local user cache
      setCurrentUser(prev => prev ? { ...prev, name: updated.name, photoUrl: updated.photoUrl || undefined } : prev);
      setIsProfileOpen(false);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to update profile');
    }
  };

  const sendFriendRequest = async () => {
    try {
      setGlobalError(null);
      if (!friendEmail.trim()) return;
      await api.sendFriendRequest(friendEmail.trim());
      const reqs = await api.getFriendRequests();
      setIncomingRequests(reqs.incoming);
      setOutgoingRequests(reqs.outgoing);
      setFriendEmail('');
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to send request');
    }
  };

  const respondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setGlobalError(null);
      await api.respondFriendRequest(requestId, action);
      // Refresh both requests and people as accepting may add a linked person
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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Header userName={currentUser.name} onLogout={handleLogout} onOpenNotifications={() => setShowNotifications(v => !v)} unreadCount={notifications.filter(n => !n.read).length} />
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
            <div id="friend-section" className="mt-8 bg-slate-800/50 ring-1 ring-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Add a friend by email</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="friend@example.com"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={sendFriendRequest}
                  className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                >Send</button>
              </div>
              {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Incoming</h4>
                    <ul className="space-y-2">
                      {incomingRequests.map((r) => (
                        <li key={r._id} className="flex items-center justify-between bg-slate-900/50 rounded px-3 py-2">
                          <span className="text-slate-200">{typeof r.fromUser === 'object' ? r.fromUser.email : ''}</span>
                          <div className="flex gap-2">
                            <button onClick={() => respondToRequest(r._id, 'accept')} className="text-emerald-400 hover:text-emerald-300">Accept</button>
                            <button onClick={() => respondToRequest(r._id, 'decline')} className="text-rose-400 hover:text-rose-300">Decline</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Outgoing</h4>
                    <ul className="space-y-2">
                      {outgoingRequests.map((r) => (
                        <li key={r._id} className="flex items-center justify-between bg-slate-900/50 rounded px-3 py-2">
                          <span className="text-slate-200">{typeof r.toUser === 'object' ? r.toUser.email : ''}</span>
                          <span className="text-slate-400 text-sm">Pending</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="fixed bottom-6 right-6">
              <div className="relative">
                <button
                  onClick={() => setIsFabMenuOpen(v => !v)}
                  className="bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                  aria-label="Actions"
                >
                  <UserPlusIcon className="h-8 w-8" />
                </button>
                {isFabMenuOpen && (
                  <div className="absolute bottom-16 right-0 bg-slate-800 ring-1 ring-slate-700 rounded-lg shadow-xl p-2 w-56">
                    <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200" onClick={() => { setIsAddPersonModalOpen(true); setIsFabMenuOpen(false); }}>Add Person</button>
                    <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200" onClick={() => { setIsFabMenuOpen(false); const el = document.querySelector('#friend-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Add Friend</button>
                    <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 text-slate-200" onClick={() => { setIsFabMenuOpen(false); openProfile(); }}>Edit Profile</button>
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

      {showNotifications && (
        <div className="fixed inset-0 bg-black/40" onClick={() => setShowNotifications(false)}>
          <div className="absolute right-6 top-20 w-96 bg-slate-800 ring-1 ring-slate-700 rounded-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-slate-700">
              <h4 className="text-white font-semibold">Notifications</h4>
              <button className="text-amber-400 hover:text-amber-300" onClick={async () => { await api.markNotificationsRead(); const list = await api.getNotifications(); setNotifications(list); }}>Mark all read</button>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-slate-400">No notifications</div>
              ) : (
                <ul className="divide-y divide-slate-700">
                  {notifications.map(n => (
                    <li key={n._id} className={`p-3 ${n.read ? 'bg-slate-800' : 'bg-slate-800/70'}`}>
                      <p className="text-slate-200">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setIsProfileOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-sm m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
                <CloseIcon />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Name</label>
                <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Photo URL</label>
                <input value={profilePhotoUrl} onChange={(e) => setProfilePhotoUrl(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="https://..." />
                <p className="text-xs text-slate-400 mt-1">Paste a public image URL for now.</p>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsProfileOpen(false)} className="px-4 py-2 rounded bg-slate-700 text-slate-200">Cancel</button>
                <button onClick={saveProfile} className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;