import { Link, useLocation } from "react-router-dom";
import { FileText, LayoutDashboard, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/admin", icon: Settings, label: "Admin Panel" },
    { to: "/dashboard", icon: LayoutDashboard, label: "All Invoices" },
    { to: "/invoices/new", icon: FileText, label: "New Invoice" },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 shadow-lg border-b border-purple-500 border-opacity-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">UV</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              Urban Vac
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 !px-6 !py-3 !rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? "!bg-orange-500 !text-white shadow-lg"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* USER SECTION */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                Urban Vac Admin
              </p>
              <p className="text-xs text-gray-300">Invoice Management</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">A</span>
            </div>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 !px-6 !py-3 !rounded-2xl text-base font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? "!bg-orange-500 !text-white shadow-lg"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            ))}

            {/* MOBILE USER INFO */}
            <div className="flex items-center gap-3 px-4 py-4 border-t border-white/10 mt-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">A</span>
              </div>
              <div className="leading-4">
                <p className="text-sm font-semibold text-white">
                  Urban Vac Admin
                </p>
                <p className="text-xs text-gray-300">Invoice Management</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
