declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise (e.g. ₹320 = 32000)
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
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

export const processRazorpayPayment = async (
  amountINR: number,
  bookingTitle: string,
  userProfile: { name: string; email: string; phone?: string },
  onSuccess: (paymentId: string) => void,
  onFailure: (err: any) => void
) => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !import.meta.env.VITE_RAZORPAY_KEY_ID) {
    // Demo Mode Simulated Payment
    setTimeout(() => {
      const mockPaymentId = `pay_demo_${Math.random().toString(36).substring(2, 10)}`;
      onSuccess(mockPaymentId);
    }, 1200);
    return;
  }

  const options: RazorpayOptions = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amountINR * 100, // paise
    currency: 'INR',
    name: 'SpaceShare',
    description: `Booking payment for ${bookingTitle}`,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    prefill: {
      name: userProfile.name,
      email: userProfile.email,
      contact: userProfile.phone || '9876543210',
    },
    theme: {
      color: '#0c8de9',
    },
    handler: function (response) {
      onSuccess(response.razorpay_payment_id);
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      onFailure(response.error);
    });
    rzp.open();
  } catch (err) {
    onFailure(err);
  }
};
