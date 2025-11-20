import React from 'react';

interface BottomNavigationProps {
  activeSection: 'dashboard' | 'people' | 'personal-finance' | 'profile';
  onNavigate: (section: 'dashboard' | 'people' | 'personal-finance' | 'profile') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeSection, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <button
          onClick={() => onNavigate('people')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeSection === 'people' ? 'text-primary-400' : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </button>

        <div className="relative -top-5">
          <button
            onClick={() => onNavigate('personal-finance')}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg border-4 border-slate-900 transition-transform ${activeSection === 'personal-finance'
                ? 'bg-accent-500 text-white scale-110'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeSection === 'profile' ? 'text-primary-400' : 'text-slate-400 hover:text-slate-200'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
