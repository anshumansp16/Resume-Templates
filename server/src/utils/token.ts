import crypto from 'crypto';
import { nanoid } from 'nanoid';

export const generateDownloadToken = (): string => {
  return nanoid(32);
};

export const generateOrderId = (): string => {
  return `order_${nanoid(24)}`;
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
};

export const calculateExpiryDate = (days: number = 365): number => {
  const now = Date.now();
  return now + days * 24 * 60 * 60 * 1000;
};
