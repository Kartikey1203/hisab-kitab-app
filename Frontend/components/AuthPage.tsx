import React, { useState } from 'react';
import { UserIcon, LockClosedIcon, EnvelopeIcon } from './icons';

interface AuthPageProps {
  onLogin: (email: string, pass: string) => Promise<void> | void;
  onSignUp: (name: string, email: string, pass: string) => Promise<void> | void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignUp }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLoginView) {
        await onLogin(email, password);
      } else {
        await onSignUp(name, email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-slate-800 p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
          <h1 className="text-4xl font-bold text-white">Welcome to Hisab Kitab</h1>
          <p className="text-slate-400 mt-2">{isLoginView ? 'Sign in to continue' : 'Create an account to get started'}</p>
        </div>

        <div className="bg-slate-900 ring-1 ring-white/10 shadow-2xl rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 text-rose-300 border border-rose-700 rounded-md p-3 text-sm">
                {error}
              </div>
            )}
            {!isLoginView && (
              <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-md pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                    disabled={loading}
                    />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-md pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                disabled={loading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-md pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-md hover:bg-amber-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {loading ? (isLoginView ? 'Signing in…' : 'Creating account…') : (isLoginView ? 'Login' : 'Sign Up')}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-6">
            {isLoginView ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="font-semibold text-amber-500 hover:text-amber-400 ml-2"
            >
              {isLoginView ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
        <p className="text-center text-xs text-slate-600 mt-8">
            Note: This is a demo. User data is stored in your browser's local storage.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
