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
        return "bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-30";
      case "unpaid":
      case "overdue":
        return "bg-red-500 bg-opacity-20 text-red-300 border border-red-500 border-opacity-30";
      case "draft":
        return "bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500 border-opacity-30";
      case "sent":
        return "bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30";
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-300 border border-gray-500 border-opacity-30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 pt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              All Invoices
            </h1>
            <p className="text-gray-300 mt-2 text-sm">
              Manage and track all your invoices & quotations
            </p>
          </div>

          <button
            onClick={() => navigate("/invoices/new")}
            className="mt-4 sm:mt-0 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg"
          >
            + New Invoice
          </button>
        </div>

        {/* CARD */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl border border-white border-opacity-20 shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse">
              <thead>
                <tr className="border-b border-white border-opacity-20">
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold text-sm">
                    Invoice ID
                  </th>
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold text-sm">
                    Client
                  </th>
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold text-sm">
                    Amount
                  </th>
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold text-sm">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold text-sm">
                    Date
                  </th>
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold text-sm">
                    Actions
                  </th>
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
                      className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5 transition-colors"
                    >
                      <td className="py-4 px-6 text-white font-medium">
                        #{inv.invoiceNumber || inv.invoiceId}
                      </td>

                      <td className="py-4 px-6 text-gray-300">
                        {inv.customer?.name || inv.clientName || "-"}
                      </td>

                      <td className="py-4 px-6 text-white font-semibold">
                        ${(inv.total || inv.amount || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-4 py-1.5 text-xs font-semibold rounded-full ${statusColor(
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
                          className="text-orange-400 font-medium hover:text-orange-300 transition-colors"
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
