/**
 * Receipt PDF Generation Service
 * Generates PDF receipts for buyers and sellers after successful payment
 */

import { jsPDF } from 'jspdf';
import { TransactionResponse } from './transaction.service';

// StoxxFarm Company Details
const COMPANY_DETAILS = {
  name: 'StoxxFarm Agri Connect Pvt. Ltd.',
  addressLine1: '#123, 4th Floor, Tech Park',
  addressLine2: 'Whitefield, Bengaluru',
  city: 'Karnataka - 560066',
  country: 'India',
  gstin: 'GSTIN: 29AABCS1234A1ZV',
  email: 'contact@stoxxfarm.in',
  phone: '+91 999-999-8888',
  website: 'www.stoxxfarm.in',
};

// Colors
const PRIMARY_COLOR: [number, number, number] = [34, 120, 60]; // Green
const TEXT_COLOR: [number, number, number] = [50, 50, 50];
const LIGHT_GRAY: [number, number, number] = [240, 240, 240];

interface ReceiptData {
  transaction: TransactionResponse;
  buyerDetails: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  sellerDetails: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

/**
 * Format currency to Indian Rupees
 */
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date to readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Add company header to PDF
 */
const addHeader = (doc: jsPDF, receiptType: 'BUYER' | 'SELLER'): number => {
  let y = 20;

  // Company Name
  doc.setFontSize(22);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_DETAILS.name, 105, y, { align: 'center' });

  y += 8;

  // Address
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_DETAILS.addressLine1, 105, y, { align: 'center' });
  y += 5;
  doc.text(`${COMPANY_DETAILS.addressLine2}, ${COMPANY_DETAILS.city}`, 105, y, { align: 'center' });
  y += 5;
  doc.text(COMPANY_DETAILS.gstin, 105, y, { align: 'center' });
  y += 5;
  doc.text(`${COMPANY_DETAILS.email} | ${COMPANY_DETAILS.phone}`, 105, y, { align: 'center' });

  y += 12;

  // Receipt Title
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(15, y, 180, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const title = receiptType === 'BUYER' ? 'PAYMENT RECEIPT - BUYER' : 'PAYMENT RECEIPT - SELLER';
  doc.text(title, 105, y + 7, { align: 'center' });

  return y + 18;
};

/**
 * Add transaction details section
 */
const addTransactionDetails = (doc: jsPDF, y: number, transaction: TransactionResponse): number => {
  doc.setTextColor(...TEXT_COLOR);
  doc.setFontSize(10);

  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt No:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`RCP-${transaction.transaction_number}`, 50, y);

  // Right column
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 120, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(transaction.paid_at || transaction.created_at), 140, y);

  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Transaction No:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.transaction_number, 50, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Ref:', 120, y);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.payment_reference || 'N/A', 155, y);

  return y + 12;
};

/**
 * Add party details (buyer/seller info)
 */
