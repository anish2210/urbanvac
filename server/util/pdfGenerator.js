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

      // Document title - centered below header (reduced spacing)
      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor("#1a1a1a")
        .text(docType, 0, headerPath ? 210 : 40, {
          align: "center",
          width: 595,
        });

      // Left column - To
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#1a1a1a")
        .text("To", 47, 295);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#333")
        .text(invoice.customer.phone, 47, 315)
        .text(invoice.customer.address, 47, 330, { width: 280 });

      // Right column - From (right-aligned)
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#1a1a1a")
        .text("From", 350, 295, { align: "right", width: 198 });

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#333")
        .text("Urbanvac Roof and Gutter Pty Ltd.", 350, 315, {
          align: "right",
          width: 198,
        })
        .text("19 Colchester Ave", 350, 330, { align: "right", width: 198 })
        .text("Cranbourne West 3977", 350, 345, {
          align: "right",
          width: 198,
        });

      // Bank Details (left column)
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#1a1a1a")
        .text("Bank Details", 47, 370);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#333")
        .text("Commbank BSB: 063 250", 47, 390)
        .text("A/C Name: Singh", 47, 405)
        .text("A/C: 1099 4913", 47, 420);

      // Bill Details (right column, right-aligned)
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#1a1a1a")
        .text(`Bill No: ${invoice.invoiceNumber}`, 350, 385, {
          align: "right",
          width: 198,
        });

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#1a1a1a")
        .text(
          `Bill Date: ${new Date(invoice.issueDate).toLocaleDateString(
            "en-AU",
            {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }
          )}`,
          350,
          405,
          {
            align: "right",
            width: 198,
          }
        );

      // Items section
      let yPos = 450;
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#1a1a1a")
        .text("Items", 47, yPos);

      yPos += 18;

      // Table header with border (reduced height)
      doc.rect(47, yPos, 500, 24).fillAndStroke("#d9d9d9", "#999");

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#1a1a1a")
        .text("Item", 60, yPos + 7, { width: 220 })
        .text("Quantity", 290, yPos + 7, { width: 70, align: "center" })
        .text("Price", 370, yPos + 7, { width: 80, align: "center" })
        .text("Total", 460, yPos + 7, { width: 75, align: "center" });

      yPos += 24;

      // Table rows
      doc.font("Helvetica").fontSize(8).fillColor("#333");

      invoice.items.forEach((item, index) => {
        // Check if we need a new page
        if (yPos > 700) {
          doc.addPage({ size: "A4", margin: 0 });
          yPos = 50;
        }

        // Row with border (reduced height to 24)
        doc
          .rect(47, yPos, 500, 24)
          .stroke("#999");

        doc
          .text(item.description, 60, yPos + 7, { width: 220 })
          .text(item.quantity.toString(), 290, yPos + 7, {
            width: 70,
            align: "center",
          })
          .text(`$${item.price.toFixed(2)}`, 370, yPos + 7, {
            width: 80,
            align: "center",
          })
          .text(`$${item.total.toFixed(2)}`, 460, yPos + 7, {
            width: 75,
            align: "center",
          });

        yPos += 24;
      });

      yPos += 8;

      // Totals (right-aligned)
      const totalsX = 385;
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#333")
        .text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, totalsX, yPos, {
          width: 162,
          align: "right",
        });

      yPos += 15;

      if (invoice.gst > 0) {
        doc.text(`GST (10%): $${invoice.gst.toFixed(2)}`, totalsX, yPos, {
          width: 162,
          align: "right",
        });
        yPos += 15;
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#1a1a1a")
        .text(`Total: $${invoice.total.toFixed(2)}`, totalsX, yPos, {
          width: 162,
          align: "right",
        });

      yPos += 18;

      // Notes section if exists (compact, fits before footer)
      if (invoice.notes && yPos < 690) {
        // Only add notes if there's space before footer
        const availableHeight = Math.min(45, 735 - yPos);
        if (availableHeight >= 30) {
          doc
            .rect(47, yPos, 500, availableHeight)
            .fillAndStroke("#f5f5f5", "#f5f5f5");

          doc
            .font("Helvetica-Bold")
            .fontSize(8)
            .fillColor("#1a1a1a")
            .text("Notes:", 65, yPos + 6);

          doc
            .font("Helvetica")
            .fontSize(7)
            .fillColor("#333")
            .text(invoice.notes, 65, yPos + 16, {
              width: 465,
              height: availableHeight - 20,
            });

          yPos += availableHeight;
        }
      }

      // Footer - positioned at bottom of last page
      const footerPath = getImagePath("Footer.png");
      if (footerPath) {
        // Position footer at bottom of page
        doc.image(footerPath, 0, 742, { width: 595, height: 100 });
      }

      // ABN text on footer (overlaid on footer image)
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor("#1a1a1a")
        .text("ABN : 50 679 172 948", 0, 760, {
          align: "right",
          width: 545,
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

    // Generate view URL (opens in browser)
    const viewUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: "raw",
      type: "upload",
      secure: true,
    });

    // Generate download URL (forces download)
    const downloadUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: "raw",
      type: "upload",
      flags: "attachment",
      secure: true,
    });

    return {
      success: true,
      url: downloadUrl, // Default to download URL for backward compatibility
      viewUrl: viewUrl, // URL to view PDF in browser
      downloadUrl: downloadUrl, // URL to download PDF
      publicId: uploadResult.public_id,
      fileName: `${pdfFileName}.pdf`,
    };
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};
