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

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-600/20 text-green-300 border border-green-500/30";
      case "unpaid":
      case "overdue":
        return "bg-red-600/20 text-red-300 border border-red-500/30";
      case "draft":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
      case "sent":
        return "bg-blue-600/20 text-blue-300 border border-blue-500/30";
      default:
        return "bg-gray-600/20 text-gray-300 border border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E0E0E]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">All Invoices</h1>
            <p className="text-gray-400 mt-1 text-sm">
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
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  {[
                    "Invoice ID",
                    "Client",
                    "Amount",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="py-4 px-6 text-left text-gray-300 font-medium text-sm tracking-wide"
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
                      className="py-10 text-center text-gray-400 text-sm"
                    >
                      No invoices found. Create your first invoice!
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv._id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-4 px-6 font-medium text-white">
                        #{inv.invoiceNumber || inv.invoiceId}
                      </td>

                      <td className="py-4 px-6 text-gray-300">
                        {inv.customer?.name || inv.clientName || "-"}
                      </td>

                      <td className="py-4 px-6 font-semibold text-white">
                        ${(inv.total || inv.amount || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusColor(
                            inv.status
                          )}`}
                        >
                          {inv.status || "N/A"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-gray-400">
                        {inv.issueDate || inv.date
                          ? new Date(
                              inv.issueDate || inv.date
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => navigate(`/invoices/${inv._id}`)}
                          className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
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
