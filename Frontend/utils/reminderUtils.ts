import { Person, TransactionType } from '../types';

export interface ReminderData {
  personName: string;
  totalAmount: number;
  transactionCount: number;
  oldestDate: string;
}

/**
 * Calculate the total amount owed by analyzing transactions
 */
export const calculateAmountOwed = (person: Person): number => {
  return person.transactions.reduce((acc, tx) => {
    return tx.type === TransactionType.I_PAID ? acc + tx.amount : acc - tx.amount;
  }, 0);
};

/**
 * Get reminder data for a person
 */
export const getReminderData = (person: Person): ReminderData | null => {
  const totalAmount = calculateAmountOwed(person);
  
  // Only create reminder if they owe you money
  if (totalAmount <= 0) {
    return null;
  }

  // Get transactions where they owe you
  const owedTransactions = person.transactions.filter(
    tx => tx.type === TransactionType.I_PAID
  );

  if (owedTransactions.length === 0) {
    return null;
  }

  // Find oldest unpaid transaction
  const sortedTransactions = [...owedTransactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    personName: person.name,
    totalAmount,
    transactionCount: owedTransactions.length,
    oldestDate: sortedTransactions[0]?.date || new Date().toISOString(),
  };
};

/**
 * Generate reminder message text
 */
export const generateReminderMessage = (data: ReminderData): string => {
  const formattedAmount = data.totalAmount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  const oldestDate = new Date(data.oldestDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const transactionText = data.transactionCount === 1 
    ? '1 transaction' 
    : `${data.transactionCount} transactions`;

  return `Hi ${data.personName}! 👋

This is a friendly reminder about the pending payment.

💰 *Total Amount to Pay:* ${formattedAmount}
📝 *Number of Transactions:* ${transactionText}
📅 *Oldest Transaction:* ${oldestDate}

Please settle the amount when convenient. Thanks! 🙏

_Sent via Hisab Kitab_`;
};

/**
 * Open WhatsApp with pre-filled reminder message
 */
export const sendWhatsAppReminder = (phoneNumber: string, message: string): void => {
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // WhatsApp URL scheme
  // For web: https://wa.me/PHONE?text=MESSAGE
  // For app: whatsapp://send?phone=PHONE&text=MESSAGE
  
  // Try app first, fallback to web
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};

/**
 * Open SMS app with pre-filled reminder message
 */
export const sendSMSReminder = (phoneNumber: string, message: string): void => {
  // Clean phone number
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // SMS URL scheme
  const smsUrl = `sms:${cleanPhone}?body=${encodedMessage}`;
  
  window.open(smsUrl, '_blank');
};

/**
 * Copy reminder message to clipboard
 */
export const copyReminderToClipboard = async (message: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Check if Web Share API with files is supported
 */
export const isShareWithFilesSupported = (): boolean => {
  return navigator.share !== undefined && navigator.canShare !== undefined;
};

/**
 * Share reminder message with PDF attachment using Web Share API
 */
export const shareWithPDF = async (
  message: string,
  pdfBlob: Blob,
  filename: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!navigator.share) {
      return { success: false, error: 'Share API not supported on this device' };
    }

    const file = new File([pdfBlob], filename, { type: 'application/pdf' });
    
    // Check if sharing files is supported
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      return { success: false, error: 'Sharing PDF files is not supported on this device' };
    }

    await navigator.share({
      title: 'Payment Reminder',
      text: message,
      files: [file],
    });

    return { success: true };
  } catch (error: any) {
    // User cancelled the share
    if (error.name === 'AbortError') {
      return { success: false, error: 'Share cancelled' };
    }
    console.error('Failed to share:', error);
    return { success: false, error: error.message || 'Failed to share' };
  }
};

/**
 * Open email client with reminder and PDF attachment
 * Note: Email attachments via mailto: are not supported by most browsers
 * This will just open email with the message, user needs to attach PDF manually
 */
export const sendEmailReminder = (email: string, message: string, subject: string = 'Payment Reminder'): void => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(message + '\n\n[Please attach the PDF that was downloaded]');
  
  const mailtoUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
  window.open(mailtoUrl, '_blank');
};
