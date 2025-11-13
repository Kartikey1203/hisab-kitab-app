import React, { useState, useEffect, useRef } from 'react';
import { Person, TransactionType, NewTransaction } from '../types';
import VoiceCommandHelp from './VoiceCommandHelp';

interface VoiceCommandButtonProps {
  people: Person[];
  onAddTransaction: (personId: string, transaction: NewTransaction) => void;
  onBulkTransaction?: (personIds: string[], transaction: NewTransaction) => void;
}

interface ParsedCommand {
  amount?: number;
  description?: string;
  personNames?: string[];
  type?: TransactionType;
}

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({ 
  people, 
  onAddTransaction,
  onBulkTransaction 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Voice commands not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // English only
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setSuccess(null);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        processCommand(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      } else {
        setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []); // Initialize once

  const parseCommand = (command: string): ParsedCommand | null => {
    const lowerCommand = command.toLowerCase();
    const result: ParsedCommand = {};

    // Extract amount
    const amountPatterns = [
      /(?:rupees?|rs\.?|₹)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rupees?|rs\.?|₹)/i,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    ];

    for (const pattern of amountPatterns) {
      const match = lowerCommand.match(pattern);
      if (match) {
        const amountStr = match[1].replace(/,/g, '');
        result.amount = parseFloat(amountStr);
        break;
      }
    }

    // Determine transaction type
    const iPaidKeywords = ['i paid', 'i gave', 'i spent', 'i lent', 'lent to', 'gave to'];
    const theyPaidKeywords = ['they paid', 'he paid', 'she paid', 'borrowed from', 'took from', 'received from'];
    
    if (iPaidKeywords.some(keyword => lowerCommand.includes(keyword))) {
      result.type = TransactionType.I_PAID;
    } else if (theyPaidKeywords.some(keyword => lowerCommand.includes(keyword))) {
      result.type = TransactionType.THEY_PAID;
    } else {
      // Default to I_PAID for "add expense" type commands
      result.type = TransactionType.I_PAID;
    }

    // Extract person names with fuzzy matching
    const foundPeople: string[] = [];
    
    // Helper function to calculate string similarity
    const similarity = (s1: string, s2: string): number => {
      const longer = s1.length > s2.length ? s1 : s2;
      const shorter = s1.length > s2.length ? s2 : s1;
      
      if (longer.length === 0) return 1.0;
      if (longer.includes(shorter)) return 0.8;
      
      // Check word-by-word matching for multi-word names
      const words1 = s1.split(/\s+/);
      const words2 = s2.split(/\s+/);
      
      let matches = 0;
      words1.forEach(w1 => {
        words2.forEach(w2 => {
          if (w1.length > 2 && w2.length > 2) {
            if (w1.includes(w2) || w2.includes(w1)) matches++;
          }
        });
      });
      
      if (matches > 0) return matches / Math.max(words1.length, words2.length);
      return 0;
    };

    people.forEach(person => {
      const nameLower = person.name.toLowerCase();
      const nickname = person.nickname ? person.nickname.toLowerCase() : '';
      
      // Direct match
      if (lowerCommand.includes(nameLower)) {
        if (!foundPeople.includes(person.id)) {
          foundPeople.push(person.id);
        }
      } else if (nickname && lowerCommand.includes(nickname)) {
        if (!foundPeople.includes(person.id)) {
          foundPeople.push(person.id);
        }
      } else {
        // Fuzzy match for name variations
        const nameWords = nameLower.split(/\s+/);
        const commandWords = lowerCommand.split(/\s+/);
        
        let maxSimilarity = 0;
        nameWords.forEach(nameWord => {
          if (nameWord.length > 2) {
            commandWords.forEach(commandWord => {
              if (commandWord.length > 2) {
                const sim = similarity(nameWord, commandWord);
                maxSimilarity = Math.max(maxSimilarity, sim);
              }
            });
          }
        });
        
        // If similarity is high enough (70%+), consider it a match
        if (maxSimilarity >= 0.7 && !foundPeople.includes(person.id)) {
          foundPeople.push(person.id);
        }
      }
    });

    if (foundPeople.length > 0) {
      result.personNames = foundPeople;
    }

    // Extract description
    const descriptionPatterns = [
      /(?:for)\s+(.+?)(?:\s+with|\s+to|\s+from|$)/i,
      /(?:expense)\s+(?:of|for)\s+(.+?)(?:\s+with|\s+to|\s+from|$)/i,
      /(?:paid)\s+(?:for)\s+(.+?)(?:\s+with|\s+to|\s+from|$)/i,
    ];

    for (const pattern of descriptionPatterns) {
      const match = command.match(pattern);
      if (match && match[1]) {
        let desc = match[1].trim();
        // Remove amount
        desc = desc.replace(/\d+(?:,\d{3})*(?:\.\d{2})?/g, '').trim();
        desc = desc.replace(/(?:rupees?|rs\.?|₹)/gi, '').trim();
        
        if (desc.length > 0 && desc.length < 100) {
          result.description = desc;
        }
        break;
      }
    }

    // If no description found using patterns, try to extract something meaningful
    if (!result.description) {
      let desc = command;
      
      // Remove common command keywords
      const removeWords = [
        'add', 'expense', 'transaction', 'payment', 
        'for', 'with', 'to', 'from', 
        'i paid', 'they paid', 
        'rupees', 'rs'
      ];
      
      removeWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        desc = desc.replace(regex, '');
      });
      
      // Remove amount
      desc = desc.replace(/\d+(?:,\d{3})*(?:\.\d{2})?/g, '');
      desc = desc.replace(/₹/g, '');
      
      // Try to remove person names
      people.forEach(person => {
        const nameWords = person.name.toLowerCase().split(/\s+/);
        nameWords.forEach(word => {
          if (word.length > 2) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            desc = desc.replace(regex, '');
          }
        });
      });
      
      desc = desc.replace(/\s+/g, ' ').trim();
      
      if (desc.length > 0 && desc.length < 100) {
        result.description = desc;
      }
    }

    // Validation
    if (!result.amount || result.amount <= 0) {
      return null;
    }

    if (!result.personNames || result.personNames.length === 0) {
      return null;
    }

    if (!result.description || result.description.length === 0) {
      result.description = 'Voice transaction';
    }

    return result;
  };

  const processCommand = async (command: string) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const parsed = parseCommand(command);

      if (!parsed || !parsed.amount || !parsed.personNames || parsed.personNames.length === 0) {
        setError('Could not understand the command. Try: "Add 500 rupees for dinner with John"');
        setIsProcessing(false);
        return;
      }

      const transaction: NewTransaction = {
        amount: parsed.amount,
        purpose: parsed.description || 'Voice transaction',
        type: parsed.type || TransactionType.I_PAID,
      };

      if (parsed.personNames.length === 1) {
        // Single person transaction
        await onAddTransaction(parsed.personNames[0], transaction);
        const personName = people.find(p => p.id === parsed.personNames![0])?.name || 'person';
        setSuccess(`Added ₹${parsed.amount} transaction with ${personName}`);
      } else {
        // Multiple people (bulk transaction)
        if (onBulkTransaction) {
          await onBulkTransaction(parsed.personNames, transaction);
          setSuccess(`Added ₹${parsed.amount} transaction to ${parsed.personNames.length} people`);
        } else {
          // Fallback to individual transactions
          for (const personId of parsed.personNames) {
            await onAddTransaction(personId, transaction);
          }
          setSuccess(`Added ₹${parsed.amount} transaction to ${parsed.personNames.length} people`);
        }
      }

      setTimeout(() => {
        setSuccess(null);
        setTranscript('');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to add transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      setSuccess(null);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (error && error.includes('not supported')) {
    return null; // Don't show button if not supported
  }

  return (
    <div className="relative">
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute -top-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-lg transition-all z-10"
        title="Voice commands help"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Voice Command Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className={`relative p-4 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 ${
          isListening
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/30 animate-pulse'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500/30'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Voice command"
      >
        {isListening ? (
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
        
        {/* Pulsing ring when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-50"></span>
          </>
        )}
      </button>

      {/* Transcript/Status Display */}
      {(isListening || transcript || error || success || isProcessing) && (
        <div className="absolute bottom-full mb-4 right-0 w-80 max-w-[90vw]">
          <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 p-4 animate-slide-up">
            {/* Status Header */}
            <div className="flex items-center gap-2 mb-3">
              {isListening && (
                <>
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                  <span className="text-red-400 font-medium text-sm">Listening...</span>
                </>
              )}
              {isProcessing && (
                <>
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-purple-400 font-medium text-sm">Processing...</span>
                </>
              )}
            </div>

            {/* Transcript */}
            {transcript && !error && !success && (
              <div className="mb-2">
                <p className="text-slate-300 text-sm italic">"{transcript}"</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-300 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Help Text */}
            {isListening && !transcript && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-slate-400 text-xs">
                  Try: "Add 500 rupees for dinner with John"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && <VoiceCommandHelp onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default VoiceCommandButton;