import React, { useState } from 'react';

interface VoiceCommandHelpProps {
  onClose: () => void;
}

const VoiceCommandHelp: React.FC<VoiceCommandHelpProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'examples' | 'tips'>('examples');

  const examples = [
    {
      command: '"Add 500 rupees for dinner with John"',
      description: 'Basic expense transaction',
      result: '₹500 to John for "dinner"'
    },
    {
      command: '"I paid 200 for coffee with Sarah"',
      description: 'Explicit "I paid" format',
      result: '₹200 to Sarah for "coffee"'
    },
    {
      command: '"300 rupees lunch with Mike and Tom"',
      description: 'Multiple people',
      result: '₹300 to Mike and Tom for "lunch"'
    },
    {
      command: '"Add 1500 for movie tickets with Emma"',
      description: 'Longer description',
      result: '₹1500 to Emma for "movie tickets"'
    },
    {
      command: '"I gave 50 rupees to Alex for snacks"',
      description: '"I gave" format',
      result: '₹50 to Alex for "snacks"'
    },
  ];

  const tips = [
    { icon: '🎤', title: 'Speak Clearly', text: 'Use natural pace, not too fast or slow' },
    { icon: '💰', title: 'Say Amount', text: 'Use "rupees", "rs" or just the number' },
    { icon: '👤', title: 'Name Recognition', text: 'Works with fuzzy matching for name variations' },
    { icon: '📝', title: 'Add Context', text: 'Say "for [description]" to add details' },
    { icon: '✅', title: 'Review Before Save', text: 'Always check the parsed transaction' },
    { icon: '🔁', title: 'Try Again', text: 'If it fails, rephrase and retry' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="card-gradient rounded-2xl shadow-2xl w-full max-w-2xl border border-white/10 animate-slide-up max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Voice Commands</h2>
              <p className="text-slate-400 text-sm">Add transactions hands-free</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6">
          <button
            onClick={() => setActiveTab('examples')}
            className={`py-3 px-4 font-medium transition-colors border-b-2 ${
              activeTab === 'examples'
                ? 'text-white border-purple-500'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Examples
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`py-3 px-4 font-medium transition-colors border-b-2 ${
              activeTab === 'tips'
                ? 'text-white border-purple-500'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Tips
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'examples' && (
            <div className="space-y-4">
              <p className="text-slate-300 mb-6">
                Click the 🎤 microphone button and speak naturally. Here are some examples:
              </p>
              {examples.map((example, index) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">{example.command}</p>
                      <p className="text-slate-400 text-sm mb-2">{example.description}</p>
                      <div className="bg-slate-800/50 rounded px-3 py-2 border border-slate-600/30">
                        <p className="text-green-400 text-sm">✓ {example.result}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-blue-300 text-sm">
                    <strong>Pro tip:</strong> Speak naturally in English. The system uses fuzzy matching to handle name variations and pronunciation differences.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-4">
              <p className="text-slate-300 mb-6">
                Follow these tips for best voice recognition results:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tips.map((tip, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                    <div className="text-4xl mb-2">{tip.icon}</div>
                    <h3 className="text-white font-semibold mb-1">{tip.title}</h3>
                    <p className="text-slate-400 text-sm">{tip.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="text-green-300 font-medium">Good: "500 rupees for coffee with John"</p>
                      <p className="text-green-400/70 text-sm mt-1">Clear amount, description, and person name</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">❌</span>
                    <div>
                      <p className="text-red-300 font-medium">Bad: "five hundred r tea"</p>
                      <p className="text-red-400/70 text-sm mt-1">Use numbers, say "rupees" fully, include person name</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-blue-300 text-sm">
                    <strong>Quick Tip:</strong> Speak naturally with clear pronunciation. The system uses fuzzy matching to recognize name variations.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-slate-800/30">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
          >
            Got it! Let's try
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandHelp;