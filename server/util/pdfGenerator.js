import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, "..", "invoices");
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// Get logo as base64
const getLogoBase64 = () => {
  try {
    const logoPath = path.join(
      __dirname,
      "..",
      "..",
      "client",
      "src",
      "assets",
      "urbanvaclogo.png"
    );
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      return `data:image/png;base64,${logoBuffer.toString("base64")}`;
    }
  } catch (error) {
    console.error("Error loading logo:", error);
  }
  return "";
};

// Generate HTML template for invoice
const generateInvoiceHTML = (invoice) => {
  const documentTypeText = {
    invoice: "INVOICE",
    quotation: "QUOTATION",
    cash_receipt: "CASH RECEIPT",
  };

  const docType = documentTypeText[invoice.documentType] || "INVOICE";
  const logoBase64 = getLogoBase64();

  const itemsHTML = invoice.items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${
        index + 1
      }</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${
        item.description
      }</td>
      <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${
        item.quantity
      }</td>
      <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">$${item.price.toFixed(
        2
      )}</td>
      <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">$${item.total.toFixed(
        2
      )}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${docType} #${invoice.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          line-height: 1.6;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2c3e50;
        }
        .company-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .company-logo {
          width: 72px;
          height: 72px;
          object-fit: contain;
        }
        .company-text {
          flex: 1;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 5px;
        }
        .company-details {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-type {
          font-size: 28px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .invoice-number {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .dates {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
        }
        .date-section {
          flex: 1;
        }
        .date-label {
          font-weight: bold;
          color: #555;
          font-size: 12px;
          margin-bottom: 5px;
        }
        .date-value {
          font-size: 14px;
          color: #333;
        }
        .customer-section {
          margin: 30px 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .customer-details {
          font-size: 13px;
          line-height: 1.6;
        }
        .items-table {
          width: 100%;
          margin: 30px 0;
          border-collapse: collapse;
        }
        .items-table thead {
          background-color: #2c3e50;
          color: white;
        }
        .items-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
        }
        .items-table th:nth-child(3),
        .items-table th:nth-child(4),
        .items-table th:nth-child(5) {
          text-align: right;
        }
        .totals {
          margin-top: 20px;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          padding: 8px 0;
          font-size: 14px;
        }
        .total-label {
          width: 150px;
          text-align: right;
          padding-right: 20px;
          font-weight: 600;
          color: #555;
        }
        .total-value {
          width: 120px;
          text-align: right;
        }
        .grand-total {
          border-top: 2px solid #2c3e50;
          margin-top: 10px;
          padding-top: 10px;
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
        }
        .payment-info {
          margin-top: 40px;
          padding: 20px;
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 5px;
        }
        .payment-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #856404;
        }
        .payment-details {
          font-size: 13px;
          line-height: 1.8;
          color: #856404;
        }
        .notes {
          margin-top: 30px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
          font-size: 12px;
          color: #666;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 11px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            ${
              logoBase64
                ? `<img src="${logoBase64}" alt="Urban Vac Logo" class="company-logo" />`
                : ""
            }
            <div class="company-text">
              <div class="company-name">Urban Vac Roof & Gutter Pty Ltd</div>
              <div class="company-details">
                ABN: 50 679 172 948<br>
                19, Colchester Ave, Cranbourne, west 3977<br>
                Phone: +61 426 371 500<br>
                Email: info.urbanvac@gmail.com <br> www.urbanvac.com.au 
              </div>
            </div>
          </div>
          <div class="invoice-info">
            <div class="invoice-type">${docType}</div>
            <div class="invoice-number">#${invoice.invoiceNumber}</div>
          </div>
        </div>

        <div class="dates">
          <div class="date-section">
            <div class="date-label">Issue Date</div>
            <div class="date-value">${new Date(
              invoice.issueDate
            ).toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}</div>
          </div>
          <div class="date-section">
            <div class="date-label">Due Date</div>
            <div class="date-value">${new Date(
              invoice.dueDate
            ).toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}</div>
          </div>
        </div>

        <div class="customer-section">
          <div class="section-title">Bill To</div>
          <div class="customer-details">
            <strong>${invoice.customer.name}</strong><br>
            ${invoice.customer.address}<br>
            Phone: ${invoice.customer.phone}<br>
            Email: ${invoice.customer.email}
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 45%;">Description</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Price</th>
              <th style="width: 20%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <div class="total-label">Subtotal:</div>
            <div class="total-value">$${invoice.subtotal.toFixed(2)}</div>
          </div>
          ${
            invoice.gst > 0
              ? `
          <div class="total-row">
            <div class="total-label">GST (10%):</div>
            <div class="total-value">$${invoice.gst.toFixed(2)}</div>
          </div>
          `
              : ""
          }
          <div class="total-row grand-total">
            <div class="total-label">Total:</div>
            <div class="total-value">$${invoice.total.toFixed(2)}</div>
          </div>
        </div>

        <div class="payment-info">
          <div class="payment-title">Payment Information</div>
          <div class="payment-details">
            <strong>Commbank BSB:</strong> 063 250<br>
            <strong>A/C Name:</strong> Singh<br>
            <strong>A/C:</strong> 1099 4913<br>
          </div>
        </div>

        ${
          invoice.notes
            ? `
        <div class="notes">
          <strong>Notes:</strong><br>
          ${invoice.notes}
        </div>
        `
            : ""
        }

        <div class="footer">
          Thank you for your business!<br>
          This ${docType.toLowerCase()} was generated electronically and is valid without signature.
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate PDF from invoice data
export const generateInvoicePDF = async (invoice) => {
  let browser;
  try {
    const html = generateInvoiceHTML(invoice);

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfFileName = `INV-NO_${invoice.invoiceNumber}.pdf`;
    const pdfPath = path.join(invoicesDir, pdfFileName);

    // Generate PDF
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    return {
      success: true,
      path: pdfPath,
      fileName: pdfFileName,
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error("PDF generation error:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};
