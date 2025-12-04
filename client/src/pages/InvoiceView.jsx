import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { invoiceAPI } from "../utils/api";
import { formatCurrency, formatDate } from "../lib/utils";
import { Download, Printer } from "lucide-react";
import { toast } from "react-toastify";
import headerImage from "../assets/Header.png";
import footerImage from "../assets/Footer.png";

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
    <div className="min-h-screen bg-gray-100">
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

      {/* Invoice Content */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none my-8 print:my-0">
        {/* Header Image */}
        <img src={headerImage} alt="Urban Vac Header" className="w-full h-auto" />

        {/* Invoice Title */}
        <div className="text-center text-3xl font-bold py-5">
          {documentTitle}
        </div>

        {/* Content */}
        <div className="px-10 pb-20">
          {/* Info Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div>
              <div className="mb-8">
                <h3 className="font-bold mb-2 text-sm">To</h3>
                <div className="text-sm leading-relaxed">
                  {invoice.customer?.phone}<br />
                  {invoice.customer?.address}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2 text-sm">Bank Details</h3>
                <div className="text-sm leading-relaxed">
                  Commbank BSB: 063 250<br />
                  A/C Name: Singh<br />
                  A/C: 1099 4913
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="text-right">
              <div className="mb-6">
                <h3 className="font-bold mb-2 text-sm">From</h3>
                <div className="text-sm leading-relaxed">
                  Urbanvac Roof and Gutter Pty Ltd.<br />
                  19 Colchester Ave<br />
                  Cranbourne West 3977
                </div>
              </div>

              <div className="text-sm leading-relaxed">
                <div className="mb-1">
                  <strong>Bill No:</strong> {invoice.invoiceNumber}
                </div>
                <div>
                  <strong>Bill Date:</strong> {new Date(invoice.issueDate).toLocaleDateString("en-AU", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mt-10 mb-8">
            <h3 className="font-bold text-base mb-4">Items</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 px-3 py-2 text-left text-sm font-bold">Item</th>
                  <th className="border border-gray-400 px-3 py-2 text-center text-sm font-bold">Quantity</th>
                  <th className="border border-gray-400 px-3 py-2 text-right text-sm font-bold">Price</th>
                  <th className="border border-gray-400 px-3 py-2 text-right text-sm font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 px-3 py-2 text-sm">{item.description}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center text-sm">{item.quantity}</td>
                    <td className="border border-gray-400 px-3 py-2 text-right text-sm">{formatCurrency(item.price)}</td>
                    <td className="border border-gray-400 px-3 py-2 text-right text-sm">
                      {formatCurrency(item.total || item.quantity * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-5 text-right text-sm">
              <div className="mb-2">Subtotal: {formatCurrency(invoice.subtotal)}</div>
              {invoice.documentType === "invoice" && invoice.gst > 0 && (
                <div className="mb-2">GST (10%): {formatCurrency(invoice.gst)}</div>
              )}
              <div className="font-bold text-base mt-4">Total: {formatCurrency(invoice.total)}</div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-2 text-sm">Notes:</h3>
              <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          {/* Thank You */}
          <div className="text-center font-bold text-sm mt-16 mb-10">
            Thank you for your business!
          </div>
        </div>

        {/* Footer with ABN */}
        <div className="relative">
          <img src={footerImage} alt="Urban Vac Footer" className="w-full h-auto" />
          <div className="absolute bottom-5 right-10 text-2xl font-bold">
            ABN : 50 679 172 948
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