const addPartyDetails = (
  doc: jsPDF,
  y: number,
  label: string,
  details: { name: string; email?: string; phone?: string; address?: string }
): number => {
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(15, y, 180, 7, 'F');
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(label, 17, y + 5);

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${details.name}`, 17, y);
  if (details.email) {
    y += 5;
    doc.text(`Email: ${details.email}`, 17, y);
  }
  if (details.phone) {
    y += 5;
    doc.text(`Phone: ${details.phone}`, 17, y);
  }
  if (details.address) {
    y += 5;
    doc.text(`Address: ${details.address}`, 17, y);
  }

  return y + 10;
};

/**
 * Add item details table
 */
const addItemTable = (doc: jsPDF, y: number, transaction: TransactionResponse): number => {
  // Table header
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(15, y, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  doc.text('Item Description', 17, y + 6);
  doc.text('Qty (kg)', 100, y + 6);
  doc.text('Rate/kg', 130, y + 6);
  doc.text('Amount', 170, y + 6);

  y += 12;

  // Table row
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.produce_name, 17, y);
  doc.text(transaction.quantity.toString(), 100, y);
  doc.text(formatCurrency(transaction.price_per_unit), 125, y);
  doc.text(formatCurrency(transaction.base_amount), 163, y);

  // Draw line
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);

  return y + 5;
};

/**
 * Add buyer breakdown section
 */
const addBuyerBreakdown = (doc: jsPDF, y: number, transaction: TransactionResponse): number => {
  const rightAlign = 165;

  doc.setFontSize(10);
  doc.setTextColor(...TEXT_COLOR);

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', rightAlign - 40, y);
  doc.text(formatCurrency(transaction.base_amount), rightAlign, y);

  y += 7;

  // GST
  doc.text(`GST (${transaction.buyer_gst_percentage}%):`, rightAlign - 40, y);
  doc.text(formatCurrency(transaction.buyer_gst_amount), rightAlign, y);

  y += 7;

  // Platform Fee
  doc.text(`Platform Fee (${transaction.buyer_platform_fee_pct}%):`, rightAlign - 40, y);
  doc.text(formatCurrency(transaction.buyer_platform_fee), rightAlign, y);

  y += 3;
  doc.setDrawColor(100, 100, 100);
  doc.line(rightAlign - 50, y, 195, y);

  y += 7;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Amount Paid:', rightAlign - 45, y);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(formatCurrency(transaction.buyer_total_amount), rightAlign, y);

  return y + 15;
};

/**
 * Add seller breakdown section
 */
const addSellerBreakdown = (doc: jsPDF, y: number, transaction: TransactionResponse): number => {
  const rightAlign = 165;

  doc.setFontSize(10);
  doc.setTextColor(...TEXT_COLOR);

  // Base Amount
  doc.setFont('helvetica', 'normal');
  doc.text('Base Amount:', rightAlign - 40, y);
  doc.text(formatCurrency(transaction.base_amount), rightAlign, y);

  y += 7;

  // GST Deduction
  doc.text(`GST Deduction (${transaction.seller_gst_percentage}%):`, rightAlign - 40, y);
  doc.setTextColor(180, 50, 50);
  doc.text(`-${formatCurrency(transaction.seller_gst_deduction)}`, rightAlign, y);

  y += 7;

  // Platform Fee Deduction
  doc.setTextColor(...TEXT_COLOR);
  doc.text(`Platform Fee (${transaction.seller_platform_fee_pct}%):`, rightAlign - 40, y);
  doc.setTextColor(180, 50, 50);
  doc.text(`-${formatCurrency(transaction.seller_platform_fee)}`, rightAlign, y);

  y += 3;
  doc.setDrawColor(100, 100, 100);
  doc.line(rightAlign - 50, y, 195, y);

  y += 7;

  // Net Payout
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...TEXT_COLOR);
  doc.text('Net Amount Receivable:', rightAlign - 50, y);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(formatCurrency(transaction.seller_payout_amount), rightAlign, y);

  return y + 15;
};

/**
 * Add footer section
 */
const addFooter = (doc: jsPDF, y: number): void => {
  // Thank you note
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text('Thank you for using StoxxFarm!', 105, y, { align: 'center' });

  y += 8;

  // Terms
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('This is a computer-generated receipt and does not require a signature.', 105, y, { align: 'center' });

  y += 5;
  doc.text(`For queries, contact us at ${COMPANY_DETAILS.email} or ${COMPANY_DETAILS.phone}`, 105, y, { align: 'center' });
};

/**
 * Generate Buyer Receipt PDF
 */
export const generateBuyerReceipt = (data: ReceiptData): jsPDF => {
  const doc = new jsPDF();
  const { transaction, buyerDetails } = data;

  let y = addHeader(doc, 'BUYER');
  y = addTransactionDetails(doc, y, transaction);
  y = addPartyDetails(doc, y, 'BILL TO', buyerDetails);
  y = addItemTable(doc, y, transaction);
  y = addBuyerBreakdown(doc, y, transaction);
  addFooter(doc, y);

  return doc;
};

/**
 * Generate Seller Receipt PDF
 */
export const generateSellerReceipt = (data: ReceiptData): jsPDF => {
  const doc = new jsPDF();
  const { transaction, sellerDetails } = data;

  let y = addHeader(doc, 'SELLER');
  y = addTransactionDetails(doc, y, transaction);
  y = addPartyDetails(doc, y, 'SELLER DETAILS', sellerDetails);
  y = addItemTable(doc, y, transaction);
  y = addSellerBreakdown(doc, y, transaction);
  addFooter(doc, y);

  return doc;
};

/**
 * Download PDF
 */
export const downloadReceipt = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};

/**
 * Generate and download both receipts
 */
export const generateAndDownloadReceipts = (data: ReceiptData): void => {
  const buyerDoc = generateBuyerReceipt(data);
  const sellerDoc = generateSellerReceipt(data);

  const txnNumber = data.transaction.transaction_number;

  downloadReceipt(buyerDoc, `StoxxFarm_Receipt_Buyer_${txnNumber}.pdf`);

  // Small delay to avoid browser blocking multiple downloads
  setTimeout(() => {
    downloadReceipt(sellerDoc, `StoxxFarm_Receipt_Seller_${txnNumber}.pdf`);
  }, 500);
};

export default {
  generateBuyerReceipt,
  generateSellerReceipt,
  downloadReceipt,
  generateAndDownloadReceipts,
};
