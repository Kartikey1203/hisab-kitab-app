import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Person, Transaction, TransactionType } from '../types';

/**
 * Format currency amount for PDF (avoiding locale-specific issues)
 */
const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toFixed(2)}`;
};

/**
 * Generate a PDF with transaction history for a person
 */
export const generateTransactionHistoryPDF = (person: Person, totalBalance: number): Blob => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Transaction History', 14, 20);
  
  // Person details
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('Name: ' + person.name, 14, 32);
  if (person.nickname) {
    doc.text('Nickname: ' + person.nickname, 14, 40);
  }
  if (person.phoneNumber) {
    doc.text('Phone: ' + person.phoneNumber, 14, person.nickname ? 48 : 40);
  }
  
  // Balance summary
  const yPos = person.nickname ? (person.phoneNumber ? 58 : 50) : (person.phoneNumber ? 50 : 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  
  if (totalBalance > 0) {
    doc.setTextColor(16, 185, 129); // Green
    doc.text('Total Amount Owed: ' + formatCurrency(totalBalance), 14, yPos);
  } else if (totalBalance < 0) {
    doc.setTextColor(239, 68, 68); // Red
    doc.text('You Owe: ' + formatCurrency(Math.abs(totalBalance)), 14, yPos);
  } else {
    doc.setTextColor(100, 100, 100);
    doc.text('Settled Up', 14, yPos);
  }
  
  // Transaction table
  const tableStartY = yPos + 10;
  
  if (person.transactions.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('No transactions yet', 14, tableStartY);
  } else {
    // Sort transactions by date (newest first)
    const sortedTransactions = [...person.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Prepare table data
    const tableData = sortedTransactions.map((tx: Transaction) => {
      const date = new Date(tx.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      const type = tx.type === TransactionType.I_PAID ? 'You Paid' : 'They Paid';
      const amount = formatCurrency(tx.amount);
      
      return [date, tx.purpose, type, amount];
    });
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['Date', 'Description', 'Type', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [251, 191, 36], // Amber
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'left' }, // Date
        1: { cellWidth: 65, halign: 'left' }, // Description
        2: { cellWidth: 35, halign: 'center' }, // Type
        3: { cellWidth: 40, halign: 'right' }, // Amount
      },
      margin: { top: 10, left: 14, right: 14 },
      styles: {
        font: 'helvetica',
        fontStyle: 'normal',
      },
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    const currentDate = new Date().toLocaleDateString('en-GB');
    const footerText = 'Generated on ' + currentDate + ' | Page ' + i + ' of ' + pageCount;
    doc.text(footerText, doc.internal.pageSize.getWidth() / 2, footerY, { align: 'center' });
    doc.text('Hisab Kitab', 14, footerY);
  }
  
  // Return as Blob with explicit PDF MIME type
  return doc.output('blob');
};

/**
 * Download PDF file
 */
export const downloadPDF = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Open PDF in new tab for preview
 */
export const previewPDF = (blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

/**
 * Generate filename for PDF
 */
export const generatePDFFilename = (personName: string): string => {
  const sanitizedName = personName.replace(/[^a-z0-9]/gi, '_');
  const date = new Date().toISOString().split('T')[0];
  return `Transaction_History_${sanitizedName}_${date}.pdf`;
};
