/**
 * Payment Service - Razorpay Integration
 */

import api from '@/lib/api';

export interface CreateOrderRequest {
  transaction_id: string;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  transaction_id: string;
  transaction_number: string;
  produce_name: string;
  seller_name: string;
  buyer_total_amount: number;
}

export interface VerifyPaymentRequest {
  transaction_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  transaction_id: string;
  transaction_number: string;
  payment_id: string;
  status: string;
}

// Razorpay Checkout response types
export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id: string;
  };
}

class PaymentService {
  /**
   * Format phone number for Razorpay (expects 10-digit Indian number)
   */
  private formatPhoneNumber(phone: string): string {
    if (!phone) return '';

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Handle different formats
    if (digits.length === 10) {
      return digits; // Already in correct format
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return digits.slice(2); // Remove +91 country code
    } else if (digits.length === 11 && digits.startsWith('0')) {
      return digits.slice(1); // Remove leading 0
    }

    return digits.slice(-10); // Take last 10 digits as fallback
  }

  /**
   * Create a Razorpay order for a transaction
   */
  async createOrder(transactionId: string): Promise<CreateOrderResponse> {
    const response = await api.post<CreateOrderResponse>('/payments/create-order', {
      transaction_id: transactionId,
    });
    return response;
  }

  /**
   * Verify payment after successful Razorpay checkout
   */
  async verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const response = await api.post<VerifyPaymentResponse>('/payments/verify', data);
    return response;
  }

  /**
   * Load Razorpay script dynamically
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Open Razorpay checkout
   */
  async openCheckout(
    orderData: CreateOrderResponse,
    userDetails: { name: string; email: string; phone: string },
    onSuccess: (response: RazorpaySuccessResponse) => void,
    onError: (error: RazorpayErrorResponse) => void,
    onDismiss?: () => void,
  ): Promise<void> {
    const scriptLoaded = await this.loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'StoxxFarm',
      description: `Payment for ${orderData.produce_name}`,
      order_id: orderData.order_id,
      handler: onSuccess,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: this.formatPhoneNumber(userDetails.phone),
      },
      notes: {
        transaction_id: orderData.transaction_id,
        produce_name: orderData.produce_name,
        seller_name: orderData.seller_name,
      },
      theme: {
        color: '#16a34a', // Green color matching StoxxFarm branding
      },
      modal: {
        ondismiss: onDismiss,
        escape: true,
        backdropclose: false,
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.on('payment.failed', onError);
    razorpay.open();
  }
}

export const paymentService = new PaymentService();
export default paymentService;
