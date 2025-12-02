import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Navbar } from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import { NewInvoice } from "./pages/NewInvoice";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Navbar />
        <Routes>
          {/* Redirect root to admin panel */}
          <Route path="/" element={<Navigate to="/admin" />} />

          {/* Main Routes */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices/new" element={<NewInvoice />} />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </Router>
  );
}

export default App;
