import React from 'react';
import { LogoutIcon } from './icons';

interface HeaderProps {
    userName: string;
    onLogout: () => void;
    onOpenNotifications?: () => void;
    unreadCount?: number;
}

const Header: React.FC<HeaderProps> = ({ userName, onLogout, onOpenNotifications, unreadCount = 0 }) => {
  return (
    <header className="bg-slate-900 shadow-lg">
      <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold leading-tight text-white flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Hisab Kitab
        </h1>
        <div className="flex items-center gap-4">
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative text-slate-300 hover:text-amber-400 transition-colors"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v2.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6z" /><path d="M14 14a4 4 0 11-8 0h8z" /></svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
                )}
              </button>
            )}
            <span className="text-slate-300 hidden sm:block">
                Welcome, <span className="font-semibold text-white">{userName}</span>
            </span>
            <button
                onClick={onLogout}
                className="flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors"
                aria-label="Logout"
            >
                <LogoutIcon className="h-6 w-6" />
                <span className="hidden sm:block">Logout</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;