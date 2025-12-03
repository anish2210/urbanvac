import { Link, useLocation } from "react-router-dom";
import { FileText, LayoutDashboard, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

// Import the logo
import urbanVacLogo from "../assets/urbanvaclogo.png";
// Update the path based on your actual project structure

export const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    // { to: "/admin", icon: Settings, label: "Admin Panel" },
    { to: "/invoices/new", icon: FileText, label: "New Invoice" },
    { to: "/dashboard", icon: LayoutDashboard, label: "All Invoices" },
  ];

  return (
    <nav className="bg-white shadow-sm">
      {/* This is the key wrapper: Centers content, limits max width, and uses responsive padding px-4/6/8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Removed mx-4 and px-24 from this div, it now only manages layout height and positioning */}
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link to="/admin" className="flex items-center gap-3">
            <img
              src={urbanVacLogo}
              alt="Urban Vac Logo"
              className="w-18 h-18 object-contain"
            />
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 !px-6 !py-3 !rounded-sm text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? "!bg-orange-500 !text-white shadow-lg"
                    : "text-gray-800 hover:text-gray-600"
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
              <p className="text-sm font-semibold text-black">
                Urban Vac Admin
              </p>
              <p className="text-xs text-gray-500">Invoice Management</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">A</span>
            </div>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU needs padding applied here as it is inside the wrapper now */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-100 px-4 sm:px-6 lg:px-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                // Removed all !px-6 from these links since the parent container has padding
                className={`flex items-center gap-3 !py-3 !rounded-sm text-base font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? "!bg-orange-500 !text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            ))}

            {/* MOBILE USER INFO */}
            <div className="flex items-center gap-3 py-4 border-t border-gray-100 mt-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">A</span>
              </div>
              <div className="leading-4">
                <p className="text-sm font-semibold text-black">
                  Urban Vac Admin
                </p>
                <p className="text-xs text-gray-500">Invoice Management</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>

  );
};
