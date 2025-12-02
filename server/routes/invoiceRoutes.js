import express from 'express';
import {
  createInvoice,
  getAllInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  downloadInvoice,
  updateInvoiceStatus,
  getNextInvoiceNumber,
} from '../controllers/invoiceController.js';
import { invoiceValidation, validate } from '../middlewares/validation.js';

const router = express.Router();

router.get('/next-number', getNextInvoiceNumber);
router.post('/', invoiceValidation, validate, createInvoice);
router.get('/', getAllInvoices);
router.get('/:id', getInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.post('/:id/send', sendInvoice);
router.get('/:id/download', downloadInvoice);
router.patch('/:id/status', updateInvoiceStatus);

export default router;
