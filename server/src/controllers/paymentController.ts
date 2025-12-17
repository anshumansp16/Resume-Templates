import { Request, Response } from 'express';
import { razorpayInstance, PAYMENT_AMOUNT, PAYMENT_CURRENCY } from '../config/razorpay';
import {
  createOrder,
  getOrderByRazorpayOrderId,
  updateOrderPayment,
} from '../models/database';
import {
  generateDownloadToken,
  generateOrderId,
  verifyRazorpaySignature,
  calculateExpiryDate,
} from '../utils/token';
import { sendDownloadLinkEmail } from '../utils/email';

export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, resumeData, templateId } = req.body;

    if (!email || !resumeData || !templateId) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: email, resumeData, or templateId',
      });
      return;
    }

    const amount = PAYMENT_AMOUNT;
    const currency = PAYMENT_CURRENCY;

    const razorpayOrder = await razorpayInstance.orders.create({
      amount,
      currency,
      receipt: generateOrderId(),
      notes: {
        email,
        templateId,
      },
    });

    const downloadToken = generateDownloadToken();
    const expiryDays = parseInt(process.env.DOWNLOAD_LINK_VALIDITY_DAYS || '365', 10);

    const orderData = {
      id: razorpayOrder.receipt || generateOrderId(),
      email,
      razorpay_order_id: razorpayOrder.id,
      resume_data: JSON.stringify(resumeData),
      template_id: templateId,
      payment_status: 'pending' as const,
      amount,
      currency,
      download_token: downloadToken,
      created_at: Date.now(),
      expires_at: calculateExpiryDate(expiryDays),
    };

    createOrder(orderData);

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      templateName,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters',
      });
      return;
    }

    const order = getOrderByRazorpayOrderId(razorpay_order_id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      secret
    );

    if (!isValid) {
      updateOrderPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature, 'failed');
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
      return;
    }

    updateOrderPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature, 'completed');

    try {
      await sendDownloadLinkEmail({
        email: order.email,
        downloadToken: order.download_token,
        templateName: templateName || 'Professional Resume',
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      downloadToken: order.download_token,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
