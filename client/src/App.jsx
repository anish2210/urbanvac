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
import NewInvoice from "./pages/NewInvoice";
import InvoiceView from "./pages/InvoiceView";
// import AdminPanel from "./pages/AdminPanel";
// import Login from "./pages/Login";
// import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          {/* Auth Routes */}
          {/* <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> */}

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Main Routes */}
          {/* <Route path="/admin" element={<AdminPanel />} /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices/new" element={<NewInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceView />} />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={2000}
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
