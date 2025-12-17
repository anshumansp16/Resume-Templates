import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials not found in environment variables');
}

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const PAYMENT_AMOUNT = parseInt(process.env.PAYMENT_AMOUNT || '4900', 10);
export const PAYMENT_CURRENCY = process.env.PAYMENT_CURRENCY || 'INR';
