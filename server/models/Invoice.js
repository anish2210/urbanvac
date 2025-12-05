import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  total: {
    type: Number,
    default: 0,
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    documentType: {
      type: String,
      enum: ['invoice', 'quotation', 'cash_receipt'],
      required: [true, 'Document type is required'],
      default: 'invoice',
    },
    customer: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Customer email is required'],
        trim: true,
        lowercase: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please provide a valid email',
        ],
      },
      phone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true,
      },
      address: {
        type: String,
        required: false,
        trim: true,
      },
    },
    items: {
      type: [invoiceItemSchema],
      required: [true, 'At least one item is required'],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Invoice must have at least one item',
      },
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    gst: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    pdfViewUrl: {
      type: String,
      default: null,
    },
    pdfDownloadUrl: {
      type: String,
      default: null,
    },
    pdfPublicId: {
      type: String,
      default: null,
    },
    pdfPath: {
      type: String,
      default: null,
      // Deprecated: kept for backward compatibility, use pdfUrl instead
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ 'customer.email': 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });

// Calculate totals before saving
invoiceSchema.pre('save', function () {
  // Calculate item totals
  this.items.forEach((item) => {
    item.total = item.quantity * item.price;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);

  // Calculate GST (10% for invoices only)
  if (this.documentType === 'invoice') {
    this.gst = this.subtotal * 0.1;
  } else {
    this.gst = 0;
  }

  // Calculate total
  this.total = this.subtotal + this.gst;
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
