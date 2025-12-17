import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface SendDownloadLinkParams {
  email: string;
  downloadToken: string;
  templateName: string;
}

export const sendDownloadLinkEmail = async ({
  email,
  downloadToken,
  templateName,
}: SendDownloadLinkParams) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const downloadLink = `${frontendUrl}/download/${downloadToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'ResumePro <noreply@resumepro.com>',
    to: email,
    subject: 'Your ResumePro Download Link',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
          }
          .info-box {
            background: white;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">🎉 Payment Successful!</h1>
        </div>
        <div class="content">
          <h2>Thank you for your purchase!</h2>
          <p>Your <strong>${templateName}</strong> resume is ready to download.</p>

          <div style="text-align: center;">
            <a href="${downloadLink}" class="button">Download Your Resume</a>
          </div>

          <div class="info-box">
            <h3 style="margin-top: 0; color: #667eea;">Important Information:</h3>
            <ul style="margin: 10px 0;">
              <li>This download link is valid for <strong>1 year</strong></li>
              <li>You can download your resume as many times as you need</li>
              <li>Save this email for future access</li>
              <li>No signup required - your email is your access key</li>
            </ul>
          </div>

          <p><strong>Download Link:</strong><br>
          <a href="${downloadLink}" style="color: #667eea; word-break: break-all;">${downloadLink}</a></p>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you need to re-download your resume in the future, simply visit the download link above or request a new link from our website.
          </p>
        </div>
        <div class="footer">
          <p>ResumePro - Professional Resume Builder</p>
          <p>This email was sent to ${email}</p>
        </div>
      </body>
      </html>
    `,
    text: `
Thank you for your purchase!

Your ${templateName} resume is ready to download.

Download Link: ${downloadLink}

Important Information:
- This download link is valid for 1 year
- You can download your resume as many times as you need
- Save this email for future access
- No signup required - your email is your access key

If you need to re-download your resume in the future, simply visit the download link above or request a new link from our website.

ResumePro - Professional Resume Builder
This email was sent to ${email}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
