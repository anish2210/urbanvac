import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../utils/api';
import { Button } from '../components/Button';
import { Card, CardTitle } from '../components/Card';
import { Input, TextArea, Select } from '../components/Input';
import { formatCurrency } from '../lib/utils';
import { Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

export const NewInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const [formData, setFormData] = useState({
    documentType: 'invoice',
    customer: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    items: [{ description: '', quantity: 1, price: 0, total: 0 }],
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    gst: 0,
    total: 0,
  });

  useEffect(() => {
    fetchNextInvoiceNumber();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.documentType]);

  useEffect(() => {
    // Set default due date to 30 days from issue date
    if (formData.issueDate) {
      const issueDate = new Date(formData.issueDate);
      issueDate.setDate(issueDate.getDate() + 30);
      setFormData({
        ...formData,
        dueDate: issueDate.toISOString().split('T')[0],
      });
    }
  }, [formData.issueDate]);

  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await invoiceAPI.getNextNumber();
      setInvoiceNumber(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch invoice number');
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.price || 0);
      return sum + itemTotal;
    }, 0);

    const gst = formData.documentType === 'invoice' ? subtotal * 0.1 : 0;
    const total = subtotal + gst;

    setTotals({ subtotal, gst, total });
  };

  const handleCustomerChange = (field, value) => {
    setFormData({
      ...formData,
      customer: {
        ...formData.customer,
        [field]: value,
      },
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Calculate item total
    if (field === 'quantity' || field === 'price') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].total = quantity * price;
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0, total: 0 }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.customer.name || !formData.customer.email) {
      toast.error('Please fill in customer details');
      return;
    }

    if (formData.items.some((item) => !item.description || item.price <= 0)) {
      toast.error('Please fill in all item details');
      return;
    }

    setLoading(true);
    try {
      const response = await invoiceAPI.create(formData);
      toast.success('Invoice created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const documentTypeOptions = [
    { value: 'invoice', label: 'Invoice' },
    { value: 'quotation', label: 'Quotation' },
    { value: 'cash_receipt', label: 'Cash Receipt' },
  ];

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 pt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Create New Invoice</h1>
          <p className="text-gray-300 mt-2">Fill in the details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Info */}
          <Card className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 shadow-lg">
            <CardTitle className="mb-4 text-white">Document Information</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Invoice Number
                </label>
                <div className="px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg font-mono text-lg text-white">
                  #{invoiceNumber}
                </div>
              </div>
              <Select
                label="Document Type"
                value={formData.documentType}
                onChange={(e) =>
                  setFormData({ ...formData, documentType: e.target.value })
                }
                options={documentTypeOptions}
                required
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white"
              />
              <Input
                label="Issue Date"
                type="date"
                value={formData.issueDate}
                onChange={(e) =>
                  setFormData({ ...formData, issueDate: e.target.value })
                }
                required
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white"
              />
              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white"
              />
            </div>
          </Card>

          {/* Customer Info */}
          <Card className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 shadow-lg">
            <CardTitle className="mb-4 text-white">Customer Information</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Customer Name"
                type="text"
                value={formData.customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
                required
                placeholder="John Doe"
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-gray-400"
              />
              <Input
                label="Email"
                type="email"
                value={formData.customer.email}
                onChange={(e) => handleCustomerChange('email', e.target.value)}
                required
                placeholder="customer@example.com"
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-gray-400"
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.customer.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
                required
                placeholder="+61 400 000 000"
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-gray-400"
              />
              <div className="md:col-span-2">
                <TextArea
                  label="Address"
                  value={formData.customer.address}
                  onChange={(e) => handleCustomerChange('address', e.target.value)}
                  required
                  placeholder="123 Main St, Sydney NSW 2000"
                  rows={2}
                  className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </Card>

          {/* Items */}
          <Card className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-white">Items</CardTitle>
              <Button
                type="button"
                onClick={addItem}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <Plus size={16} className="mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10"
                >
                  <div className="col-span-12 md:col-span-5">
                    <Input
                      label="Description"
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, 'description', e.target.value)
                      }
                      required
                      placeholder="Service or product description"
                      className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Input
                      label="Quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                      required
                      className="bg-white bg-opacity-10 border-white border-opacity-20 text-white"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Input
                      label="Price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(index, 'price', e.target.value)
                      }
                      required
                      className="bg-white bg-opacity-10 border-white border-opacity-20 text-white"
                    />
                  </div>
                  <div className="col-span-10 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Total
                    </label>
                    <div className="px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg font-semibold text-white">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                      className="w-full"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-white border-opacity-20 pt-6">
              <div className="flex flex-col items-end space-y-2">
                <div className="flex justify-between w-full md:w-64">
                  <span className="text-gray-300 font-medium">Subtotal:</span>
                  <span className="font-semibold text-white">{formatCurrency(totals.subtotal)}</span>
                </div>
                {formData.documentType === 'invoice' && (
                  <div className="flex justify-between w-full md:w-64">
                    <span className="text-gray-300 font-medium">GST (10%):</span>
                    <span className="font-semibold text-white">{formatCurrency(totals.gst)}</span>
                  </div>
                )}
                <div className="flex justify-between w-full md:w-64 text-lg border-t border-white border-opacity-20 pt-2">
                  <span className="text-white font-bold">Total:</span>
                  <span className="font-bold text-orange-400">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 shadow-lg">
            <CardTitle className="mb-4 text-white">Additional Notes (Optional)</CardTitle>
            <TextArea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information or payment terms..."
              rows={3}
              className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-gray-400"
            />
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white border border-white border-opacity-20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <FileText size={18} />
              <span>Create Invoice</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
