/* --- CLEAN, PROFESSIONAL, REDESIGNED ADMIN PANEL --- */

import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  DollarSign,
  Mail,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const mockDashboardData = {
  totalInvoices: 1847,
  revenue: {
    totalRevenue: 612839,
    paidRevenue: 450200,
    pendingRevenue: 162639,
  },
  totalUsers: 342,
  emailsSent: 1256,
  overdueInvoices: 23,
  invoicesByStatus: {
    paid: 1204,
    sent: 420,
    draft: 180,
    overdue: 43,
  },
  invoicesByType: {
    invoice: 1520,
    estimate: 215,
    credit_note: 112,
  },
  recentInvoices: [
    {
      _id: "1",
      invoiceNumber: "INV-2024-001",
      customer: { name: "Williams Wright" },
      total: 10500,
      status: "pending",
      createdAt: "2024-03-15",
    },
    {
      _id: "2",
      invoiceNumber: "INV-2024-002",
      customer: { name: "Mason Adams" },
      total: 20200,
      status: "paid",
      createdAt: "2024-04-17",
    },
    {
      _id: "3",
      invoiceNumber: "INV-2024-003",
      customer: { name: "Emily Allen" },
      total: 35050,
      status: "sent",
      createdAt: "2024-05-15",
    },
    {
      _id: "4",
      invoiceNumber: "INV-2024-004",
      customer: { name: "Sarah Johnson" },
      total: 15750,
      status: "overdue",
      createdAt: "2024-02-28",
    },
  ],
  monthlyRevenue: [
    { _id: { year: 2024, month: 1 }, revenue: 145000, count: 123 },
    { _id: { year: 2024, month: 2 }, revenue: 178000, count: 145 },
    { _id: { year: 2024, month: 3 }, revenue: 165000, count: 134 },
    { _id: { year: 2024, month: 4 }, revenue: 195000, count: 167 },
    { _id: { year: 2024, month: 5 }, revenue: 210000, count: 180 },
  ],
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getMonthName = (month) =>
  [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][month - 1];

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-600 border-t-white"></div>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Revenue",
      value: formatCurrency(dashboardData.revenue.totalRevenue),
      change: "+12.5%",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      name: "Total Invoices",
      value: dashboardData.totalInvoices,
      change: "+8.2%",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Active Users",
      value: dashboardData.totalUsers,
      change: "+5.3%",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      name: "Emails Sent",
      value: dashboardData.emailsSent,
      change: "+18.7%",
      icon: Mail,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  const maxRevenue = Math.max(
    ...dashboardData.monthlyRevenue.map((m) => m.revenue)
  );

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Overview of your business activity</p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${s.bg} p-3 rounded-lg`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                  {s.change}
                </span>
              </div>

              <p className="text-slate-400 text-sm">{s.name}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* REVENUE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Paid */}
          <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="font-medium">Paid Revenue</p>
            </div>

            <p className="text-4xl font-bold text-emerald-400 mb-2">
              {formatCurrency(dashboardData.revenue.paidRevenue)}
            </p>
            <p className="text-slate-500 text-sm">73.5% of total revenue</p>
          </div>

          {/* Pending */}
          <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange-500/10 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <p className="font-medium">Pending Revenue</p>
            </div>

            <p className="text-4xl font-bold text-orange-400 mb-2">
              {formatCurrency(dashboardData.revenue.pendingRevenue)}
            </p>
            <p className="text-slate-500 text-sm">26.5% of total revenue</p>
          </div>

          {/* Overdue */}
          <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="font-medium">Overdue Invoices</p>
            </div>

            <p className="text-4xl font-bold text-red-400 mb-2">
              {dashboardData.overdueInvoices}
            </p>
            <p className="text-slate-500 text-sm">Requires attention</p>
          </div>
        </div>

        {/* INVOICE STATUS + TYPES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status */}
          <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">Invoice Status</h3>
            </div>

            <div className="space-y-4">
              {Object.entries(dashboardData.invoicesByStatus).map(
                ([status, count]) => {
                  const total = Object.values(
                    dashboardData.invoicesByStatus
                  ).reduce((a, b) => a + b, 0);
                  const percentage = ((count / total) * 100).toFixed(1);

                  const colors = {
                    paid: "from-emerald-500 to-emerald-400",
                    sent: "from-blue-500 to-blue-400",
                    draft: "from-slate-500 to-slate-400",
                    overdue: "from-red-500 to-red-400",
                  };

                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-2">
                        <span className="capitalize text-slate-300">
                          {status}
                        </span>
                        <span className="text-white font-semibold">
                          {count}
                        </span>
                      </div>

                      <div className="w-full bg-slate-700/40 rounded-full h-3">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${colors[status]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Types */}
          <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Document Types</h3>
            </div>

            <div className="space-y-4">
              {Object.entries(dashboardData.invoicesByType).map(
                ([type, count]) => (
                  <div
                    key={type}
                    className="flex justify-between py-3 px-4 bg-slate-700/30 rounded-lg"
                  >
                    <span className="capitalize">{type.replace("_", " ")}</span>
                    <span className="text-xl font-bold">{count}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* RECENT INVOICES */}
        <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-cyan-500/10 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold">Recent Invoices</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                  <th className="py-3">Invoice</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {dashboardData.recentInvoices.map((inv) => (
                  <tr key={inv._id} className="border-b border-slate-700/50">
                    <td className="py-4">{inv.invoiceNumber}</td>
                    <td className="py-4 text-slate-300">{inv.customer.name}</td>
                    <td className="py-4 font-semibold">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs capitalize ${
                          inv.status === "paid"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : inv.status === "pending"
                            ? "bg-orange-500/20 text-orange-300"
                            : inv.status === "sent"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">
                      {formatDate(inv.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MONTHLY REVENUE */}
        <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-pink-500/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
          </div>

          <div className="space-y-6">
            {dashboardData.monthlyRevenue.map((m) => {
              const percentage = (m.revenue / maxRevenue) * 100;

              return (
                <div key={m._id.month}>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">
                      {getMonthName(m._id.month)} {m._id.year}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(m.revenue)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-700/40 h-4 rounded-full">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
