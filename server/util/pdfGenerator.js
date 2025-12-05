import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get image path
const getImagePath = (filename) => {
  const imagePath = path.join(__dirname, "..", "assets", filename);
  if (fs.existsSync(imagePath)) {
    return imagePath;
  }
  return null;
};

// Generate PDF using PDFKit
const createInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const chunks = [];

      // Collect PDF data into buffer
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const documentTypeText = {
        invoice: "INVOICE",
        quotation: "QUOTATION",
        cash_receipt: "CASH RECEIPT",
      };
      const docType = documentTypeText[invoice.documentType] || "INVOICE";

      // Add header image if exists
      const headerPath = getImagePath("Header.png");
      if (headerPath) {
        doc.image(headerPath, 0, 0, { width: 595 });
      }

      // Document title
      doc
        .font("Helvetica-Bold")
        .fontSize(28)
        .fillColor("#333")
        .text(docType, 0, headerPath ? 150 : 40, {
          align: "center",
          width: 595,
        });

      // Left column - To & Bank Details
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#333")
        .text("To", 40, 200);

      doc
        .font("Helvetica")
        .fontSize(13)
        .fillColor("#333")
        .text(invoice.customer.phone, 40, 220)
        .text(invoice.customer.address, 40, 235);

      // Bank Details
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#333")
        .text("Bank Details", 40, 280);

      doc
        .font("Helvetica")
        .fontSize(13)
        .fillColor("#333")
        .text("Commbank BSB: 063 250", 40, 300)
        .text("A/C Name: Singh", 40, 315)
        .text("A/C: 1099 4913", 40, 330);

      // Right column - From & Bill Details
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#333")
        .text("From", 350, 200);

      doc
        .font("Helvetica")
        .fontSize(13)
        .fillColor("#333")
        .text("Urbanvac Roof and Gutter Pty Ltd.", 350, 220)
        .text("19 Colchester Ave", 350, 235)
        .text("Cranbourne West 3977", 350, 250);

      // Bill Details
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor("#333")
        .text(`Bill No: `, 350, 290)
        .font("Helvetica")
        .text(invoice.invoiceNumber, 420, 290);

      doc
        .font("Helvetica-Bold")
        .text(`Bill Date: `, 350, 305)
        .font("Helvetica")
        .text(
          new Date(invoice.issueDate).toLocaleDateString("en-AU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          420,
          305
        );

      // Items section
      let yPos = 370;
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor("#333")
        .text("Items", 40, yPos);

      yPos += 25;

      // Table header
      doc.rect(40, yPos, 515, 30).fillAndStroke("#e8e8e8", "#ccc");

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor("#000")
        .text("Item", 50, yPos + 8, { width: 200 })
        .text("Quantity", 260, yPos + 8, { width: 80, align: "center" })
        .text("Price", 350, yPos + 8, { width: 80, align: "right" })
        .text("Total", 440, yPos + 8, { width: 100, align: "right" });

      yPos += 30;

      // Table rows
      doc.font("Helvetica").fontSize(13).fillColor("#333");

      invoice.items.forEach((item) => {
        // Check if we need a new page
        if (yPos > 700) {
          doc.addPage({ size: "A4", margin: 0 });
          yPos = 50;
        }

        doc.rect(40, yPos, 515, 1).fillAndStroke("#ccc");
        yPos += 1;

        doc
          .text(item.description, 50, yPos + 10, { width: 200 })
          .text(item.quantity.toString(), 260, yPos + 10, {
            width: 80,
            align: "center",
          })
          .text(`$${item.price.toFixed(2)}`, 350, yPos + 10, {
            width: 80,
            align: "right",
          })
          .text(`$${item.total.toFixed(2)}`, 440, yPos + 10, {
            width: 100,
            align: "right",
          });

        yPos += 35;
      });

      doc.rect(40, yPos, 515, 1).fillAndStroke("#ccc");
      yPos += 20;

      // Totals
      doc
        .font("Helvetica")
        .fontSize(14)
        .fillColor("#333")
        .text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 440, yPos, {
          width: 100,
          align: "right",
        });

      yPos += 20;

      if (invoice.gst > 0) {
        doc.text(`GST (10%): $${invoice.gst.toFixed(2)}`, 440, yPos, {
          width: 100,
          align: "right",
        });
        yPos += 20;
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(`Total: $${invoice.total.toFixed(2)}`, 440, yPos, {
          width: 100,
          align: "right",
        });

      yPos += 40;

      // Notes section if exists
      if (invoice.notes) {
        if (yPos > 650) {
          doc.addPage({ size: "A4", margin: 0 });
          yPos = 50;
        }

        doc
          .rect(40, yPos, 515, 80)
          .fillAndStroke("#f8f9fa", "#f8f9fa")
          .fillColor("#333");

        doc
          .font("Helvetica-Bold")
          .fontSize(13)
          .text("Notes:", 50, yPos + 10);

        doc
          .font("Helvetica")
          .fontSize(13)
          .text(invoice.notes, 50, yPos + 30, { width: 495 });

        yPos += 90;
      }

      // Thank you message
      if (yPos > 700) {
        doc.addPage({ size: "A4", margin: 0 });
        yPos = 50;
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#333")
        .text("Thank you for your business!", 0, yPos + 20, {
          align: "center",
          width: 595,
        });

      // Footer - positioned at bottom of last page
      const footerPath = getImagePath("Footer.png");
      if (footerPath) {
        // Position footer at bottom of page
        doc.image(footerPath, 0, 750, { width: 595 });
      }

      // ABN text on footer
      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor("#333")
        .text("ABN : 50 679 172 948", 0, 760, {
          align: "right",
          width: 555,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate PDF from invoice data and upload to Cloudinary
export const generateInvoicePDF = async (invoice) => {
  try {
    // Generate PDF as buffer using PDFKit
    const pdfBuffer = await createInvoicePDF(invoice);

    // Upload PDF buffer to Cloudinary
    const pdfFileName = `INV-NO_${invoice.invoiceNumber}`;
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "urbanvac/invoices",
          public_id: pdfFileName,
          type: "upload",
          invalidate: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(pdfBuffer);
    });

    console.log("PDF uploaded to Cloudinary:", uploadResult.secure_url);

    // Generate download URL
    const downloadUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: "raw",
      type: "upload",
      flags: "attachment",
      secure: true,
    });

    return {
      success: true,
      url: downloadUrl,
      publicId: uploadResult.public_id,
      fileName: `${pdfFileName}.pdf`,
    };
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};
