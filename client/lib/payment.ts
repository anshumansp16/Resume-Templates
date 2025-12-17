declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  email: string;
  name: string;
  onSuccess: (response: RazorpayResponse) => void;
  onError: (error: any) => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (options: PaymentOptions) => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  const paymentOptions = {
    key: options.keyId,
    amount: options.amount,
    currency: options.currency,
    name: 'ResumePro',
    description: 'Professional Resume Download',
    order_id: options.orderId,
    prefill: {
      email: options.email,
      name: options.name,
    },
    theme: {
      color: '#667eea',
    },
    handler: function (response: RazorpayResponse) {
      options.onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        console.log('Payment cancelled');
      },
    },
  };

  const razorpay = new window.Razorpay(paymentOptions);

  razorpay.on('payment.failed', function (response: any) {
    options.onError(response.error);
  });

  razorpay.open();
};
