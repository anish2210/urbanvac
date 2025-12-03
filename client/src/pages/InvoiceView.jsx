import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { invoiceAPI } from "../utils/api";
import { formatCurrency, formatDate } from "../lib/utils";
import { Download, Printer } from "lucide-react";
import { toast } from "react-toastify";
import urbanVacLogo from "../assets/urbanvaclogo.png";

const InvoiceView = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getOne(id);
      setInvoice(response.data.data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `INV-NO_${invoice.invoiceNumber || id}`;
    window.print();
    document.title = originalTitle;
  };

  const handleDownload = async () => {
    try {
      const response = await invoiceAPI.download(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `INV-NO_${invoice.invoiceNumber || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invoice not found</p>
      </div>
    );
  }

  const documentTitle = invoice.documentType === "quotation"
    ? "QUOTATION"
    : invoice.documentType === "cash_receipt"
    ? "CASH RECEIPT"
    : "INVOICE";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print/Download Buttons - Hidden when printing */}
      <div className="print:hidden sticky top-0 bg-white shadow-sm z-10 px-4 py-3 flex justify-end gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Printer size={18} />
          <span>Print</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Download size={18} />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Invoice Content - Optimized for printing */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="bg-white shadow-lg print:shadow-none">
          <div className="p-8 print:p-12">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-300">
              <div className="flex items-center gap-4">
                <img
                  src={urbanVacLogo}
                  alt="Urban Vac Logo"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Urban Vac</h1>
                  <p className="text-gray-600">Professional Cleaning Services</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-orange-500 mb-2">
                  {documentTitle}
                </h2>
                <p className="text-gray-600">#{invoice.invoiceNumber}</p>
              </div>
            </div>

            {/* Dates and Customer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-700">
                  <p className="font-semibold">{invoice.customer?.name}</p>
                  <p>{invoice.customer?.email}</p>
                  <p>{invoice.customer?.phone}</p>
                  <p className="mt-2 whitespace-pre-line">{invoice.customer?.address}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="mb-3">
                  <span className="font-semibold text-gray-900">Issue Date: </span>
                  <span className="text-gray-700">{formatDate(invoice.issueDate)}</span>
                </div>
                {invoice.dueDate && (
                  <div className="mb-3">
                    <span className="font-semibold text-gray-900">Due Date: </span>
                    <span className="text-gray-700">{formatDate(invoice.dueDate)}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-900">Status: </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    invoice.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : invoice.status === "sent"
                      ? "bg-blue-100 text-blue-700"
                      : invoice.status === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {invoice.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 font-semibold text-gray-900">Description</th>
                    <th className="text-right py-3 font-semibold text-gray-900 w-24">Quantity</th>
                    <th className="text-right py-3 font-semibold text-gray-900 w-32">Price</th>
                    <th className="text-right py-3 font-semibold text-gray-900 w-32">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 text-gray-700">{item.description}</td>
                      <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-700">{formatCurrency(item.price)}</td>
                      <td className="py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(item.total || item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.documentType === "invoice" && invoice.gst > 0 && (
                  <div className="flex justify-between py-2 text-gray-700">
                    <span>GST (10%):</span>
                    <span className="font-semibold">{formatCurrency(invoice.gst)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t-2 border-gray-300 text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-orange-500">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t border-gray-300 text-center text-gray-600 text-sm">
              <p>Thank you for your business!</p>
              <p className="mt-2">Urban Vac - Professional Cleaning Services</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
