import pkg from 'nodemailer';
const { createTransport } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create transporter
const createTransporter = () => {
  return createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send invoice email
export const sendInvoiceEmail = async (invoice, pdfPath) => {
  try {
    const transporter = createTransporter();

    const documentTypeText = {
      invoice: 'Invoice',
      quotation: 'Quotation',
      cash_receipt: 'Cash Receipt',
    };

    const docType = documentTypeText[invoice.documentType] || 'Invoice';

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: invoice.customer.email,
      subject: `${docType} #${invoice.invoiceNumber} from Urban Vac`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #2c3e50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .invoice-details {
              background-color: white;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
              border-left: 4px solid #3498db;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #3498db;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #777;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Urban Vac Roof & Gutter Pty Ltd</h1>
            </div>
            <div class="content">
              <h2>Hello ${invoice.customer.name},</h2>
              <p>Thank you for your business! Please find your ${docType.toLowerCase()} attached to this email.</p>

              <div class="invoice-details">
                <h3>${docType} Details</h3>
                <div class="detail-row">
                  <span class="label">${docType} Number:</span>
                  <span>#${invoice.invoiceNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Issue Date:</span>
                  <span>${new Date(invoice.issueDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Due Date:</span>
                  <span>${new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span>
                  <span style="font-size: 18px; color: #2c3e50; font-weight: bold;">$${invoice.total.toFixed(2)}</span>
                </div>
              </div>

              ${
                invoice.documentType === 'invoice'
                  ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Payment Details:</strong></p>
                <p style="margin: 5px 0;">Bank: ANZ</p>
                <p style="margin: 5px 0;">BSB: 012-003</p>
                <p style="margin: 5px 0;">Account: 123456789</p>
                <p style="margin: 5px 0;">Reference: INV-${invoice.invoiceNumber}</p>
              </div>
              `
                  : ''
              }

              <p>If you have any questions about this ${docType.toLowerCase()}, please don't hesitate to contact us.</p>

              <div class="footer">
                <p>Urban Vac Roof & Gutter Pty Ltd</p>
                <p>ABN: 12 345 678 901</p>
                <p>Email: info@urbanvac.com | Phone: (02) 1234 5678</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `${docType}_${invoice.invoiceNumber}.pdf`,
          path: pdfPath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: %s', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send welcome email to new user
export const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to Urban Vac Invoice System',
      html: `
        <h1>Welcome ${user.name}!</h1>
        <p>Your account has been created successfully.</p>
        <p>You can now start creating and managing invoices.</p>
        <p>Best regards,<br>Urban Vac Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email error:', error);
    // Don't throw error for welcome email
    return { success: false };
  }
};
