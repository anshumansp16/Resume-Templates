import { Request, Response } from 'express';
import {
  getOrderByDownloadToken,
  incrementDownloadCount,
  getOrdersByEmail,
} from '../models/database';
import { sendDownloadLinkEmail } from '../utils/email';

export const downloadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Download token is required',
      });
      return;
    }

    const order = await getOrderByDownloadToken(token);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Invalid or expired download link',
      });
      return;
    }

    if (order.payment_status !== 'completed') {
      res.status(403).json({
        success: false,
        message: 'Payment not completed for this order',
      });
      return;
    }

    const now = Date.now();
    if (now > order.expires_at) {
      res.status(410).json({
        success: false,
        message: 'Download link has expired',
      });
      return;
    }

    await incrementDownloadCount(token);

    const resumeData = JSON.parse(order.resume_data);

    res.status(200).json({
      success: true,
      resumeData,
      templateId: order.template_id,
      downloadCount: order.download_count + 1,
    });
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const resendDownloadLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, templateName } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    const orders = await getOrdersByEmail(email);

    const completedOrders = orders.filter(
      (order) => order.payment_status === 'completed' && Date.now() <= order.expires_at
    );

    if (completedOrders.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No active paid orders found for this email',
      });
      return;
    }

    const latestOrder = completedOrders[0];

    await sendDownloadLinkEmail({
      email: latestOrder.email,
      downloadToken: latestOrder.download_token,
      templateName: templateName || 'Professional Resume',
    });

    res.status(200).json({
      success: true,
      message: 'Download link sent to your email',
    });
  } catch (error) {
    console.error('Error resending download link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend download link',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
