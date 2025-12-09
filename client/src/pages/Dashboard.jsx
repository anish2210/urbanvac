import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceAPI } from "../utils/api";

const InvoiceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getAll();
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const documentTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "invoice":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "quotation":
        return "bg-purple-100 text-purple-700 border border-purple-300";
      case "cash_receipt":
        return "bg-green-100 text-green-700 border border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const formatDocumentType = (type) => {
    switch (type?.toLowerCase()) {
      case "invoice":
        return "Invoice";
      case "quotation":
        return "Quotation";
      case "cash_receipt":
        return "Cash Receipt";
      default:
        return type || "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">All Document</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage and track all your invoices & quotations
            </p>
          </div>

          <button
            onClick={() => navigate("/invoices/new")}
            className="mt-4 sm:mt-0 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 
            text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 
            transition-all duration-200 shadow-lg"
          >
            + New Invoice
          </button>
        </div>

        {/* CARD */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-black/10">
                  {[
                    "Invoice ID",
                    "Client",
                    "Amount",
                    "Type",
                    "Date",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="py-4 px-6 text-left text-gray-700 font-medium text-sm tracking-wide"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {!Array.isArray(invoices) || invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-10 text-center text-gray-500 text-sm"
                    >
                      No invoices found. Create your first invoice!
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv._id}
                      className="border-b border-black/5 hover:bg-black/5 transition"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900">
                        #{inv.invoiceNumber || inv.invoiceId}
                      </td>

                      <td className="py-4 px-6 text-gray-700">
                        {inv.customer?.name || inv.clientName || "-"}
                      </td>

                      <td className="py-4 px-6 font-semibold text-gray-900">
                        ${(inv.total || inv.amount || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${documentTypeColor(
                            inv.documentType
                          )}`}
                        >
                          {formatDocumentType(inv.documentType)}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-gray-600">
                        {inv.issueDate || inv.date
                          ? new Date(
                              inv.issueDate || inv.date
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => window.open(`/invoices/${inv._id}`, '_blank')}
                          className="text-orange-500 hover:text-orange-600 font-medium transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDashboard;
