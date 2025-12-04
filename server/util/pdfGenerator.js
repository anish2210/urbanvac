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

// Get images as base64
const getImageBase64 = (filename) => {
  try {
    const imagePath = path.join(__dirname, "..", "assets", filename);
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      return `data:image/png;base64,${imageBuffer.toString("base64")}`;
    }
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
  }
  return "";
};

const getLogoBase64 = () => getImageBase64("urbanvaclogo.png");
const getHeaderBase64 = () => getImageBase64("Header.png");
const getFooterBase64 = () => getImageBase64("Footer.png");

// Generate HTML template for invoice
const generateInvoiceHTML = (invoice) => {
  const documentTypeText = {
    invoice: "INVOICE",
    quotation: "QUOTATION",
    cash_receipt: "CASH RECEIPT",
  };

  const docType = documentTypeText[invoice.documentType] || "INVOICE";
  const headerBase64 = getHeaderBase64();
  const footerBase64 = getFooterBase64();

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
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          background-color: #f5f5f5;
        }
        .page {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          position: relative;
          min-height: 297mm;
        }
        .header-image {
          width: 100%;
          height: auto;
          display: block;
        }
        .invoice-title {
          text-align: center;
          font-size: 28px;
          font-weight: bold;
          margin: 20px 0;
          color: #333;
        }
        .content {
          padding: 0 40px;
        }
        .info-section {
          display: table;
          width: 100%;
          margin-bottom: 30px;
        }
        .info-left, .info-right {
          display: table-cell;
          width: 50%;
          vertical-align: top;
        }
        .info-right {
          text-align: right;
        }
        .section-heading {
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .info-text {
          font-size: 13px;
          line-height: 1.8;
        }
        .bank-details {
          margin-top: 30px;
        }
        .bill-details {
          margin-top: 20px;
        }
        .items-section {
          margin: 40px 0;
        }
        .items-heading {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 15px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table thead {
          background-color: #e8e8e8;
        }
        .items-table th {
          padding: 10px;
          text-align: left;
          font-weight: bold;
          font-size: 13px;
          border: 1px solid #ccc;
        }
        .items-table th:nth-child(2) {
          text-align: center;
        }
        .items-table th:nth-child(3),
        .items-table th:nth-child(4) {
          text-align: right;
        }
        .items-table td {
          padding: 10px;
          border: 1px solid #ccc;
          font-size: 13px;
        }
        .items-table td:nth-child(2) {
          text-align: center;
        }
        .items-table td:nth-child(3),
        .items-table td:nth-child(4) {
          text-align: right;
        }
        .totals {
          margin-top: 20px;
          text-align: right;
          padding-right: 10px;
        }
        .total-row {
          margin: 8px 0;
          font-size: 14px;
        }
        .total-row.grand-total {
          font-weight: bold;
          font-size: 16px;
          margin-top: 15px;
        }
        .thank-you {
          text-align: center;
          margin: 60px 0 40px 0;
          font-weight: bold;
          font-size: 14px;
        }
        ${
          invoice.notes
            ? `
        .notes-section {
          margin: 30px 0;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        .notes-heading {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .notes-text {
          font-size: 13px;
          white-space: pre-line;
        }
        `
            : ""
        }
        .footer-wrapper {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
        }
        .footer-image {
          width: 100%;
          height: auto;
          display: block;
          position: relative;
        }
        .abn-text {
          position: absolute;
          bottom: 20px;
          right: 40px;
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="page">
        ${
          headerBase64
            ? `<img src="${headerBase64}" alt="Urban Vac Header" class="header-image" />`
            : ""
        }

        <div class="invoice-title">${docType}</div>

        <div class="content">
          <div class="info-section">
            <div class="info-left">
              <div class="section-heading">To</div>
              <div class="info-text">
                ${invoice.customer.phone}<br>
                ${invoice.customer.address}
              </div>

              <div class="bank-details">
                <div class="section-heading">Bank Details</div>
                <div class="info-text">
                  Commbank BSB: 063 250<br>
                  A/C Name: Singh<br>
                  A/C: 1099 4913
                </div>
              </div>
            </div>

            <div class="info-right">
              <div class="section-heading">From</div>
              <div class="info-text">
                Urbanvac Roof and Gutter Pty Ltd.<br>
                19 Colchester Ave<br>
                Cranbourne West 3977
              </div>

              <div class="bill-details">
                <div class="info-text">
                  <strong>Bill No:</strong> ${invoice.invoiceNumber}<br>
                  <strong>Bill Date:</strong> ${new Date(
                    invoice.issueDate
                  ).toLocaleDateString("en-AU", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>

          <div class="items-section">
            <div class="items-heading">Items</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${item.total.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">Subtotal: $${invoice.subtotal.toFixed(
                2
              )}</div>
              ${
                invoice.gst > 0
                  ? `<div class="total-row">GST (10%): $${invoice.gst.toFixed(
                      2
                    )}</div>`
                  : ""
              }
              <div class="total-row grand-total">Total: $${invoice.total.toFixed(
                2
              )}</div>
            </div>
          </div>

          ${
            invoice.notes
              ? `
          <div class="notes-section">
            <div class="notes-heading">Notes:</div>
            <div class="notes-text">${invoice.notes}</div>
          </div>
          `
              : ""
          }

          <div class="thank-you">Thank you for your business!</div>
        </div>

        <div class="footer-wrapper">
          ${
            footerBase64
              ? `<img src="${footerBase64}" alt="Urban Vac Footer" class="footer-image" />`
              : ""
          }
          <div class="abn-text">ABN : 50 679 172 948</div>
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
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
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
