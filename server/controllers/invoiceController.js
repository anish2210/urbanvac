import Invoice from '../models/Invoice.js';
import { generateInvoicePDF } from '../util/pdfGenerator.js';
import { sendInvoiceEmail } from '../util/emailService.js';

// @desc    Get next invoice number
// @route   GET /api/invoices/next-number
// @access  Private
export const getNextInvoiceNumber = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
    const nextNumber = lastInvoice
      ? lastInvoice.invoiceNumber + 1
      : parseInt(process.env.INVOICE_START_NUMBER) || 3000;

    res.json({
      success: true,
      data: nextNumber,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
export const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;

    // Get next invoice number
    const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
    const invoiceNumber = lastInvoice
      ? lastInvoice.invoiceNumber + 1
      : parseInt(process.env.INVOICE_START_NUMBER) || 3000;

    // Create invoice
    const invoice = await Invoice.create({
      ...invoiceData,
      invoiceNumber,
      createdBy: null,
    });

    // Generate PDF and upload to Cloudinary
    const pdfResult = await generateInvoicePDF(invoice);
    invoice.pdfUrl = pdfResult.url;
    invoice.pdfPublicId = pdfResult.publicId;
    invoice.pdfPath = pdfResult.url; // For backward compatibility
    await invoice.save();

    res.status(201).json({
      success: true,
      data: invoice,
      pdfUrl: pdfResult.url,
      pdfFileName: pdfResult.fileName,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
export const getAllInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      status,
      documentType,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (documentType) filter.documentType = documentType;
    if (search) {
      filter.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { invoiceNumber: parseInt(search) || 0 },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1 };

    // Get invoices
    const invoices = await Invoice.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    // Get total count
    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
export const updateInvoice = async (req, res) => {
  try {
    let invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Update invoice
    invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Regenerate PDF and upload to Cloudinary
    const pdfResult = await generateInvoicePDF(invoice);
    invoice.pdfUrl = pdfResult.url;
    invoice.pdfPublicId = pdfResult.publicId;
    invoice.pdfPath = pdfResult.url; // For backward compatibility
    await invoice.save();

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    await invoice.deleteOne();

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send invoice via email
// @route   POST /api/invoices/:id/send
// @access  Private
export const sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Generate PDF if not exists and upload to Cloudinary
    if (!invoice.pdfUrl) {
      const pdfResult = await generateInvoicePDF(invoice);
      invoice.pdfUrl = pdfResult.url;
      invoice.pdfPublicId = pdfResult.publicId;
      invoice.pdfPath = pdfResult.url; // For backward compatibility
      await invoice.save();
    }

    // Send email
    const emailResult = await sendInvoiceEmail(invoice, invoice.pdfUrl);

    // Update invoice status
    invoice.emailSent = true;
    invoice.emailSentAt = new Date();
    if (invoice.status === 'draft') {
      invoice.status = 'sent';
    }
    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice sent successfully',
      data: {
        invoice,
        emailMessageId: emailResult.messageId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Download invoice PDF (redirect to Cloudinary URL)
// @route   GET /api/invoices/:id/download
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Generate PDF if not exists and upload to Cloudinary
    if (!invoice.pdfUrl) {
      const pdfResult = await generateInvoicePDF(invoice);
      invoice.pdfUrl = pdfResult.url;
      invoice.pdfPublicId = pdfResult.publicId;
      invoice.pdfPath = pdfResult.url; // For backward compatibility
      await invoice.save();
    }

    // Redirect to Cloudinary URL for download
    res.redirect(invoice.pdfUrl);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update invoice status
// @route   PATCH /api/invoices/:id/status
// @access  Private
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    invoice.status = status;
    await invoice.save();

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
