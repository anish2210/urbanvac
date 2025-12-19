// Generate email content for manual Gmail compose
export const generateEmailContent = (invoice) => {
  const documentTypeText = {
    invoice: 'Invoice',
    quotation: 'Quotation',
    cash_receipt: 'Cash Receipt',
  };

  const docType = documentTypeText[invoice.documentType] || 'Invoice';

  const subject = `${docType} #${invoice.invoiceNumber} from Urbanvac Roof and Gutter`;

  const body = `Dear ${invoice.customer.name},

Thank you for your business with Urbanvac Roof and Gutter!

Please find your ${docType.toLowerCase()} details below:

═══════════════════════════════════════════
${docType.toUpperCase()} DETAILS
═══════════════════════════════════════════

${docType} Number: #${invoice.invoiceNumber}
Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}

TOTAL AMOUNT: $${invoice.total.toFixed(2)} AUD

${invoice.documentType === 'invoice' ? `
═══════════════════════════════════════════
PAYMENT DETAILS
═══════════════════════════════════════════

Bank: Commonwealth Bank
BSB: 063 250
Account Name: Singh
Account Number: 1099 4913
Payment Reference: INV-${invoice.invoiceNumber}

⚠️ IMPORTANT: Please include the payment reference when transferring funds.

` : ''}
═══════════════════════════════════════════
DOWNLOAD YOUR ${docType.toUpperCase()}
═══════════════════════════════════════════

Click the link below to download your ${docType.toLowerCase()} PDF:
${invoice.pdfDownloadUrl || invoice.pdfUrl}

The PDF contains complete details of your ${docType.toLowerCase()} including all line items and terms.

═══════════════════════════════════════════

If you have any questions or concerns regarding this ${docType.toLowerCase()}, please feel free to contact us.

Kind regards,

Urbanvac Roof and Gutter Pty Ltd
📍 19 Colchester Ave, Cranbourne West VIC 3977
📧 Contact us for any queries

---
This is an official ${docType.toLowerCase()} from Urbanvac Roof and Gutter Pty Ltd.`;

  return {
    to: invoice.customer.email,
    subject,
    body,
    pdfUrl: invoice.pdfDownloadUrl || invoice.pdfUrl,
  };
};
